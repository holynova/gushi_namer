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
    <div className="flex flex-wrap gap-4 justify-center my-6">
      {books.map((book) => (
        <label
          key={book.id}
          className={clsx(
            'cursor-pointer px-4 py-2 rounded-full border transition-all duration-200',
            selectedBook === book.id
              ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-900/50'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:border-slate-600',
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
