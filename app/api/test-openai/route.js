import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.OPENAI_API_KEY;
    
    console.log('=== OpenAI Test Endpoint ===');
    console.log('API Key exists:', !!apiKey);
    console.log('API Key length:', apiKey ? apiKey.length : 0);
    console.log('API Key prefix:', apiKey ? apiKey.substring(0, 10) + '...' : 'none');
    console.log('API Key suffix:', apiKey ? '...' + apiKey.substring(apiKey.length - 6) : 'none');
    
    if (!apiKey) {
      return NextResponse.json({ 
        success: false,
        error: 'OpenAI API key not found in environment variables',
        envCheck: {
          OPENAI_API_KEY: 'not set',
          allEnvVars: Object.keys(process.env).filter(key => key.includes('OPENAI'))
        }
      }, { status: 500 });
    }

    console.log('Making test request to OpenAI...');
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: 'Say "Hello from TopTours.ai!" in exactly those words.'
          }
        ],
        max_tokens: 20,
        temperature: 0
      })
    });

    console.log('OpenAI response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json({
        success: false,
        error: 'OpenAI API returned an error',
        status: response.status,
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    console.log('OpenAI response received successfully!');
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working correctly!',
      testResponse: data.choices[0].message.content,
      apiKeyConfigured: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

