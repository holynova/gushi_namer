import { useState, useEffect, useRef, useCallback } from 'react';
import { BookSelector } from './components/BookSelector';
import { FamilyNameInput } from './components/FamilyNameInput';
import { NameCard } from './components/NameCard';
import { FavoritesPage } from './components/FavoritesPage';
import { AboutPage } from './components/AboutPage';
import { Namer, type GeneratedName } from './utils/namer';
import { isFavorite, toggleFavorite } from './utils/favorites';
import { Check, Heart, Library, RefreshCw, Sparkles, Info } from 'lucide-react';

const MAX_NAME = 6;
const MAX_ATTEMPTS = 100;

function App() {
  const [page, setPage] = useState<'main' | 'favorites' | 'about'>('main');
  const [selectedBook, setSelectedBook] = useState<string>('shijing');
  const [familyName, setFamilyName] = useState<string>('苏');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const namerRef = useRef<Namer>(new Namer());

  const generateNames = useCallback(() => {
    const names: GeneratedName[] = [];
    let attempts = 0;

    while (names.length < MAX_NAME && attempts < MAX_ATTEMPTS) {
      const name = namerRef.current.genName();
      if (name) {
        names.push(name);
      }
      attempts++;
    }

    setGeneratedNames(names);
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadAndGenerate = async () => {
      setInitializing(true);
      await namerRef.current.loadBook(selectedBook);
      if (cancelled) return;
      generateNames();
      setInitializing(false);
    };

    loadAndGenerate();

    return () => {
      cancelled = true;
    };
  }, [selectedBook, generateNames]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadFavoriteStates = async () => {
      const entries = await Promise.all(
        generatedNames.map(async (name) => {
          const key = `${familyName}${name.name}`;
          return [key, await isFavorite(name.name, familyName)] as const;
        })
      );
      setFavoriteStates(Object.fromEntries(entries));
    };

    if (generatedNames.length > 0) {
      loadFavoriteStates();
    }
  }, [familyName, generatedNames]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleGenerate = () => {
    if (initializing) return;
    generateNames();
  };

  const handleFavorite = async (name: GeneratedName) => {
    const key = `${familyName}${name.name}`;
    const currentState = favoriteStates[key] || false;
    const newState = !currentState;

    setFavoriteStates({ ...favoriteStates, [key]: newState });

    try {
      const isFavorited = await toggleFavorite(name, familyName);

      if (isFavorited !== newState) {
        setFavoriteStates({ ...favoriteStates, [key]: isFavorited });
      }

      showToast(isFavorited ? '收藏成功' : '已取消收藏');
    } catch (error: any) {
      setFavoriteStates({ ...favoriteStates, [key]: currentState });
      showToast(error.message || '操作失败，请重试', 'error');
    }
  };

  useEffect(() => {
    if (page === 'about') {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }
  }, [page]);

  if (page === 'favorites') {
    return <FavoritesPage onBack={() => setPage('main')} />;
  }

  if (page === 'about') {
    return <AboutPage onBack={() => setPage('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F0E4] text-[#28231D] font-serif selection:bg-[#B85B4D]/20">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 sm:px-6 lg:px-8">
        <header
          className={`sticky top-0 z-50 -mx-3 border-b border-[#D7C7AF]/80 bg-[#F7F0E4]/95 px-3 backdrop-blur transition-all duration-300 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${
            isScrolled ? 'py-2 shadow-sm shadow-[#B59B7A]/10' : 'py-3'
          }`}
        >
          <div className="mx-auto hidden max-w-7xl items-center justify-between sm:flex">
            <div className="min-w-0 text-left">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-[#8D5A4F]">
                Gushi Namer
              </p>
              <h1 className="truncate font-serif text-3xl font-bold text-[#2F765C]">
                古诗文起名
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerate}
                disabled={initializing}
                className="flex h-10 items-center justify-center gap-2 rounded-full bg-[#B85B4D] px-4 font-sans text-sm font-semibold text-white shadow-sm shadow-[#B85B4D]/20 transition hover:bg-[#A94D42] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
                换一组
              </button>
              <button
                onClick={() => setPage('favorites')}
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7C7AF] bg-white/60 px-4 font-sans text-sm text-[#2F765C] transition-colors hover:border-[#2F765C] hover:bg-white"
              >
                <Heart className="h-4 w-4" />
                收藏
              </button>
              <button
                onClick={() => setPage('about')}
                className="flex h-10 items-center justify-center gap-2 rounded-full border border-[#D7C7AF] bg-white/60 px-4 font-sans text-sm text-[#2F765C] transition-colors hover:border-[#2F765C] hover:bg-white"
              >
                <Info className="h-4 w-4" />
                关于
              </button>
            </div>
          </div>

          <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 sm:hidden">
            <div className="min-w-0">
              <p
                className={`font-sans text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8D5A4F] transition-all ${
                  isScrolled ? 'h-0 overflow-hidden opacity-0' : 'h-4 opacity-100'
                }`}
              >
                Gushi Namer
              </p>
              <h1
                className={`truncate font-serif font-bold text-[#2F765C] transition-all ${
                  isScrolled ? 'text-lg leading-6' : 'text-2xl leading-8'
                }`}
              >
                古诗文起名
              </h1>
            </div>
            <nav className="grid shrink-0 grid-cols-3 gap-1 rounded-full border border-[#D7C7AF] bg-[#FFFDF8]/85 p-1 shadow-sm shadow-[#B59B7A]/10">
              <button
                onClick={handleGenerate}
                disabled={initializing}
                className="flex h-9 min-w-10 items-center justify-center rounded-full px-2 text-[#B85B4D] transition hover:bg-[#F7F0E4] disabled:opacity-50"
                aria-label="换一组"
              >
                <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setPage('favorites')}
                className="flex h-9 min-w-10 items-center justify-center rounded-full px-2 text-[#2F765C] transition hover:bg-[#F7F0E4]"
                aria-label="收藏"
              >
                <Heart className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage('about')}
                className="flex h-9 min-w-10 items-center justify-center rounded-full px-2 text-[#2F765C] transition hover:bg-[#F7F0E4]"
                aria-label="关于"
              >
                <Info className="h-4 w-4" />
              </button>
            </nav>
          </div>
        </header>

        <main className="grid flex-1 gap-4 py-4 sm:gap-6 sm:py-6 lg:grid-cols-[360px_minmax(0,1fr)]">
          <aside className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 sm:p-5 lg:sticky lg:top-24 lg:h-fit">
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <div>
                <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                  Source
                </p>
                <h2 className="font-serif text-[1.7rem] font-bold leading-tight sm:text-2xl">
                  从经典中取字
                </h2>
              </div>
              <Library className="h-6 w-6 text-[#2F765C]" />
            </div>

            <label className="mb-2 block font-sans text-sm font-medium text-[#5D5145]">
              选择典籍
            </label>
            <div className="mb-5">
              <BookSelector
                selectedBook={selectedBook}
                onSelect={setSelectedBook}
                disabled={initializing}
              />
            </div>

            <label className="mb-2 block font-sans text-sm font-medium text-[#5D5145]">
              输入姓氏
            </label>
            <div className="mb-5 grid w-full grid-cols-[96px_minmax(0,1fr)] items-end gap-2 sm:gap-3">
              <FamilyNameInput
                value={familyName}
                onChange={setFamilyName}
              />

              <button
                onClick={handleGenerate}
                disabled={initializing}
                className="mb-2 flex h-[42px] w-full items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-[#B85B4D] px-3 font-sans font-semibold text-white shadow-sm shadow-[#B85B4D]/20 transition hover:bg-[#A94D42] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {initializing ? '加载中...' : '换一组'}
                <RefreshCw className={`h-4 w-4 ${initializing ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="hidden rounded-lg bg-[#F7F0E4] p-4 lg:block">
              <div className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold text-[#2F765C]">
                <Check className="h-4 w-4" />
                今日取名偏好
              </div>
              <p className="font-sans text-sm leading-6 text-[#5D5145]">
                清朗、好读、有出处；先看含义，再看音韵。
              </p>
            </div>
          </aside>

          <section className="space-y-4 sm:space-y-5">
            <div className="hidden rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 sm:p-5 lg:block">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                    Results
                  </p>
                  <h2 className="font-serif text-[1.8rem] font-bold leading-tight sm:text-3xl">
                    {initializing ? '正在翻阅典籍' : `${generatedNames.length} 个候选名字`}
                  </h2>
                  <p className="mt-2 font-sans text-sm text-[#6D6257]">
                    翻阅经典，与一个好名字不期而遇。每个名字保留出处和一句原文。
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E8F1EA] px-3 py-2 font-sans text-sm text-[#2F765C]">
                  <Sparkles className="h-4 w-4" />
                  已避开常见忌字
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {generatedNames.map((name, index) => {
                const key = `${familyName}${name.name}`;
                return (
                  <NameCard
                    key={`${name.name}-${index}`}
                    data={name}
                    familyName={familyName}
                    onFavorite={() => handleFavorite(name)}
                    isFavorited={favoriteStates[key] || false}
                  />
                );
              })}
              {initializing && generatedNames.length === 0 && (
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[320px] animate-pulse rounded-lg border border-[#D7C7AF] bg-[#FFFDF8]/70"
                  />
                ))
              )}
            </div>

            <div className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 sm:p-5 lg:hidden">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                    Results
                  </p>
                  <h2 className="font-serif text-[1.8rem] font-bold leading-tight">
                    {initializing ? '正在翻阅典籍' : `${generatedNames.length} 个候选名字`}
                  </h2>
                  <p className="mt-2 font-sans text-sm text-[#6D6257]">
                    每个名字保留出处和一句原文，适合慢慢比较。
                  </p>
                </div>
                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-[#E8F1EA] px-3 py-2 font-sans text-sm text-[#2F765C]">
                  <Sparkles className="h-4 w-4" />
                  已避开常见忌字
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 ring-1 ring-[#D7C7AF] lg:hidden">
              <div className="mb-2 flex items-center gap-2 font-sans text-sm font-semibold text-[#2F765C]">
                <Check className="h-4 w-4" />
                今日取名偏好
              </div>
              <p className="font-sans text-sm leading-6 text-[#5D5145]">
                清朗、好读、有出处；先看含义，再看音韵。
              </p>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#D7C7AF]/70 pb-24 pt-6 text-center font-sans text-sm text-[#8D7B68] lg:pb-8">
          <p>© {new Date().getFullYear()} 古诗文起名</p>
          <p className="mt-2 text-xs text-[#8D7B68]/75">
            访客 <span id="busuanzi_value_site_uv">--</span> · 浏览 <span id="busuanzi_value_site_pv">--</span>
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a
              href="https://github.com/holynova/gushi_namer"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2F765C] transition-colors hover:text-[#275F4B]"
            >
              GitHub
            </a>
            <span>·</span>
            <button
              onClick={() => setPage('about')}
              className="text-[#2F765C] transition-colors hover:text-[#275F4B]"
            >
              关于
            </button>
            <span>·</span>
            <span>作者 holynova</span>
          </div>
          <p className="mt-2 text-xs text-[#8D7B68]/75">诗词数据来源于网络</p>
        </footer>
      </div>

      <button
        onClick={handleGenerate}
        disabled={initializing}
        className="fixed bottom-5 right-5 z-40 hidden h-14 w-14 items-center justify-center rounded-full bg-[#B85B4D] text-white shadow-lg shadow-[#B85B4D]/30 transition hover:bg-[#A94D42] disabled:cursor-not-allowed disabled:opacity-50 sm:flex sm:bottom-6 sm:right-6"
        aria-label={initializing ? '加载中' : '重新生成新名字'}
        title={initializing ? '加载中' : '重新生成'}
      >
        <RefreshCw className={`h-6 w-6 ${initializing ? 'animate-spin' : ''}`} />
      </button>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in slide-in-from-bottom-2 fade-in">
          <div
            className={`rounded-full border px-6 py-3 font-sans shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-800'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            {toast.message}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
