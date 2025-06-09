# DigiCard - Digital Business Card Application

A modern, full-stack digital business card application that allows users to create, manage, and share professional digital business cards with QR code functionality and real-time analytics.

## Overview

DigiCard is a comprehensive digital business card solution that replaces traditional paper business cards with interactive, shareable digital versions. Users can create professional-looking cards, track engagement through analytics, and share their contact information easily via QR codes or direct links.

## Features

### 🎨 Digital Business Card

- **Interactive Card Design**: Flippable business cards with front and back sides
- **Professional Layout**: Clean, modern design with company branding
- **Customizable Content**: User information, contact details, company logos
- **QR Code Integration**: Auto-generated QR codes for easy sharing

### 📊 Dashboard & Analytics

- **Real-time Statistics**: Track total scans, recent activity, and engagement metrics
- **Activity Monitoring**: View scan history with IP addresses and timestamps
- **User Analytics**: Monitor how many people are viewing and downloading your card

### 👤 Profile Management

- **User Information**: Edit personal and professional details
- **Contact Details**: Manage phone numbers, emails, addresses, and social links
- **Shareable Links**: Generate direct sharing links and QR codes
- **Download Options**: Export contact information as vCard files

### 🔗 Sharing Capabilities

- **QR Code Sharing**: Generate scannable QR codes for instant sharing
- **Direct Links**: Create shareable URLs that work without QR scanning
- **Social Sharing**: Easy sharing via various platforms
- **Mobile Optimized**: Responsive design for all devices

### 🔐 Authentication & Security

- **Azure AD Integration**: Secure login using Microsoft Azure Active Directory
- **User Session Management**: Secure user authentication and authorization
- **Access Control**: Protected routes and user-specific data

### 👑 Admin Features

- **User Management**: Admin dashboard for managing all users
- **Analytics Overview**: System-wide statistics and user activity monitoring
- **Content Management**: Ability to manage and moderate user content

## Technology Stack

### Frontend

- **Framework**: React 18 with Vite for fast development
- **Styling**: Tailwind CSS for responsive, modern UI design
- **State Management**: Zustand for lightweight state management
- **API Client**: TanStack Query for server state management
- **Authentication**: Azure MSAL for Microsoft authentication
- **UI Components**: Headless UI and Heroicons for accessibility
- **Form Handling**: React Hook Form with Zod validation
- **QR Codes**: QRCode.react for generating QR codes
- **Routing**: React Router DOM for navigation

### Backend

- **Runtime**: Node.js with Express.js framework
- **Database**: MongoDB with Mongoose ODM (planned)
- **Authentication**: JWT-based authentication with Azure AD
- **API Documentation**: Swagger for API documentation
- **Validation**: Joi for request validation
- **Environment**: Environment-based configuration

## Project Structure

```
digicard/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── Card.jsx      # Digital business card component
│   │   │   └── ActivityViewPopup.jsx
│   │   ├── pages/            # Application pages
│   │   │   ├── Dashboard.jsx # Main dashboard with analytics
│   │   │   ├── Profile.jsx   # User profile management
│   │   │   ├── ShareView.jsx # Public card sharing view
│   │   │   ├── Activity.jsx  # Activity tracking page
│   │   │   ├── Admin.jsx     # Admin management panel
│   │   │   ├── QRCode.jsx    # QR code generation page
│   │   │   └── login.jsx     # Authentication page
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # UI building blocks
│   │   ├── styles/           # CSS and styling files
│   │   └── assets/           # Static assets
│   ├── public/               # Public assets
│   └── package.json
├── backend/                  # Node.js + Express API
│   ├── config/               # Configuration files
│   ├── modules/              # Feature modules
│   ├── middlewares/          # Express middlewares
│   ├── validators/           # Request validation schemas
│   ├── swagger/              # API documentation
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MongoDB (for backend data storage)
- Azure AD tenant (for authentication)

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd digicard
```

2. **Install Frontend Dependencies**

```bash
cd frontend
npm install
```

3. **Install Backend Dependencies**

```bash
cd backend
npm install
```

4. **Environment Configuration**
   Create `.env` files in both frontend and backend directories with necessary environment variables.

5. **Start Development Servers**

Frontend:

```bash
cd frontend
npm run dev
```

Backend:

```bash
cd backend
npm run dev
```

## Key Features Explained

### Digital Business Card Component

The core `Card.jsx` component creates an interactive, flippable business card with:

- Professional contact information display
- Company branding and logos
- QR code for easy sharing
- Responsive design for all screen sizes

### Analytics Dashboard

The dashboard provides comprehensive insights including:

- Total card scans and views
- Recent activity tracking
- Geographic and temporal analytics
- User engagement metrics

### Sharing System

Multiple sharing options available:

- **QR Code**: Instant scanning for quick contact exchange
- **Direct Links**: Shareable URLs for digital distribution
- **vCard Export**: Download contact information for address books
- **Social Media**: Integration with various platforms

### Authentication Flow

Secure authentication using Azure AD:

- Single Sign-On (SSO) capabilities
- Enterprise-grade security
- User profile synchronization
- Role-based access control

## API Endpoints (Planned)

### Authentication

- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### User Management

- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/generate-share-id` - Generate sharing ID

### Analytics

- `GET /api/analytics/dashboard` - Get dashboard statistics
- `GET /api/analytics/activity` - Get user activity history
- `POST /api/analytics/track` - Track card interactions

### Sharing

- `GET /api/share/:id` - Get shared card information
- `POST /api/share/track` - Track sharing activity

## Development Guidelines

### Code Style

- Use ES6+ features and modern JavaScript
- Follow React functional component patterns
- Implement proper error boundaries
- Use TypeScript for type safety (planned)

### State Management

- Use Zustand for global state management
- Keep component state minimal and local
- Implement proper state synchronization

### API Integration

- Use TanStack Query for server state
- Implement proper caching strategies
- Handle loading and error states gracefully

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Contact

For questions or support, please contact the development team.

---

**Note**: This application is currently in development. Some features may be using static data for demonstration purposes and will be connected to live APIs in future releases.
