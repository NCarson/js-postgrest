DROP TABLE IF exists testing;
CREATE TABLE testing AS  SELECT * FROM generate_series(1,100) AS i;
GRANT SELECT ON testing TO :user;
