
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
TARGETS := $(TARGET_DIR)/PostgrestFetcher.js $(TARGET_DIR)/PostgrestQuery.js

#EXCL_SRC_DIRS := ./codesplit ./umd

include $(BASE_DIR)/.makefiles/conf.makefile

docs: $(SRC_FILES)
	documentation build $(SRC_FILES) -f html -o ../docs



