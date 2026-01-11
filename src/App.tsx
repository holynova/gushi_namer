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
import { Sparkles, LogIn, UserPlus } from 'lucide-react';
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
    <div className="min-h-screen bg-matsu-bg text-matsu-text font-serif selection:bg-matsu-primary/30">
      <div className="max-w-4xl mx-auto">
        <header className={`sticky top-0 z-50 bg-matsu-bg/95 backdrop-blur-sm py-4 px-4 mb-6 transition-all duration-300 ${
          isScrolled ? 'border-b border-matsu-border' : ''
        }`}>
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-matsu-primary tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              古诗文起名
            </h1>
            
            <div className="flex items-center gap-2">
              {user ? (
                <UserMenu onViewFavorites={() => setPage('favorites')} />
              ) : (
                <>
                  <button
                    onClick={() => {
                      setAuthModalView('login');
                      setAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 text-matsu-primary hover:text-matsu-primaryHover transition-colors border border-matsu-border rounded-full hover:bg-matsu-primary/10"
                  >
                    <LogIn className="w-4 h-4" />
                    登录
                  </button>
                  <button
                    onClick={() => {
                      setAuthModalView('register');
                      setAuthModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-matsu-primary hover:bg-matsu-primaryHover text-white rounded-full transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    注册
                  </button>
                </>
              )}
            </div>
          </div>
          <p className="text-matsu-text/70 text-sm text-center">
            翻阅经典, 与一个好名字不期而遇
          </p>
        </header>

        <main className="space-y-6 px-4 pb-6">
          <section className="bg-matsu-card/50 rounded-2xl p-4 md:p-6 border border-matsu-border backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <BookSelector 
                selectedBook={selectedBook} 
                onSelect={setSelectedBook} 
                disabled={initializing}
              />
              
              <div className="flex items-end gap-4">
                <FamilyNameInput 
                  value={familyName} 
                  onChange={setFamilyName} 
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={initializing}
                  className="mb-2 px-6 py-2 bg-matsu-primary hover:bg-matsu-primaryHover text-white rounded-full font-bold text-base shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 h-[42px] w-[120px]"
                >
                  {initializing ? '加载中...' : '起名'}
                  {!initializing && <Sparkles className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </section>

          {generatedNames.length > 0 && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
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
            </section>
          )}
        </main>

        <footer className="mt-16 text-center text-matsu-text/50 text-sm space-y-2">
          <p>© {new Date().getFullYear()} 古诗文起名 | 诗词数据来源于网络</p>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com/holynova/gushi_namer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-matsu-primary hover:text-matsu-primaryHover transition-colors"
            >
              本项目完全开源
            </a>
            <span>•</span>
            <span>作者: holynova</span>
          </div>
          <div className="flex items-center justify-center gap-4">
            <a 
              href="https://github.com/holynova/gushi_namer" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-matsu-primary hover:text-matsu-primaryHover transition-colors"
            >
              github地址 https://github.com/holynova/gushi_namer
            </a>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            <span className="text-matsu-text/40">访问量:</span>
            <img 
              src="https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fholynova.github.io%2Fgushi_namer&count_bg=%238B9D5E&title_bg=%23E6D5B8&icon=&icon_color=%23E7E7E7&title=访问&edge_flat=false"
              alt="访问统计"
              className="inline-block"
            />
          </div>
          <div className="pt-2">
            <button
              onClick={() => setPage('about')}
              className="text-matsu-primary hover:text-matsu-primaryHover transition-colors underline"
            >
              关于本项目
            </button>
          </div>
        </footer>
      </div>
      
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
