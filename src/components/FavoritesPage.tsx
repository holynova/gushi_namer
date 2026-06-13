import React, { useRef, useState, useEffect } from 'react';
import { Heart, Trash2, ArrowLeft, AlertCircle, User, Download, Upload } from 'lucide-react';
import {
  exportFavorites,
  getFavorites,
  importFavorites,
  removeFavorite,
  type FavoriteItem,
} from '../utils/favorites';
import { NameCard } from './NameCard';

interface FavoritesPageProps {
  onBack: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const importInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadFavorites = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getFavorites();
      setFavorites(data);
    } catch (err) {
      setError('加载收藏失败，请重试');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await removeFavorite(id);
      await loadFavorites();
    } catch (err) {
      setError('删除收藏失败，请重试');
      console.error(err);
    }
  };

  const handleExport = async () => {
    const data = await exportFavorites();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `gushi-namer-favorites-${new Date()
      .toISOString()
      .slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setMessage('收藏已导出为 JSON 文件');
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError('');
    setMessage('');

    try {
      const text = await file.text();
      const result = await importFavorites(JSON.parse(text));
      await loadFavorites();
      setMessage(`导入完成：新增 ${result.imported} 个收藏，共 ${result.total} 个`);
    } catch (err: any) {
      setError(err.message || '导入失败，请检查 JSON 文件格式');
    } finally {
      event.target.value = '';
    }
  };

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
                Library
              </p>
              <h1 className="font-serif text-2xl font-bold text-[#2F765C] sm:text-3xl">我的收藏</h1>
              <p className="mt-1 hidden font-sans text-xs text-[#6D6257] sm:block">
                在这里导出或导入收藏 JSON
              </p>
            </div>
          </div>
        </header>

        <section className="mt-5 rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-4 shadow-sm shadow-[#B59B7A]/10 ring-2 ring-[#2F765C]/5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#28231D]">本地收藏</h2>
              <p className="mt-1 font-sans text-sm text-[#6D6257]">
                收藏保存在当前浏览器。可导出 JSON 备份，也可从 JSON 导入恢复。
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                onClick={handleExport}
                className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#D7C7AF] bg-white px-3 font-sans text-sm text-[#2F765C] transition hover:border-[#2F765C]"
              >
                <Download className="h-4 w-4" />
                导出收藏 JSON
              </button>
              <button
                onClick={() => importInputRef.current?.click()}
                className="flex h-10 items-center justify-center gap-2 rounded-lg bg-[#2F765C] px-3 font-sans text-sm text-white transition hover:bg-[#275F4B]"
              >
                <Upload className="h-4 w-4" />
                导入 JSON
              </button>
              <input
                ref={importInputRef}
                type="file"
                accept="application/json,.json"
                onChange={handleImportFile}
                className="hidden"
              />
            </div>
          </div>
        </section>

        {error && (
          <div className="my-5 rounded-lg border border-red-200 bg-red-50 p-3 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800 text-sm">{error}</p>
              <button
                onClick={loadFavorites}
                className="text-red-600 hover:text-red-700 text-sm underline mt-1"
              >
                重新加载
              </button>
            </div>
          </div>
        )}

        {message && (
          <div className="my-5 rounded-lg border border-green-200 bg-green-50 p-3 font-sans text-sm text-green-800">
            {message}
          </div>
        )}

        {loading ? (
          <div className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] py-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#2F765C] mx-auto mb-4"></div>
            <p className="font-sans text-[#6D6257]">加载中...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="rounded-lg border border-dashed border-[#D7C7AF] bg-[#FFFDF8]/70 py-20 px-4 text-center">
            <Heart className="w-14 h-14 text-[#D7C7AF] mx-auto mb-4" />
            <p className="font-serif text-2xl font-bold text-[#28231D]">还没有收藏任何名字</p>
            <p className="font-sans text-[#6D6257] text-sm mt-2">
              在起名页面点击名字卡片右上角的爱心图标即可收藏
            </p>
          </div>
        ) : (
          <div className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {favorites.map((favorite) => (
                <div key={favorite.id} className="relative">
                  <NameCard
                    data={favorite}
                    familyName={favorite.familyName}
                  />
                  <button
                    onClick={() => handleRemove(favorite.id)}
                    className="absolute bottom-4 right-4 rounded-full border border-red-200 bg-red-50 p-2 transition-colors hover:bg-red-100"
                    aria-label="删除收藏"
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </button>
                </div>
              ))}
            </section>

            <aside className="rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-5 lg:h-fit">
              <div className="mb-4 flex items-center gap-2">
                <User className="h-5 w-5 text-[#2F765C]" />
                <h2 className="font-serif text-xl font-bold">收藏概览</h2>
              </div>
              <dl className="space-y-3 font-sans text-sm">
                <div className="flex justify-between border-b border-[#E2D5C2] pb-3">
                  <dt className="text-[#6D6257]">已收藏</dt>
                  <dd className="font-semibold">{favorites.length} 个</dd>
                </div>
                <div className="flex justify-between border-b border-[#E2D5C2] pb-3">
                  <dt className="text-[#6D6257]">最近姓氏</dt>
                  <dd className="font-semibold">{favorites[0]?.familyName || '-'}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[#6D6257]">常用典籍</dt>
                  <dd className="font-semibold">{favorites[0]?.book || '-'}</dd>
                </div>
              </dl>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};
