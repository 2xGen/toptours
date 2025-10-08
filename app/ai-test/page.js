"use client";
import { useState } from 'react';

export default function AITest() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const test = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai-test-final', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination: 'Paris' })
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'Arial', maxWidth: '800px', margin: '0 auto' }}>
      <h1>OpenAI Test</h1>
      <button 
        onClick={test}
        disabled={loading}
        style={{
          padding: '15px 30px',
          fontSize: '16px',
          background: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Testing...' : 'Test OpenAI API'}
      </button>

      {result && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: result.success ? '#e6ffe6' : '#ffe6e6',
          borderRadius: '5px',
          border: result.success ? '2px solid green' : '2px solid red'
        }}>
          <h3>{result.success ? '✅ SUCCESS' : '❌ ERROR'}</h3>
          <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

