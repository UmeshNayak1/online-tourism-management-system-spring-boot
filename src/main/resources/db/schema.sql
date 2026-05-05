CREATE DATABASE IF NOT EXISTS tourism_db;
USE tourism_db;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(160) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('ADMIN', 'CUSTOMER') NOT NULL DEFAULT 'CUSTOMER',
    phone VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS hotels (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(140) NOT NULL,
    location VARCHAR(140) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS rooms (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    hotel_id BIGINT NOT NULL,
    room_type VARCHAR(80),
    price DECIMAL(10, 2),
    available BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_rooms_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id)
);

CREATE TABLE IF NOT EXISTS packages (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(140) NOT NULL,
    destination VARCHAR(140) NOT NULL,
    price DECIMAL(10, 2),
    duration VARCHAR(80),
    description TEXT,
    image_url VARCHAR(1000)
);

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120),
    type VARCHAR(80),
    price DECIMAL(10, 2),
    available BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS food_services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(120),
    type VARCHAR(80),
    price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS transport (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type VARCHAR(80),
    source VARCHAR(140),
    destination VARCHAR(140),
    price DECIMAL(10, 2)
);

CREATE TABLE IF NOT EXISTS bookings (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    package_id BIGINT,
    hotel_id BIGINT,
    vehicle_id BIGINT,
    current_location VARCHAR(255),
    number_of_people INT,
    customer_note VARCHAR(255),
    status ENUM('PENDING', 'CONFIRMED', 'CANCELLED') DEFAULT 'PENDING',
    booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_bookings_package FOREIGN KEY (package_id) REFERENCES packages(id),
    CONSTRAINT fk_bookings_hotel FOREIGN KEY (hotel_id) REFERENCES hotels(id),
    CONSTRAINT fk_bookings_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
);

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    booking_id BIGINT,
    amount DECIMAL(10, 2),
    payment_status ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payments_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_payments_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);
