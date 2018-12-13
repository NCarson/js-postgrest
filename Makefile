.PHONY: all clean test doc publish

all:
	$(MAKE) -C src

clean:
	cd src && make clean

test:
	cd test && make test

doc:
	cd src && make doc

commit-doc:
	git add docs README.md
	git commit -m "updated doc"
	git push

publish:
	cd src && make clean
	cd src && PRODUCTION=1 make
	cd src && make docs
	npm publish

