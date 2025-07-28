import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Bino - Local Service Assistant',
  description: 'Your friendly local service assistant for finding plumbers, restaurants, cabs, and more',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
