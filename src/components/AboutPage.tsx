import React from 'react';
import { ArrowLeft, HelpCircle, Heart } from 'lucide-react';

interface AboutPageProps {
  onBack: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-matsu-bg text-matsu-text py-6 px-4 font-serif">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-matsu-primary hover:text-matsu-primaryHover transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回起名
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-matsu-primary mb-2 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6" />
            关于本项目
          </h1>
        </header>

        <main className="space-y-8">
          {/* 作者的话 */}
          <section className="bg-matsu-card/50 rounded-2xl p-6 md:p-8 border border-matsu-border">
            <h2 className="text-2xl font-bold text-matsu-primary mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5 fill-matsu-primary" />
              作者的话
            </h2>
            <div className="space-y-4 text-matsu-text/90 leading-relaxed">
              <p>
                我是作者 holy_nova，这个5年前的项目，最近获得了颇多关注，感谢大家的 star。
              </p>
              <p>
                这个项目出发点，是基于这样一个简单的理念：<strong className="text-matsu-primary">词库好，名字就好，即使是随机取的</strong>。
              </p>
              <blockquote className="border-l-4 border-matsu-primary pl-4 py-2 bg-matsu-bg/50 rounded-r-lg my-4">
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
              <p className="font-bold text-matsu-primary">
                让这个程序帮你翻阅经典，与一个好名字不期而遇。
              </p>
              <p className="text-sm text-matsu-text/60 text-right mt-4">2021年09月04日</p>
            </div>
          </section>

          {/* Q&A */}
          <section className="bg-matsu-card/50 rounded-2xl p-6 md:p-8 border border-matsu-border">
            <h2 className="text-2xl font-bold text-matsu-primary mb-6 flex items-center gap-2">
              <HelpCircle className="w-5 h-5" />
              常见问题
            </h2>
            <div className="space-y-6">
              <div className="border-b border-matsu-border pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-matsu-primary mb-2">
                  1. 为什么会有很多搞笑的名字？
                </h3>
                <p className="text-matsu-text/80 leading-relaxed">
                  因为是随机生成的，自由组合。
                </p>
              </div>

              <div className="border-b border-matsu-border pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-matsu-primary mb-2">
                  2. 为什么会有脏字？
                </h3>
                <p className="text-matsu-text/80 leading-relaxed">
                  我已经加了一些脏字的简单过滤，但试验下来，发现古诗文里面脏字实在太多，人工是过滤不完的。有兴趣的可以在源码里面搜索"狗"，找到敏感词列表，自己扩展。
                </p>
              </div>

              <div className="border-b border-matsu-border pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-matsu-primary mb-2">
                  3. 为什么只有2个字的名字，能否更改字数？
                </h3>
                <p className="text-matsu-text/80 leading-relaxed">
                  这是一个简单的参数问题，改起来很简单。我这里采取了2个字名字，因为1个字的话，跟诗文没有什么关系，这个字可以取自任何地方。"三分诗，七分读"，3个字的话，人们很难读出韵味来。
                </p>
              </div>

              <div className="border-b border-matsu-border pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-matsu-primary mb-2">
                  4. 能否增加生成名字的数量？
                </h3>
                <p className="text-matsu-text/80 leading-relaxed mb-2">
                  又是一个简单的参数问题。我限制了数量，希望你能放慢脚步，仔细的读生成出来的每个名字，好名字是琢磨出来的。如果一下子生成100个，其实很难有耐心仔细的读他们。
                </p>
                <p className="text-matsu-text/80 leading-relaxed">
                  当然，非要增加数量的话，你可以多点几次生成，就可以无限刷。小技巧：电脑上按回车就能再出6个名字。
                </p>
              </div>

              <div className="border-b border-matsu-border pb-6 last:border-0 last:pb-0">
                <h3 className="text-lg font-bold text-matsu-primary mb-2">
                  5. 词库哪里来的？
                </h3>
                <p className="text-matsu-text/80 leading-relaxed">
                  当年我用 scrapy 爬的古诗文网，做成了 json。
                </p>
              </div>
            </div>
          </section>

          {/* 支持的经典 */}
          <section className="bg-matsu-card/50 rounded-2xl p-6 md:p-8 border border-matsu-border">
            <h2 className="text-2xl font-bold text-matsu-primary mb-4">
              支持的经典
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['诗经', '楚辞', '唐诗', '宋词', '乐府诗集', '古诗三百首', '著名辞赋'].map((book) => (
                <div
                  key={book}
                  className="bg-matsu-bg/50 rounded-lg p-3 text-center border border-matsu-border hover:border-matsu-primary transition-colors"
                >
                  <span className="text-matsu-text font-medium">{book}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};
