// Web search API route
import { applyRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    // Apply rate limiting for search requests
    const rateLimitResult = applyRateLimit(request, 'search');
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const { query } = await request.json();

    if (!query || query.trim() === '') {
      return Response.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Using DuckDuckGo Instant Answer API (free and doesn't require API key)
    const searchUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
    
    try {
      const response = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'ChatBot/1.0'
        }
      });

      if (!response.ok) {
        throw new Error('Search service unavailable');
      }

      const data = await response.json();
      
      // Extract relevant information
      const searchResults = {
        query: query,
        instant_answer: data.AbstractText || data.Answer || null,
        source: data.AbstractSource || data.AnswerType || null,
        related_topics: data.RelatedTopics?.slice(0, 3)?.map(topic => ({
          title: topic.Text,
          url: topic.FirstURL
        })) || [],
        infobox: data.Infobox ? {
          content: data.Infobox.content?.slice(0, 3)?.map(item => ({
            label: item.label,
            value: item.value
          })) || []
        } : null
      };

      // Fallback to web scraping for basic search if no instant answer
      if (!searchResults.instant_answer && !searchResults.related_topics.length) {
        // Try a simple web search using a different approach
        try {
          const fallbackUrl = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
          // Note: This is a simplified approach. In production, you'd want to use a proper search API
          searchResults.fallback_message = "I found your query but couldn't get detailed results. Let me provide a general response based on my knowledge.";
        } catch (fallbackError) {
          console.log('Fallback search also failed:', fallbackError);
        }
      }

      return Response.json(searchResults, {
        headers: {
          // Add rate limit headers
          ...rateLimitResult.headers,
        }
      });

    } catch (searchError) {
      console.error('Search API Error:', searchError);
      
      // Return a structured response even when search fails
      return Response.json({
        query: query,
        error: 'Search temporarily unavailable',
        fallback_message: "I couldn't search the web right now, but I'll answer based on my existing knowledge."
      }, {
        headers: {
          ...rateLimitResult.headers,
        }
      });
    }

  } catch (error) {
    console.error('Search Route Error:', error);
    
    return Response.json(
      { 
        error: 'Failed to perform search',
        message: "Search feature is temporarily unavailable. I'll help you with my existing knowledge instead."
      },
      { status: 500 }
    );
  }
}
