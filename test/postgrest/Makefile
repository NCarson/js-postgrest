

SYSTEMD_LIB := /lib/systemd/system/
POSTGREST_LIB := /etc/postgrest/
NGINX_LIB := /etc/nginx/sites-enabled/

SERVICE_FILES := $(shell find -name '*.service')
POSTGREST_FILES := $(shell find -name '*.postgrest')
NGINX_FILES := $(shell find -name '*.nginx')

INSTALLED_SERVICE := $(SERVICE_FILES:%=$(SYSTEMD_LIB)%)
INSTALLED_POSTGREST := $(POSTGREST_FILES:%=$(POSTGREST_LIB)%)
INSTALLED_NGINX := $(NGINX_FILES:%=$(NGINX_LIB)%)

$(info $(SERVICE_FILES))

.PHONY: all
all: $(INSTALLED_POSTGREST) $(INSTALLED_SERVICE) $(INSTALLED_NGINX)

$(SYSTEMD_LIB)%: $(SERVICE_FILES)
	cp $* $(SYSTEMD_LIB)
	systemctl daemon-reload
	#systemctl enable $(notdir $(basename $*))
	systemctl restart $(notdir $(basename $*))

$(POSTGREST_LIB)%: $(POSTGREST_FILES)
	mkdir -p $(POSTGREST_LIB)
	cp $* $(POSTGREST_LIB)

$(NGINX_LIB)%: $(NGINX_FILES)
	cp $* $(NGINX_LIB)
	systemctl restart nginx
