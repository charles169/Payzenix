import { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, AlertCircle, FileText, UserPlus, DollarSign } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  time: string;
  read: boolean;
  icon: any;
}

export const NotificationBell = () => {
  const { user } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Load notifications based on user role
    const mockNotifications: Notification[] = [];
    
    if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'hr') {
      mockNotifications.push(
        {
          id: '1',
          title: 'Payroll Pending',
          message: 'February payroll needs approval',
          type: 'warning',
          time: '5 min ago',
          read: false,
          icon: DollarSign
        },
        {
          id: '2',
          title: 'New Employee',
          message: 'Rajesh Kumar onboarded successfully',
          type: 'success',
          time: '1 hour ago',
          read: false,
          icon: UserPlus
        },
        {
          id: '3',
          title: 'Compliance Alert',
          message: 'PF challan due in 3 days',
          type: 'warning',
          time: '2 hours ago',
          read: true,
          icon: AlertCircle
        },
        {
          id: '4',
          title: 'Report Generated',
          message: 'Monthly salary report is ready',
          type: 'info',
          time: '3 hours ago',
          read: true,
          icon: FileText
        }
      );
    } else {
      mockNotifications.push(
        {
          id: '1',
          title: 'Payslip Available',
          message: 'Your January payslip is ready',
          type: 'success',
          time: '1 hour ago',
          read: false,
          icon: FileText
        },
        {
          id: '2',
          title: 'Loan Approved',
          message: 'Your loan request has been approved',
          type: 'success',
          time: '2 days ago',
          read: true,
          icon: DollarSign
        }
      );
    }
    
    setNotifications(mockNotifications);
  }, [user]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success': return '#16a34a';
      case 'warning': return '#d97706';
      case 'error': return '#dc2626';
      default: return '#2563eb';
    }
  };

  const getIconBg = (type: string) => {
    switch (type) {
      case 'success': return '#dcfce7';
      case 'warning': return '#fef3c7';
      case 'error': return '#fee2e2';
      default: return '#dbeafe';
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        style={{
          position: 'relative',
          padding: '8px',
          background: 'transparent',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s'
        }}
        onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
        onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <Bell style={{ width: '20px', height: '20px', color: '#374151' }} />
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '18px',
            height: '18px',
            background: '#dc2626',
            color: 'white',
            borderRadius: '50%',
            fontSize: '11px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid white'
          }}>
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <>
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setShowDropdown(false)}
          />
          <div style={{
            position: 'absolute',
            top: '45px',
            right: 0,
            width: '380px',
            maxHeight: '500px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
            zIndex: 1000,
            overflow: 'hidden',
            animation: 'slideDown 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>Notifications</h3>
                {unreadCount > 0 && (
                  <p style={{ margin: 0, fontSize: '12px', color: '#666', marginTop: '2px' }}>
                    {unreadCount} unread
                  </p>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  style={{
                    padding: '4px 12px',
                    background: 'transparent',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    color: '#4f46e5',
                    fontWeight: '500'
                  }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
              {notifications.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                  <Bell style={{ width: '48px', height: '48px', color: '#d1d5db', margin: '0 auto 12px' }} />
                  <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>No notifications</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      padding: '16px 20px',
                      borderBottom: '1px solid #f3f4f6',
                      cursor: 'pointer',
                      background: notification.read ? 'white' : '#f9fafb',
                      display: 'flex',
                      gap: '12px',
                      transition: 'background 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                    onMouseOut={(e) => e.currentTarget.style.background = notification.read ? 'white' : '#f9fafb'}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '8px',
                      background: getIconBg(notification.type),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <notification.icon style={{ width: '20px', height: '20px', color: getIconColor(notification.type) }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <h4 style={{ 
                          margin: 0, 
                          fontSize: '14px', 
                          fontWeight: notification.read ? '500' : '600',
                          color: '#111827'
                        }}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <span style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#4f46e5',
                            flexShrink: 0
                          }} />
                        )}
                      </div>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '13px', 
                        color: '#6b7280',
                        marginBottom: '4px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {notification.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock style={{ width: '12px', height: '12px', color: '#9ca3af' }} />
                        <span style={{ fontSize: '11px', color: '#9ca3af' }}>
                          {notification.time}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #e5e7eb',
                textAlign: 'center'
              }}>
                <button
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: 'transparent',
                    border: 'none',
                    color: '#4f46e5',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    borderRadius: '6px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.background = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};
