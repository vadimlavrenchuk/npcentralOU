@echo off
echo Starting NPCentral OU Backend Server...
echo.
echo Make sure you have:
echo 1. Updated .env file with MongoDB Atlas connection string
echo 2. MongoDB Atlas cluster is running and accessible
echo.
cd backend
npm run dev
