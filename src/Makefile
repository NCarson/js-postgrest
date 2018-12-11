
# production mode aka NODE_ENV=production
# will produce minified versions
# run `PRODCUTION=1 make`

# development
# run `make`

######################################
#  Direcs and files
######################################

BASE_DIR := ..
BUNDLE_BASENAME := bundle
UMD_BASENAME := js-postgrest
TARGET_DIR := $(BASE_DIR)/dist

#XXX make sure to define ungzipped version along 
#    with gzipped so `make clean` works correctly.
BUNDLE_TARGET := \
	$(TARGET_DIR)/$(BUNDLE_BASENAME).min.js \
	$(TARGET_DIR)/$(BUNDLE_BASENAME).min.js.gz

UMD_TARGET := \
	$(TARGET_DIR)/$(UMD_BASENAME).min.js \
	$(TARGET_DIR)/$(UMD_BASENAME).min.js.gz


# XXX these are main targets to build
# aka $(BUNDLE_BASENAME).js would build unminifed and un-gzipped
# remove them if you dont want to build them
TARGETS :=  $(UMD_TARGET)

#EXCL_SRC_DIRS := ./codesplit ./umd

include $(BASE_DIR)/.makefiles/conf.makefile

