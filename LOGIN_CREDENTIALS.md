# PayZenix Login Credentials

After running `node seed-mongodb.js`, you can login with any of these accounts:

## 🔐 All Login Accounts

### 1. Super Admin (Full System Access)
- **Email**: `superadmin@payzenix.com`
- **Password**: `admin123`
- **Permissions**: Everything + System Settings
- **Use for**: System administration, managing all users

---

### 2. Admin (Full Management Access)
- **Email**: `admin@payzenix.com`
- **Password**: `admin123`
- **Permissions**: Add, Edit, Delete all records
- **Use for**: Day-to-day management, full CRUD operations

---

### 3. HR Manager (Add & Edit Only)
- **Email**: `hr@payzenix.com`
- **Password**: `admin123`
- **Permissions**: Can add and edit, but cannot delete
- **Use for**: HR operations, employee management

---

### 4. Employee (View Only)
- **Email**: `employee@payzenix.com`
- **Password**: `admin123`
- **Permissions**: View only their own data
- **Use for**: Testing employee view, checking payslips

---

## 🎯 Quick Test

Try logging in with different roles to see how permissions work:

1. **Super Admin** → Can access Settings page
2. **Admin** → Can delete employees/payroll/loans
3. **HR** → Cannot see Delete buttons
4. **Employee** → Can only see Dashboard, My Payslips, My Loans

---

## ⚠️ Important Notes

- All accounts use the same password: `admin123`
- This is for demo/development purposes only
- In production, use strong unique passwords
- Change the JWT_SECRET in server/.env for production

---

## 🔄 Reset Database

If you need to reset everything:
```bash
cd server
node seed-mongodb.js
```

This will clear and recreate all users and data.
