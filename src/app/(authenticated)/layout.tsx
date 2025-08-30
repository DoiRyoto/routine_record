import Layout from '@/components/Layout/Layout';

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return <Layout>{children}</Layout>;
}
