# Hotel Management System

> **Note:** The frontend part of this project was developed with assistance from AI tools for UI structure, component organization, and styling support, while the backend architecture, business logic, API development, and overall project integration were implemented independently.

A full-stack hotel management application built with **Spring Boot** and **React**. The project provides functionality for managing hotel reservations, rooms, guests, room types, and employee authentication through a modern web interface and RESTful API.

---

# Tech Stack

## Backend

* Java 21
* Spring Boot 3
* Spring Web
* Spring Data JPA
* Spring Security
* MySQL
* Lombok
* DTO Mapper
* Maven

## Frontend

* React 19
* TypeScript
* Vite
* React Router DOM
* Bootstrap 5

---

# Project Structure

```bash
spring_projekat/
│
├── hotel-server-application/     # Spring Boot backend
│   └── hotel-server-application/
│
├── hotel-client-application/     # React frontend
│   └── hotel-react-app-main/
│
└── dokumentacija_njt.pdf         # Project documentation
```

---

# Features

## Authentication

* Employee login system
* Spring Security integration
* Protected backend endpoints

## Reservation Management

* Create reservations
* View reservations
* Reservation validation
* Date handling utilities

## Guest Management

* Add guests
* View guest information
* Connect guests with reservations

## Room Management

* Manage hotel rooms
* Room type categorization
* Room availability handling

## City & Room Type Management

* City CRUD operations
* Room type management

---

# Backend Architecture

The backend follows a layered architecture:

```bash
Controller → Service → Repository → Database
```

## Main Packages

### Controllers

Handle HTTP requests and REST endpoints.

### Services

Contain business logic and validation.

### Repositories

Provide database access using Spring Data JPA.

### DTOs

Used for request and response mapping.

### Domain Models

Represent database entities.

---

# API Endpoints

## Authentication

```http
POST /auth/login
```

## Guests

```http
GET    /guests
POST   /guests
```

## Reservations

```http
GET    /reservations
POST   /reservations
```

## Rooms

```http
GET    /rooms
```

## Room Types

```http
GET    /room-types
```

## Cities

```http
GET    /cities
```

---

# Getting Started

## Prerequisites

Make sure you have installed:

* Java 21
* Node.js
* npm
* MySQL
* Maven

---

# Backend Setup

## 1. Navigate to backend project

```bash
cd hotel-server-application/hotel-server-application
```

## 2. Configure database

Update your `application.properties` file with MySQL credentials:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hotel_db
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
```

## 3. Run the backend

```bash
./mvnw spring-boot:run
```

Or on Windows:

```bash
mvnw.cmd spring-boot:run
```

The backend server will start on:

```bash
http://localhost:8080
```

---

# Frontend Setup

## 1. Navigate to frontend project

```bash
cd hotel-client-application/hotel-react-app-main
```

## 2. Install dependencies

```bash
npm install
```

## 3. Start development server

```bash
npm run dev
```

The frontend application will start on:

```bash
http://localhost:5173
```

---

# Database

The application uses **MySQL** as the primary database.

Main entities:

* Employee
* Guest
* Reservation
* Room
* RoomType
* City

---

# Security

The backend uses Spring Security for:

* Authentication
* Endpoint protection
* Login handling

CORS configuration is also included for frontend-backend communication.

---

# Development Notes

## Backend

* Uses DTO pattern for cleaner API responses
* Service layer separates business logic from controllers
* Repository pattern implemented with Spring Data JPA

## Frontend

* Built using React + TypeScript
* Uses React Router for navigation
* Styled with Bootstrap 5

---

# Future Improvements

Potential future enhancements:

* JWT authentication
* Role-based authorization
* Reservation calendar view
* Room availability filtering
* Admin dashboard
* Unit and integration tests
* Docker support
* Deployment configuration

---

# Author

Developed by Luka Grcic.

---

# License

This project was developed for educational and academic purposes.
