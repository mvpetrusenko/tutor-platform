# Tutor Platform Backend

This backend provides API endpoints to store and retrieve data from the tutor platform frontend.

## Two Deployment Options:

### Option 1: Vercel Serverless Functions (Recommended for Production)

**No server needed!** Vercel automatically runs the backend as serverless functions.

See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

### Option 2: Express Server (For Local Development)

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

## API Endpoints

### Materials
- `GET /api/materials/:type` - Get all materials by type (photos, texts, exercises, homework)
- `POST /api/materials/:type` - Save a material
- `DELETE /api/materials/:type/:id` - Delete a material

### Selected Materials
- `GET /api/selected/:type` - Get selected materials by type
- `POST /api/selected/:type` - Save selected materials

### Homework
- `GET /api/homework` - Get homework content
- `POST /api/homework` - Save homework content

### Tests
- `GET /api/tests` - Get all saved tests
- `POST /api/tests` - Save a test
- `DELETE /api/tests/:id` - Delete a test

### Whiteboard
- `GET /api/whiteboard` - Get whiteboard drawing
- `POST /api/whiteboard` - Save whiteboard drawing

### Preferences
- `GET /api/preferences` - Get user preferences (theme, animation)
- `POST /api/preferences` - Save user preferences

### Health Check
- `GET /api/health` - Check if server is running

## Data Storage

Data is stored in JSON files in the `data/` directory:
- `materials.json` - All uploaded materials
- `selected.json` - Selected materials on home page
- `homework.json` - Homework content
- `tests.json` - Saved tests
- `whiteboard.json` - Whiteboard drawings
- `preferences.json` - User preferences

## Frontend Integration

The frontend uses `api.js` to communicate with the backend. The API service:
- Automatically syncs localStorage data to backend
- Loads data from backend on page load
- Falls back to localStorage if backend is unavailable

To use the backend:
1. Include `api.js` in your HTML files
2. Call `loadFromBackend()` on page load
3. Call sync functions after localStorage operations
