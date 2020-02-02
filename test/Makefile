#https://postgrest.org/en/v6.0/auth.html#overview-of-role-system
#https://postgrest.org/en/v6.0/configuration.html
#XXX users and dbname need to match server.cfig 
AUTH_USER :=authenticator
ANON_USER :=web_app
DBNAME :=postgrest-test# USER and DBNAME need to match first line on server.cfg
PSQL :=psql -X -d$(DBNAME)

#XXX you need to update your postgres server to accept connections
#    this should be ok for a local machine to do testing:
#
# /etc/postgresql/x.x/main/pg_hba.conf
# host    postgrest-test  web_app         localhost               trust
# host    postgrest-test  all             localhost               trust


# /etc/postgresql/x.x/main/postgresql.conf
# listen_addresses = 'localhost'      # what IP address(es) to listen on;

# create-db rule will reload conf (if you have problems try restarting database -- pg_ctl, pg_ctlcluster, sysctl, etc)

HELP += \nall: start server, run tests, stop server
.PHONY: all
all: start-server test stop-server

HELP += \ncreate-db: creates test db and test user (should run this as the postgrest super-user (not root))
.PHONY: create-db
create-db:
	createdb $(DBNAME)
	$(PSQL) -f tables.sql
	$(PSQL) -c 'create role $(ANON_USER) nologin'
	$(PSQL) -c 'grant usage on schema api to $(ANON_USER)'
	$(PSQL) -c 'grant select on api.v_testing to $(ANON_USER)'
	$(PSQL) -c "create role $(AUTH_USER) noinherit login password '1234'"
	$(PSQL) -c 'grant $(ANON_USER) to $(AUTH_USER)'
	$(PSQL) -c 'SELECT pg_reload_conf()'

HELP += \ndrop-db: drops test db and test user
.PHONY: drop-db
drop-db:
	dropdb $(DBNAME)
	dropuser $(ANON_USER)
	dropuser $(AUTH_USER)

HELP += \nstart-server: starts postgrest server
.PHONY: start-server
start-server: 
	./postgrest server.cfg &

HELP += \nstop-server: stops postgrest server
.PHONY: stop-server
stop-server:
	pkill --signal=KILL -f "./postgrest server.cfg" & true

HELP += \ntest: runs unit tests
.PHONY: test
test:
	ava test.js

export HELP
help:
	echo $$HELP


