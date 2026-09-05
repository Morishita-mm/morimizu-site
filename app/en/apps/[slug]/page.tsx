import { redirect } from 'next/navigation';

export default async function AppsEnSlugRedirectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/en/projects/${slug}`);
}
