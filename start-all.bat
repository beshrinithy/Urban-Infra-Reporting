@echo off
echo Starting Urban Infrastructure Reporting System...

echo Starting AI Service (Port 8000)...
start "AI Service" cmd /k "cd ai_module && call ..\.venv\Scripts\activate && python -m uvicorn main:app --reload --port 8000 || pause"

echo Starting Express Backend (Port 5000)...
start "Backend Server" cmd /k "cd backend && node server.js || pause"

echo Starting React Frontend (Port 3000)...
start "Frontend App" cmd /k "cd frontend && npm run dev || pause"

echo All services started! 
echo Frontend: http://localhost:3000
echo Backend: http://localhost:5000
echo AI Service: http://localhost:8000
pause
