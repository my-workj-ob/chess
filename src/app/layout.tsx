import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://mirachess.online'),
  title: {
    default: "MiraChess — Real vaqtda Onlayn Shaxmat | Play Chess Online | Шахматы Онлайн",
    template: "%s | MiraChess"
  },
  description: "O'zbekcha: Zamonoviy dizayn, kuchli sun'iy intellekt va do'stlar bilan o'ynash uchun onlayn shaxmat platformasi. English: Play chess online with friends and AI. Русский: Играйте в шахматы онлайн с друзьями и ИИ.",
  keywords: [
    // --- BREND VA ASOSIY SO'ROVLAR ---
    'mirachess', 'mirachess online', 'shohmot', 'shohmot online', 'shohmot uz',

    // --- O'ZBEKCHA KALIT SO'ZLAR (UZ) ---
    'shaxmat', 'onlayn shaxmat', 'shaxmat o\'ynash', 'shaxmat online', 'shaxmat uzbekistan', 
    'ozbekcha shaxmat', 'shaxmat bot bilan', 'sun\'iy intellekt shaxmat', 'shaxmat turnirlari', 
    'dostlar bilan shaxmat', 'shaxmat masalalari', 'shaxmat darslari', 'bepul shaxmat', 
    'milliylashtirilgan shaxmat', 'shaxmat doskasi', 'shaxmat o\'yini yuklab olishsiz',

    // --- INGLIZCHA KALIT SO'ZLAR (EN) ---
    'play chess online', 'chess online', 'chess vs ai', 'multiplayer chess', 'online chess board',
    'free online chess', 'chess with friends', 'chess engine', 'play chess with computer',
    'realtime chess', 'web chess game', 'browser chess', 'chess puzzles', 'chess tactics',
    'chess tournaments', 'pvp chess', 'chess bot online', 'nextjs chess game',

    // --- RUSCHA KALIT SO'ZLAR (RU) ---
    'шахматы онлайн', 'играть в шахматы', 'шахматы с ИИ', 'шахматы онлайн с друзьями',
    'шахматы бесплатно', 'шахматный бот', 'онлайн шахматы узбекистан', 'шахматы без регистрации',
    'шахматная доска онлайн', 'играть в шахматы с компьютером', 'шахматные задачи',
    'шахматные турниры', 'сетевые шахматы', 'шахматы на двоих', 'быстрые шахматы онлайн'
  ],
  authors: [{ name: 'MiraChess Team' }],
  creator: 'MiraChess',
  publisher: 'MiraChess',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://mirachess.online',
    languages: {
      'uz-UZ': 'https://mirachess.online',
      'en-US': 'https://mirachess.online',
      'ru-RU': 'https://mirachess.online',
    },
  },
  openGraph: {
    title: "MiraChess — Onlayn Shaxmat / Play Chess Online / Шахматы Онлайн",
    description: "Do'stlar va sun'iy intellektga qarshi onlayn shaxmat o'ynang. Play chess online with friends and AI. Играйте в шахматы онлайн.",
    url: 'https://mirachess.online',
    siteName: 'MiraChess',
    locale: 'uz_UZ',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "MiraChess — Real vaqtda Onlayn Shaxmat platformasi",
    description: "Real vaqtda onlayn shaxmat o'ynang va sun'iy intellekt bilan kuch sinashing.",
  },
};
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz" className={`${inter.variable} dark`}>
      <body className="bg-slate-950 text-slate-100 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}