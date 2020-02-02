# For Production Mode aka NODE_ENV=production (minified)
# run `PRODUCTION=1 make`

# For Development
# run `make`

MJS_HELP +=\nrun `make -j 8` to run with 8 threads (set the number to number of cores)! \
		   \nrun `make -n` for a dry run that will print out the actually commands it would have used \
		   \nrun `make --debug=b` basic debug dependency chain \
		   \nrun `make -f PROJECT_ROOT/makefiles-for-js/makefiles/js.makefile -p` to print out rules of the js makefile \
		   \n

######################################
#  Knobs
######################################
#XXX dont set bool type variables to zero. 

#    BAD: USE_THINGY :=0
#	 GOOD: USE_THINGY :=
#
#	 This is because make usually checks for existance of variable being set.
#
#XXX  watch out with spaces when setting variables
#	  make is very literal in setting things
#
#     BAD: BASE_DIR := .. # will evaluate to ' .. '
#     GOOD: BASE_DIR :=..# will evaluate to '..'

#     So the value starts right after assingment symbol and ends
#     at newline or comment hash.

#XXX  debug tips
#	  inline: $(info |$(BASE_DIR)|) #pipes help show spaces
#	  command line: `make print-BASE_DIR`

USE_BABEL :=1 #babel (needs global install)

USE_LINTER :=1 #eslint (needs global install)

# set for easier debugging in web console
USE_SOURCEMAPS :=1

# set for react options on babel and eslint
# you  still need to install babel transforms locally
# REACT :=1

# set for latest syntax like spread op and static classes
# you still need to install babel transforms locally
POST_ES6 :=1

######################################
#  Direcs and files
######################################

#XXX dont add trailing '/' to paths
BASE_DIR :=..
SRC_DIR :=.
BUILD_DIR :=$(SRC_DIR)/build
EXCL_SRC_DIRS :=./scratch

######################################
#  UMD libary build

TARGET_DIR :=$(BASE_DIR)/lib# finished files go here
UMD_BASENAME :=postgrest#XXX this needs to be different from the source file names
#TARGETS := \
#    $(TARGET_DIR)/$(UMD_BASENAME).js \
#    $(TARGET_DIR)/$(UMD_BASENAME).min.js \
#    $(TARGET_DIR)/$(UMD_BASENAME).min.js.gz \ # all components bundled
#
#    find all source files (on default export per file) and append ../lib direc to them
#    leave out index as that probably goes in PROJECT_ROOT
TARGETS := $(shell find . -path $(BUILD_DIR) -prune -o -name '*.js' -print \
	| grep -v ^./index.js$ \
	| cut -b1-2 --complement \
	| awk '{print "$(TARGET_DIR)/"$$0}'  \
	)
#TARGETS += $(patsubst %.js,%.min.js,$(TARGETS))# minified
#TARGETS += $(patsubst %.js,%.min.js.gz,$(TARGETS))# gzipped
TARGETS += ../index.js

######################################
# Includes / Default Rules
######################################

####################################
# Rules

.PHONY: all
all: $(TARGETS)
MJS_HELP +=\nall: make all the targets

.PHONY: clean
clean:
	rm -f $(TARGETS)
	rm -fr $(BUILD_DIR)
MJS_HELP +=\nclean: remove targets and build direc

####################################
# Includes
#
MAKE_DIR:=$(BASE_DIR)/makefile-for-js/makefiles/
include $(MAKE_DIR)/common.makefile
# you may want to take a peek at this also
# as it contains other variables that can be changed.
include $(MAKE_DIR)/js.makefile 

####################################
# Custom programs (have to go after includes)
#
#LINTER := #set your own linter
#BABEL := #set your own transpiler
#see js.makefile for more

######################################
# Your rules
######################################
# XXX define your own rules AFTER the includes
# 	  otherwise you will overwrite the default
# 	  rule, aka `make all` without arguments.


