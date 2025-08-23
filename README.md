# GeoCaptcha

An interactive full-stack captcha system with **dual verification methods**: traditional map-based location verification and **AI-powered photo verification** using OpenAI GPT-4o.

## ✨ Features

- **🗺️ Map-Based Verification**: Two-step process with interactive maps powered by Leaflet
- **📸 AI Photo Verification**: Upload photos from target locations for AI analysis (Beta)
- **🎨 Google-Style UI**: Professional design with gradient animations and hover effects
- **🔄 Method Toggle**: Seamlessly switch between verification methods
- **🤖 OpenAI Integration**: GPT-4o analyzes photos for location authenticity
- **⚡ Real-time Feedback**: Instant success/failure messages with confidence scores

---

## 🚀 Quick Start

### 1. Install Dependencies

**Backend (Python):**

```bash
pip install -r requirements.txt
```

**Frontend (Node.js):**

```bash
cd geoCaptcha
npm install
```

### 2. Configure OpenAI API (for Photo Verification)

Create a `.env` file in the `vibe_folder/` directory:

```bash
# vibe_folder/.env
API_KEY=your_openai_api_key_here
```

**Note**: Photo verification requires an OpenAI API key. Map verification works without it.

---

### 3. Start the Servers

**Backend:**

```bash
cd vibe_folder
python3 db_connection.py
```

**Frontend (Dev Mode):**

```bash
cd geoCaptcha
npm run dev
```

---

## 🎮 How to Use

### Map Verification (Traditional)
1. **Share Location**: Allow geolocation or enter coordinates manually
2. **Verify Current Code**: Enter the code displayed on the target location
3. **Submit New Code**: Provide a new code for the next user

### Photo Verification (Beta) 🆕
1. **Click "Try another method (beta)"** to enable photo verification
2. **Upload Photo**: Select an image taken at the target location
3. **AI Analysis**: GPT-4o analyzes the photo for location authenticity
4. **Instant Results**: Get immediate verification with confidence scores

---

## 🏗️ Architecture

### Frontend (React + TypeScript)
- **Vite**: Fast build tool and dev server
- **Leaflet**: Interactive maps with refresh functionality  
- **CSS Animations**: Google-style UI with gradient effects
- **Conditional Rendering**: Seamless method switching

### Backend (Flask + Python)
- **Flask**: RESTful API with CORS support
- **OpenAI GPT-4o**: AI-powered image analysis
- **Pandas**: Coordinate and captcha data management
- **Base64 Encoding**: Secure photo upload handling

---

## 📂 Project Structure

```
GeoCaptcha/
├── geoCaptcha/                 # Frontend (React + Vite)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── Captcha.tsx    # Main captcha component
│   │   │   ├── Captcha.css    # Google-style styling
│   │   │   └── Map.tsx        # Leaflet map integration
│   │   └── functions/
│   │       └── helperFunctions.tsx  # API communication
│   └── package.json
├── vibe_folder/               # Backend (Flask API)
│   ├── db_connection.py       # Main Flask application
│   ├── coordinate_check.py    # Distance calculations
│   ├── agent.py              # OpenAI integration utilities
│   └── .env                  # API keys (create this)
├── database.txt              # Captcha location data  
├── requirements.txt          # Python dependencies
└── README.md                 # This file
```

---

## � API Endpoints

### Backend (Flask - Port 5000)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/get_captcha` | GET | Retrieve captcha location data |
| `/check_captcha` | POST | Verify traditional map codes |
| `/get_random_coordinates` | GET | Get nearby location coordinates |
| `/verify_photo` | POST | **🆕 AI photo verification endpoint** |

### Photo Verification Request
```bash
curl -X POST "http://localhost:5000/verify_photo" \
  -F "photo=@image.jpg" \
  -F "latitude=60.1879" \
  -F "longitude=24.8241"
```

### Response Format
```json
{
  "success": true,
  "message": "AI analysis confirms photo matches target location",
  "confidence": 0.85
}
```

---

## 🤖 AI Analysis Features

The AI photo verification system analyzes:
- **🏢 Visible landmarks and buildings**
- **🌍 Geographic and environmental context**
- **🏛️ Architectural styles matching the region**
- **🪧 Text, signs, and license plates**
- **🌡️ Climate and weather appropriateness**

---

## 💡 Development Notes

- **Backend runs on port 5000** (Flask default)
- **Frontend runs on port 5173+** (Vite default, auto-increments if busy)
- **CORS enabled** for cross-origin requests
- **Environment variables** managed via `.env` files
- **Hot reload** enabled in development mode

### Production Deployment
- Use `npm run build` for optimized frontend build
- Deploy Flask with production WSGI server (Gunicorn, uWSGI)
- Set `FLASK_ENV=production` for production backend
- Secure API keys with proper environment management

---

## 🚨 Troubleshooting

### Common Issues
- **Port conflicts**: Kill processes on ports 5000/5173 or use different ports
- **CORS errors**: Ensure `flask-cors` is installed and configured
- **OpenAI errors**: Verify API key is correctly set in `.env` file
- **Map loading**: Check internet connection for Leaflet tile loading
- **Photo upload**: Ensure file size is reasonable (<10MB)

### Debug Commands
```bash
# Check if backend is running
curl http://localhost:5000/get_captcha

# Test photo verification
curl -X POST "http://localhost:5000/verify_photo" -F "photo=@test.jpg" -F "latitude=60" -F "longitude=24"

# View backend logs in terminal where Flask is running
```

---

## 📄 License

Submission for **Junction Stupid Hack 2025** - Code may contain creative solutions! 🎉
