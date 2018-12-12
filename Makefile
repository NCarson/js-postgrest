
.PHONY: all clean test

all:
	$(MAKE) -C src

clean:
	cd src && make clean

test:
	cd test && make test
