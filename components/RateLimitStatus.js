import { useState, useEffect } from 'react';
import { AlertTriangle, Clock, Shield } from 'lucide-react';

const RateLimitStatus = ({ show = false, className = '' }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/rate-limit');
      
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch rate limit status');
      }
    } catch (err) {
      setError('Network error while fetching status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show) {
      fetchStatus();
      // Refresh every 30 seconds when visible
      const interval = setInterval(fetchStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [show]);

  const formatTimeRemaining = (resetTime) => {
    const now = new Date();
    const reset = new Date(resetTime);
    const diffMs = reset - now;
    
    if (diffMs <= 0) return 'Now';
    
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const getLimitColor = (remaining, total) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'text-green-400';
    if (percentage > 20) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getLimitBgColor = (remaining, total) => {
    const percentage = (remaining / total) * 100;
    if (percentage > 50) return 'bg-green-500/20';
    if (percentage > 20) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  if (!show) return null;

  return (
    <div className={`bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-blue-400" />
          <h3 className="text-sm font-semibold text-gray-200">Rate Limit Status</h3>
        </div>
        <button
          onClick={fetchStatus}
          disabled={loading}
          className="text-xs text-gray-400 hover:text-gray-300 transition-colors disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center space-x-2 text-red-400 text-sm mb-3">
          <AlertTriangle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {status && (
        <div className="space-y-3">
          {/* Chat Limits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Chat Messages</span>
              <span className={getLimitColor(status.limits.chat.remaining, status.limits.chat.limit)}>
                {status.limits.chat.remaining}/{status.limits.chat.limit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getLimitBgColor(status.limits.chat.remaining, status.limits.chat.limit)}`}
                style={{
                  width: `${(status.limits.chat.remaining / status.limits.chat.limit) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Resets in: {formatTimeRemaining(status.limits.chat.resetTime)}</span>
              <span>{status.limits.chat.window}</span>
            </div>
          </div>

          {/* Search Limits */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">Web Searches</span>
              <span className={getLimitColor(status.limits.search.remaining, status.limits.search.limit)}>
                {status.limits.search.remaining}/{status.limits.search.limit}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${getLimitBgColor(status.limits.search.remaining, status.limits.search.limit)}`}
                style={{
                  width: `${(status.limits.search.remaining / status.limits.search.limit) * 100}%`
                }}
              ></div>
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Resets in: {formatTimeRemaining(status.limits.search.resetTime)}</span>
              <span>{status.limits.search.window}</span>
            </div>
          </div>

          {/* Server Info */}
          <div className="pt-2 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>Active Clients: {status.server.activeClients}</span>
              </div>
              <span>Updated: {new Date(status.server.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RateLimitStatus;
