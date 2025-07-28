import { getSystemPrompt } from '@/lib/geminiPrompt';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

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

    // Dynamic import to avoid module loading issues
    const { ChatGoogleGenerativeAI } = await import('@langchain/google-genai');
    const { HumanMessage, SystemMessage } = await import('@langchain/core/messages');

    // Initialize the model
    const model = new ChatGoogleGenerativeAI({
      modelName: "gemini-1.5-flash",
      apiKey: process.env.GEMINI_API_KEY,
      streaming: true,
      temperature: 0.7,
    });

    // Create messages for LangChain
    const systemPrompt = getSystemPrompt();
    const messages = [
      new SystemMessage(systemPrompt),
      new HumanMessage(message)
    ];

    // Create a ReadableStream for streaming response
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream the response
          const streamingResponse = await model.stream(messages);
          
          for await (const chunk of streamingResponse) {
            const content = chunk.content;
            if (content) {
              // Send each chunk as Server-Sent Events format
              const data = `data: ${JSON.stringify({ content })}\n\n`;
              controller.enqueue(encoder.encode(data));
            }
          }
          
          // Send end signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('LangChain Streaming error:', error);
          const errorData = `data: ${JSON.stringify({ 
            error: 'Failed to get response from Bino',
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
    console.error('LangChain API Error:', error);
    
    return Response.json(
      { 
        error: 'Failed to get response from Bino',
        reply: "I'm having some technical difficulties right now. Please try again in a moment! 🔧"
      },
      { status: 500 }
    );
  }
}
