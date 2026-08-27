# GreenEye — AI Plant Disease Detection

GreenEye is a full-stack web application that detects plant diseases from photos using Google Gemini AI. Upload a photo of any plant leaf and receive an instant diagnosis with cause, treatment, and prevention steps.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React JS |
| Backend | Python Flask |
| Database | MySQL |
| AI | Google Gemini API |
| Authentication | JWT + Bcrypt |

---

## Features

- Secure user registration and login
- Upload any plant photo via drag and drop
- AI-powered disease detection in seconds
- Full diagnosis: disease name, severity, cause, treatment, prevention
- Scan history saved per user
- Protected dashboard — only accessible after login

---

## Project Structure

```
CropEye_Project/
├── frontend/
│   └── src/
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   └── Dashboard.jsx
│       ├── components/
│       │   └── PrivateRoute.jsx
│       └── App.jsx
│
└── backend/
    ├── app.py
    ├── config.py
    ├── database.sql
    ├── requirements.txt
    ├── .env
    └── routes/
        ├── __init__.py
        ├── auth.py
        └── scan.py
```

---

## Local Setup

### Requirements
- Node.js
- Python 3.10+
- MySQL Community Server
- Gemini API key from aistudio.google.com

### Database
Open MySQL Workbench and run `database.sql` to create the database and tables.

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
venv\Scripts\python.exe -m pip install -r requirements.txt
```

Create `.env` file in backend folder:
```
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=greeneye
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_gemini_key
```

Start Flask:
```bash
venv\Scripts\python.exe app.py
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## API Reference

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | /api/auth/register | Create account | No |
| POST | /api/auth/login | Login, returns token | No |
| POST | /api/scan/analyse | Analyse plant image | Yes |
| GET | /api/scan/history | Get scan history | Yes |

Protected routes require this header:
```
Authorization: Bearer <token>
```

---

## Environment Variables

### Backend `.env`
```
MYSQL_HOST=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DB=
JWT_SECRET=
GEMINI_API_KEY=
```

### Frontend `.env`
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Author

Built by [Punam Nikam]