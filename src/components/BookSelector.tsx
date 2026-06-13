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
    <div className="grid w-full grid-cols-3 gap-2">
      {books.map((book) => (
        <label
          key={book.id}
          className={clsx(
            'cursor-pointer rounded-lg border px-2 py-2 text-center font-sans text-sm whitespace-nowrap transition-all duration-200 sm:px-3',
            selectedBook === book.id
              ? 'border-[#2F765C] bg-[#E8F1EA] text-[#2F765C]'
              : 'border-[#D7C7AF] bg-white text-[#5D5145] hover:border-[#2F765C]/60',
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
