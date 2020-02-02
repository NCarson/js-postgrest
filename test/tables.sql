DROP TABLE IF exists testing;
CREATE TABLE testing AS  SELECT * FROM generate_series(1,100) AS i;

CREATE SCHEMA api;

CREATE VIEW api.v_testing AS SELECT * FROM testing;
