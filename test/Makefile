

USER:=$(shell python3 -c "from config import *; print(WWW_USER)")
DB:=$(shell python3 -c "from config import *; print(DBNAME)")

PYTHON = python3
PSQL = psql -X -d$(DB)

.PHONY: all
all: tables
	cd postgrest && sudo make

.PHONY: tables
tables:
	$(PSQL) -f tables.sql -v user=$(USER) -v direc=$(DATA_DIR)


