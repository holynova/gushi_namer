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
    <div className={`rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-5 shadow-sm shadow-[#B59B7A]/10 transition hover:-translate-y-0.5 hover:border-[#2F765C]/50 hover:shadow-md flex flex-col justify-between h-full group relative ${
      isAnimating ? 'animate-pulse-scale' : ''
    }`}>
      {onFavorite && (
        <button
          onClick={handleFavoriteClick}
          disabled={loading}
          className={`absolute top-4 right-4 rounded-full border p-2 transition disabled:opacity-50 ${
            isFavorited
              ? 'border-[#B85B4D] bg-[#B85B4D] text-white'
              : 'border-[#D7C7AF] text-[#8D7B68] hover:border-[#B85B4D] hover:text-[#B85B4D]'
          }`}
          aria-label={user ? "收藏" : "登录后收藏"}
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${isFavorited ? 'fill-current scale-110' : ''}`}
          />
        </button>
      )}
      <div className="mb-4 pr-12">
        <h3 className="text-[2.5rem] leading-tight md:text-4xl font-serif font-bold text-[#28231D] mb-2 transition-colors">
          {familyName}{name}
        </h3>
        <p className="font-sans text-sm text-[#6D6257]">
          {dynasty ? `${dynasty} · ` : ''}{author || '佚名'} · {title}
        </p>
      </div>
      
      <div className="space-y-4">
        <blockquote className="border-l-2 border-[#2F765C] pl-4 font-serif text-base md:text-lg leading-8 text-[#3C352E]">
          {highlightSentence()}
        </blockquote>
        
        <div className="flex flex-wrap gap-2 border-t border-[#E2D5C2] pt-4">
          <span className="rounded-full bg-[#F7F0E4] px-3 py-1 font-sans text-xs font-medium text-[#5D5145]">
            《{title}》
          </span>
          <span className="rounded-full bg-[#F7F0E4] px-3 py-1 font-sans text-xs font-medium text-[#5D5145]">
            {book}
          </span>
        </div>
      </div>
    </div>
  );
};
