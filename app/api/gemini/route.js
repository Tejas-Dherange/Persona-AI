import { GoogleGenerativeAI } from '@google/generative-ai';
// import { getSystemPrompt } from '@/lib/geminiPrompt';
import {  getHiteshSirPersonaPrompt, getPiyushGargPersonaPrompt } from '@/lib/geminiPrompt';
import { applyRateLimit } from '@/lib/rateLimit';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    // Apply rate limiting first
    const rateLimitResult = applyRateLimit(request, 'chat');
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const { message, conversationHistory = [], mentor = 'hitesh' } = await request.json();

    if (!message || message.trim() === '') {
      return Response.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return Response.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Detect if web search might be helpful
    const searchTriggers = [
      'latest', 'recent', 'current', 'news', 'today', 'this year', '2024', '2025',
      'what happened', 'recent updates', 'latest version', 'current price',
      'breaking news', 'recent developments', 'market trends', 'stock price',
      'weather', 'current events', 'recent changes', 'latest release'
    ];
    
    const needsWebSearch = searchTriggers.some(trigger => 
      message.toLowerCase().includes(trigger.toLowerCase())
    );

    let webSearchContext = '';
    
    // Perform web search if needed
    if (needsWebSearch) {
      try {
        const searchResponse = await fetch(`${request.url.replace('/api/gemini', '/api/search')}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ query: message })
        });

        if (searchResponse.ok) {
          const searchData = await searchResponse.json();
          
          if (searchData.instant_answer) {
            webSearchContext = `\n\nCurrent web search results for "${message}":\n`;
            webSearchContext += `Answer: ${searchData.instant_answer}\n`;
            if (searchData.source) {
              webSearchContext += `Source: ${searchData.source}\n`;
            }
          }
          
          if (searchData.related_topics && searchData.related_topics.length > 0) {
            webSearchContext += `\nRelated information:\n`;
            searchData.related_topics.forEach((topic, index) => {
              webSearchContext += `${index + 1}. ${topic.title}\n`;
            });
          }
          
          if (searchData.fallback_message) {
            webSearchContext += `\nNote: ${searchData.fallback_message}\n`;
          }
        }
      } catch (searchError) {
        console.error('Web search failed:', searchError);
        // Continue without web search context
      }
    }

    // Get a generative model with streaming enabled
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    // Create the full prompt with system context and conversation history
    let systemPrompt;
    switch (mentor) {
      case 'piyush':
        systemPrompt = getPiyushGargPersonaPrompt();
        break;
      case 'hitesh':
      default:
        systemPrompt = getHiteshSirPersonaPrompt();
        break;
    }
    
    // Build conversation context from history (keep last 10 messages to avoid token limits)
    let conversationContext = '';
    if (conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-10); // Keep last 10 messages
      conversationContext = '\n\nPrevious conversation:\n';
      recentHistory.forEach((msg, index) => {
        const role = msg.sender === 'user' ? 'User' : 'Assistant';
        // Only include text content, skip empty or streaming messages
        if (msg.text && msg.text.trim()) {
          conversationContext += `${role}: ${msg.text}\n`;
        }
      });
      conversationContext += '\nCurrent question:\n';
    }
    
    // Combine all contexts
    const fullPrompt = `${systemPrompt}${webSearchContext}${conversationContext}User: ${message}`;
    
    // Log the conversation context for debugging (optional)
    console.log('Mentor:', mentor);
    console.log('Web search performed:', needsWebSearch);
    console.log('Conversation context length:', conversationHistory.length);
    console.log('Recent history used:', conversationHistory.slice(-10).length);

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate streaming response
          const result = await model.generateContentStream(fullPrompt);
          console.log('Streaming chunk:', result.content);

          
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              // Send each chunk as Server-Sent Events format
              const data = `data: ${JSON.stringify({ content: chunkText })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          
          // Send end signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ 
            error: 'Failed to get response from ChatBot',
            content: "I'm having some technical difficulties right now. Please try again in a moment! 🔧"
          })}\n\n`;
          controller.enqueue(encoder.encode(errorData));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Add rate limit headers
        ...rateLimitResult.headers,
      },
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    return Response.json(
      { 
        error: 'Failed to get response from ChatBot',
        reply: "I'm having some technical difficulties right now. Please try again in a moment! 🔧"
      },
      { status: 500 }
    );
  }
}