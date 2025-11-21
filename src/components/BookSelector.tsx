import React from 'react';
import clsx from 'clsx';

interface BookSelectorProps {
  selectedBook: string;
  onSelect: (book: string) => void;
  disabled?: boolean;
}

const books = [
  { id: 'shijing', name: '诗经' },
  { id: 'chuci', name: '楚辞' },
  { id: 'tangshi', name: '唐诗' },
  { id: 'songci', name: '宋词' },
  { id: 'yuefu', name: '乐府诗集' },
  { id: 'gushi', name: '古诗三百首' },
  { id: 'cifu', name: '著名辞赋' },
];

export const BookSelector: React.FC<BookSelectorProps> = ({
  selectedBook,
  onSelect,
  disabled,
}) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center my-2">
      {books.map((book) => (
        <label
          key={book.id}
          className={clsx(
            'cursor-pointer px-3 py-1.5 rounded-full border text-sm transition-all duration-200',
            selectedBook === book.id
              ? 'bg-matsu-primary border-matsu-primary text-white shadow-md'
              : 'bg-transparent border-matsu-border text-matsu-text hover:bg-matsu-primary/10 hover:border-matsu-primary',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <input
            type="radio"
            name="book"
            value={book.id}
            checked={selectedBook === book.id}
            onChange={(e) => onSelect(e.target.value)}
            className="hidden"
            disabled={disabled}
          />
          <span>{book.name}</span>
        </label>
      ))}
    </div>
  );
};
