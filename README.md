# ResumeX — AI Resume Analyzer

A full‑stack web app that analyzes resumes against a job description, returns scores + suggestions, and generates an improved PDF via an n8n workflow. Includes cookie‑based auth, email verification, and password reset using SendGrid.

---

## ✨ Features

- **Resume analysis** (scores + suggestions) via **n8n** webhook
- **PDF generation** of the improved resume (download link shown in UI)
- **Auth**: Signup, login (JWT in HttpOnly cookie), logout
- **Email flows**: verification, password reset (SendGrid Dynamic Templates)
- **Saved reports** (logged‑in users see their past analyses in a table with a “View suggestions” modal)
- Modern **React** UI (Vite) with glassmorphism effects + responsive layout
- **Express + MongoDB** backend with secure CORS/cookies config

---

## 🧰 Tech Stack

- **Frontend**: React (Vite), CSS (custom)
- **Backend**: Node.js, Express, Mongoose (MongoDB)
- **Auth**: JWT (HttpOnly cookie)
- **Email**: SendGrid (Dynamic Templates)
- **Automation**: n8n (webhook → AI agent → PDF → URL)
- **Build/Dev**: Vite, Nodemon

---

## 📁 Repository Structure (typical)

```
root/
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ Home.jsx
│  │  ├─ Header.jsx
│  │  ├─ SignupPage.jsx
│  │  ├─ LoginPage.jsx
│  │  ├─ VerifyEmail.jsx
│  │  ├─ ForgotPasswordPage.jsx
│  │  ├─ ResetPasswordPage.jsx
│  │  ├─ ResumeUpload.jsx
│  │  ├─ DesignShowcase.jsx
│  │  └─ styles (various .css files)
│  ├─ index.html
│  └─ vite.config.js
└─ backend/
   ├─ index.js
   ├─ routes/
   │  └─ auth-route.js
   ├─ controllers/
   │  └─ auth-controller.js
   ├─ middleware/
   │  └─ verifyToken.js
   ├─ utils/
   │  ├─ generateJWTToken.js
   │  └─ generateVerificationToken.js
   ├─ database/
   │  └─ connectiontoDatabase.js
   ├─ model/
   │  └─ user.js
   └─ sendgrid/
      └─ email.js
```

> Your exact layout may differ slightly; this README covers the concepts and required env/config either way.

---

## ⚙️ Environment Variables

Create **two** `.env` files — one in **backend/** and one in **frontend/**.

### backend/.env
```
PORT=3000
NODE_ENV=development

MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret

# SendGrid
SENDGRID_API_KEY=SG.xxxxx...
EMAIL_FROM="ResumeX <no-reply@yourdomain.com>"
SENDGRID_TPL_VERIFY=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TPL_WELCOME=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TPL_RESET=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TPL_RESET_OK=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# For links generated in emails
CLIENT_URL=http://localhost:5173
```

### frontend/.env
```
VITE_API_URL=http://localhost:3000/api
# (optional) VITE_N8N_WEBHOOK_URL=https://your-n8n-domain/webhook/resume-upload
```

> **NOTE**: In production (HTTPS), cookies require `secure: true` and `sameSite: "none"`. The backend sets this automatically based on `NODE_ENV`.

---

## 🧪 Local Development

### 1) Install
From the repo **root**, in two terminals:

**Backend**
Copy `.env.example` to `.env` and fill values.
```bash
cd backend
npm install
npm run dev   # starts Express on http://localhost:3000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev   # starts Vite on http://localhost:5173
```

### 2) CORS (backend)
`backend/index.js` already uses:
```js
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
```
Ensure `CLIENT_URL` matches your Vite dev URL.

### 3) n8n webhook
In `frontend/src/ResumeUpload.jsx` the analysis POST target can be:
- hardcoded `ANALYZE_URL` **or**
- moved to `VITE_N8N_WEBHOOK_URL` env.

The webhook should return JSON including `parameters`, `suggestions`, and a PDF `url` (or your flow should be normalized by the UI helper).

---

## 🔐 API Endpoints (Auth)

All are mounted under `/api/auth`:

- `POST /signup` — create user, set auth cookie, send verification email
- `POST /login` — login, set auth cookie
- `POST /logout` — clear auth cookie
- `POST /verify-email` — verify email by 6‑digit code
- `POST /forgot-password` — send password reset link (email)
- `POST /reset-password/:token` — set new password
- `GET /check/auth` — returns authenticated user (requires cookie + token)

---

## 🧩 How the n8n Flow Fits

1. **Webhook** receives `{ resume (file), jobDescription (text) }`
2. **Parse / AI agent** computes `parameters[]` + `suggestions[]` + `improved_resume`
3. **HTML → PDF**: your Code node builds HTML; a PDF node creates the file
4. **Storage**: you host the PDF and return a URL
5. **Webhook response** returns JSON consumed by the React app:
   ```json
   {
     "parameters": [{ "name":"Skills","score":80 }, ...],
     "suggestions": ["...", "..."],
     "url": "https://.../Improved_Resume.pdf"
   }
   ```
6. **Frontend** shows progress bars, suggestions, and a **Download** button

---

## 🚀 Deployment Notes

- **Backend**: Render, Railway, Fly.io, etc. Set environment variables. Ensure `NODE_ENV=production` so cookies are `secure: true` + `sameSite: "none"`.
- **Frontend**: Netlify, Vercel, Cloudflare Pages (build with Vite). Set `VITE_API_URL` to your deployed backend `/api` base.
- **SendGrid**: Verify your sender domain, use Production API key, and Dynamic Template IDs.
- **n8n**: Deploy and make sure the webhook URL is publicly accessible (HTTPS).

---

## 🧯 Troubleshooting

- **`Failed to fetch`**: Check CORS (`origin`), `credentials: true`, and that backend is running on the expected port.
- **Cookie not set**: Must be same domain or `sameSite: "none"` + `secure: true` over HTTPS.
- **404 `/auth/check`**: The route is `/check/auth` (note the slash order).
- **White email styling**: Ensure SendGrid Dynamic Template uses your dark theme colors (lavender/purple). The backend only supplies variables; style lives in the template.
- **n8n output shape varies**: The UI normalizes both `{...}` and stringified `output` payloads. Confirm your webhook returns a PDF URL field as `url`.

---


