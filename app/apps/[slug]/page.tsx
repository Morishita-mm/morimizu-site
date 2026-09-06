import { redirect } from 'next/navigation';
// Legacy URLs are redirected by the Worker, not emitted as HTML assets.
export function generateStaticParams() {
  return [];
}

export default async function AppsSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/projects/${slug}`);
}
