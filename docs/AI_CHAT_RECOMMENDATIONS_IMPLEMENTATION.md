# AI Chat Recommendations - Implementation Plan

## Overview
A conversational AI interface that helps users discover tours and restaurants based on destination data, user preferences, and existing guides. Uses Gemini Flash for cheap conversational flow, with structured responses for common queries.

---

## 🎯 Core Features

### 1. Restaurant Recommendations
- **Query:** "Give me seafood options in Aruba"
- **Response:** Shows filtered restaurants with match scores
- **Data Source:** Existing restaurant database + cuisine filters
- **AI Usage:** Minimal (only for conversational follow-ups)

### 2. Tour Recommendations
- **Query:** "What's the best snorkeling tour for couples?"
- **Response:** Uses product search or category guides
- **Data Source:** Viator API (`/search/freetext`) + category guides
- **AI Usage:** For personalized recommendations based on preferences

### 3. Destination Planning
- **Query:** "What to do in Aruba?"
- **Response:** Shows 6 category guides
- **Data Source:** Existing category guides
- **AI Usage:** None (structured response)

---

## 🏗️ Architecture

### Component Structure

```
src/
├── components/
│   └── ai-chat/
│       ├── AIChatWidget.jsx          # Main chat UI component
│       ├── ChatMessage.jsx           # Individual message component
│       ├── RecommendationCard.jsx   # Tour/restaurant card in chat
│       └── QuickActions.jsx          # Quick action buttons
├── lib/
│   └── ai-chat/
│       ├── queryRouter.js            # Routes queries (structured vs AI)
│       ├── structuredResponses.js    # Handles structured responses
│       ├── aiHandler.js              # Gemini Flash integration
│       ├── restaurantSearch.js        # Restaurant filtering logic
│       └── tourSearch.js             # Tour search logic
└── app/
    └── api/
        └── ai-chat/
            └── route.js              # API endpoint for chat
```

---

## 📋 Implementation Steps

### Phase 1: Chat UI Component (Week 1)

#### 1.1 Create Chat Widget Component

**File:** `src/components/ai-chat/AIChatWidget.jsx`

```jsx
"use client";
import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import QuickActions from './QuickActions';

export default function AIChatWidget({ destination, userPreferences, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (query) => {
    if (!query.trim()) return;

    // Add user message
    const userMessage = { type: 'user', content: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Call API endpoint
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          destination: destination.id,
          destinationName: destination.name,
          userPreferences,
          conversationHistory: messages.slice(-5) // Last 5 messages for context
        })
      });

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        type: 'ai',
        content: data.message,
        recommendations: data.recommendations || [],
        guides: data.guides || [],
        quickActions: data.quickActions || []
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, {
        type: 'ai',
        content: 'Sorry, I encountered an error. Please try again.',
        error: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-lg flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI Travel Assistant</h3>
          <p className="text-sm text-blue-100">{destination.name}</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-200">
          ✕
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="font-semibold mb-2">👋 Hi! I'm your AI travel assistant.</p>
            <p className="text-sm">Ask me about tours, restaurants, or things to do in {destination.name}!</p>
            <QuickActions 
              destination={destination}
              onAction={handleSend}
            />
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <ChatMessage key={idx} message={msg} destination={destination} />
        ))}
        
        {loading && (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Thinking...</span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(input); }}>
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tours, restaurants, or activities..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

#### 1.2 Create Message Component

**File:** `src/components/ai-chat/ChatMessage.jsx`

```jsx
import RecommendationCard from './RecommendationCard';
import Link from 'next/link';

export default function ChatMessage({ message, destination }) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-start">
      <div className="bg-gray-100 rounded-lg px-4 py-2 max-w-[85%]">
        <div className="flex items-start space-x-2">
          <span className="text-xl">🤖</span>
          <div className="flex-1">
            <p className="text-gray-800 whitespace-pre-wrap">{message.content}</p>
            
            {/* Recommendations */}
            {message.recommendations && message.recommendations.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.recommendations.map((rec, idx) => (
                  <RecommendationCard key={idx} recommendation={rec} destination={destination} />
                ))}
              </div>
            )}
            
            {/* Guides */}
            {message.guides && message.guides.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-semibold text-gray-700 mb-2">📚 Travel Guides:</p>
                <div className="space-y-1">
                  {message.guides.map((guide, idx) => (
                    <Link
                      key={idx}
                      href={guide.link}
                      className="block text-sm text-blue-600 hover:text-blue-800"
                    >
                      • {guide.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}
            
            {/* Quick Actions */}
            {message.quickActions && message.quickActions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => action.onClick && action.onClick()}
                    className="text-xs px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Phase 2: Query Routing System (Week 1)

#### 2.1 Query Router

**File:** `src/lib/ai-chat/queryRouter.js`

```javascript
/**
 * Routes queries to appropriate handler (structured vs AI)
 */
export function routeQuery(query, destination, userPreferences) {
  const queryLower = query.toLowerCase().trim();
  
  // Pattern 1: "What to do" → Show guides (structured)
  if (queryLower.match(/what.*to.*do|things.*to.*do|activities|what.*can.*i.*do/i)) {
    return {
      type: 'structured',
      handler: 'show_guides',
      data: { destination }
    };
  }
  
  // Pattern 2: "Where to eat" / "Restaurants" → Show cuisine options (structured)
  if (queryLower.match(/where.*eat|restaurants|dining|food|where.*dine/i)) {
    return {
      type: 'structured',
      handler: 'show_cuisine_options',
      data: { destination }
    };
  }
  
  // Pattern 3: "Show me tours" → Navigate (structured)
  if (queryLower.match(/show.*tours|browse.*tours|tours|activities/i)) {
    return {
      type: 'navigation',
      handler: 'navigate_tours',
      data: { destination }
    };
  }
  
  // Pattern 4: Specific cuisine type → Show restaurants (structured)
  const cuisineTypes = ['seafood', 'italian', 'caribbean', 'asian', 'mexican', 'french', 'american', 'japanese', 'chinese', 'indian'];
  const matchedCuisine = cuisineTypes.find(cuisine => queryLower.includes(cuisine));
  if (matchedCuisine) {
    return {
      type: 'structured',
      handler: 'show_restaurants',
      data: { destination, cuisine: matchedCuisine }
    };
  }
  
  // Pattern 5: Specific activity/tour type → Search tours (structured + AI)
  const tourTypes = ['snorkeling', 'diving', 'sailing', 'hiking', 'cultural', 'adventure', 'food', 'wine'];
  const matchedTourType = tourTypes.find(type => queryLower.includes(type));
  if (matchedTourType) {
    return {
      type: 'hybrid',
      handler: 'search_tours',
      data: { destination, tourType: matchedTourType, query, userPreferences }
    };
  }
  
  // Pattern 6: Preference-based → Use AI
  if (queryLower.match(/best|recommend|suggest|what.*should|which.*is|romantic|budget|cheap|expensive|private|group|couples|family/i)) {
    return {
      type: 'ai',
      handler: 'ai_recommendation',
      data: { destination, query, userPreferences }
    };
  }
  
  // Default: Use AI for conversational flow
  return {
    type: 'ai',
    handler: 'ai_conversation',
    data: { destination, query, userPreferences }
  };
}
```

#### 2.2 Structured Response Handlers

**File:** `src/lib/ai-chat/structuredResponses.js`

```javascript
import { getAllCategoryGuidesForDestination } from '@/lib/categoryGuides';
import { getRestaurantsForDestination } from '@/lib/restaurants';

/**
 * Handle structured responses (no AI needed)
 */
export async function handleStructuredResponse(route, destination, userPreferences) {
  switch (route.handler) {
    case 'show_guides':
      return await handleShowGuides(destination);
    
    case 'show_cuisine_options':
      return await handleShowCuisineOptions(destination);
    
    case 'show_restaurants':
      return await handleShowRestaurants(destination, route.data.cuisine);
    
    case 'navigate_tours':
      return {
        type: 'navigation',
        message: `Here are all tours in ${destination.name}:`,
        url: `/destinations/${destination.id}/tours`
      };
    
    default:
      return null;
  }
}

async function handleShowGuides(destination) {
  const guides = await getAllCategoryGuidesForDestination(destination.id);
  
  return {
    type: 'structured',
    message: `Here are the best ways to explore ${destination.name}:`,
    guides: guides.map(guide => ({
      title: guide.title || guide.category_name,
      link: `/destinations/${destination.id}/guides/${guide.category_slug || guide.slug}`
    })),
    quickActions: [
      { label: 'Show Restaurants', onClick: () => 'Where to eat?' },
      { label: 'Show Tours', onClick: () => 'Show me tours' }
    ]
  };
}

async function handleShowCuisineOptions(destination) {
  // Get available cuisine types from restaurants
  const restaurants = await getRestaurantsForDestination(destination.id);
  const cuisineTypes = [...new Set(restaurants.map(r => r.cuisine_type).filter(Boolean))];
  
  return {
    type: 'structured',
    message: `What type of cuisine are you interested in?`,
    cuisineOptions: cuisineTypes,
    quickActions: cuisineTypes.slice(0, 6).map(cuisine => ({
      label: cuisine,
      onClick: () => `Show me ${cuisine.toLowerCase()} restaurants`
    }))
  };
}

async function handleShowRestaurants(destination, cuisine) {
  const restaurants = await getRestaurantsForDestination(destination.id);
  const filtered = restaurants.filter(r => 
    r.cuisine_type?.toLowerCase().includes(cuisine.toLowerCase())
  );
  
  // Sort by match score if user preferences available
  const sorted = userPreferences 
    ? filtered.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    : filtered;
  
  return {
    type: 'structured',
    message: `Here are the best ${cuisine} restaurants in ${destination.name}:`,
    recommendations: sorted.slice(0, 5).map(r => ({
      type: 'restaurant',
      id: r.id,
      title: r.name,
      description: r.description,
      matchScore: r.matchScore,
      link: `/destinations/${destination.id}/restaurants/${r.slug}`
    }))
  };
}
```

---

### Phase 3: AI Integration (Week 2)

#### 3.1 AI Handler with Gemini Flash

**File:** `src/lib/ai-chat/aiHandler.js`

```javascript
/**
 * Handle AI responses using Gemini Flash (cheap, fast)
 */
export async function handleAIResponse(route, destination, userPreferences, conversationHistory = []) {
  const { query } = route.data;
  
  // Get relevant data based on query
  const relevantData = await getRelevantData(query, destination, userPreferences);
  
  // Build minimal prompt
  const prompt = buildPrompt(query, destination, userPreferences, relevantData, conversationHistory);
  
  // Call Gemini Flash
  const response = await callGeminiFlash(prompt);
  
  return {
    type: 'ai',
    message: response.message,
    recommendations: response.recommendations || [],
    guides: response.guides || []
  };
}

async function getRelevantData(query, destination, userPreferences) {
  const queryLower = query.toLowerCase();
  
  // Determine if query is about tours or restaurants
  const isTourQuery = queryLower.match(/tour|activity|excursion|experience|adventure|sightseeing/i);
  const isRestaurantQuery = queryLower.match(/restaurant|dining|eat|food|cuisine|meal/i);
  
  if (isTourQuery) {
    // Search tours using Viator API
    return await searchTours(query, destination, userPreferences);
  } else if (isRestaurantQuery) {
    // Search restaurants
    return await searchRestaurants(query, destination, userPreferences);
  }
  
  // Default: return both
  return {
    tours: await searchTours(query, destination, userPreferences),
    restaurants: await searchRestaurants(query, destination, userPreferences)
  };
}

async function searchTours(query, destination, userPreferences) {
  // Use Viator API search
  const response = await fetch('/api/internal/viator-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      searchTerm: query,
      viatorDestinationId: destination.destinationId,
      page: 1,
      perPage: 10
    })
  });
  
  const data = await response.json();
  return data.products?.results || [];
}

async function searchRestaurants(query, destination, userPreferences) {
  // Get restaurants from database
  const { getRestaurantsForDestination } = await import('@/lib/restaurants');
  const restaurants = await getRestaurantsForDestination(destination.id);
  
  // Filter by query keywords
  const queryLower = query.toLowerCase();
  return restaurants.filter(r => 
    r.name.toLowerCase().includes(queryLower) ||
    r.cuisine_type?.toLowerCase().includes(queryLower) ||
    r.description?.toLowerCase().includes(queryLower)
  ).slice(0, 10);
}

function buildPrompt(query, destination, userPreferences, relevantData, conversationHistory) {
  const context = conversationHistory.length > 0
    ? `Previous conversation:\n${conversationHistory.map(m => `${m.type}: ${m.content}`).join('\n')}\n\n`
    : '';
  
  return `
You are a helpful travel assistant for ${destination.name}.

${context}
User asked: "${query}"

User preferences:
${JSON.stringify(userPreferences, null, 2)}

Available options:
${JSON.stringify(relevantData.slice(0, 10), null, 2)}

Provide a brief, conversational response (2-3 sentences) with top 3 recommendations.
Include match scores if available.
Keep it natural and helpful.
Format recommendations as JSON array with: title, description, matchScore, link.
`;
}

async function callGeminiFlash(prompt) {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('Gemini API key not configured');
  }
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 500
      }
    })
  });
  
  const data = await response.json();
  const text = data.candidates[0]?.content?.parts[0]?.text || 'Sorry, I could not generate a response.';
  
  // Parse JSON from response if present
  try {
    const jsonMatch = text.match(/\[{.*}\]/s);
    if (jsonMatch) {
      const recommendations = JSON.parse(jsonMatch[0]);
      return {
        message: text.replace(jsonMatch[0], '').trim(),
        recommendations
      };
    }
  } catch (e) {
    // Not JSON, return as message
  }
  
  return { message: text };
}
```

---

### Phase 4: API Endpoint (Week 2)

#### 4.1 Create API Route

**File:** `app/api/ai-chat/route.js`

```javascript
import { routeQuery } from '@/lib/ai-chat/queryRouter';
import { handleStructuredResponse } from '@/lib/ai-chat/structuredResponses';
import { handleAIResponse } from '@/lib/ai-chat/aiHandler';
import { getDestinationById } from '@/data/destinationsData';

export async function POST(request) {
  try {
    const { query, destination: destinationId, destinationName, userPreferences, conversationHistory } = await request.json();
    
    // Get destination data
    const destination = getDestinationById(destinationId) || {
      id: destinationId,
      name: destinationName || destinationId,
      destinationId: destinationId
    };
    
    // Route query
    const route = routeQuery(query, destination, userPreferences);
    
    // Handle based on route type
    let response;
    switch (route.type) {
      case 'structured':
      case 'navigation':
        response = await handleStructuredResponse(route, destination, userPreferences);
        break;
      
      case 'ai':
      case 'hybrid':
        response = await handleAIResponse(route, destination, userPreferences, conversationHistory);
        break;
      
      default:
        response = await handleAIResponse(route, destination, userPreferences, conversationHistory);
    }
    
    return Response.json(response);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    return Response.json(
      { error: 'Failed to process query', message: error.message },
      { status: 500 }
    );
  }
}
```

---

### Phase 5: Integration into Destination Pages (Week 2)

#### 5.1 Add Chat Widget to Destination Page

**File:** `app/destinations/[id]/DestinationDetailClient.jsx`

```jsx
import AIChatWidget from '@/components/ai-chat/AIChatWidget';
import { useState } from 'react';

export default function DestinationDetailClient({ destination, ... }) {
  const [showChat, setShowChat] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  
  // ... existing code ...
  
  return (
    <>
      {/* ... existing content ... */}
      
      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-blue-700 flex items-center space-x-2 z-40"
      >
        <span>💬</span>
        <span>Ask AI Assistant</span>
      </button>
      
      {/* Chat Widget */}
      {showChat && (
        <AIChatWidget
          destination={destination}
          userPreferences={userPreferences}
          onClose={() => setShowChat(false)}
        />
      )}
    </>
  );
}
```

---

## 📊 Cost Estimates

### Gemini Flash Pricing (as of 2024)
- **Input:** $0.075 per 1M tokens
- **Output:** $0.30 per 1M tokens

### Per Query Estimate
- **Prompt:** ~500-800 tokens (query + context + data)
- **Response:** ~200-400 tokens
- **Total:** ~700-1,200 tokens per AI query
- **Cost:** ~$0.0003-0.0005 per query (0.03-0.05 cents)

### Monthly Cost Projections
- **100 queries/day:** $0.90-1.50/month
- **1,000 queries/day:** $9-15/month
- **10,000 queries/day:** $90-150/month

**Note:** With 90% structured responses (no AI), actual costs will be 10% of above.

---

## ✅ Implementation Checklist

### Week 1
- [ ] Create chat UI components
- [ ] Implement query router
- [ ] Build structured response handlers
- [ ] Add chat widget to destination pages

### Week 2
- [ ] Integrate Gemini Flash API
- [ ] Build AI handler
- [ ] Create API endpoint
- [ ] Test restaurant recommendations
- [ ] Test tour recommendations

### Week 3
- [ ] Polish UI/UX
- [ ] Add error handling
- [ ] Implement analytics
- [ ] Optimize prompts for cost
- [ ] User testing

---

## 🎯 Success Metrics

- **Engagement:** % of users who interact with chat
- **Conversion:** % of chat users who click on recommendations
- **Cost per session:** Average AI cost per user session
- **Response time:** Average time to first response
- **User satisfaction:** Feedback on recommendations

---

## 🚀 Next Steps

1. **Start with Phase 1:** Build chat UI
2. **Test structured responses:** Ensure "What to do" and "Where to eat" work
3. **Add AI gradually:** Start with simple queries, expand
4. **Monitor costs:** Track Gemini API usage
5. **Iterate:** Based on user feedback

This is a **major MOAT feature** that differentiates you from competitors! 🎯

