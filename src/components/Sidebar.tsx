"use client";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { useContext, useState } from "react";
import { AppContext } from "../app/providers/AppContextProvider";

export default function Sidebar() {
  const { data: session, status } = useSession();
  const {
    categories, setCategories, activeCategory, setActiveCategory,
  } = useContext(AppContext);
  const [newCategory, setNewCategory] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory]);
      setNewCategory("");
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className="w-72 h-screen p-8 bg-gradient-to-b from-blue-900 via-blue-700 to-blue-800 shadow-2xl flex flex-col">
      {/* Header */}
      <div className="flex items-center mb-10 gap-3">
        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
          {session?.user?.name?.[0] || session?.user?.email?.[0] || 'U'}
        </div>
        <h1 className="text-2xl font-bold text-blue-200">Todo SaaS</h1>
        <button
          onClick={toggleDarkMode}
          className="ml-auto p-2 text-blue-200 hover:text-white transition-colors"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <h3 className="text-sm text-blue-100 mb-2 font-bold">カテゴリ</h3>
        <select 
          value={activeCategory} 
          onChange={(e) => setActiveCategory(e.target.value)}
          className="w-full p-2 bg-blue-800 text-white rounded-lg border border-blue-600"
        >
          {categories.map((cat: string) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        
        <div className="mt-2 flex gap-2">
          <input
            type="text"
            placeholder="新規カテゴリ"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAddCategory(); }}
            className="flex-1 p-2 bg-blue-800 text-white rounded border border-blue-600 placeholder-blue-300"
          />
          <button 
            onClick={handleAddCategory}
            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-6">
        <button className="w-full p-3 text-left text-blue-100 hover:bg-blue-800 rounded-lg transition-colors mb-2">
          ⚙️ 設定
        </button>
      </div>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* User section */}
      <div className="border-t border-blue-600 pt-6 flex flex-col items-center gap-3">
        {status === "authenticated" && session?.user ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm">
                {session.user.name?.[0] || session.user.email?.[0] || 'U'}
              </div>
              <span className="text-sm text-blue-100 truncate">
                {session.user.name || session.user.email}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/auth/signin" })}
              className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
            >
              ログアウト
            </button>
          </>
        ) : (
          <Link href="/auth/signin" className="w-full">
            <button className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors">
              サインイン
            </button>
          </Link>
        )}
      </div>
    </div>
  );
} 