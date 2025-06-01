# Blood Donation Management API

A comprehensive RESTful API for managing blood donation operations between donors, NGOs, and hospitals.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [User Routes](#user-routes)
  - [NGO Routes](#ngo-routes)
  - [Hospital Routes](#hospital-routes)
  - [Blood Donation Routes](#blood-donation-routes)
  - [Blood Request Routes](#blood-request-routes)
  - [Admin Routes](#admin-routes)
- [Authentication](#authentication)
- [API Base URL](#api-base-url)

## Overview

This Blood Donation Management API facilitates the connection between blood donors, NGOs (blood banks), and hospitals. It provides a complete solution for managing blood donations, inventory, requests, and transfers, ensuring timely and efficient blood supply to those in need.

## Features

- User registration and authentication
- NGO and Hospital registration, verification, and management
- Blood donation registration and tracking
- Blood inventory management
- Blood request processing
- Admin dashboard with analytics
- Geolocation-based NGO finding for hospitals
- Secure authentication with JWT

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer and Cloudinary
- **Security**: bcrypt for password hashing
- **Other**: axios, cookie-parser, cors, dotenv

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd blood-donation-server
   ```

2. Install dependencies:
   ```
   npm install
   ```
   
3. Start the development server:
   ```
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=8000
MONGODB_URI=mongodb://localhost:27017/bloodDonation
CORS_ORIGIN=http://localhost:3000
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## API Documentation

### API Base URL

All API endpoints are prefixed with `/api/v1`.

### Authentication

Most routes require authentication via JWT tokens. Include the authentication token in the request headers:

```
Authorization: Bearer <your_jwt_token>
```

The token is obtained during login and can be refreshed using the refresh token endpoints.

### User Routes

Base path: `/api/v1/user`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/register` | POST | Register a new user | No |
| `/login` | POST | Login existing user | No |
| `/logout` | POST | Logout user | Yes |
| `/current-user` | GET | Get current user details | Yes |
| `/change-password` | POST | Change user password | Yes |
| `/refreshToken` | POST | Refresh access token | No |
| `/update-account` | PATCH | Update account details | Yes |

### NGO Routes

Base path: `/api/v1/ngo`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/register` | POST | Register a new NGO/blood bank | No |
| `/verify-email` | POST | Verify NGO email with OTP | No |
| `/request-otp` | POST | Request a new OTP | No |
| `/login` | POST | Login as NGO | No |
| `/refresh-token` | POST | Refresh access token | No |
| `/logout` | GET | Logout NGO | Yes (NGO) |
| `/profile` | GET | Get NGO profile | Yes (NGO) |
| `/profile` | PATCH | Update NGO profile | Yes (NGO) |
| `/blood-inventory` | POST | Update blood inventory | Yes (NGO) |
| `/connected-hospitals` | GET | Get list of connected hospitals | Yes (NGO) |
| `/connection-response` | POST | Respond to connection request | Yes (NGO) |
| `/change-password` | POST | Change NGO password | Yes (NGO) |

### Hospital Routes

Base path: `/api/v1/hospital`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/register` | POST | Register a new hospital | No |
| `/verify-email` | POST | Verify hospital email | No |
| `/login` | POST | Login as hospital | No |
| `/logout` | GET | Logout hospital | Yes (Hospital) |
| `/profile` | GET | Get hospital profile | Yes (Hospital) |
| `/profile` | PATCH | Update hospital profile | Yes (Hospital) |
| `/blood-requirements` | POST | Update blood requirements | Yes (Hospital) |
| `/nearby-ngos` | GET | Find nearby NGOs/blood banks | Yes (Hospital) |
| `/blood-requests` | GET | Get blood request history | Yes (Hospital) |
| `/connect-ngo` | POST | Connect with an NGO | Yes (Hospital) |

### Blood Donation Routes

Base path: `/api/v1/blood`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/register-donation` | POST | Register a new blood donation | Yes (NGO) |
| `/donations` | GET | Get all NGO blood donations | Yes (NGO) |
| `/donation/:donationId/status` | PATCH | Update blood donation status | Yes (NGO) |
| `/inventory` | GET | Get NGO blood inventory | Yes (NGO) |
| `/donation/:donationId` | GET | Get blood donation details | Yes (NGO) |
| `/expiring` | GET | Get list of expiring blood donations | Yes (NGO) |

### Blood Request Routes

Base path: `/api/v1/blood-request`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/create` | POST | Create a new blood request | Yes (Hospital) |
| `/hospital` | GET | Get hospital blood requests | Yes (Hospital) |
| `/confirm-delivery/:requestId` | POST | Confirm blood delivery | Yes (Hospital) |
| `/ngo` | GET | Get NGO blood requests | Yes (NGO) |
| `/:requestId/status` | PATCH | Update blood request status | Yes (NGO) |
| `/transfer/:donationId` | POST | Transfer blood unit | Yes (NGO) |

### Admin Routes

Base path: `/api/v1/admin`

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|--------------|
| `/login` | POST | Admin login | No |
| `/logout` | GET | Admin logout | Yes (Admin) |
| `/dashboard` | GET | Get dashboard overview | Yes (Admin) |
| `/analytics/blood-inventory` | GET | Get blood inventory analytics | Yes (Admin) |
| `/analytics/geo` | GET | Get geographical analytics | Yes (Admin) |
| `/analytics/donors` | GET | Get donor analytics | Yes (Admin) |
| `/analytics/hospitals` | GET | Get hospital analytics | Yes (Admin) |
| `/analytics/ngos` | GET | Get NGO analytics | Yes (Admin) |
| `/analytics/trends` | GET | Get time-based analytics | Yes (Admin) |
| `/users` | GET | Get all users | Yes (Admin) |
| `/ngos` | GET | Get all NGOs | Yes (Admin) |
| `/hospitals` | GET | Get all hospitals | Yes (Admin) |
| `/blood-donations` | GET | Get all blood donations | Yes (Admin) |
| `/ngo/:ngoId/verify` | PATCH | Verify an NGO | Yes (Admin) |
| `/hospital/:hospitalId/verify` | PATCH | Verify a hospital | Yes (Admin) |

## License

ISC

## Contact

For any questions or feedback, please reach out to the repository owner.