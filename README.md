# 🌌 Social Sphere • Next-Gen Celestial Spatial Glass Social Network

**Social Sphere** is a modern social media platform featuring a **"Celestial Spatial Glass"** design language, paired with the full feature suite of Instagram:
- **Unique Design Aesthetic**: Floating aerodynamic frosted capsule dock (`spatial-dock`), 3D aerogel cards (`aerogel-card`), dynamic ambient soundtrack backglow, spinning holographic vinyl discs, and orbital story rings with radiating sound waves.
- **Full Post Management**: Upload posts with filters and soundtracks, **Edit posts** (caption, location, and songs), and **Delete posts** with cascading cleanup.
- **Full Story Management**: 24h disappearing stories with music, interactive viewer with audio playback and equalizer, and **Delete stories**.
- **Integrated Music Soundtracks**: Royalty-free music library with live preview playback, genre filters, and waveform equalizers.
- **Global Creator Radar**: Live search drawer across all registered users with presence indicators, follow/unfollow toggles, and direct calling.
- **Real-Time Live Chat**: Instant messaging powered by Socket.IO with typing indicators and online presence.
- **Spatial Audio & Video Calling**: 1-on-1 Instagram-style calls via WebRTC signaling, incoming ring modal, mic/camera controls, and timer.
- **Pure Zero-Mock Architecture**: Clean database baseline where only genuine user-created accounts and transmissions exist.
- **Universal Multi-Device Responsiveness**: Fluid experience across mobile phones (iPhone, Samsung Galaxy), tablets (iPad Mini, iPad Air), and desktop/laptop screens.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Web Audio API, WebRTC
- **Backend**: Node.js, Express, Socket.IO (WebSockets), SQLite (`better-sqlite3` in WAL mode), JWT, bcryptjs

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Install server dependencies
cd server
npm install
cd ..
```

### 2. Start Servers
```bash
# Terminal 1 - Backend Server (Port 5000)
cd server
npm run build
npm start

# Terminal 2 - Frontend App (Port 5173)
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** in your browser!

---

## 🌐 Deploy Live

### Option A: Frontend on Vercel + Backend on Render

#### 1. Push to GitHub
```bash
git remote add origin https://github.com/TanushShahi/social-sphere.git
git branch -M main
git push -u origin main
```

#### 2. Deploy Frontend (Vercel)
1. Go to [vercel.com](https://vercel.com) and import your `social-sphere` GitHub repository.
2. Build Settings:
   - Framework Preset: **Vite**
   - Root Directory: `./`
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Environment Variables:
   - Set `VITE_API_URL` to your live backend URL (e.g. `https://social-sphere-backend.onrender.com`).
4. Click **Deploy**.

#### 3. Deploy Backend (Render)
1. Go to [render.com](https://render.com) and create a new **Web Service**.
2. Connect your `social-sphere` GitHub repository.
3. Settings:
   - Root Directory: `server`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `node dist/server.js`
4. Add Environment Variable:
   - `JWT_SECRET`: Any random secure secret string.
5. Click **Create Web Service**.

---

## 📄 License
MIT License. Created by [TanushShahi](https://github.com/TanushShahi).

