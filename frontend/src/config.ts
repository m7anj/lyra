// src/config.ts

// Default to localhost if the environment variable is not set
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Export any other configuration variables here
export const APP_VERSION = '1.0.0';