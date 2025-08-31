import Layout from '@/common/components/layout/Layout';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
