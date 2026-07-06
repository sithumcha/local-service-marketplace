# QuickServe.lk - Sri Lanka Trusted Local Service Marketplace

A location-based service marketplace for Sri Lanka, connecting customers with trusted local service providers (plumbers, electricians, tutors, cleaners, etc.).

## Tech Stack
- **Frontend**: React (Vite), React Router, Zustand, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Mongoose (MongoDB)
- **Security**: JWT access tokens + HTTP-only rotation refresh cookies

## Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on `mongodb://127.0.0.1:27017` (or MongoDB Atlas URI)

### Setup & Installation
1. Install all dependencies for the root, backend, and frontend directories:
   ```bash
   npm run install-all
   ```

2. Configure Environment Variables:
   A default config has been created in `backend/.env`. If you need to use MongoDB Atlas instead of local MongoDB, update `MONGO_URI` there.

### Running the App
Start both the backend server and the frontend Vite server concurrently with a single command from the root folder:
```bash
npm run dev
```

- **Frontend dev server**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)
