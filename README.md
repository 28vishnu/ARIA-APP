# ARIA Personal AI Workspace

Responsive Next.js frontend for the existing ARIA FastAPI service at `https://aria-ai-s5go.onrender.com`. The frontend uses the deployed backend; you do not need to run a second backend locally.

## Included features

- Apple-inspired liquid-glass styling, responsive desktop/tablet/mobile layout, dark mode, accent color, text size and compact layout settings.
- Local signup/login profiles, per-profile browser-local chat history, automatic first-message titles, chat search, rename, and delete.
- Calls to the existing `/chat`, `/upload`, and `/health` endpoints; backend health indicator.
- Browser speech recognition/synthesis, file attachment, and camera/screen still-image capture where the browser supports them.
- In-app response-ready notices and optional browser notifications when a response completes in a background tab.
- Frontend deployment-version polling with a refresh banner when a new Vercel build is detected.

## Local account and notification limitations

- Usernames and salted PBKDF2 password hashes are stored in the browser; passwords are not sent to the ARIA backend. This is a local profile gate, **not secure server authentication**. A person with access to the browser profile can manipulate local storage. Do not use it for sensitive or multi-user accounts without adding backend authentication.
- Accounts, chats and preferences do not sync across browsers or devices; clearing browser data may delete them.
- Browser notifications require permission. This implementation can notify while the page is running in a background tab. Push after the app/browser is fully closed requires a service worker, push subscriptions, VAPID keys and backend push-delivery support.
- Camera and microphone permissions are requested when those tools are used. Screen sharing requires browser selection/permission each time. Websites cannot silently grant these permissions during login.
- The frontend can call only API routes available on the deployed backend. Backend capabilities not exposed as separate routes remain accessible only through the existing chat pipeline. `/chat` currently returns a complete response, not token-by-token streaming.

## Run locally against Render

1. Use Node.js 20 or newer.
2. Create `.env.local` beside `package.json`:

   ```dotenv
   NEXT_PUBLIC_API_URL=https://aria-ai-s5go.onrender.com
   ```

3. In PowerShell, from this folder:

   ```powershell
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`, create a local profile, confirm the backend status, and ask ARIA a question.

## Deploy and update automatically

1. Copy these frontend files into your existing frontend GitHub repository (the one connected to Vercel).
2. Set `NEXT_PUBLIC_API_URL=https://aria-ai-s5go.onrender.com` in Vercel for the required environments and redeploy.
3. Confirm the live Render backend CORS allowlist includes the exact production frontend origin.
4. Keep Git integration/auto-deploy enabled in Vercel for frontend changes and in Render for backend changes.

Backend changes are served by the stable Render URL without a frontend rebuild when the API contract remains compatible. Frontend changes require a Vercel deployment. The app checks for new frontend deployments while open and offers a refresh. This ZIP itself does not update GitHub, Render, or Vercel.
