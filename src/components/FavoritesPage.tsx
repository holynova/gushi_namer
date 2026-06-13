import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowLeft, AlertCircle, User } from 'lucide-react';
import { getFavorites, removeFavorite, type FavoriteItem } from '../utils/favorites';
import { NameCard } from './NameCard';
import { useAuth } from '../contexts/AuthContext';

interface FavoritesPageProps {
  onBack: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack }) => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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

  // 如果未登录，显示提示
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F0E4] px-4 text-[#28231D] font-serif">
        <div className="w-full max-w-md rounded-lg border border-[#D7C7AF] bg-[#FFFDF8] p-8 text-center shadow-sm shadow-[#B59B7A]/10">
          <Heart className="w-14 h-14 text-[#D7C7AF] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#2F765C] mb-2">请先登录</h2>
          <p className="font-sans text-[#6D6257] mb-6">登录后即可查看您的收藏</p>
          <button
            onClick={onBack}
            className="rounded-lg bg-[#2F765C] px-6 py-2 font-sans text-white transition-colors hover:bg-[#275F4B]"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

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
            </div>
          </div>
        </header>

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
