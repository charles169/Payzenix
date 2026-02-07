import { useState } from 'react';
import { Button } from '@/components/ui/button';
import toast from 'react-hot-toast';

export const TestPage = () => {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    console.log('🔴 BUTTON CLICKED! Count:', count);
    alert('Button works! Count: ' + count);
    setCount(count + 1);
    toast.success('Button clicked! Count: ' + count);
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '48px', marginBottom: '30px' }}>BUTTON TEST PAGE</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <p style={{ fontSize: '24px' }}>Count: {count}</p>
      </div>

      <Button 
        onClick={handleClick}
        style={{ 
          padding: '20px 40px', 
          fontSize: '20px',
          background: 'red',
          color: 'white'
        }}
      >
        CLICK ME - TEST BUTTON
      </Button>

      <div style={{ marginTop: '30px' }}>
        <button
          onClick={() => {
            console.log('🟢 HTML BUTTON CLICKED!');
            alert('HTML button works!');
          }}
          style={{
            padding: '20px 40px',
            fontSize: '20px',
            background: 'green',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            borderRadius: '5px'
          }}
        >
          HTML BUTTON TEST
        </button>
      </div>

      <div style={{ marginTop: '30px', padding: '20px', background: '#f0f0f0' }}>
        <p>If you can see this page and click buttons, React is working!</p>
        <p>Check browser console (F12) for messages when you click.</p>
      </div>
    </div>
  );
};
