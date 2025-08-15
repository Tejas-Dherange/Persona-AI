import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"
const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'PersonaAI',
  description: 'Your AI-powered personal assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <Analytics/>
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
