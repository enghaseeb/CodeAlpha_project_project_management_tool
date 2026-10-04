# Setup Guide — Run Lanes on Your Laptop

You need three things running: **MongoDB** (database), the **backend** (port 5000), and the
**frontend** (port 5173). Follow the steps in order.

---

## Step 1 — Install the tools

### Node.js (required)
1. Go to https://nodejs.org and download the **LTS** version (18 or newer).
2. Install it (keep the defaults). This also installs `npm`.
3. Verify in a terminal (Command Prompt / PowerShell on Windows, Terminal on Mac/Linux):
   ```bash
   node -v      # should print v18.x or higher
   npm -v
   ```

### MongoDB — pick ONE option

**Option A: MongoDB Atlas (cloud, easiest, no install)**
1. Create a free account at https://www.mongodb.com/atlas and create a **free (M0) cluster**.
2. *Database Access* → add a database user (username + password). Remember them.
3. *Network Access* → **Add IP Address** → "Allow access from anywhere" (fine for development).
4. *Database* → **Connect** → **Drivers** → copy the connection string. It looks like:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/`
5. Put your real username/password in it and add a database name at the end, e.g.:
   `mongodb+srv://haseeb:MyPass123@cluster0.xxxxx.mongodb.net/project-management-tool`
   (If your password has special characters like `@` or `#`, URL-encode them.)

**Option B: MongoDB installed on your laptop**
1. Download **MongoDB Community Server** from https://www.mongodb.com/try/download/community
2. Install it. On Windows, keep "Install MongoDB as a Service" ticked — it then starts automatically.
3. Your connection string is simply: `mongodb://127.0.0.1:27017/project-management-tool`
4. Make sure it's running:
   - Windows: it runs as a service (check *Services* → MongoDB Server).
   - Mac (Homebrew): `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`

**Option C: Docker** (if you already use it)
```bash
docker run -d --name mongo -p 27017:27017 mongo:7
```
Connection string: `mongodb://127.0.0.1:27017/project-management-tool`

---

## Step 2 — Unzip the project

Unzip `pmt.zip`. You will get a folder `pmt/` containing `backend/` and `frontend/`.
Open the whole `pmt` folder in VS Code (optional but recommended).

---

## Step 3 — Start the backend

Open a terminal and run:

```bash
cd pmt/backend
npm install
```

Create your environment file:

- **Mac/Linux:** `cp .env.example .env`
- **Windows (PowerShell):** `copy .env.example .env`

Open `backend/.env` and edit it:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=<your connection string from Step 1>
JWT_SECRET=type_any_long_random_text_here_like_9f8a7d6c5b4e3a2f1
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```

Start the server:

```bash
npm run dev
```

You should see:
```
MongoDB connected: ...
API + WebSocket server running on port 5000
```
Leave this terminal open. Quick check: open http://localhost:5000/api/health in your browser —
you should see `{"status":"ok"}`.

*(Optional)* Load demo data (2 users + a sample board). In a **second** terminal:
```bash
cd pmt/backend
npm run seed
```
Demo logins afterwards: `alice@demo.com` / `password123` and `bob@demo.com` / `password123`.
Note: the seed script wipes existing data, so only use it on a fresh/dev database.

---

## Step 4 — Start the frontend

Open a **new** terminal (keep the backend one running):

```bash
cd pmt/frontend
npm install
```

Create its env file (defaults already point to `localhost:5000`, so this is optional):

- **Mac/Linux:** `cp .env.example .env`
- **Windows (PowerShell):** `copy .env.example .env`

Start it:

```bash
npm run dev
```

Open **http://localhost:5173** in your browser. 🎉

---

## Step 5 — Try the real-time features

1. Register two accounts (or use the seeded Alice and Bob).
2. Open one normal browser window and one **incognito/private** window side by side, each logged in as a different user.
3. As user 1, create a project, then click **Invite** and add user 2 by their email.
4. Open the project in both windows. Now drag cards, add tasks, and write comments in one
   window — the other window updates instantly. Assigning a task to someone sends them a live
   notification (bell icon, top right).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `MongoDB connection error` | Check `MONGODB_URI` in `backend/.env`. For Atlas, confirm the IP allowlist and password. For local, confirm `mongod` is running. |
| `EADDRINUSE: port 5000` | Another app uses port 5000 (on macOS, AirPlay often does). Change `PORT=5001` in `backend/.env` **and** set `VITE_API_URL=http://localhost:5001/api` and `VITE_SOCKET_URL=http://localhost:5001` in `frontend/.env`, then restart both. |
| Browser shows "Network Error" / CORS error | Backend not running, or `CLIENT_URL` in `backend/.env` doesn't match the frontend URL exactly (`http://localhost:5173`). Restart the backend after editing `.env`. |
| No live updates | Make sure both windows are on the same project page and the backend terminal has no errors. Log out and back in to reconnect the socket. |
| `npm install` fails | Confirm `node -v` is 18+. Delete `node_modules` and `package-lock.json`, then retry. |
| Changed `.env` but nothing happened | Stop the server (Ctrl+C) and start it again — env files are read only at startup. |

## Building for production (optional)

```bash
cd frontend && npm run build     # outputs frontend/dist
cd ../backend && npm start        # runs the API without nodemon
```
Deploy the backend to Render/Railway (set the same env vars), the frontend to Vercel/Netlify
(set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend's public URL), and set the backend's
`CLIENT_URL` to your frontend's public URL.
