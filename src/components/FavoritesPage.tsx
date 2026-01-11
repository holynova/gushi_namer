import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowLeft, AlertCircle } from 'lucide-react';
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
      <div className="min-h-screen bg-matsu-bg text-matsu-text font-serif flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-matsu-border mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-matsu-primary mb-2">请先登录</h2>
          <p className="text-matsu-text/60 mb-6">登录后即可查看您的收藏</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-matsu-primary hover:bg-matsu-primaryHover text-white rounded-full transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-matsu-bg text-matsu-text font-serif">
      <div className="max-w-4xl mx-auto">
        <header className={`sticky top-0 z-50 bg-matsu-bg/95 backdrop-blur-sm py-4 px-4 mb-6 transition-all duration-300 ${
          isScrolled ? 'border-b border-matsu-border' : ''
        }`}>
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-matsu-primary hover:text-matsu-primaryHover transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            返回起名
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-matsu-primary mb-2 tracking-tight flex items-center gap-2">
            <Heart className="w-6 h-6 fill-matsu-primary" />
            我的收藏
          </h1>
          <p className="text-matsu-text/70 text-sm">
            共收藏 {favorites.length} 个名字
          </p>
        </header>

        {error && (
          <div className="mx-4 mb-6 bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
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
          <div className="text-center py-20 px-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-matsu-primary mx-auto mb-4"></div>
            <p className="text-matsu-text/60">加载中...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-20 px-4">
            <Heart className="w-16 h-16 text-matsu-border mx-auto mb-4" />
            <p className="text-matsu-text/60 text-lg">还没有收藏任何名字</p>
            <p className="text-matsu-text/40 text-sm mt-2">
              在起名页面点击名字卡片右上角的爱心图标即可收藏
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 pb-6">
            {favorites.map((favorite) => (
              <div key={favorite.id} className="relative">
                <NameCard
                  data={favorite}
                  familyName={favorite.familyName}
                />
                <button
                  onClick={() => handleRemove(favorite.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                  aria-label="删除收藏"
                >
                  <Trash2 className="w-5 h-5 text-red-600" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
