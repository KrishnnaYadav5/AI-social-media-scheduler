# 🚀 AI Social Media Scheduler

An intelligent, multi-platform AI Social Media Scheduler built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Supabase**, **Drizzle ORM**, **Google Gemini AI**, and **Upstash QStash**.

---

## ✨ Features

- 📅 **Multi-Platform Post Scheduling**: Schedule and auto-publish posts to Facebook, Instagram, LinkedIn, and X (Twitter).
- 🤖 **AI Content & Image Generator**: Leverage Google Gemini AI to draft engaging posts, generate hashtags, analyze tone, and create AI visuals.
- 📊 **Analytics & Telemetry**: Dynamic dashboard with engagement KPIs, audience reach metrics, and caching telemetry.
- 🗂️ **Kanban & Calendar Views**: Drag-and-drop workflow management for post drafts, scheduled queues, and published history.
- 🔐 **Supabase & Clerk Auth Ready**: Production-grade SSR authentication and cookie management.
- ⏰ **Reliable Background Execution**: Powered by Upstash QStash webhooks for precision scheduled publishing.
- 🪣 **Cloudflare R2 Asset Storage**: Fast S3-compatible media upload and delivery.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Database**: [Neon Postgres](https://neon.tech/) & [Drizzle ORM](https://orm.drizzle.team/)
- **Auth**: [Supabase SSR](https://supabase.com/) & [Clerk](https://clerk.com/)
- **AI**: [Google Generative AI (Gemini)](https://ai.google.dev/)
- **Background Jobs**: [Upstash QStash](https://upstash.com/docs/qstash/overall/overview)
- **Storage**: [Cloudflare R2 / AWS S3](https://www.cloudflare.com/developer-platform/r2/)

---

## 🌐 Deploying to Vercel

### Step 1: Push Code to GitHub
Ensure the project is pushed to your GitHub repository:
```bash
git push origin main
```

### Step 2: Import into Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import `AI-social-media-scheduler` from GitHub.

### Step 3: Configure Environment Variables
Copy the required key-value pairs from `.env.example` into Vercel's **Environment Variables** section:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon/PostgreSQL connection string |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase Anon Public Key |
| `GEMINI_API_KEY` | Google Gemini AI Key |
| `QSTASH_URL` | Upstash QStash API Endpoint |
| `QSTASH_TOKEN` | Upstash QStash Access Token |
| `QSTASH_CURRENT_SIGNING_KEY` | QStash Current Webhook Verification Key |
| `QSTASH_NEXT_SIGNING_KEY` | QStash Next Webhook Verification Key |
| `APP_URL` | Production App URL (e.g., `https://your-app.vercel.app`) |
| `ENCRYPTION_SECRET` | 32-byte secret key for credential encryption |

### Step 4: Deploy!
Click **Deploy**. Next.js App Router will automatically build and deploy your app globally on Vercel's Edge Network.

---

## 💻 Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/KrishnnaYadav5/AI-social-media-scheduler.git
   cd AI-social-media-scheduler
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up local environment**:
   ```bash
   cp .env.example .env.local
   ```

4. **Run development server**:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Scripts

- `npm run dev` - Start Next.js development server
- `npm run build` - Build production bundle
- `npm run start` - Start production server locally
- `npm run db:generate` - Generate Drizzle migrations
- `npm run db:push` - Push schema directly to database

---

## 🛡️ License

MIT License. Designed and developed with ❤️.
