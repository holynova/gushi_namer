import React, { useState, useEffect } from 'react';
import { ArrowLeft, BookOpen, HelpCircle, Info } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  const [isScrolled, setIsScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F0E4] text-[#28231D] font-serif">
      <div className="mx-auto w-full max-w-7xl px-3 py-3 sm:px-6 lg:px-8">
        <header className={`sticky top-0 z-50 -mx-3 border-b border-[#D7C7AF]/80 bg-[#F7F0E4]/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all duration-300 ${
          isScrolled ? 'shadow-sm shadow-[#B59B7A]/10' : ''
        }`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-full border border-[#D7C7AF] bg-white/60 px-3 py-2 font-sans text-sm text-[#2F765C] transition hover:border-[#2F765C]"
            >
              <ArrowLeft className="w-4 h-4" />
              返回起名
            </button>
            <div className="text-right">
              <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                About
              </p>
              <h1 className="font-serif text-2xl font-bold text-[#2F765C] sm:text-3xl">关于本项目</h1>
            </div>
          </div>
        </header>

        <main className="grid gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* 作者的话 */}
          <section className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-6 shadow-sm shadow-[#B59B7A]/10 md:p-8">
            <h2 className="mb-6 flex items-center gap-3 font-serif text-3xl font-bold">
              <Info className="w-6 h-6 text-[#2F765C]" />
              作者的话
            </h2>
            <div className="space-y-5 font-serif text-lg leading-9 text-[#3C352E]">
              <p>
                我是作者 holy_nova，这个5年前的项目，最近获得了颇多关注，感谢大家的 star。
              </p>
              <p>
                这个项目出发点，是基于这样一个简单的理念：<strong className="text-[#2F765C]">词库好，名字就好，即使是随机取的</strong>。
              </p>
              <blockquote className="rounded-lg bg-[#F7F0E4] p-5 text-[#2F765C]">
                <p className="italic">我叫周星驰，取自滕王阁序"雄州雾列，俊采星驰"。</p>
              </blockquote>
              <p>这是我这个项目期望达到的效果。</p>
              <p>
                常说"男诗经，女楚辞"，我爬取了中华传统经典的唐诗宋词等，作为孕育好名字的优秀文本。
              </p>
              <p>
                这个项目没有任何人工智能，没有判断名字价值的目标函数（5年前做这个项目时候，人工智能还不像现在这么火）。
              </p>
              <p>
                既然是随机，就有可能带来一些智障、搞笑的名字，反过来惊艳、惊鸿一瞥的名字也在随机中孕育。
              </p>
              <p className="font-bold text-[#2F765C]">
                让这个程序帮你翻阅经典，与一个好名字不期而遇。
              </p>
              <p className="font-sans text-sm text-[#8D7B68] text-right mt-4">2021年09月04日</p>
            </div>
          </section>

          <aside className="space-y-4">
            <section className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-5">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold">
                <HelpCircle className="w-5 h-5 text-[#2F765C]" />
                常见问题
              </h2>
              <div className="space-y-4 font-sans text-sm leading-6 text-[#5D5145]">
                {[
                  ['为什么会有很多搞笑的名字？', '因为是随机生成的，自由组合。'],
                  ['为什么会有脏字？', '已经有简单过滤，但古诗文语料很大，仍需继续扩展敏感词。'],
                  ['为什么只有2个字的名字？', '两个字更容易保留诗文韵味，也更适合随机组合。'],
                  ['能否增加生成数量？', '可以多点几次生成，但项目希望用户慢慢读、慢慢挑。'],
                ].map(([question, answer]) => (
                  <div key={question} className="border-b border-[#E2D5C2] pb-4 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-[#2F765C]">{question}</h3>
                    <p className="mt-1">{answer}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-5">
              <h2 className="mb-4 flex items-center gap-2 font-serif text-xl font-bold">
                <BookOpen className="w-5 h-5 text-[#B85B4D]" />
                支持的经典
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {['诗经', '楚辞', '唐诗', '宋词', '乐府诗集', '古诗三百首', '著名辞赋'].map((book) => (
                  <div
                    key={book}
                    className="rounded-lg border border-[#D7C7AF] bg-[#F7F0E4] p-3 text-center font-sans text-sm text-[#5D5145]"
                  >
                    {book}
                  </div>
                ))}
              </div>
            </section>
          </aside>
        </main>
      </div>
    </div>
  );
};
