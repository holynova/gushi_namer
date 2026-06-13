import { useState, useEffect, useRef } from 'react';
import { BookSelector } from './components/BookSelector';
import { FamilyNameInput } from './components/FamilyNameInput';
import { NameCard } from './components/NameCard';
import { FavoritesPage } from './components/FavoritesPage';
import { AboutPage } from './components/AboutPage';
import { AuthModal } from './components/Auth/AuthModal';
import { UserMenu } from './components/Auth/UserMenu';
import { Namer, type GeneratedName } from './utils/namer';
import { toggleFavorite } from './utils/favorites';
import { useAuth } from './contexts/AuthContext';
import { BookOpen, Check, Library, LogIn, RefreshCw, Sparkles, UserPlus } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const { user } = useAuth();
  const [page, setPage] = useState<'main' | 'favorites' | 'about'>('main');
  const [selectedBook, setSelectedBook] = useState<string>('shijing');
  const [familyName, setFamilyName] = useState<string>('苏');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [isFirstGeneration, setIsFirstGeneration] = useState<boolean>(true);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalView, setAuthModalView] = useState<'login' | 'register'>('login');
  
  const namerRef = useRef<Namer>(new Namer());

  useEffect(() => {
    const loadInitialBook = async () => {
      setInitializing(true);
      await namerRef.current.loadBook(selectedBook);
      setInitializing(false);
    };
    loadInitialBook();
  }, [selectedBook]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleGenerate = () => {
    if (initializing) return;
    const MAX_NAME = 6;
    const MAX_ATTEMPTS = 100;
    
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
    
    // Trigger confetti on first generation
    if (isFirstGeneration) {
      setIsFirstGeneration(false);
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#8B9D5E', '#E6D5B8', '#F0E6D2', '#8B7355']
        });
      }, 300);
    }
  };

  const [favoriteStates, setFavoriteStates] = useState<Record<string, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show toast message
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFavorite = async (name: GeneratedName) => {
    if (!user) {
      showToast('请先登录以使用收藏功能', 'error');
      setAuthModalOpen(true);
      return;
    }

    const key = `${familyName}${name.name}`;
    const currentState = favoriteStates[key] || false;
    const newState = !currentState;
    
    // 🚀 乐观更新：立即更新 UI
    setFavoriteStates({ ...favoriteStates, [key]: newState });
    
    try {
      // 后台异步更新数据库
      const isFavorited = await toggleFavorite(name, familyName);
      
      // 如果后台返回的状态与预期不符，更新为正确状态
      if (isFavorited !== newState) {
        setFavoriteStates({ ...favoriteStates, [key]: isFavorited });
      }
      
      showToast(isFavorited ? '收藏成功' : '已取消收藏');
    } catch (error: any) {
      // ❌ 失败时回滚 UI 状态
      setFavoriteStates({ ...favoriteStates, [key]: currentState });
      showToast(error.message || '操作失败，请重试', 'error');
    }
  };

  const handleLoginRequired = () => {
    showToast('请先登录以使用收藏功能', 'error');
    setAuthModalOpen(true);
  };


  if (page === 'favorites') {
    return <FavoritesPage onBack={() => setPage('main')} />;
  }

  if (page === 'about') {
    return <AboutPage onBack={() => setPage('main')} />;
  }

  return (
    <div className="min-h-screen bg-[#F7F0E4] text-[#28231D] font-serif selection:bg-[#B85B4D]/20">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-3 py-3 sm:px-6 lg:px-8">
        <header className={`sticky top-0 z-50 -mx-3 border-b border-[#D7C7AF]/80 bg-[#F7F0E4]/95 px-3 py-3 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 transition-all duration-300 ${
          isScrolled ? 'border-b border-matsu-border' : ''
        }`}>
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 sm:flex sm:items-center sm:justify-between">
            <div className="min-w-0 text-center sm:text-left">
              <p className="font-sans text-xs font-medium uppercase tracking-[0.22em] text-[#8D5A4F]">
                Gushi Namer
              </p>
              <h1 className="truncate font-serif text-2xl font-bold text-[#2F765C] sm:text-3xl">
                古诗文起名
              </h1>
            </div>
            
            <div className="mx-auto grid w-full max-w-[280px] grid-cols-2 items-center gap-2 sm:mx-0 sm:w-auto sm:max-w-none sm:flex">
              {user ? (
                <UserMenu onViewFavorites={() => setPage('favorites')} />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalView('login');
                      setAuthModalOpen(true);
                    }}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-full border border-[#D7C7AF] bg-white/60 px-3 font-sans text-sm text-[#2F765C] transition-colors hover:border-[#2F765C] hover:bg-white md:gap-2 md:px-4"
                  >
                    <LogIn className="w-4 h-4" />
                    登录
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalView('register');
                      setAuthModalOpen(true);
                    }}
                    className="flex h-10 items-center justify-center gap-1.5 rounded-full bg-[#2F765C] px-3 font-sans text-sm text-white shadow-sm shadow-[#2F765C]/15 transition-colors hover:bg-[#275F4B] md:gap-2 md:px-4"
                  >
                    <UserPlus className="w-4 h-4" />
                    注册
                  </button>
                </>
              )}
            </div>
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
                  {!initializing && <RefreshCw className="w-4 h-4" />}
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
                    {generatedNames.length > 0 ? `${generatedNames.length} 个候选名字` : '准备开始取名'}
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

            {generatedNames.length > 0 ? (
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
                    onLoginRequired={handleLoginRequired}
                  />
                );
              })}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#D7C7AF] bg-[#FFFDF8]/70 p-8 text-center">
                <BookOpen className="mx-auto mb-4 h-10 w-10 text-[#2F765C]" />
                <p className="font-serif text-2xl font-bold text-[#28231D]">先选典籍，再生成名字</p>
                <p className="mt-2 font-sans text-sm text-[#6D6257]">
                  建议从诗经或楚辞开始，慢慢比较出处、音韵和气质。
                </p>
              </div>
            )}

            <div className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 sm:p-5 lg:hidden">
              <div className="flex flex-col gap-3">
                <div>
                  <p className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-[#8D5A4F]">
                    Results
                  </p>
                  <h2 className="font-serif text-[1.8rem] font-bold leading-tight">
                    {generatedNames.length > 0 ? `${generatedNames.length} 个候选名字` : '准备开始取名'}
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
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
            <a 
              href="https://github.com/holynova/gushi_namer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[#2F765C] transition-colors hover:text-[#275F4B]"
            >
              GitHub
            </a>
            <span>•</span>
            <button
              onClick={() => setPage('about')}
              className="text-[#2F765C] transition-colors hover:text-[#275F4B]"
            >
              关于
            </button>
            <span>•</span>
            <span>作者 holynova</span>
          </div>
          <p className="mt-2 text-xs text-[#8D7B68]/75">诗词数据来源于网络</p>
        </footer>
      </div>

      <button
        onClick={handleGenerate}
        disabled={initializing}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#B85B4D] text-white shadow-lg shadow-[#B85B4D]/30 transition hover:bg-[#A94D42] disabled:cursor-not-allowed disabled:opacity-50 sm:bottom-6 sm:right-6"
        aria-label={initializing ? '加载中' : '重新生成新名字'}
        title={initializing ? '加载中' : '重新生成'}
      >
        <RefreshCw className={`h-6 w-6 ${initializing ? 'animate-spin' : ''}`} />
      </button>
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-bottom-2 fade-in">
          <div className={`px-6 py-3 rounded-full shadow-lg border ${
            toast.type === 'success' 
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {toast.message}
          </div>
        </div>
      )}
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialView={authModalView}
      />
    </div>
  );
}

export default App;
