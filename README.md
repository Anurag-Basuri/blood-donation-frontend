# Blood Donation Management System

A comprehensive platform connecting blood donors, recipients, NGOs, hospitals, and blood banks to streamline the blood donation process and save lives.

---

## Table of Contents
- [Why This Project Matters](#why-this-project-matters)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Why This Project Matters

- **Increase Blood Donation Rates:** Makes it easy to find donation centers and schedule appointments
- **Improve Supply Chain:** Optimizes blood distribution to ensure availability where needed
- **Reduce Blood Wastage:** Minimizes expired blood through efficient inventory management
- **Enhance Transparency:** Secure platform fostering trust between donors and recipients
- **Empower Stakeholders:** Real-time blood availability info for informed decisions

## Features

- **User Management**
  - Multi-role authentication (Users, NGOs, Hospitals, Admin)
  - Role-specific dashboards and permissions
  - Profile management and verification

- **Blood Donation**
  - Donation scheduling and tracking
  - Real-time inventory management
  - Donation history and certificates
  - Blood camp management

- **Hospital & NGO Features**
  - Blood request management
  - Inventory tracking
  - Camp organization tools
  - Analytics dashboard

- **Additional Features**
  - Real-time donor-recipient matching
  - Interactive maps for centers
  - Statistics and reporting
  - Email notifications

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS for styling
- Framer Motion for animations
- Chart.js for statistics
- React Google Maps
- Axios for API calls

### Backend
- Node.js & Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for media
- Nodemailer for emails

### DevOps & Tools
- ESLint & Prettier
- Git & GitHub
- Docker support
- Jest for testing

## Project Structure

```
Backend/
├── app.js
├── server.js
├── package.json
├── controllers/
├── db/
├── middleware/
├── models/
├── routes/
├── scripts/
├── test-data/
└── utils/

Frontend/
├── src/
│   ├── App.jsx
│   ├── main.jsx
│   ├── components/
│   ├── pages/
│   ├── router/
│   └── services/
├── public/
├── package.json
└── vite.config.js
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- MongoDB instance (local or Atlas)
- Cloudinary account
- Google Maps API key

### Backend Setup

1. **Clone & Install:**
```bash
git clone https://github.com/yourusername/blood-donation.git
cd blood-donation/Backend
npm install
```

2. **Environment Setup:**
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
EMAIL_USER=your_email
EMAIL_PASS=your_password
CORS_ORIGIN=http://localhost:5173
```

3. **Start Server:**
```bash
npm run dev
```

### Frontend Setup

1. **Install Dependencies:**
```bash
cd ../Frontend
npm install
```

2. **Environment Setup:**
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

3. **Start Development Server:**
```bash
npm run dev
```

## API Overview

### Core Endpoints

- **Authentication**
  - `/api/v1/auth/register`
  - `/api/v1/auth/login`
  - `/api/v1/auth/refresh-token`

- **Users & Profiles**
  - `/api/v1/users`
  - `/api/v1/ngo`
  - `/api/v1/hospitals`

- **Blood Donation**
  - `/api/v1/donations`
  - `/api/v1/requests`
  - `/api/v1/inventory`

Full API documentation available in the [Backend/docs](Backend/docs) directory.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see [LICENSE](LICENSE) for details.

## Acknowledgements

- [React](https://react.dev/)
- [Express](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [Cloudinary](https://cloudinary.com/)
- [Chart.js](https://www.chartjs.org/)

---

Created with ❤️ for saving lives