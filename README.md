# Blood Donation Management System

A full-stack web application to streamline blood donation, connect donors, NGOs, hospitals, and recipients, and manage blood donation drives and requests.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [API Overview](#api-overview)
- [License](#license)

---

## Features

- User, NGO, and Hospital registration & authentication
- Role-based dashboards
- Blood donation request & management
- Blood donation camp management (NGOs)
- Real-time donor-recipient matching
- Certificates, badges, and donation history
- Responsive, modern UI with statistics and testimonials

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Framer Motion, Chart.js, React Google Maps
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT, Cloudinary, Nodemailer
- **Other:** ESLint, Prettier, dotenv

---

## Project Structure

```
Backend/
  app.js
  server.js
  package.json
  controllers/
  db/
  middleware/
  models/
  routes/
  scripts/
  test-data/
  utils/
Frontend/
  src/
    App.jsx
    main.jsx
    index.css
    components/
    pages/
    router/
    ...
  public/
  package.json
  vite.config.js
  index.html
```

---

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or cloud)

### Backend Setup

1. **Install dependencies:**
   ```sh
   cd Backend
   npm install
   ```

2. **Configure environment variables:**  
   Create a `.env` file in `Backend/` with:
   ```
   PORT=8000
   MONGODB_URI=your_mongodb_connection_string
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   ACCESS_TOKEN_EXPIRY=15m
   REFRESH_TOKEN_EXPIRY=7d
   CORS_ORIGIN=http://localhost:5173
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   EMAIL_USER=your_email
   EMAIL_PASS=your_email_password
   ```

3. **Run the backend server:**
   ```sh
   npm run dev
   ```

### Frontend Setup

1. **Install dependencies:**
   ```sh
   cd Frontend
   npm install
   ```

2. **Configure environment variables:**  
   Create a `.env` file in `Frontend/` with:
   ```
   VITE_API_URL=http://localhost:8000/api/v1
   ```

3. **Run the frontend:**
   ```sh
   npm run dev
   ```

---

## Scripts

### Backend

- `npm run dev` – Start backend in development mode (nodemon)
- `npm start` – Start backend in production
- `npm run create-admin` – Create an admin user

### Frontend

- `npm run dev` – Start frontend in development mode
- `npm run build` – Build frontend for production
- `npm run preview` – Preview production build

---

## API Overview

The backend exposes RESTful endpoints for:

- **User:** Registration, login, profile, donation history, etc.
- **NGO:** Registration, login, camp management, inventory, etc.
- **Hospital:** Registration, login, blood requests, etc.
- **Admin:** Dashboard, user/NGO/hospital management.
- **Blood:** Donation, inventory, status updates.
- **Centers:** Blood banks and donation camps.

See the `controllers/` and `routes/` directories in [Backend](Backend/) for details.

---

## License

This project is licensed under the ISC License. See [Backend/LICENSE](Backend/LICENSE) and [Frontend/LICENSE](Frontend/LICENSE).

---

## Acknowledgements

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Cloudinary](https://cloudinary.com/)
- [Chart.js](https://www.chartjs.org/)