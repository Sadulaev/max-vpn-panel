# Hyper VPN Admin Panel

React admin panel for Hyper VPN Subscription Service.

## Features

- 🔐 **Authentication** - Login with username/password from backend env
- 🖥️ **Server Management** - Complete CRUD for VPN servers
- 📋 **Subscription Management** - Create, edit, extend subscriptions
- 👥 **User Management** - View users with search and pagination
- 📊 **Dashboard** - Overview statistics
- 🎨 **Modern UI** - Built with Ant Design

## Quick Start

### Prerequisites

- Node.js 18+
- Backend service running on http://localhost:3001

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Build for Production

```bash
npm run build
npm run preview
```

## Default Credentials

Default admin credentials (configured in backend `.env`):
- Username: `admin`
- Password: `admin123`

**⚠️ Change these in production!**

## Project Structure

```
src/
├── components/          # Reusable components
│   └── Layout.tsx      # Main layout with sidebar
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state
├── pages/              # Page components
│   ├── Login.tsx       # Login page
│   ├── Dashboard.tsx   # Dashboard with stats
│   ├── Servers.tsx     # Server management
│   ├── Subscriptions.tsx # Subscription management
│   └── Users.tsx       # User listing
├── services/           # API services
│   └── api.ts          # Axios API client
├── App.tsx             # Main app with routing
└── main.tsx            # Entry point
```

## API Integration

The frontend communicates with the backend via proxy (configured in `vite.config.ts`):
- `/api/*` → `http://localhost:3001/api/*`
- `/sub/*` → `http://localhost:3001/sub/*`

## Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Ant Design** - UI components
- **React Router** - Routing
- **Axios** - HTTP client
- **Day.js** - Date formatting

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## License

MIT
