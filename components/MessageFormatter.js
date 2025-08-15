import { useState } from 'react';
import { Copy, Check, ExternalLink } from 'lucide-react';

export default function MessageFormatter({ message, isUser }) {
  const [copiedBlocks, setCopiedBlocks] = useState(new Set());

  const copyToClipboard = async (text, blockId) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedBlocks(prev => new Set([...prev, blockId]));
      setTimeout(() => {
        setCopiedBlocks(prev => {
          const newSet = new Set(prev);
          newSet.delete(blockId);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessage = (text) => {
    if (!text) return null;

    // Split the message into parts to handle different formatting
    const parts = [];
    let currentIndex = 0;
    let blockIdCounter = 0;

    // Regex patterns for different formats
    const patterns = {
      codeBlock: /```(\w+)?\n?([\s\S]*?)```/g,
      inlineCode: /`([^`]+)`/g,
      link: /(https?:\/\/[^\s\)]+)/g,
      githubRepo: /github\.com\/([a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)/g,
      bold: /\*\*(.*?)\*\*/g,
      italic: /\*(.*?)\*/g,
      listItem: /^[•\-\*]\s(.+)$/gm,
      numberedList: /^\d+\.\s(.+)$/gm,
      heading: /^#{1,6}\s(.+)$/gm
    };

    // Find all matches for code blocks first (highest priority)
    const codeMatches = [...text.matchAll(patterns.codeBlock)];
    
    let processedText = text;
    const codeBlocks = [];

    // Extract and replace code blocks with placeholders
    codeMatches.forEach((match, index) => {
      const placeholder = `__CODE_BLOCK_${index}__`;
      const language = match[1] || 'text';
      const code = match[2].trim();
      codeBlocks.push({ language, code, placeholder });
      processedText = processedText.replace(match[0], placeholder);
    });

    // Split by code block placeholders
    const segments = processedText.split(/(__CODE_BLOCK_\d+__)/);

    return segments.map((segment, segmentIndex) => {
      // Check if this segment is a code block placeholder
      const codeBlockMatch = segment.match(/^__CODE_BLOCK_(\d+)__$/);
      if (codeBlockMatch) {
        const blockIndex = parseInt(codeBlockMatch[1]);
        const block = codeBlocks[blockIndex];
        const blockId = `code-${blockIdCounter++}`;
        
        return (
          <div key={segmentIndex} className="my-3">
            <div className="relative bg-gray-900 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700">
                <span className="text-xs text-gray-300 font-mono">
                  {block.language}
                </span>
                <button
                  onClick={() => copyToClipboard(block.code, blockId)}
                  className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded transition-colors"
                >
                  {copiedBlocks.has(blockId) ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto">
                <code className="text-sm text-gray-100 font-mono leading-relaxed">
                  {block.code}
                </code>
              </pre>
            </div>
          </div>
        );
      }

      // Process regular text with other formatting
      return (
        <span key={segmentIndex}>
          {formatTextSegment(segment)}
        </span>
      );
    });
  };

  const formatTextSegment = (text) => {
    const parts = [];
    let lastIndex = 0;

    // Process inline code first
    const inlineCodeRegex = /`([^`]+)`/g;
    let match;

    while ((match = inlineCodeRegex.exec(text)) !== null) {
      // Add text before the code
      if (match.index > lastIndex) {
        parts.push(formatLinks(text.slice(lastIndex, match.index)));
      }

      // Add the inline code
      parts.push(
        <code 
          key={`inline-${match.index}`}
          className="px-2 py-1 bg-gray-700 text-orange-300 rounded text-sm font-mono"
        >
          {match[1]}
        </code>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(formatLinks(text.slice(lastIndex)));
    }

    return parts.length > 0 ? parts : formatLinks(text);
  };

  const formatLinks = (text) => {
    if (!text) return null;

    // Clean up malformed markdown links first
    let cleanedText = text
      // Remove malformed markdown patterns like [url](url📚 text](url)
      .replace(/\[([^\]]+)\]\([^)]*📚[^)]*\)\([^)]*\)/g, '$1')
      // Remove duplicate brackets and malformed patterns
      .replace(/\]\([^)]*\]\([^)]*\)/g, '')
      // Clean up any remaining malformed markdown
      .replace(/\[([^\]]*)\]\(([^)]*)\)/g, (match, text, url) => {
        // If URL is valid, keep it clean
        if (url.match(/^https?:\/\//)) {
          return url;
        }
        return match;
      });

    // Enhanced regex for URLs, emails, and GitHub repos
    const patterns = [
      { type: 'url', regex: /(https?:\/\/[^\s\)\]]+)/g },
      { type: 'email', regex: /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g },
      { type: 'githubRepo', regex: /(github\.com\/[a-zA-Z0-9-_.]+\/[a-zA-Z0-9-_.]+)/g }
    ];

    const matches = [];

    // Find all matches
    patterns.forEach(({ type, regex }) => {
      let match;
      while ((match = regex.exec(cleanedText)) !== null) {
        // Check for overlapping matches and prefer longer/more specific ones
        const newMatch = {
          original: match[0],
          start: match.index,
          end: match.index + match[0].length,
          type: type
        };

        // Check if this overlaps with existing matches
        const overlapping = matches.find(existing => 
          (newMatch.start < existing.end && newMatch.end > existing.start)
        );

        if (!overlapping) {
          matches.push(newMatch);
        } else if (newMatch.original.length > overlapping.original.length) {
          // Replace with longer match
          const index = matches.indexOf(overlapping);
          matches[index] = newMatch;
        }
      }
    });

    if (matches.length === 0) {
      return formatTextStyles(cleanedText);
    }

    // Sort matches by position
    matches.sort((a, b) => a.start - b.start);

    const parts = [];
    let lastIndex = 0;

    matches.forEach((match, index) => {
      // Add text before the match
      if (match.start > lastIndex) {
        const textBefore = cleanedText.slice(lastIndex, match.start);
        parts.push(formatTextStyles(textBefore, `text-${index}`));
      }

      // Add the link element
      const { original, type } = match;
      const linkClass = `${
        isUser 
          ? 'text-blue-200 hover:text-blue-100' 
          : 'text-blue-400 hover:text-blue-300'
      } underline decoration-dotted hover:decoration-solid transition-all duration-200 inline-flex items-center`;

      if (type === 'email') {
        parts.push(
          <a 
            key={`email-${index}`}
            href={`mailto:${original}`}
            className={linkClass}
          >
            📧 {original}
          </a>
        );
      } else if (type === 'githubRepo') {
        const repoName = original.replace('github.com/', '');
        parts.push(
          <a 
            key={`github-${index}`}
            href={`https://${original}`}
            target="_blank" 
            rel="noopener noreferrer"
            className={linkClass}
          >
            📚 {repoName}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        );
      } else {
        parts.push(
          <a 
            key={`url-${index}`}
            href={original}
            target="_blank" 
            rel="noopener noreferrer"
            className={linkClass}
          >
            {original}
            <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        );
      }

      lastIndex = match.end;
    });

    // Add remaining text
    if (lastIndex < cleanedText.length) {
      const remainingText = cleanedText.slice(lastIndex);
      parts.push(formatTextStyles(remainingText, 'remaining'));
    }

    return parts;
  };

  const formatTextStyles = (text, key) => {
    if (!text) return null;

    // Split by line breaks to handle line-by-line processing
    const lines = text.split('\n');
    const processedLines = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        processedLines.push(<br key={`br-${key}-${i}`} />);
        continue;
      }

      // Check for headings
      if (line.match(/^###\s(.+)$/)) {
        const content = line.replace(/^###\s/, '');
        processedLines.push(
          <h3 key={`h3-${key}-${i}`} className="text-lg font-bold mt-4 mb-2 text-orange-300">
            {content}
          </h3>
        );
        continue;
      }
      
      if (line.match(/^##\s(.+)$/)) {
        const content = line.replace(/^##\s/, '');
        processedLines.push(
          <h2 key={`h2-${key}-${i}`} className="text-xl font-bold mt-4 mb-2 text-orange-300">
            {content}
          </h2>
        );
        continue;
      }
      
      if (line.match(/^#\s(.+)$/)) {
        const content = line.replace(/^#\s/, '');
        processedLines.push(
          <h1 key={`h1-${key}-${i}`} className="text-2xl font-bold mt-4 mb-2 text-orange-300">
            {content}
          </h1>
        );
        continue;
      }

      // Check for list items
      if (line.match(/^[•\-\*]\s(.+)$/)) {
        const content = line.replace(/^[•\-\*]\s/, '');
        processedLines.push(
          <li key={`li-${key}-${i}`} className="ml-4 list-disc list-inside mb-1">
            {formatInlineStyles(content)}
          </li>
        );
        continue;
      }
      
      if (line.match(/^\d+\.\s(.+)$/)) {
        const content = line.replace(/^\d+\.\s/, '');
        processedLines.push(
          <li key={`oli-${key}-${i}`} className="ml-4 list-decimal list-inside mb-1">
            {formatInlineStyles(content)}
          </li>
        );
        continue;
      }

      // Regular text with inline formatting
      processedLines.push(
        <span key={`text-${key}-${i}`}>
          {formatInlineStyles(line)}
        </span>
      );
    }

    return processedLines;
  };

  const formatInlineStyles = (text) => {
    const parts = [];
    let currentText = text;
    let partIndex = 0;

    // Process bold text (**text**)
    const boldRegex = /\*\*(.*?)\*\*/g;
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the bold
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        parts.push(processItalics(beforeText, `before-bold-${partIndex++}`));
      }

      // Add the bold text
      parts.push(
        <strong key={`bold-${partIndex++}`} className="font-bold text-orange-200">
          {match[1]}
        </strong>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      parts.push(processItalics(remainingText, `remaining-${partIndex++}`));
    }

    return parts.length > 0 ? parts : processItalics(text, 'full-text');
  };

  const processItalics = (text, keyPrefix) => {
    const parts = [];
    const italicRegex = /\*(.*?)\*/g;
    let lastIndex = 0;
    let match;
    let partIndex = 0;

    while ((match = italicRegex.exec(text)) !== null) {
      // Add text before the italic
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText) {
          parts.push(
            <span key={`${keyPrefix}-before-italic-${partIndex++}`}>
              {beforeText}
            </span>
          );
        }
      }

      // Add the italic text
      parts.push(
        <em key={`${keyPrefix}-italic-${partIndex++}`} className="italic text-gray-300">
          {match[1]}
        </em>
      );

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText) {
        parts.push(
          <span key={`${keyPrefix}-remaining-${partIndex++}`}>
            {remainingText}
          </span>
        );
      }
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="message-content leading-relaxed">
      {formatMessage(message)}
    </div>
  );
}
