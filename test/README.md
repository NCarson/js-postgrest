try running `make help` to see what the makefile can do.

if the test errors out while the server-running you will need to run `make stop-server` by hand.

requires `ava` installed globaly `sudo npm -g install ava`

Steps

- Install postgrest binary in this direc https://github.com/PostgREST/postgrest/releases/

- make sure your logged in as the postgresql super user (not the same as root)

- read the makefile and edit your postgresql conf files

- run `make create-db`

- run `make` to run the server and the unit tests
