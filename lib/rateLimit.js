/**
 * Simple in-memory rate limiter
 * For production, consider using Redis or a database for persistence
 */

class RateLimiter {
  constructor() {
    this.clients = new Map();
    this.cleanup();
  }

  /**
   * Check if client is within rate limits
   * @param {string} identifier - Client identifier (IP, user ID, etc.)
   * @param {Object} options - Rate limiting options
   * @returns {Object} - { allowed: boolean, remaining: number, resetTime: number }
   */
  checkLimit(identifier, options = {}) {
    const {
      windowMs = 15 * 60 * 1000, // 15 minutes
      maxRequests = 100, // Max 100 requests per window
      skipLimit = false // Skip rate limiting (for testing)
    } = options;

    if (skipLimit) {
      return { allowed: true, remaining: maxRequests, resetTime: Date.now() + windowMs };
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create client record
    if (!this.clients.has(identifier)) {
      this.clients.set(identifier, {
        requests: [],
        windowStart: now
      });
    }

    const client = this.clients.get(identifier);

    // Remove old requests outside the current window
    client.requests = client.requests.filter(timestamp => timestamp > windowStart);

    // Check if client has exceeded the limit
    if (client.requests.length >= maxRequests) {
      const oldestRequest = Math.min(...client.requests);
      const resetTime = oldestRequest + windowMs;
      
      return {
        allowed: false,
        remaining: 0,
        resetTime,
        retryAfter: Math.ceil((resetTime - now) / 1000) // seconds
      };
    }

    // Add current request
    client.requests.push(now);

    const remaining = maxRequests - client.requests.length;
    const resetTime = Math.min(...client.requests) + windowMs;

    return {
      allowed: true,
      remaining,
      resetTime,
      retryAfter: 0
    };
  }

  /**
   * Get client stats
   * @param {string} identifier - Client identifier
   * @returns {Object} - Client statistics
   */
  getClientStats(identifier) {
    const client = this.clients.get(identifier);
    if (!client) {
      return { requestCount: 0, lastRequest: null };
    }

    return {
      requestCount: client.requests.length,
      lastRequest: client.requests.length > 0 ? Math.max(...client.requests) : null
    };
  }

  /**
   * Reset limits for a specific client
   * @param {string} identifier - Client identifier
   */
  resetClient(identifier) {
    this.clients.delete(identifier);
  }

  /**
   * Get all clients (for monitoring)
   * @returns {Array} - Array of client information
   */
  getAllClients() {
    const clients = [];
    for (const [identifier, data] of this.clients.entries()) {
      clients.push({
        identifier,
        requestCount: data.requests.length,
        lastRequest: data.requests.length > 0 ? Math.max(...data.requests) : null
      });
    }
    return clients;
  }

  /**
   * Cleanup old clients periodically
   */
  cleanup() {
    setInterval(() => {
      const now = Date.now();
      const cleanupThreshold = 60 * 60 * 1000; // 1 hour

      for (const [identifier, client] of this.clients.entries()) {
        const lastRequest = client.requests.length > 0 ? Math.max(...client.requests) : 0;
        
        // Remove clients that haven't made requests in the last hour
        if (now - lastRequest > cleanupThreshold) {
          this.clients.delete(identifier);
        }
      }
    }, 10 * 60 * 1000); // Run cleanup every 10 minutes
  }

  /**
   * Get total number of tracked clients
   * @returns {number} - Number of active clients
   */
  getClientCount() {
    return this.clients.size;
  }
}

// Rate limiting configurations for different endpoints
export const RATE_LIMIT_CONFIGS = {
  // Main chat endpoint - more restrictive
  chat: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 50, // 50 messages per 15 minutes
    message: 'Too many chat messages. Please wait before sending more messages.'
  },

  // Search endpoint - moderate limits
  search: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 20, // 20 searches per 5 minutes
    message: 'Too many search requests. Please wait before searching again.'
  },

  // General API - lenient limits
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 100, // 100 requests per 15 minutes
    message: 'Rate limit exceeded. Please try again later.'
  }
};

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Get client identifier from request
 * @param {Request} request - The request object
 * @returns {string} - Client identifier
 */
export function getClientIdentifier(request) {
  // Try to get IP from various headers (for different hosting environments)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const remoteAddr = request.headers.get('remote-addr');
  
  // Use the first available IP
  const ip = forwarded?.split(',')[0]?.trim() || realIP || remoteAddr || 'unknown';
  
  // You can also include user agent for additional uniqueness (optional)
  const userAgent = request.headers.get('user-agent')?.slice(0, 50) || 'unknown';
  
  // Create a composite identifier
  return `${ip}:${userAgent}`;
}

/**
 * Apply rate limiting to a request
 * @param {Request} request - The request object
 * @param {string} type - Rate limit type ('chat', 'search', 'general')
 * @returns {Object} - { allowed, response }
 */
export function applyRateLimit(request, type = 'general') {
  const config = RATE_LIMIT_CONFIGS[type] || RATE_LIMIT_CONFIGS.general;
  const identifier = getClientIdentifier(request);
  
  const result = rateLimiter.checkLimit(identifier, config);
  
  if (!result.allowed) {
    const response = Response.json(
      {
        error: 'Rate limit exceeded',
        message: config.message,
        retryAfter: result.retryAfter,
        resetTime: result.resetTime
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': result.retryAfter.toString(),
          'Content-Type': 'application/json'
        }
      }
    );
    
    return { allowed: false, response };
  }
  
  // Add rate limit headers to successful responses
  const headers = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': result.resetTime.toString()
  };
  
  return { allowed: true, headers, rateLimitInfo: result };
}

// Export the rate limiter instance for direct access if needed
export { rateLimiter };

export default rateLimiter;
