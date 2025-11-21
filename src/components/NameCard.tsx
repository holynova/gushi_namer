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
              className={isNameChar ? 'text-emerald-400 font-bold' : ''}
            >
              {char}
            </span>
          );
        })}
      </span>
    );
  };

  return (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700 hover:border-emerald-500/50 transition-all duration-300 flex flex-col justify-between h-full group">
      <div className="text-center mb-4">
        <h3 className="text-4xl font-serif font-bold text-slate-100 mb-2 group-hover:text-emerald-400 transition-colors">
          {familyName}{name}
        </h3>
      </div>
      
      <div className="text-center space-y-3">
        <p className="text-slate-300 text-lg font-serif leading-relaxed">
          「{highlightSentence()}」
        </p>
        
        <div className="text-xs text-slate-500 border-t border-slate-700 pt-3 mt-2">
          <p className="mb-1">
            <span className="text-emerald-600/80">[{dynasty}]</span> {author}
          </p>
          <p>
            《{title}》 • {book}
          </p>
        </div>
      </div>
    </div>
  );
};
