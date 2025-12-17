import React from 'react';
import { BookOpen, PlayCircle } from 'lucide-react';

const Learning: React.FC = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto pb-24 h-full overflow-y-auto">
      <header className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-emerald-900">中医讲堂</h1>
        <p className="text-stone-500 text-sm">传承经典，科学养生</p>
      </header>

      <div className="flex flex-col items-center justify-center py-20 text-stone-400">
        <BookOpen size={64} className="mb-4 text-stone-300" />
        <h3 className="text-lg font-bold mb-2">课程内容建设中...</h3>
        <p className="text-sm max-w-xs text-center">
          我们将很快上线中医基础理论、穴位按摩教程及食疗养生课程，敬请期待。
        </p>
      </div>
    </div>
  );
};

export default Learning;
