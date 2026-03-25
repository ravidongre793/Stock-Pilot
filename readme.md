# Indian Stock Market Predictor

A full-stack web application designed to track and predict Indian stock market trends. The project features real-time stock data fetching, interactive financial charts, and technical indicator analysis.

## Tech Stack

### Frontend (`/client`)
- **React 19** with **Vite** for fast, modern UI development.
- **Lightweight Charts** for high-performance interactive financial charting.
- **Lucide React** for icons.
- **React Router v7** for application routing.
- **Axios** for API calls.

### Backend (`/server`)
- **Node.js** & **Express** for the RESTful API.
- **WebSockets (`ws`)** for real-time data streaming.
- **Yahoo Finance 2 (`yahoo-finance2`)** for fetching historical and real-time stock market data.
- **Technical Indicators (`technicalindicators`)** for calculating trading signals and market trends.

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites
- Node.js (v18 or higher recommended)
- npm

### Installation

1. Navigate to the project directory.

2. **Install Server Dependencies:**
   ```bash
   cd server
   npm install
   ```

3. **Install Client Dependencies:**
   ```bash
   cd client
   npm install
   ```

### Running the Application

You will need two terminal windows to run both the frontend and backend concurrently.

1. **Start the Backend Server:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Development Server:**
   ```bash
   cd client
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Features
- Real-time stock data tracking.
- Interactive charting with customized indicators.
- Technical analysis integration for stock sentiment and predictions.
