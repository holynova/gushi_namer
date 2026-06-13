import React from 'react';

interface FamilyNameInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const FamilyNameInput: React.FC<FamilyNameInputProps> = ({
  value,
  onChange,
}) => {
  return (
    <div className="flex flex-col items-center gap-2 my-2">
      {/* <label htmlFor="familyName" className="text-slate-400 text-sm">
        输入姓氏
      </label> */}
      <input
        id="familyName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-[42px] w-full rounded-lg border border-[#D7C7AF] bg-[#F7F0E4] px-3 py-2 text-center font-serif text-xl text-[#28231D] placeholder-[#8D7B68] outline-none transition-all focus:border-[#2F765C] focus:ring-4 focus:ring-[#2F765C]/15"
        placeholder="输入姓氏"
        maxLength={2}
      />
    </div>
  );
};
