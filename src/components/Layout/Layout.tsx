import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import PageHeader from './PageHeader';
import AlertFeed from '../AlertFeed/AlertFeed';

interface LayoutProps {
  children: ReactNode;
  showAlertFeed?: boolean;
  /** Breadcrumb segments, e.g. ['RADAR', 'RISK MONITOR'] */
  breadcrumb?: string[];
}

export default function Layout({ children, showAlertFeed = true, breadcrumb = ['RADAR'] }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <Sidebar />
      <div className="ml-60 flex flex-col min-h-screen">
        <PageHeader breadcrumb={breadcrumb} />
        <div className="flex flex-1 items-stretch">
          <main className="flex-1 min-w-0">
            {children}
          </main>
          {showAlertFeed && <AlertFeed />}
        </div>
      </div>
    </div>
  );
}
