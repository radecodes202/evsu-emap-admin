# EVSU eMAP Admin Webapp

Admin panel for managing the EVSU eMAP React Native mobile application.

## Features

- 🏢 **Building Management (CRUD)** - Create, edit, delete buildings with interactive map for location selection
- 👥 **User Management** - Manage user accounts, roles, and permissions
- 🗺️ **Campus Configuration** - Configure campus center coordinates and boundaries
- 🤖 **Chatbot Management** - Manage chatbot responses and suggested questions
- ⚙️ **App Settings** - Configure API settings, feature flags, and app preferences
- 📊 **Dashboard** - Overview with statistics and quick actions

## Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool and dev server
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **React Query** - Data fetching and caching
- **React Hook Form + Yup** - Form handling and validation
- **Leaflet Maps** - Interactive maps for building location editing
- **Axios** - HTTP client

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

```bash
npm install
```

### Configuration

1. Create a `.env` file in the root directory (optional):
```env
VITE_API_URL=http://192.168.1.8:3000/api
```

2. Or update the API base URL in `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://your-api-url:3000/api';
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3001`

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
evsu-emap-admin/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Layout/         # Dashboard layout with sidebar
│   │   ├── ProtectedRoute.jsx
│   │   └── StatCard.jsx
│   ├── config/             # Configuration files
│   │   └── api.js          # API endpoints and settings
│   ├── context/            # React Context providers
│   │   └── AuthContext.jsx # Authentication state
│   ├── pages/              # Page components
│   │   ├── DashboardPage.jsx
│   │   ├── BuildingsPage.jsx
│   │   ├── BuildingFormPage.jsx
│   │   ├── UsersPage.jsx
│   │   ├── CampusConfigPage.jsx
│   │   ├── ChatbotPage.jsx
│   │   ├── SettingsPage.jsx
│   │   └── LoginPage.jsx
│   ├── utils/              # Utility functions
│   │   └── api.js          # API client and endpoints
│   ├── App.jsx             # Main app component with routes
│   └── main.jsx            # Entry point
├── public/                 # Static assets
├── package.json
├── vite.config.js
└── README.md
```

## Features Overview

### Building Management

- View all buildings in a sortable table
- Create new buildings with:
  - Building name, code, description
  - Number of floors
  - Location coordinates (click on map or enter manually)
  - Interactive Leaflet map for location selection
- Edit existing buildings
- Delete buildings with confirmation
- Form validation (coordinates within campus boundaries, unique codes, etc.)

### User Management

- View all users with their roles
- Create new users (email, password, name, role)
- Delete users
- Role-based access (admin/user)

### Campus Configuration

- Set campus center coordinates
- Configure campus boundaries (north-east and south-west corners)
- Map preview showing the configured area
- All changes validated before saving

### Chatbot Management

- Manage keyword-based responses
- Add/remove suggested questions
- Simple interface for maintaining chatbot knowledge base

### Settings

- Configure API URL and timeout
- Toggle feature flags
- View app information

### Dashboard

- Statistics overview (total buildings, users, etc.)
- Recent buildings list
- Quick actions guide

## Authentication

The admin panel uses JWT token-based authentication:

1. Login with admin credentials at `/login`
2. Token is stored in localStorage
3. All API requests include the token in the Authorization header
4. Protected routes require authentication and admin role
5. Auto-logout on 401 responses

**Default Login:**
- Email: `admin@evsu.edu.ph`
- Password: (your backend admin password)

## API Integration

The admin panel expects the following API endpoints:

### Authentication
- `POST /api/auth/login` - Login endpoint

### Buildings
- `GET /api/buildings` - Get all buildings
- `GET /api/buildings/:id` - Get building by ID
- `POST /api/buildings` - Create building
- `PUT /api/buildings/:id` - Update building
- `DELETE /api/buildings/:id` - Delete building

### Users (Optional - may not be implemented in backend)
- `GET /api/users` - Get all users
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Settings (Optional)
- `GET /api/settings` - Get settings
- `PUT /api/settings` - Update settings

### Chatbot (Optional)
- `GET /api/chatbot/responses` - Get chatbot responses
- `PUT /api/chatbot/responses` - Update responses
- `GET /api/chatbot/suggested-questions` - Get suggested questions
- `PUT /api/chatbot/suggested-questions` - Update questions

## Development Notes

- The app gracefully handles missing API endpoints (shows warnings instead of errors)
- Form validation ensures data integrity
- Map integration uses OpenStreetMap (no API key required)
- Responsive design works on desktop and tablet
- All API calls include error handling

## Troubleshooting

### API Connection Issues

If you see API errors:
1. Check that your backend server is running
2. Verify the API URL in `src/config/api.js`
3. Check CORS settings on your backend
4. Ensure the API endpoints match the expected format

### Map Not Loading

If maps don't load:
1. Check your internet connection (Leaflet loads tiles from OpenStreetMap)
2. Verify Leaflet CSS is loaded (check `index.html`)

### Build Errors

If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Check Node.js version (should be 16+)

## License

This project is part of the EVSU eMAP application suite.

