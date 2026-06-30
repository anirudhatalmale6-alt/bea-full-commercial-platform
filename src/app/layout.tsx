import './globals.css';
import type { Metadata } from 'next';
import BEAAgentWidget from '@/components/agent/BEAAgentWidget';

export const metadata: Metadata = {
  title: 'British English Academy | CEFR Placement & ESL Curriculum',
  description: 'CEFR-aligned ESL placement test, paid score reports, diagnostic certificates, activities and full A1-C2 curriculum.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <BEAAgentWidget />
      </body>
    </html>
  );
}
