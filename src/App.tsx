import { useState, useEffect, useRef } from 'react';
import { BookSelector } from './components/BookSelector';
import { FamilyNameInput } from './components/FamilyNameInput';
import { NameCard } from './components/NameCard';
import { Loading } from './components/Loading';
import { Namer, type GeneratedName } from './utils/namer';
import { Sparkles } from 'lucide-react';

function App() {
  const [selectedBook, setSelectedBook] = useState<string>('shijing');
  const [familyName, setFamilyName] = useState<string>('李');
  const [generatedNames, setGeneratedNames] = useState<GeneratedName[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  
  const namerRef = useRef<Namer>(new Namer());

  useEffect(() => {
    const loadInitialBook = async () => {
      setInitializing(true);
      await namerRef.current.loadBook(selectedBook);
      setInitializing(false);
    };
    loadInitialBook();
  }, [selectedBook]);

  const handleGenerate = async () => {
    if (initializing) return;
    
    setLoading(true);
    // Simulate a small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const names: GeneratedName[] = [];
    for (let i = 0; i < 6; i++) {
      const name = namerRef.current.genName();
      if (name) {
        names.push(name);
      }
    }
    setGeneratedNames(names);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 py-10 px-4 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-emerald-500 mb-4 tracking-tight flex items-center justify-center gap-3">
            <Sparkles className="w-8 h-8" />
            古诗文起名
          </h1>
          <p className="text-slate-400">
            探寻中国传统文化之美，为您取一个富有诗意的名字
          </p>
        </header>

        <main className="space-y-8">
          <section className="bg-slate-800/50 rounded-2xl p-6 md:p-8 border border-slate-700/50 backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <BookSelector 
                selectedBook={selectedBook} 
                onSelect={setSelectedBook} 
                disabled={initializing || loading}
              />
              
              <FamilyNameInput 
                value={familyName} 
                onChange={setFamilyName} 
              />
              
              <button
                onClick={handleGenerate}
                disabled={initializing || loading}
                className="mt-4 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-bold text-lg shadow-lg shadow-emerald-900/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
              >
                {initializing ? '加载词库中...' : loading ? '正在生成...' : '开始起名'}
                {!initializing && !loading && <Sparkles className="w-5 h-5" />}
              </button>
            </div>
          </section>

          {(loading || generatedNames.length > 0) && (
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {loading ? (
                <div className="col-span-full flex justify-center py-12">
                  <Loading />
                </div>
              ) : (
                generatedNames.map((name, index) => (
                  <NameCard 
                    key={`${name.name}-${index}`} 
                    data={name} 
                    familyName={familyName} 
                  />
                ))
              )}
            </section>
          )}
        </main>

        <footer className="mt-16 text-center text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} 古诗文起名 | 诗词数据来源于网络</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
