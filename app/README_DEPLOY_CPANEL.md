# cPanel Deployment Guide

This repository builds a Node.js backend (Hono) and a static frontend (`dist/public`).

Steps to deploy on cPanel (Node.js application support required):

1. Build locally and create a deploy package:

```bash
npm run build
./scripts/deploy_cpanel.sh
```

2. Upload `deploy_package.tar.gz` to your cPanel account (File Manager) and extract it into your application directory.

3. In the cPanel "Node.js App" interface:
- Create or select an application
- Set the `Application root` to the folder where you extracted the package
- Set the `Application startup file` to `dist/boot.js`
- Set environment variables (`DATABASE_URL`, `APP_ID`, `APP_SECRET`, etc.) via the UI

4. Install production dependencies (SSH or cPanel terminal):

```bash
npm install --production
```

5. Start the application via the cPanel UI or run:

```bash
node dist/boot.js
```

Notes:
- If your cPanel uses Passenger, set the startup file accordingly or create a `passenger` config.
- Ensure your MySQL `DATABASE_URL` is configured for production.
- The `data/` folder was cleared for production; restore any necessary seed data as needed.
