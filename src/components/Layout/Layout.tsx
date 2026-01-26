import type { ReactNode } from 'react';
import TopNav from './TopNav';
import AlertFeed from '../AlertFeed/AlertFeed';

interface LayoutProps {
  children: ReactNode;
  showAlertFeed?: boolean;
}

export default function Layout({ children, showAlertFeed = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopNav />
      <div className="pt-16 flex">
        <main className={`flex-1 ${showAlertFeed ? 'mr-[300px]' : ''}`}>
          {children}
        </main>
        {showAlertFeed && <AlertFeed />}
      </div>
    </div>
  );
}
