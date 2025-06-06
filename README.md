# LifeLink - Blood Donation Management System

<div align="center">

![LifeLink Logo](public/images/logo.png)

A comprehensive healthcare platform connecting blood donors, recipients, NGOs, and hospitals to streamline blood donation and save lives.

[![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/yourusername/blood-donation)](https://github.com/yourusername/blood-donation/stargazers)
[![GitHub Issues](https://img.shields.io/github/issues/yourusername/blood-donation)](https://github.com/yourusername/blood-donation/issues)

[View Demo](https://lifelink-demo.vercel.app) · [Report Bug](https://github.com/yourusername/blood-donation/issues) · [Request Feature](https://github.com/yourusername/blood-donation/issues)

</div>

## 🩸 Why LifeLink Matters

Every two seconds, someone needs blood. LifeLink addresses critical challenges in blood donation:

- **Saves Lives**: Connects donors with recipients in real-time
- **Reduces Wastage**: Smart inventory management prevents blood expiration
- **Improves Access**: Makes finding and scheduling donations effortless
- **Ensures Trust**: Verified institutions and transparent processes
- **Data-Driven**: Analytics for better resource allocation

## ✨ Key Features

### 🔐 User Management
- Multi-role authentication system (Donors, Recipients, NGOs, Hospitals)
- Role-specific dashboards and access controls
- Verified profiles with trust scores
- Secure data handling and privacy controls

### 🏥 Blood Donation Management
- Smart donor-recipient matching
- Real-time inventory tracking
- Automated appointment scheduling
- Digital certificates and donation history
- Blood camp organization tools

### 📊 Analytics & Reporting
- Real-time availability dashboards
- Donation impact statistics
- Predictive supply-demand analysis
- Custom report generation

### 🗺️ Location Services
- Interactive map for donation centers
- Proximity-based matching
- Route optimization for emergency requests
- Blood camp location tracking

## 🛠️ Tech Stack

### Frontend
```
React + Vite │ Tailwind CSS │ Framer Motion │ Chart.js │ React Google Maps
```

### Backend
```
Node.js │ Express │ MongoDB │ JWT │ Cloudinary │ Nodemailer
```

### DevOps
```
Docker │ GitHub Actions │ Jest │ ESLint │ Prettier
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- Cloudinary Account
- Google Maps API Key

### Installation

1. **Clone Repository**
```bash
git clone https://github.com/yourusername/blood-donation.git
cd blood-donation
```

2. **Backend Setup**
```bash
cd Backend
npm install
```

3. **Frontend Setup**
```bash
cd ../Frontend
npm install
```

4. **Environment Variables**

Create a `.env` file in the `Backend` directory and add the following:

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

In the `Frontend` directory, create a `.env` file and add:

```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your_google_maps_key
```

5. **Run the Application**

- **Backend:**
```bash
cd Backend
npm run dev
```

- **Frontend:**
```bash
cd Frontend
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