# Deployment Guide

## Vercel Deployment (Recommended)

Vercel automatically handles both frontend and backend deployment. The backend runs as serverless functions, so you don't need to start a separate server.

### Steps to Deploy:

1. **Install Vercel CLI** (optional, for local testing):
```bash
npm i -g vercel
```

2. **Deploy to Vercel**:
   - Option A: Via Vercel Dashboard
     1. Go to [vercel.com](https://vercel.com)
     2. Import your Git repository
     3. Vercel will auto-detect the configuration
     4. Deploy!

   - Option B: Via CLI
     ```bash
     vercel
     ```

3. **That's it!** Vercel will:
   - Deploy your frontend files (HTML, CSS, JS)
   - Deploy your backend API as serverless functions
   - Handle routing automatically
   - Provide HTTPS and CDN

### How It Works:

- **Frontend**: Static files are served directly
- **Backend**: API routes in `/api` folder become serverless functions
- **No Server Needed**: Vercel handles everything automatically
- **Auto-scaling**: Functions scale automatically based on traffic

### Environment:

The `api.js` file automatically detects the environment:
- **Development**: Uses `http://localhost:3000/api` (when running locally)
- **Production**: Uses `/api` (relative URLs work on Vercel)

### Local Development:

For local development with the full Express server:

```bash
npm install
npm start
```

The server will run on `http://localhost:3000`

### Data Storage:

**Important**: Vercel serverless functions are stateless. For production, consider:
- Using a database (MongoDB, PostgreSQL, etc.)
- Using Vercel KV (Redis) for key-value storage
- Using Vercel Blob for file storage

The current file-based storage (`data/` folder) works for:
- Local development
- Small deployments
- Testing

For production with multiple users, migrate to a proper database.

### Alternative: Keep Express Server

If you prefer to keep the Express server approach, you can:
1. Deploy frontend to Vercel
2. Deploy backend separately to:
   - Railway
   - Render
   - Heroku
   - DigitalOcean
   - AWS/GCP/Azure

Then update `API_BASE_URL` in `api.js` to point to your backend URL.
