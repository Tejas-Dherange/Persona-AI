import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/lib/geminiPrompt';
import { getCareerPrompt } from '@/lib/geminiPrompt';
// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { message } = await request.json();

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

    // Get a generative model with streaming enabled
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.7,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      },
    });

    // Create the full prompt with system context
    const systemPrompt = getCareerPrompt();
    const fullPrompt = `${systemPrompt}\n\nUser: ${message}\n\nCareerGURU:`;

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Generate streaming response
          const result = await model.generateContentStream(fullPrompt);
          
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
            error: 'Failed to get response from CareerGURU',
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
      },
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    
    return Response.json(
      { 
        error: 'Failed to get response from CareerGURU',
        reply: "I'm having some technical difficulties right now. Please try again in a moment! 🔧"
      },
      { status: 500 }
    );
  }
}