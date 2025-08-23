Submission for Junction Stupid Hack 2025, so the code may be a little stupid :D.

# GeoCaptcha

An interactive full-stack captcha demo using a Python/Flask backend and a React/TypeScript frontend.

---

## 🚀 Quick Start

### 1. Install Dependencies

**Backend (Python):**

```bash
pip install flask flask-cors pandas
```

**Frontend (Node.js):**

```bash
cd geoCaptcha
npm install
```

---

### 2. Start the Servers

**Backend:**

```bash
python vibe_folder/db_connection.py
```

**Frontend (Dev Mode):**

```bash
cd geoCaptcha
npm run dev
```

---

## 📝 Notes

- Make sure both backend and frontend are running at the same time.
- If running for the first time, install all required pip and npm packages.
- The backend runs on port 5000 by default; the frontend runs on port 5173 (Vite default).
- If you get CORS errors, ensure `flask-cors` is installed and enabled in your backend.

---

## 📂 Project Structure

```
stupid-captcha/
├── geoCaptcha/         # Frontend (React + Vite)
│   └── ...
├── vibe_folder/        # Backend (Flask API)
│   └── db_connection.py
├── database.txt        # Captcha data
└── README.md           # This file
```

---

## 💡 Tips

- For production, use `npm run build` in the frontend and a production WSGI server for Flask.
- Update `database.txt` to add or change captcha data.
- For any issues, check terminal output for errors and ensure all dependencies are installed.
