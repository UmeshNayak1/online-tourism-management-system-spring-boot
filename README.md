# Online Tourism Management System

Spring Boot + MySQL project for managing tourism packages, hotels, vehicles, bookings, payments, customers, and admin operations.

## Technology Stack

- Backend: Spring Boot 3, Spring Security, JWT, JPA/Hibernate
- Database: MySQL
- Frontend: React CDN, HTML, CSS, JavaScript served from Spring Boot
- Build Tool: Maven

## Project Structure

```text
src/main/java/com/tourism
├── config
├── controller
├── dto
├── model
├── repository
├── security
└── service
```

## Database Setup

Create the database manually or let Spring Boot create it using the configured JDBC URL.

Manual schema:

```sql
SOURCE src/main/resources/db/schema.sql;
```

Default MySQL settings are in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/tourism_db?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

Update the username and password if your local MySQL uses different credentials.

## Run

```bash
mvn spring-boot:run
```

Open:

```text
http://localhost:8080
```

## Default Login

The app seeds one admin account on startup:

```text
Email: admin@tourism.com
Password: admin123
```

## Main APIs

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/packages`
- `POST /api/packages`
- `GET /api/hotels`
- `POST /api/hotels`
- `GET /api/vehicles`
- `POST /api/bookings`
- `GET /api/bookings/user/{id}`
- `POST /api/payments`
- `GET /api/admin/dashboard`

Admin-only endpoints require:

```text
Authorization: Bearer <jwt-token>
```
