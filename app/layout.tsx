import "./globals.css";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pemilihan Ketua Kelas",
  description: "Prototipe e-voting dengan token sekali pakai",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <header className="nav">
          <Link href="/" className="brand">🗳️ Pemilihan Ketua Kelas</Link>
          <nav>
            <Link href="/">Hasil</Link>
            <Link href="/vote" className="btn small">Beri Suara</Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>Prototipe uji coba · data suara bersifat rahasia (token tidak dikaitkan dengan pilihan)</footer>
      </body>
    </html>
  );
}
