import React from 'react';
import { Loader2 } from 'lucide-react';

export const Loading: React.FC = () => {
  return (
    <div className="flex justify-center items-center p-8">
      <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    </div>
  );
};
