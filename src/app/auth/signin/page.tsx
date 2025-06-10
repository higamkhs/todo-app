"use client";
import { signIn } from "next-auth/react";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("メールアドレスまたはパスワードが違います");
    } else {
      router.push("/");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">メールアドレス</label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full p-3 rounded-lg border-0 bg-gray-100 dark:bg-neutral-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 shadow-inner"
          required
          autoFocus
        />
      </div>
      <div>
        <label className="block text-gray-700 dark:text-gray-300 mb-1">パスワード</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-3 rounded-lg border-0 bg-gray-100 dark:bg-neutral-800 text-lg focus:ring-2 focus:ring-blue-400 focus:outline-none transition text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-neutral-500 shadow-inner"
          required
        />
      </div>
      {error && <div className="text-red-500 text-sm text-center">{error}</div>}
      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-blue-400 text-white px-7 py-3 rounded-lg font-bold text-lg shadow-lg hover:from-blue-600 hover:to-blue-500 transition disabled:opacity-50 active:scale-95"
        disabled={loading}
      >
        {loading ? "サインイン中..." : "サインイン"}
      </button>
    </form>
  );
}

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-300 dark:from-neutral-900 dark:to-neutral-800">
      <div className="w-full max-w-md p-8 rounded-3xl shadow-2xl bg-white/80 dark:bg-neutral-900/80 border border-gray-200 dark:border-neutral-700">
        <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 dark:text-white">サインイン</h2>
        <Suspense>
          <SignInForm />
        </Suspense>
        <div className="mt-6 text-center text-gray-500 dark:text-gray-400 text-sm">
          アカウントをお持ちでない方は{' '}
          <a href="/auth/signup" className="text-blue-500 hover:underline">サインアップ</a>
        </div>
      </div>
    </div>
  );
} 