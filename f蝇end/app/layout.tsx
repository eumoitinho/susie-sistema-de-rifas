import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rifas Online",
  description: "Sistema de gerenciamento de rifas online",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-orange-500 text-white shadow-lg">
          <div className="container mx-auto px-4 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold">Rifas Online</h1>
              <div className="flex gap-4">
                <a href="/" className="hover:text-orange-200 transition">Início</a>
                <a href="/login" className="hover:text-orange-200 transition">Login</a>
                <a href="/register" className="hover:text-orange-200 transition">Cadastro</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

