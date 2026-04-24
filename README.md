# 🍕 Food Ordering Chatbot — Railway Deployment Guide

A full-stack food ordering chatbot with:
- **Frontend**: Nginx + HTML/CSS/JS
- **Backend**: FastAPI (Python)
- **Database**: MySQL 8.0
- **Chatbot**: Google Dialogflow

---

## 🚀 Deploy to Railway (Step-by-Step)

### Prerequisites
- [Railway account](https://railway.app) (free tier works)
- This repo pushed to your GitHub account

---

### Step 1 — Push this repo to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/FOOD_ORDERING_CHATBOT.git
git push -u origin main
```

---

### Step 2 — Create a Railway project

1. Go to [railway.app](https://railway.app) → **New Project**
2. Choose **Deploy from GitHub repo** → select your repo
3. Railway will detect the repo — **do not deploy yet**, click **Add a Service** instead

---

### Step 3 — Add MySQL Database

1. In your Railway project, click **+ New** → **Database** → **MySQL**
2. Wait for it to provision
3. Click the MySQL service → **Variables** tab → copy these values:
   - `MYSQLDATABASE`
   - `MYSQLPASSWORD`
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`

---

### Step 4 — Deploy the Backend

1. Click **+ New** → **GitHub Repo** → select your repo
2. In **Settings** → set **Root Directory** to: `backend`
3. Railway auto-detects the `Dockerfile`
4. Go to **Variables** tab and add:

| Variable | Value |
|---|---|
| `DB_HOST` | *(paste MYSQLHOST from step 3)* |
| `DB_PORT` | *(paste MYSQLPORT)* |
| `DB_USER` | *(paste MYSQLUSER)* |
| `DB_PASSWORD` | *(paste MYSQLPASSWORD)* |
| `DB_NAME` | *(paste MYSQLDATABASE)* |

5. Click **Deploy** — wait for it to go green ✅
6. Go to **Settings** → **Networking** → click **Generate Domain**
7. Copy your backend URL, e.g. `https://food-bot-backend.up.railway.app`

---

### Step 5 — Seed the Database

After the backend is running, Railway needs the database schema loaded.

**Option A — Via Railway MySQL shell:**
1. Click the MySQL service → **Connect** tab → open the **MySQL shell**
2. Paste the contents of `db/pandeyji_eatery.sql` and run it

**Option B — From your local machine:**
```bash
mysql -h <MYSQLHOST> -P <MYSQLPORT> -u <MYSQLUSER> -p<MYSQLPASSWORD> < db/pandeyji_eatery.sql
```

---

### Step 6 — Deploy the Frontend

1. Click **+ New** → **GitHub Repo** → select your repo again
2. In **Settings** → set **Root Directory** to: `frontend`
3. Go to **Variables** tab and add:

| Variable | Value |
|---|---|
| `API_BASE` | `https://food-bot-backend.up.railway.app` *(your backend URL from Step 5)* |

4. Click **Deploy** — wait for green ✅
5. Go to **Settings** → **Networking** → **Generate Domain**
6. Your app is live! 🎉

---

## 🌐 Your Live URLs

After deployment you will have:
- **Frontend (share this on resume!)**: `https://YOUR-APP.up.railway.app`
- **Backend API**: `https://YOUR-BACKEND.up.railway.app`
- **API Docs**: `https://YOUR-BACKEND.up.railway.app/docs`

---

## 🧪 Test the App

Open the frontend URL → scroll to **Chatbot Ordering Console** → click **Run Demo Order**

Or test the API directly:
```bash
curl -X POST https://YOUR-BACKEND.up.railway.app/api/order/add \
  -H "Content-Type: application/json" \
  -d '{"session_id":"test-1","food_items":["Samosa","Pizza"],"quantities":[2,1]}'
```

---

## 📋 Menu Items

| Item | Price |
|---|---|
| Pav Bhaji | $6 |
| Chole Bhature | $7 |
| Pizza | $8 |
| Mango Lassi | $5 |
| Masala Dosa | $6 |
| Vegetable Biryani | $9 |
| Vada Pav | $4 |
| Rava Dosa | $7 |
| Samosa | $5 |

---

## 🔧 Run Locally with Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost:8080
- Backend: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🏗️ Architecture

```
Browser → Frontend (Nginx) → Backend (FastAPI) → MySQL
                               ↑
                         Dialogflow webhook
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS, Nginx |
| Backend | Python 3.12, FastAPI, Uvicorn |
| Database | MySQL 8.0 |
| Chatbot | Google Dialogflow |
| Deployment | Railway |
| Local Dev | Docker Compose |
