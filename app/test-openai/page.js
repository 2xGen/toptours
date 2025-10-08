"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function TestOpenAIPage() {
  const [destination, setDestination] = useState('Paris');
  const [descriptionResult, setDescriptionResult] = useState(null);
  const [categoriesResult, setCategoriesResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const testDescription = async () => {
    setLoading(true);
    setDescriptionResult({ status: 'loading...', data: null });
    
    try {
      console.log('Testing OpenAI Description API...');
      const response = await fetch('/api/openai-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchTerm: destination
        })
      });

      const data = await response.json();
      
      setDescriptionResult({
        status: response.ok ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        data: data
      });
    } catch (error) {
      setDescriptionResult({
        status: 'ERROR',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testCategories = async () => {
    setLoading(true);
    setCategoriesResult({ status: 'loading...', data: null });
    
    try {
      console.log('Testing OpenAI Categories API...');
      const response = await fetch('/api/openai-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: destination
        })
      });

      const data = await response.json();
      
      setCategoriesResult({
        status: response.ok ? 'SUCCESS' : 'ERROR',
        statusCode: response.status,
        data: data
      });
    } catch (error) {
      setCategoriesResult({
        status: 'ERROR',
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-purple-800 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">OpenAI API Test Page</h1>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Destination:</label>
                <Input
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Enter destination (e.g., Paris, Tokyo)"
                  className="max-w-md"
                />
              </div>
              
              <div className="flex gap-4">
                <Button 
                  onClick={testDescription}
                  disabled={loading || !destination}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Test Description API
                </Button>
                
                <Button 
                  onClick={testCategories}
                  disabled={loading || !destination}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Test Categories API
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description Results */}
        {descriptionResult && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Description API Result
                <span className={`ml-4 text-sm px-3 py-1 rounded ${
                  descriptionResult.status === 'SUCCESS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {descriptionResult.status}
                </span>
              </h2>
              
              <div className="space-y-2">
                {descriptionResult.statusCode && (
                  <p className="text-sm">
                    <strong>Status Code:</strong> {descriptionResult.statusCode}
                  </p>
                )}
                
                <div className="bg-gray-100 p-4 rounded overflow-auto">
                  <pre className="text-sm">
                    {JSON.stringify(descriptionResult.data || descriptionResult, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories Results */}
        {categoriesResult && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                Categories API Result
                <span className={`ml-4 text-sm px-3 py-1 rounded ${
                  categoriesResult.status === 'SUCCESS' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {categoriesResult.status}
                </span>
              </h2>
              
              <div className="space-y-2">
                {categoriesResult.statusCode && (
                  <p className="text-sm">
                    <strong>Status Code:</strong> {categoriesResult.statusCode}
                  </p>
                )}
                
                <div className="bg-gray-100 p-4 rounded overflow-auto">
                  <pre className="text-sm">
                    {JSON.stringify(categoriesResult.data || categoriesResult, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Instructions</h2>
            <div className="space-y-2 text-sm">
              <p>1. Enter a destination above (default: Paris)</p>
              <p>2. Click "Test Description API" to test the one-liner generation</p>
              <p>3. Click "Test Categories API" to test the category generation</p>
              <p>4. Check the results below - you'll see the full API response</p>
              <p className="mt-4 text-gray-600">
                <strong>Expected Success Response:</strong> Status "SUCCESS" with generated content
              </p>
              <p className="text-gray-600">
                <strong>Common Errors:</strong>
              </p>
              <ul className="list-disc ml-6 text-gray-600">
                <li>500 Error: OpenAI API key not configured or invalid</li>
                <li>401 Error: Invalid API key</li>
                <li>429 Error: Rate limit exceeded or quota exceeded</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a href="/" className="text-white underline hover:text-blue-200">
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}

