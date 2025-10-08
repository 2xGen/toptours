import { NextResponse } from 'next/server';

// Simple GET endpoint - can be tested directly in browser
export async function GET(request) {
  const timestamp = new Date().toISOString();
  
  console.log('=== DIRECT OpenAI Test - GET Request ===');
  console.log('Timestamp:', timestamp);
  
  try {
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json({
        endpoint: '/api/direct-openai-test',
        method: 'GET',
        timestamp: timestamp,
        error: 'OPENAI_API_KEY not set in environment',
        envVars: Object.keys(process.env).filter(k => k.includes('OPENAI')),
      }, { status: 500 });
    }

    console.log('API Key found, making OpenAI request...');

    // Simple OpenAI API call
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{
          role: 'user',
          content: 'Say exactly: "OpenAI is connected to TopTours.ai!"'
        }],
        max_tokens: 20
      })
    });

    console.log('OpenAI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI error:', errorText);
      
      return NextResponse.json({
        endpoint: '/api/direct-openai-test',
        method: 'GET',
        timestamp: timestamp,
        error: 'OpenAI API call failed',
        status: response.status,
        details: errorText
      }, { status: 500 });
    }

    const data = await response.json();
    const message = data.choices[0].message.content;

    console.log('Success! OpenAI responded:', message);

    return NextResponse.json({
      endpoint: '/api/direct-openai-test',
      method: 'GET',
      timestamp: timestamp,
      success: true,
      message: 'OpenAI API is working!',
      openaiResponse: message,
      model: data.model,
      usage: data.usage
    });

  } catch (error) {
    console.error('Exception:', error);
    
    return NextResponse.json({
      endpoint: '/api/direct-openai-test',
      method: 'GET',
      timestamp: timestamp,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}

