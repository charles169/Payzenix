# PayZenix Payroll Backend

Complete Node.js + Express + MongoDB backend for payroll management system.

## Features

- ✅ JWT Authentication & Authorization
- ✅ Role-based Access Control (Admin, HR, Employee)
- ✅ Employee Management
- ✅ Payroll Processing
- ✅ Loan Management
- ✅ Secure Password Hashing
- ✅ RESTful API Design

## Setup

### 1. Install Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment
Update `.env` file with your MongoDB connection:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/payzenix
JWT_SECRET=your-secret-key-change-in-production
NODE_ENV=development
```

### 3. Start MongoDB
```bash
# Local MongoDB
mongod

# OR Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 4. Seed Database
```bash
npm run seed
```

### 5. Start Server
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/users` - Get all users (Admin only)
- `PUT /api/auth/users/:id/role` - Update user role (Admin only)

### Employees
- `GET /api/employees` - Get all employees (Admin/HR)
- `GET /api/employees/:id` - Get single employee
- `POST /api/employees` - Create employee (Admin/HR)
- `PUT /api/employees/:id` - Update employee (Admin/HR)
- `DELETE /api/employees/:id` - Delete employee (Admin only)

### Payroll
- `GET /api/payroll` - Get all payroll records (Admin/HR)
- `GET /api/payroll/my-payslips` - Get own payslips (Employee)
- `POST /api/payroll` - Create payroll (Admin/HR)
- `PUT /api/payroll/:id` - Update payroll (Admin/HR)

### Loans
- `GET /api/loans` - Get all loans (Admin/HR)
- `GET /api/loans/my-loans` - Get own loans (Employee)
- `POST /api/loans` - Create loan request
- `PUT /api/loans/:id/approve` - Approve/Reject loan (Admin/HR)
- `PUT /api/loans/:id` - Update loan (Admin/HR)

## Default Credentials

After running `npm run seed`:

**Admin:**
- Email: admin@payzenix.com
- Password: admin123

**HR:**
- Email: hr@payzenix.com
- Password: hr123

**Employee:**
- Email: employee@payzenix.com
- Password: emp123

## Project Structure

```
server/
├── middleware/
│   └── auth.js          # JWT authentication & authorization
├── models/
│   ├── User.js          # User model with bcrypt
│   ├── Employee.js      # Employee model
│   ├── Payroll.js       # Payroll model
│   └── Loan.js          # Loan model
├── routes/
│   ├── auth.js          # Authentication routes
│   ├── employees.js     # Employee CRUD routes
│   ├── payroll.js       # Payroll routes
│   └── loans.js         # Loan routes
├── index.js             # Express server setup
├── seed.js              # Database seeding script
├── .env                 # Environment variables
└── package.json         # Dependencies
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- Protected routes
- Input validation

## Technologies

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- bcryptjs
- CORS enabled
