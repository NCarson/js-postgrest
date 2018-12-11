
.PHONY: all clean

all:
	$(MAKE) -C src

clean:
	cd src && make clean
