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
      <label htmlFor="familyName" className="text-slate-400 text-sm">
        输入姓氏
      </label>
      <input
        id="familyName"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-center text-xl focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all w-32"
        placeholder="李"
        maxLength={2}
      />
    </div>
  );
};
