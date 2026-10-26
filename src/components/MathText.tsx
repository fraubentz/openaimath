import React from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
}

export const MathText: React.FC<MathTextProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Process text with math markup: $`math`$ or $math$ or <i>...</i>
  // Replace $`...`$ with $...$
  const normalized = text
    .replace(/\$`([^`]+)`\$/g, '$$$1$$')
    .replace(/&emsp;/g, ' ')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&amp;/g, '&');

  // Split by $...$
  const parts = normalized.split(/(\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          try {
            const html = katex.renderToString(math, {
              throwOnError: false,
              displayMode: false,
            });
            return (
              <span
                key={index}
                className="inline-block px-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            );
          } catch {
            return (
              <code key={index} className="font-mono text-indigo-300 text-sm px-1 py-0.5 bg-indigo-950/40 rounded">
                {math}
              </code>
            );
          }
        }

        // Render standard text, safely parsing simple HTML tags like <i>, <sub>, <sup>
        if (part.includes('<i>') || part.includes('<sub>') || part.includes('<sup>')) {
          return (
            <span
              key={index}
              dangerouslySetInnerHTML={{ __html: part }}
            />
          );
        }

        return <React.Fragment key={index}>{part}</React.Fragment>;
      })}
    </span>
  );
};
