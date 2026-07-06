import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import routes from './routes/index.js';

const app = express();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS Configuration - Allow credentials for refresh tokens and cross-origin resource access
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite standard
    credentials: true,
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount all routes
app.use('/api', routes);

// Simple healthcheck / welcome page
app.get('/', (req, res) => {
  res.json({ message: 'Sri Lanka Local Service Marketplace API is running' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

export default app;
