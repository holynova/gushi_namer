import React, { useState } from 'react';
import type { GeneratedName } from '../utils/namer';
import { Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface NameCardProps {
  data: GeneratedName;
  familyName: string;
  onFavorite?: () => Promise<void>;
  isFavorited?: boolean;
  onLoginRequired?: () => void;
}

export const NameCard: React.FC<NameCardProps> = ({ 
  data, 
  familyName, 
  onFavorite, 
  isFavorited = false,
  onLoginRequired 
}) => {
  const { user } = useAuth();
  const { name, sentence, book, title, author, dynasty } = data;
  const [isAnimating, setIsAnimating] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleFavoriteClick = async () => {
    // Check if user is logged in
    if (!user) {
      onLoginRequired?.();
      return;
    }

    if (onFavorite) {
      setLoading(true);
      try {
        await onFavorite();
        // Trigger animation
        setIsAnimating(true);
        setTimeout(() => setIsAnimating(false), 600);
      } catch (error) {
        console.error('收藏操作失败:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Highlight the characters in the sentence
  const highlightSentence = () => {
    const chars = name.split('');
    
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
    <div className={`bg-matsu-card rounded-xl p-6 shadow-lg border border-matsu-border hover:border-matsu-primary transition-all duration-300 flex flex-col justify-between h-full group relative ${
      isAnimating ? 'animate-pulse-scale' : ''
    }`}>
      {onFavorite && (
        <button
          onClick={handleFavoriteClick}
          disabled={loading}
          className="absolute top-3 right-3 p-2 rounded-full hover:bg-matsu-primary/10 transition-colors disabled:opacity-50"
          aria-label={user ? "收藏" : "登录后收藏"}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorited
                ? 'fill-matsu-primary text-matsu-primary scale-110'
                : 'text-matsu-border hover:text-matsu-primary'
            }`}
          />
        </button>
      )}
      <div className="text-center mb-4">
        <h3 className="text-4xl font-serif font-bold text-matsu-text mb-2 transition-colors">
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
