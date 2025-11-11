-- PostgreSQL setup script for carpooling project
-- Run this as a PostgreSQL superuser (usually 'postgres')

-- Create the database
CREATE DATABASE carpooling;

-- Create the user
CREATE USER carpool WITH PASSWORD 'ZJ<170yuJ~{>rOx3c_Mq@b$g';

-- Grant privileges
ALTER ROLE carpool SET client_encoding TO 'utf8';
ALTER ROLE carpool SET default_transaction_isolation TO 'read committed';
ALTER ROLE carpool SET timezone TO 'UTC';

-- Grant all privileges on the database to the user
GRANT ALL PRIVILEGES ON DATABASE carpooling TO carpool;

-- Connect to the database and grant schema privileges
\c carpooling
GRANT ALL ON SCHEMA public TO carpool;

