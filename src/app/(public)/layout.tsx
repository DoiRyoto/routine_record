import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'RoutineRecord - 習慣管理アプリ',
  description: 'あなたの習慣を記録し、成長を可視化する習慣管理アプリです。',
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg-primary">
      {children}
    </div>
  );
}