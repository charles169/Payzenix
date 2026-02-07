# Quick Setup Guide for PayZenix

## ⚠️ IMPORTANT: Read This First!

If you're getting "Invalid credentials" error, it means you haven't seeded the database yet!

## Step-by-Step Setup (5 minutes)

### Step 1: Install MongoDB
1. Download MongoDB Community Server: https://www.mongodb.com/try/download/community
2. Install it (use default settings)
3. Make sure MongoDB service is running

**Windows**: MongoDB should start automatically after installation
**Mac/Linux**: Run `mongod` in terminal

### Step 2: Install Dependencies
Open terminal in the project folder:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Step 3: Seed the Database (CRITICAL!)
This creates all the users and initial data:

```bash
cd server
node seed-mongodb.js
```

**You should see:**
```
✅ MongoDB Connected!
✅ 4 users created!
✅ 5 employees created!
🎉 DATABASE SEEDING COMPLETE!
```

**If you see an error:**
- Make sure MongoDB is installed and running
- Check that MongoDB is running on port 27017

### Step 4: Start Backend Server
Keep this terminal open:

```bash
cd server
node index-mongodb.js
```

**You should see:**
```
🚀 Server running on port 3001
✅ MongoDB Connected: localhost
```

### Step 5: Start Frontend Server
Open a NEW terminal:

```bash
npm run dev
```

**You should see:**
```
VITE ready in 732 ms
➜  Local:   http://localhost:8080/
```

### Step 6: Login!
Open browser: **http://localhost:8080**

**Login Credentials:**
- Email: `superadmin@payzenix.com`
- Password: `admin123`

**Other accounts:**
- Admin: `admin@payzenix.com` / `admin123`
- HR: `hr@payzenix.com` / `admin123`
- Employee: `employee@payzenix.com` / `admin123`

---

## Common Issues

### ❌ "Invalid credentials"
**Solution**: You forgot to seed the database!
```bash
cd server
node seed-mongodb.js
```

### ❌ "Cannot connect to MongoDB"
**Solution**: MongoDB is not running
- Windows: Check Services, start "MongoDB Server"
- Mac/Linux: Run `mongod` in terminal

### ❌ "Port 3001 already in use"
**Solution**: Backend is already running somewhere
- Close other terminals
- Or change PORT in `server/.env`

### ❌ "Port 8080 already in use"
**Solution**: Frontend is already running
- Close other terminals
- Or it will suggest another port (like 8081)

---

## Need Help?
1. Make sure MongoDB is installed and running
2. Make sure you ran `node seed-mongodb.js`
3. Make sure both servers are running (backend on 3001, frontend on 8080)
4. Try restarting both servers

## Quick Test
After setup, you should be able to:
1. Login with any of the credentials above
2. See the dashboard with charts
3. Navigate to Employees, Payroll, Loans pages
4. Add/edit data (depending on your role)

---

**That's it! You're ready to use PayZenix! 🎉**
