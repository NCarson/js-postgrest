# beginning based on this gist:
# https://gist.github.com/hallettj/29b8e7815b264c88a0a0ee9dcddb6210

# good stuff on cdn browserify
# https://shinglyu.github.io/web/2018/02/08/minimal-react-js-without-a-build-step-updated.html
#

#http://dev.topheman.com/package-a-module-for-npm-in-commonjs-es2015-umd-with-babel-and-rollup/
#https://medium.freecodecamp.org/anatomy-of-js-module-systems-and-building-libraries-fadcd8dbd0e

#package.json
#"unpkg": "dist/my-awesome-lib.min.js",

#TODO
# fix empty index.json 

#XXX fill this out to publish (make dist)
MAIN_ENTRY := 
MODULE_NAME :=

NODE_DEV=1

#FLAGS:
# NO_LINT: if defined - will not call eslint
# NODE_DEV: if defined - will not minify and use cdn dev libs

# make sure failed commands dont leave files
.DELETE_ON_ERROR: 

FAKING_IT := $(shell ruby script/test_config.rb $(NODE_DEV))
 
###############################################################################
# commands
###############################################################################

# plugins
BABEL_PLUGINS := --plugins syntax-async-functions --plugins transform-class-properties
BROWSERIFY_SHIM := 

# these should be installed globally
BABEL := babel $(BABEL_PLUGINS) --presets=es2015
BROWSERIFY := browserify
ROLLUP := rollup
UGLIFYJS := uglifyjs
NUNJUCKS := nunjucks
GZIP := gzip


ifdef NO_LINT
	LINTER := true
else
	LINTER := eslint --parser babel-eslint --plugin import
endif

WWW_USER = www-data

###############################################################################
# directories and files
###############################################################################

# directory structure
INDEX_DIR := public
PUBLISH_DIR := dist
DIST_DIR := $(INDEX_DIR)/dist
TEMPL_DIR := templates
LIB_DIR := lib
SRC_DIR := src
PROD_DIR := /var/www/html
IDX_JSON := index.json

DEP_FILE := $(LIB_DIR)/.deps
SRC_FILES := $(shell find $(SRC_DIR)/ -name '*.js')
LIB_FILES := $(patsubst $(SRC_DIR)/%,$(LIB_DIR)/%,$(SRC_FILES))
MIN_FILES := $(patsubst $(SRC_DIR)/%.js,$(LIB_DIR)/%.min.js,$(SRC_FILES))

COMPRESS_FILES := $(shell find $(INDEX_DIR)/ -name '*.svg' -o -name '*.html' -o -name '*.css')
COMPRESS_FILES_GZ := $(patsubst %,%.gz,$(COMPRESS_FILES))

#libs that should not go in vendor build
BROKEN_LIBS := shallow-equal inline-style-prefixer
#CDN libs will be excluded from the vender build
# but you have to set them up yourself
#
REACTSTRAP_LIBS := reactstrap classnames lodash.isfunction lodash.isobject \
	lodash.tonumber react-lifecycles-compat react-popper react-transition-group

CDN_LIBS := $(BROKEN_LIBS) react-dom $(REACTSTRAP_LIBS) \ object-assign 

EXC_MODULES := python3 script/get_modules.py `pwd`/node_modules/ $(DEP_FILE) "-x="
INC_MODULES := python3 script/get_modules.py `pwd`/node_modules/ $(DEP_FILE) "-r=" "$(CDN_LIBS)"

TARGET := $(DIST_DIR)/bundle.js
VENDOR := $(DIST_DIR)/vendor.js
TARGETS := $(TARGET) $(VENDOR)
COMPRESS_FILES_GZ := $(COMPRESS_FILES_GZ) $(INDEX_DIR)/index.html.gz $(DIST_DIR)/bundle.min.js.gz $(DIST_DIR)/vendor.min.js.gz

###########################
# scripts
GET_DEPS = python3 script/get_modules.py `pwd`/node_modules/  $(DEP_FILE) "" $(CDN_LIBS)

###############################################################################
# dev / prod switches
###############################################################################

ifdef NODE_DEV
	CDN_URLS := <script src='https://unpkg.com/prop-types@15.6.2/prop-types.min.js'></script> \
		<script src='https://unpkg.com/react@16.4.1/umd/react.development.js'></script> \
		<script src='https://unpkg.com/react-dom@16.4.1/umd/react-dom.development.js'></script> \
		<script src='https://unpkg.com/reactstrap@6.4.0/dist/reactstrap.full.js'></script>
else
	CDN_URLS := <script src='https://unpkg.com/prop-types@15.6.2/prop-types.min.js'></script> \
		<script src='https://unpkg.com/react@16.4.1/umd/react.production.min.js'></script> \
		<script src='https://unpkg.com/react-dom@16.4.1/umd/react-dom.production.min.js'></script> \
		<script src='https://unpkg.com/reactstrap@6.4.0/dist/reactstrap.full.min.js'></script>
endif

###############################################################################
# big phonies
###############################################################################

.PHONY: all clean clean_dist vendor_size install
# make the vendor and target bundles
all: $(COMPRESS_FILES_GZ) 

# remove the build lib and dist files
clean:
	rm $(LIB_DIR) -fr
	rm $(DIST_DIR)/* -f 
	rm $(DEP_FILE) -f
	rm $(INDEX_DIR)/index.html  $(INDEX_DIR)/*.gz -f

# remove the dist bundle js files
clean_dist:
	rm $(DIST_DIR)/* -fr 

clean_vendor:
	rm $(DIST_DIR)/vendor* -fr 

# how big the _required_ node_module dirs are
vendor_size:
	bash script/bundle_words.sh $(shell $(GET_DEPS))

# copy public into production direc
install:
	cp -R $(INDEX_DIR)/* $(PROD_DIR)
	chown $(WWW_USER):$(WWW_USER) -R $(PROD_DIR)/*

dist:
	$(ROLLUP) lib/$(MAIN_ENTRY) -n $(MODULE_NAME) -f umd -o $(PUBLISH_DIR)/index.js -c .rollup.config.js 
	npm publish

setup-test:
	cd test && make
	
###############################################################################
# rules
###############################################################################

.PRECIOUS: $(INDEX_DIR)/index.html
$(INDEX_DIR)/index.html: $(TEMPL_DIR)/index.jinja
	jq '.cdn_urls = "$(CDN_URLS)"' $(IDX_JSON) | sponge $(IDX_JSON)
	$(NUNJUCKS) $(TEMPL_DIR)/index.jinja $(IDX_JSON)
	mv $(TEMPL_DIR)/index.html $(INDEX_DIR)

%.gz: %
	$(GZIP) $< --stdout > $@
	jq '.static_time = "$(shell date +%s)"' $(IDX_JSON) | sponge $(IDX_JSON)

.PRECIOUS: %.min.js #make will delete these as 'intermediate' without this
%.min.js: %.js
ifdef NODE_DEV
	#we cant link because of gzip 
	#ln -s $< $@
	cp $< $@
else
	$(UGLIFYJS) -cmo $@ $<
endif

$(TARGET): $(LIB_DIR)/config.js $(LIB_FILES) $(DEP_FILE) 
	$(BROWSERIFY) $(BROWSERIFY_SHIM) -d -o $(TARGET)  $(shell find $(LIB_DIR) -type f -name '*.js') $(shell $(EXC_MODULES))
	jq '.bundle_time = "$(shell date +%s)"' $(IDX_JSON) | sponge $(IDX_JSON)

# depends if the node_moules changed
# XXX not really true; app code may or may not have included or removed vendor dependencies
$(VENDOR): $(DEP_FILE)
	$(BROWSERIFY) $(BROWSERIFY_SHIM) $(shell $(INC_MODULES)) > $(VENDOR)
	jq '.vendor_time = "$(shell date +%s)"' $(IDX_JSON) | sponge $(IDX_JSON)

$(DEP_FILE): package-lock.json
	$(BROWSERIFY) --list $(shell find lib/ -type f -name '*.js') > $(LIB_DIR)/.deps

.PRECIOUS: $(LIB_DIR)/%.js #make will delete these as 'intermediate' without this
$(LIB_DIR)/%: $(SRC_DIR)/%
	$(LINTER) $<
	mkdir $(dir $@) -p
	$(BABEL) $< --out-file $@ --source-maps

$(SRC_DIR)/config.js:
ifdef NODE_DEV
	cd src && ln -s ../config/config.dev.js config.js
else
	cd src && ln -s ../config/config.prod.js config.js
endif

