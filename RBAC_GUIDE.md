# 🔐 Role-Based Access Control (RBAC) Guide

## Overview
PayZenix implements comprehensive role-based access control to ensure data security and proper authorization across the system.

## Roles & Permissions

### 🔴 Super Administrator
**Full system access with all permissions**

#### View Permissions
- ✅ View All Employees
- ✅ View All Payroll
- ✅ View All Loans
- ✅ View Compliance
- ✅ View Payouts
- ✅ View Settings
- ✅ View Reports

#### Management Permissions
- ✅ Add/Edit/Delete Employees
- ✅ Add/Edit/Delete Payroll
- ✅ Add/Edit/Delete Loans
- ✅ Approve/Reject Loans
- ✅ Process Payroll
- ✅ Edit Settings
- ✅ Export Data
- ✅ Manage Users
- ✅ Manage Roles

---

### 🟠 Administrator
**Manage employees, payroll, and loans**

#### View Permissions
- ✅ View All Employees
- ✅ View All Payroll
- ✅ View All Loans
- ✅ View Compliance
- ✅ View Payouts
- ✅ View Settings
- ✅ View Reports

#### Management Permissions
- ✅ Add/Edit/Delete Employees
- ✅ Add/Edit/Delete Payroll
- ✅ Add/Edit/Delete Loans
- ✅ Approve/Reject Loans
- ✅ Process Payroll
- ✅ Edit Settings
- ✅ Export Data
- ❌ Manage Users
- ❌ Manage Roles

---

### 🔵 HR Manager
**Manage employees and approve loans (cannot delete)**

#### View Permissions
- ✅ View All Employees
- ✅ View All Payroll
- ✅ View All Loans
- ✅ View Compliance
- ✅ View Payouts
- ❌ View Settings
- ✅ View Reports

#### Management Permissions
- ✅ Add/Edit Employees
- ❌ Delete Employees
- ✅ Add/Edit Payroll
- ❌ Delete Payroll
- ✅ Add/Edit Loans
- ❌ Delete Loans
- ✅ Approve/Reject Loans
- ✅ Process Payroll
- ❌ Edit Settings
- ✅ Export Data
- ❌ Manage Users
- ❌ Manage Roles

---

### 🟢 Employee
**View own payslips and loans only**

#### View Permissions
- ❌ View All Employees
- ❌ View All Payroll
- ❌ View All Loans
- ❌ View Compliance
- ❌ View Payouts
- ❌ View Settings
- ❌ View Reports
- ✅ View Own Payslips
- ✅ View Own Loans
- ✅ View Own Profile

#### Management Permissions
- ❌ All management permissions denied
- ✅ Can view and download own payslips
- ✅ Can view own loan status

---

## Page Access Control

### Dashboard
- **Access:** All roles
- **Content:** Role-specific dashboard
  - Admin/HR: Full statistics and management
  - Employee: Personal salary and benefits

### Employees
- **Access:** Super Admin, Admin, HR
- **Permissions:**
  - Super Admin/Admin: Full CRUD
  - HR: Add/Edit only (no delete)

### Payroll
- **Access:** Super Admin, Admin, HR
- **Permissions:**
  - Super Admin/Admin: Full CRUD
  - HR: Add/Edit only (no delete)

### Loans & Advances
- **Access:** Super Admin, Admin, HR
- **Permissions:**
  - Super Admin/Admin: Full CRUD + Approve/Reject
  - HR: Add/Edit + Approve/Reject (no delete)

### Compliance
- **Access:** Super Admin, Admin, HR
- **Permissions:** View and manage compliance documents

### Payouts
- **Access:** Super Admin, Admin, HR
- **Permissions:** View and process payouts

### Settings
- **Access:** Super Admin, Admin only
- **Permissions:** Configure system settings

### Role Permissions
- **Access:** Super Admin, Admin only
- **Permissions:** View role permissions matrix

### Audit Logs
- **Access:** Super Admin, Admin only
- **Permissions:** View system audit trail

### My Payslips
- **Access:** Employee only
- **Permissions:** View and download own payslips

### My Loans
- **Access:** Employee only
- **Permissions:** View own loan applications and status

---

## Implementation Details

### Frontend Protection
```typescript
// Check permission
import { hasPermission } from '@/utils/rbac';

const canEdit = hasPermission(user.role, 'canEditEmployee');

// Protect routes
<ProtectedRoute allowedRoles={["superadmin", "admin", "hr"]}>
  <EmployeesPage />
</ProtectedRoute>
```

### Backend Protection
```javascript
// Protect middleware
const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  // Verify token and attach user to request
};

// Role-based endpoint
app.delete('/api/employees/:id', protect, async (req, res) => {
  // Only admin and superadmin can delete
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Forbidden' });
  }
  // Delete logic
});
```

### UI Indicators
- **Buttons:** Hidden or disabled based on permissions
- **Badges:** Role badges show user's current role
- **Messages:** "View Only Mode" shown when no edit permissions
- **Modals:** Access denied screens for unauthorized pages

---

## Testing RBAC

### Test Accounts
```
Super Admin: superadmin@payzenix.com / admin123
Admin:       admin@payzenix.com / admin123
HR:          hr@payzenix.com / admin123
Employee:    employee@payzenix.com / admin123
```

### Test Scenarios

#### 1. Admin Access
- ✅ Can add/edit/delete employees
- ✅ Can approve/reject loans
- ✅ Can export data
- ✅ Can access settings
- ✅ Can view audit logs

#### 2. HR Access
- ✅ Can add/edit employees
- ❌ Cannot delete employees
- ✅ Can approve/reject loans
- ❌ Cannot delete loans
- ❌ Cannot access settings

#### 3. Employee Access
- ✅ Can view own payslips
- ✅ Can view own loans
- ❌ Cannot access employee list
- ❌ Cannot access payroll page
- ❌ Cannot access admin pages

---

## Security Features

### 1. Token-Based Authentication
- JWT tokens with 30-day expiration
- Tokens stored in localStorage
- Automatic logout on token expiration

### 2. Route Protection
- Frontend route guards
- Backend middleware protection
- Role verification on every request

### 3. Data Isolation
- Employees can only access own data
- Admin/HR can access all data
- Audit logs track all actions

### 4. Permission Checks
- UI elements hidden/disabled based on permissions
- Backend validates permissions before operations
- Clear error messages for unauthorized access

---

## Audit Trail

All actions are logged with:
- **User:** Who performed the action
- **Action:** What was done (Create/Update/Delete)
- **Module:** Which part of the system
- **Details:** Specific information about the action
- **Timestamp:** When it occurred

View audit logs at: `/audit-logs` (Admin only)

---

## Best Practices

### For Administrators
1. Regularly review audit logs
2. Use least privilege principle
3. Assign appropriate roles to users
4. Monitor system access patterns

### For HR Managers
1. Verify employee data before approval
2. Review loan applications carefully
3. Export data regularly for backup
4. Report suspicious activities

### For Employees
1. Keep login credentials secure
2. Review payslips regularly
3. Report discrepancies immediately
4. Don't share account access

---

## View Role Permissions

Navigate to **Role Permissions** page from the sidebar (Admin only) to see:
- Complete permissions matrix
- Role comparison
- Permission descriptions
- Visual indicators (✅/❌)

---

## Support

For role-related issues or permission requests:
1. Contact your system administrator
2. Check audit logs for access attempts
3. Verify your assigned role
4. Review this guide for role capabilities
