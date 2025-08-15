import { applyRateLimit, rateLimiter, getClientIdentifier } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  try {
    // Apply general rate limiting to this endpoint
    const rateLimitResult = applyRateLimit(request, 'general');
    
    if (!rateLimitResult.allowed) {
      return rateLimitResult.response;
    }

    const identifier = getClientIdentifier(request);
    const clientStats = rateLimiter.getClientStats(identifier);
    
    // Check current limits for each endpoint type
    const chatLimit = rateLimiter.checkLimit(identifier, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 50,
      skipLimit: true // Just check, don't increment
    });
    
    const searchLimit = rateLimiter.checkLimit(identifier, {
      windowMs: 5 * 60 * 1000,
      maxRequests: 20,
      skipLimit: true
    });
    
    const generalLimit = rateLimiter.checkLimit(identifier, {
      windowMs: 15 * 60 * 1000,
      maxRequests: 100,
      skipLimit: true
    });

    const status = {
      client: {
        identifier: identifier.substring(0, 20) + '...', // Partially hide for privacy
        totalRequests: clientStats.requestCount,
        lastRequest: clientStats.lastRequest ? new Date(clientStats.lastRequest).toISOString() : null
      },
      limits: {
        chat: {
          remaining: chatLimit.remaining,
          resetTime: new Date(chatLimit.resetTime).toISOString(),
          limit: 50,
          window: '15 minutes'
        },
        search: {
          remaining: searchLimit.remaining,
          resetTime: new Date(searchLimit.resetTime).toISOString(),
          limit: 20,
          window: '5 minutes'
        },
        general: {
          remaining: generalLimit.remaining,
          resetTime: new Date(generalLimit.resetTime).toISOString(),
          limit: 100,
          window: '15 minutes'
        }
      },
      server: {
        activeClients: rateLimiter.getClientCount(),
        timestamp: new Date().toISOString()
      }
    };

    return Response.json(status, {
      headers: {
        'Cache-Control': 'no-cache',
        ...rateLimitResult.headers,
      }
    });

  } catch (error) {
    console.error('Rate limit status error:', error);
    
    return Response.json(
      { 
        error: 'Failed to get rate limit status',
        message: 'Unable to retrieve rate limiting information'
      },
      { status: 500 }
    );
  }
}

// Optional: Reset endpoint for development/testing
export async function DELETE(request) {
  try {
    // Only allow in development environment
    if (process.env.NODE_ENV === 'production') {
      return Response.json(
        { error: 'Not allowed in production' },
        { status: 403 }
      );
    }

    const { resetAll } = await request.json().catch(() => ({}));
    
    if (resetAll) {
      // Reset all clients (for testing)
      const allClients = rateLimiter.getAllClients();
      allClients.forEach(client => {
        rateLimiter.resetClient(client.identifier);
      });
      
      return Response.json({
        message: 'All rate limits reset',
        resetCount: allClients.length
      });
    } else {
      // Reset current client only
      const identifier = getClientIdentifier(request);
      rateLimiter.resetClient(identifier);
      
      return Response.json({
        message: 'Rate limit reset for current client',
        client: identifier.substring(0, 20) + '...'
      });
    }

  } catch (error) {
    console.error('Rate limit reset error:', error);
    
    return Response.json(
      { 
        error: 'Failed to reset rate limits',
        message: 'Unable to reset rate limiting'
      },
      { status: 500 }
    );
  }
}
