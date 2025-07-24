import { Inter } from 'next/font/google';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
    title: 'Buffer Content Optimizer',
    description: 'Advanced social media analytics and optimization platform',
};

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body className={inter.className}>
            <div className="min-h-screen flex flex-col">
                <main className="flex-1">
                    {children}
                </main>
                <Footer />
            </div>
        </body>
        </html>
    );
}