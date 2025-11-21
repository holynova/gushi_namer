import { useState, useEffect, useRef } from 'react';
import { BookSelector } from './components/BookSelector';
import { FamilyNameInput } from './components/FamilyNameInput';
import { NameCard } from './components/NameCard';
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
    <div className="min-h-screen bg-matsu-bg text-matsu-text py-6 px-4 font-serif selection:bg-matsu-primary/30">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-bold text-matsu-primary mb-2 tracking-tight flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            古诗文起名
          </h1>
          <p className="text-matsu-text/70 text-sm">
          翻阅经典, 与一个好名字不期而遇
          </p>
        </header>

        <main className="space-y-6">
          <section className="bg-matsu-card/50 rounded-2xl p-4 md:p-6 border border-matsu-border backdrop-blur-sm">
            <div className="flex flex-col items-center">
              <BookSelector 
                selectedBook={selectedBook} 
                onSelect={setSelectedBook} 
                disabled={initializing || loading}
              />
              
              <div className="flex items-end gap-4">
                <FamilyNameInput 
                  value={familyName} 
                  onChange={setFamilyName} 
                />
                
                <button
                  onClick={handleGenerate}
                  disabled={initializing || loading}
                  className="mb-2 px-6 py-2 bg-matsu-primary hover:bg-matsu-primaryHover text-white rounded-full font-bold text-base shadow-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 h-[42px] w-[120px]"
                >
                  {initializing ? '加载中...' : loading ? '生成中...' : '起名'}
                  {!initializing && !loading && <Sparkles className="w-4 h-4" />}
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
                />
              ))}
            </section>
          )}
        </main>

        <footer className="mt-16 text-center text-matsu-text/50 text-sm">
          <p>© {new Date().getFullYear()} 古诗文起名 | 诗词数据来源于网络</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
