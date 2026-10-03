import type { Metadata } from 'next';
import { headers } from 'next/headers';
import './globals.css';

export async function generateMetadata(): Promise<Metadata> {
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? '';
  const isLocal = /^localhost(?::\d+)?$/.test(host);
  const isTrustedSite = /^[a-z0-9.-]+\.chatgpt\.site$/.test(host);
  const origin = isLocal ? `http://${host}` : isTrustedSite ? `https://${host}` : undefined;
  const title = 'grammartest — Live Grammar Challenge';
  const description = 'A live, teacher-led grammar correction game with typed answers, instant explanations, resilient reconnection, and a top-five leaderboard.';
  const image = origin ? `${origin}/og.png` : undefined;

  return {
    title,
    description,
    openGraph: { title, description, type: 'website', images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title, description, images: image ? [image] : undefined },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
