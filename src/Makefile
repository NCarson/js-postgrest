
# production mode aka NODE_ENV=production
# will produce minified versions
# run `PRODCUTION=1 make`

# development
# run `make`

######################################
#  Direcs and files
######################################

BASE_DIR := ..
TARGET_DIR := $(BASE_DIR)/lib
UMD_BASENAME := postgrest
TARGETS := \
	$(TARGET_DIR)/../dist/$(UMD_BASENAME).js \
	$(TARGET_DIR)/../dist/$(UMD_BASENAME).min.js \
	$(TARGET_DIR)/../dist/$(UMD_BASENAME).min.js.gz \
	$(TARGET_DIR)/PostgrestFetcher.js \
	$(TARGET_DIR)/PostgrestQuery.js \
	$(TARGET_DIR)/PostgrestFetcher.min.js \
	$(TARGET_DIR)/PostgrestQuery.min.js \
	$(TARGET_DIR)/PostgrestFetcher.min.js.gz \
	$(TARGET_DIR)/PostgrestQuery.min.js.gz \

#EXCL_SRC_DIRS := ./codesplit ./umd

include $(BASE_DIR)/.makefiles/conf.makefile

docs: $(SRC_FILES)
	documentation build $(SRC_FILES) -f html -o ../docs



