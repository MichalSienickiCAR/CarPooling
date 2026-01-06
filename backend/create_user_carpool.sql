-- Utworzenie użytkownika carpool i bazy danych
-- Uruchom w psql: \i create_user_carpool.sql

-- Utwórz użytkownika carpool
CREATE USER carpool WITH PASSWORD 'Kp9mN2xQvR7wF4jL8hT3bY6cZ1a';

-- Utwórz bazę danych carpooling
CREATE DATABASE carpooling OWNER carpool;

-- Nadaj uprawnienia
GRANT ALL PRIVILEGES ON DATABASE carpooling TO carpool;







