import toast, { Toaster } from 'react-hot-toast';

export const ToastTestPage = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <Toaster position="top-right" />
      
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>Toast Test Page</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '400px', margin: '0 auto' }}>
        <button
          onClick={() => {
            console.log('🟢 Success button clicked!');
            toast.success('✅ Success toast is working!', {
              duration: 5000,
              style: {
                background: '#10b981',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px',
              }
            });
          }}
          style={{
            padding: '20px 40px',
            background: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Success Toast
        </button>

        <button
          onClick={() => {
            console.log('🔵 Loading button clicked!');
            const id = toast.loading('⏳ Loading...', {
              style: {
                background: '#3b82f6',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px',
              }
            });
            
            setTimeout(() => {
              toast.success('✅ Done!', { id });
            }, 2000);
          }}
          style={{
            padding: '20px 40px',
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Loading Toast
        </button>

        <button
          onClick={() => {
            console.log('🔴 Error button clicked!');
            toast.error('❌ Error toast is working!', {
              duration: 5000,
              style: {
                background: '#ef4444',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px',
              }
            });
          }}
          style={{
            padding: '20px 40px',
            background: '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Error Toast
        </button>

        <button
          onClick={() => {
            console.log('🟡 Custom button clicked!');
            toast('🎉 Custom toast with emoji!', {
              duration: 5000,
              style: {
                background: '#f59e0b',
                color: 'white',
                fontSize: '18px',
                fontWeight: 'bold',
                padding: '20px',
              }
            });
          }}
          style={{
            padding: '20px 40px',
            background: '#f59e0b',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '18px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          Test Custom Toast
        </button>
      </div>

      <div style={{ marginTop: '50px', padding: '20px', background: '#f3f4f6', borderRadius: '12px' }}>
        <h2 style={{ marginBottom: '10px' }}>Instructions:</h2>
        <ol style={{ textAlign: 'left', maxWidth: '500px', margin: '0 auto' }}>
          <li>Click any button above</li>
          <li>Look at the TOP-RIGHT corner of your screen</li>
          <li>You should see a colored notification appear</li>
          <li>Check the browser console (F12) for logs</li>
        </ol>
      </div>
    </div>
  );
};
