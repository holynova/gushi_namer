import { useState, useEffect, useRef } from 'react';
import { BookSelector } from './components/BookSelector';
import { FamilyNameInput } from './components/FamilyNameInput';
import { NameCard } from './components/NameCard';
import { FavoritesPage } from './components/FavoritesPage';
import { Namer, type GeneratedName } from './utils/namer';
import { toggleFavorite, isFavorite } from './utils/favorites';
import { Sparkles, Heart } from 'lucide-react';
import confetti from 'canvas-confetti';

function App() {
  const [page, setPage] = useState<'main' | 'favorites'>('main');
  const [selectedBook, setSelectedBook] = useState<string>('shijing');
  const [familyName, setFamilyName] = useState<string>('苏');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [isFirstGeneration, setIsFirstGeneration] = useState<boolean>(true);
  
  const namerRef = useRef<Namer>(new Namer());

  useEffect(() => {
    const loadInitialBook = async () => {
      setInitializing(true);
      await namerRef.current.loadBook(selectedBook);
      setInitializing(false);
    };
    loadInitialBook();
  }, [selectedBook]);

  const handleGenerate = () => {
    if (initializing) return;
    
    const names: GeneratedName[] = [];
    for (let i = 0; i < 6; i++) {
      const name = namerRef.current.genName();
      if (name) {
        names.push(name);
      }
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

  const handleFavorite = (name: GeneratedName) => {
    toggleFavorite(name, familyName);
    // Force re-render by updating the generated names array
    setGeneratedNames([...generatedNames]);
  };

  if (page === 'favorites') {
    return <FavoritesPage onBack={() => setPage('main')} />;
  }

  return (
    <div className="min-h-screen bg-matsu-bg text-matsu-text py-6 px-4 font-serif selection:bg-matsu-primary/30">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl md:text-4xl font-bold text-matsu-primary tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6" />
              古诗文起名
            </h1>
            <button
              onClick={() => setPage('favorites')}
              className="flex items-center gap-2 px-4 py-2 text-matsu-primary hover:text-matsu-primaryHover transition-colors border border-matsu-border rounded-full hover:bg-matsu-primary/10"
            >
              <Heart className="w-4 h-4" />
              我的收藏
            </button>
          </div>
          <p className="text-matsu-text/70 text-sm text-center">
            翻阅经典, 与一个好名字不期而遇
          </p>
        </header>

        <main className="space-y-6">
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
              {generatedNames.map((name, index) => (
                <NameCard 
                  key={`${name.name}-${index}`} 
                  data={name} 
                  familyName={familyName}
                  onFavorite={() => handleFavorite(name)}
                  isFavorited={isFavorite(name.name, familyName)}
                />
              ))}
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
        </footer>
      </div>
    </div>
  );
}

export default App;
