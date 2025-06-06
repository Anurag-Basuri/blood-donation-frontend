# 🌐 **LifeLink – Smart Health Resource Coordination Platform**

<div align="center">
  <img src="public/images/logo.png" alt="LifeLink Logo" width="200" />

  <p align="center">
    A unified, intelligent, and real-time platform that connects <strong>donors, recipients, hospitals, NGOs, and volunteers</strong> to simplify health donations, manage emergencies, and save lives — beyond just blood.
  </p>

  [![License](https://img.shields.io/badge/license-ISC-blue.svg)](LICENSE)
  [![GitHub Stars](https://img.shields.io/github/stars/yourusername/lifelink)](https://github.com/yourusername/lifelink/stargazers)
  [![GitHub Issues](https://img.shields.io/github/issues/yourusername/lifelink)](https://github.com/yourusername/lifelink/issues)

  🔗 [View Live Demo](https://lifelink-demo.vercel.app) · 🐞 [Report Bug](https://github.com/yourusername/lifelink/issues) · 💡 [Request Feature](https://github.com/yourusername/lifelink/issues)
</div>

---

## ❓ Why LifeLink?

Every few seconds, someone needs **blood**, **plasma**, **platelets**, or even **equipment like oxygen or wheelchairs**. LifeLink is built to address:

- ⏱️ **Urgency**: Matches donors & needs instantly
- 📦 **Coordination**: Links verified NGOs, hospitals, and donors
- 🌍 **Reach**: Location-based access to healthcare support
- 🔐 **Trust & Transparency**: Verified data and institutions
- 📊 **Insights**: Tracks donation activity and health resource analytics

---

## 👤 Supported User Roles

### 1. **Users / Donors / Recipients**
- Register as a donor or request blood/resources
- Track donation history & receive certificates
- Set preferences for alerts, availability, and past contributions

### 2. **Hospitals**
- Create blood and plasma requests
- Manage real-time inventory (non-storage-based)
- View nearby donors and campaign details
- Track fulfilled vs pending requests

### 3. **NGOs**
- Organize donation camps and drives
- Post verified emergency requests
- Volunteer coordination dashboard
- Analytics on drive performance and impact

### 4. **Volunteers**
- Join and assist NGOs or hospitals in donation drives
- Earn digital certificates for verified participation
- Access training guides (CPR, safety, etc.)

---

## ✨ Key Features

### 🔐 Role-Based Access & Dashboards
- Admin, NGO, Hospital, User
- Secure JWT authentication
- Dynamic dashboards with modular UIs

### 🩸 Smart Donation Matching
- Match donors with recipients using blood type, location, and urgency
- Real-time request visibility and fulfillment flow

### 📆 Campaign & Camp Management
- NGOs/Hospitals can schedule, promote, and manage donation events
- Users can join based on interest/location

### 📡 Location-Based Discovery
- Map view to explore active camps, donation centers, and hospitals
- Filter by blood group/resource type

### 📥 Request & Inventory Overview
- Hospitals post verified requests
- Track real-time status, fulfillment, and urgency
- Inventory is just-in-time (non-storage-based)

### 📊 Insightful Analytics
- Contribution history
- Camp performance reports
- Demand forecasting via simple statistics

---

## 🛠️ Tech Stack

### ⚙️ Backend
- Node.js · Express.js
- MongoDB with Mongoose
- JWT · bcrypt · Nodemailer
- Cloudinary for media uploads

### 🎨 Frontend
- React.js (Vite) · Tailwind CSS
- Framer Motion · Chart.js
- React Google Maps API
- Axios

### 🧪 Testing & DevOps
- Jest
- ESLint & Prettier
- Docker (optional)
- GitHub Actions

---

## 📁 Folder Structure

```
Backend/
├── app.js              # Express app configuration
├── server.js           # Server entry point
├── controllers/        # Request handlers
├── models/            # Database schemas
├── routes/            # API routes
├── middleware/        # Custom middleware
├── scripts/           # Utility scripts
└── utils/             # Helper functions

Frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── router/        # Route configurations
│   └── services/      # API services
├── public/            # Static assets
└── vite.config.js     # Vite configuration
```

## 🚀 Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas or local instance
- Google Maps API key
- Cloudinary account

### Backend Setup

1. Navigate to backend directory:
```bash
cd Backend
npm install
```

2. Create `.env` in Backend root:
```env
PORT=8000
MONGODB_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_password
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
CORS_ORIGIN=http://localhost:5173
```

3. Start development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd Frontend
npm install
```

2. Create `.env` in Frontend root:
```env
VITE_API_URL=http://localhost:8000/api/v1
VITE_GOOGLE_MAPS_KEY=your_maps_key
```

3. Start development server:
```bash
npm run dev
```

## 🔌 API Overview

| Category  | Endpoints |
|-----------|-----------|
| Auth      | `/auth/register`, `/auth/login`, `/auth/refresh-token` |
| Users     | `/users`, `/users/:id`, `/users/history` |
| Donations | `/donations`, `/donations/:id` |
| Requests  | `/requests`, `/requests/fulfill` |
| Hospitals | `/hospitals`, `/hospitals/inventory` |
| NGOs      | `/ngo/camps`, `/ngo/requests` |

Full API documentation available in `Backend/docs/`.

## 🤝 Contributing

1. Fork this repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📜 License

Distributed under the ISC License. See `LICENSE` for more information.

## 🙏 Acknowledgements

- [React](https://react.dev)
- [Express](https://expressjs.com)
- [MongoDB](https://mongodb.com)
- [Tailwind CSS](https://tailwindcss.com)
- [Framer Motion](https://framer.com/motion)
- [Cloudinary](https://cloudinary.com)
- [Chart.js](https://chartjs.org)
- [Google Maps Platform](https://developers.google.com/maps)

---

<div align="center">
Built with 💖 to connect lives and care beyond boundaries.
</div>