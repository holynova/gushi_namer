import React, { useState, useEffect } from 'react';
import { Heart, Trash2, ArrowLeft } from 'lucide-react';
import { getFavorites, removeFavorite, type FavoriteItem } from '../utils/favorites';
import { NameCard } from './NameCard';

interface FavoritesPageProps {
  onBack: () => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ onBack }) => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = () => {
    setFavorites(getFavorites());
  };

  const handleRemove = (id: string) => {
    removeFavorite(id);
    loadFavorites();
  };

  return (
    <div className="min-h-screen bg-matsu-bg text-matsu-text py-6 px-4 font-serif">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
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

        {favorites.length === 0 ? (
          <div className="text-center py-20">
            <Heart className="w-16 h-16 text-matsu-border mx-auto mb-4" />
            <p className="text-matsu-text/60 text-lg">还没有收藏任何名字</p>
            <p className="text-matsu-text/40 text-sm mt-2">
              在起名页面点击名字卡片右上角的爱心图标即可收藏
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
