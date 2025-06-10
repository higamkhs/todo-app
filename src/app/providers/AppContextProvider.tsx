"use client";
import { createContext, useState } from "react";

export const AppContext = createContext<any>(null);

export default function AppContextProvider(props: any) {
  const { children } = props;
  const [categories, setCategories] = useState([
    "すべて", "仕事", "プライベート", "買い物", "学習"
  ]);
  const [activeCategory, setActiveCategory] = useState("すべて");
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [pinnedIds, setPinnedIds] = useState<number[]>([]);
  const [categoryMap, setCategoryMap] = useState<{ [id: number]: string }>({});

  return (
    <AppContext.Provider value={{
      categories, setCategories, activeCategory, setActiveCategory,
      favoriteIds, setFavoriteIds, pinnedIds, setPinnedIds, categoryMap, setCategoryMap
    }}>
      {children}
    </AppContext.Provider>
  );
} 