import React from 'react';
import type { GeneratedName } from '../utils/namer';

interface NameCardProps {
  data: GeneratedName;
  familyName: string;
}

export const NameCard: React.FC<NameCardProps> = ({ data, familyName }) => {
  const { name, sentence, book, title, author, dynasty } = data;

  // Highlight the characters in the sentence
  const highlightSentence = () => {
    const chars = name.split('');
    // Simple replacement might fail if characters are repeated, but for display it's usually fine.
    // A more robust way is to match indices, but the generator logic doesn't return indices.
    // We'll use a simple split/join approach or regex for display.
    
    // Actually, let's just wrap the characters in a span.
    // Since we don't know exactly which instance of the character was picked if repeated,
    // we will highlight all instances or just the first ones found?
    // The original logic picked random indices.
    // For visual purposes, highlighting all occurrences of the name characters is acceptable.
    
    return (
      <span>
        {sentence.split('').map((char, i) => {
          const isNameChar = chars.includes(char);
          return (
            <span
              key={i}
              className={isNameChar ? 'text-matsu-primary font-bold' : ''}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="bg-matsu-card rounded-xl p-6 shadow-lg border border-matsu-border hover:border-matsu-primary transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="text-center mb-4">
        <h3 className="text-4xl font-serif font-bold text-matsu-text mb-2 group-hover:text-matsu-primary transition-colors">
          {familyName}{name}
        </h3>
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-matsu-text text-lg font-serif leading-relaxed">
          「{highlightSentence()}」
        </p>
        
        <div className="text-xs text-matsu-text/60 border-t border-matsu-border pt-3 mt-2">
          <p className="mb-1">
            <span className="text-matsu-primary/80">[{dynasty}]</span> {author}
          </p>
          <p>
            《{title}》 • {book}
          </p>
        </div>
      </div>
    </div>
  );
};
