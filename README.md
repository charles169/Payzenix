# PayZenix – Payroll & HR Management System

## Project Overview
PayZenix is a comprehensive web-based Payroll and HR Management System with role-based access control, employee management, payroll processing, loan management, and audit logging.

## Features
- 🔐 Role-based authentication (Super Admin, Admin, HR, Employee)
- 📊 Interactive dashboard with charts
- 👥 Employee management
- 💰 Payroll processing with PDF payslips
- 🏦 Loan management and approval workflow
- 📜 Audit logs for all actions
- 🎨 Professional UI with animated sidebar
- 📱 Responsive design
- ⚙️ **NEW:** Settings page with MongoDB persistence (no more localStorage!)
- 🔄 **NEW:** Real-time page updates without refresh
- 🔔 **NEW:** Prominent toast notifications

## Recent Updates (February 2026)

### ✅ Settings Database Integration
Settings page now saves to MongoDB database for permanent persistence across all devices and sessions. See `SETTINGS_DATABASE_INTEGRATION.md` for details.

### ✅ Real-time Updates
All pages update instantly without page refresh using direct data reload and `usePageFocus` hook.

### ✅ Enhanced Notifications
Toast notifications with prominent styling (4-second duration, color-coded by type).

## Technology Stack
- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS + Custom Components
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Authentication**: JWT

## Prerequisites
Before running this project, make sure you have installed:
- Node.js (v16 or higher)
- MongoDB Community Server (v8.0 or higher)
- npm or yarn

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/charles169/Payzenix.git
cd Payzenix/payzenix-payroll-main
```

### 2. Install MongoDB
Download and install MongoDB Community Server from:
https://www.mongodb.com/try/download/community

Make sure MongoDB service is running on `localhost:27017`

### 3. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 4. Configure Environment Variables
The `.env` file is already configured in `server/.env`:
```
MONGO_URI=mongodb://localhost:27017/payzenix
JWT_SECRET=your-secret-key-here-change-in-production
PORT=3001
```

### 5. Seed the Database
**IMPORTANT**: You must seed the database to create users and initial data:
```bash
cd server
node seed-mongodb.js
```

You should see:
```
✅ MongoDB Connected!
✅ 4 users created!
✅ 5 employees created!
✅ 4 payroll records created!
✅ 4 loans created!
✅ 13 audit logs created!
🎉 DATABASE SEEDING COMPLETE!
```

### 6. Start the Servers

**Terminal 1 - Backend:**
```bash
cd server
node index-mongodb.js
```
Backend will run on: http://localhost:3001

**Terminal 2 - Frontend:**
```bash
npm run dev
```
Frontend will run on: http://localhost:8080

### 7. Access the Application
Open your browser and go to: **http://localhost:8080**

## Login Credentials

After seeding the database, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@payzenix.com | admin123 |
| Admin | admin@payzenix.com | admin123 |
| HR | hr@payzenix.com | admin123 |
| Employee | employee@payzenix.com | admin123 |

## Role Permissions

- **Super Admin**: Full system access + system-level settings
- **Admin**: Full access to all features (add/edit/delete)
- **HR**: Can add and edit but cannot delete records
- **Employee**: View-only access to their own data

## Project Structure
```
payzenix-payroll-main/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── stores/            # State management
│   ├── services/          # API services
│   └── utils/             # Utility functions
├── server/                # Backend source code
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── index-mongodb.js   # Main server file
│   └── seed-mongodb.js    # Database seeding script
└── public/                # Static assets
```

## Troubleshooting

### "Invalid credentials" error
- Make sure you ran `node seed-mongodb.js` in the server folder
- Check that MongoDB service is running
- Verify backend is running on port 3001

### Backend connection error
- Ensure MongoDB is installed and running
- Check if port 3001 is available
- Verify MONGO_URI in server/.env

### Frontend not loading
- Make sure backend is running first
- Check if port 8080 is available
- Clear browser cache and reload

## API Endpoints
- `POST /api/auth/login` - User authentication
- `GET /api/employees` - Get all employees
- `POST /api/employees` - Create employee
- `GET /api/payroll` - Get payroll records
- `POST /api/payroll` - Create payroll
- `GET /api/loans` - Get loans
- `POST /api/loans` - Create loan
- `GET /api/audit-logs` - Get audit logs

## Contributing
Feel free to submit issues and pull requests!

## License
MIT License