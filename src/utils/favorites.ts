import type { GeneratedName } from './namer';

const STORAGE_KEY = 'gushi_namer_favorites';

export interface FavoriteItem extends GeneratedName {
  id: string;
  familyName: string;
  savedAt: number;
}

export const getFavorites = (): FavoriteItem[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load favorites:', error);
    return [];
  }
};

export const saveFavorite = (name: GeneratedName, familyName: string): void => {
  try {
    const favorites = getFavorites();
    const id = `${familyName}${name.name}-${Date.now()}`;
    const newFavorite: FavoriteItem = {
      ...name,
      id,
      familyName,
      savedAt: Date.now(),
    };
    favorites.unshift(newFavorite);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Failed to save favorite:', error);
  }
};

export const removeFavorite = (id: string): void => {
  try {
    const favorites = getFavorites();
    const filtered = favorites.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to remove favorite:', error);
  }
};

export const isFavorite = (name: string, familyName: string): boolean => {
  const favorites = getFavorites();
  return favorites.some(
    (fav) => fav.name === name && fav.familyName === familyName
  );
};

export const toggleFavorite = (name: GeneratedName, familyName: string): boolean => {
  if (isFavorite(name.name, familyName)) {
    // Remove from favorites
    const favorites = getFavorites();
    const toRemove = favorites.find(
      (fav) => fav.name === name.name && fav.familyName === familyName
    );
    if (toRemove) {
      removeFavorite(toRemove.id);
    }
    return false;
  } else {
    // Add to favorites
    saveFavorite(name, familyName);
    return true;
  }
};

