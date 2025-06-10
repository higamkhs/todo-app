import "./globals.css";
import SessionProviderWrapper from "./providers/SessionProviderWrapper";
import AppContextProvider from "./providers/AppContextProvider";

export const metadata = {
  title: "Todo SaaS App",
  description: "認証付きSaaS型Todoアプリケーション",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <body style={{ minHeight: "100vh", margin: 0, padding: 0 }}>
        <SessionProviderWrapper>
          <AppContextProvider>
            {children}
          </AppContextProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
