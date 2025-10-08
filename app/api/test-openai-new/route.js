import { NextResponse } from 'next/server';

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    console.log('=== NEW OpenAI Test Endpoint Called ===');
    
    const body = await request.json();
    const testDestination = body.destination || 'Paris';
    
    console.log('Test destination:', testDestination);
    
    // Check for API key
    const apiKey = process.env.OPENAI_API_KEY;
    console.log('API Key exists:', !!apiKey);
    console.log('API Key starts with:', apiKey ? apiKey.substring(0, 7) : 'NONE');
    
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'OPENAI_API_KEY environment variable is not set',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Make actual OpenAI API call
    console.log('Calling OpenAI API...');
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful travel assistant.'
          },
          {
            role: 'user',
            content: `Write ONE compelling sentence about why people should visit ${testDestination}.`
          }
        ],
        max_tokens: 100,
        temperature: 0.8
      })
    });

    console.log('OpenAI API response status:', openaiResponse.status);

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error('OpenAI API error response:', errorText);
      
      return NextResponse.json({
        success: false,
        error: 'OpenAI API request failed',
        status: openaiResponse.status,
        statusText: openaiResponse.statusText,
        details: errorText,
        timestamp: new Date().toISOString()
      }, { status: openaiResponse.status });
    }

    const openaiData = await openaiResponse.json();
    const generatedText = openaiData.choices[0].message.content;
    
    const endTime = Date.now();
    console.log('OpenAI API call successful!');
    console.log('Generated text:', generatedText);
    console.log('Time taken:', endTime - startTime, 'ms');

    return NextResponse.json({
      success: true,
      message: 'OpenAI API is working!',
      destination: testDestination,
      generatedText: generatedText,
      model: openaiData.model,
      usage: openaiData.usage,
      timeTaken: `${endTime - startTime}ms`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('=== ERROR in test endpoint ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

