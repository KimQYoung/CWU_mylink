import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { FirebaseAnalytics } from "@/components/firebase-analytics";
import { FirestoreLinksSync } from "@/components/firestore-links-sync";
import { QueryProvider } from "@/components/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "김규영 | 마이링크";
const DEFAULT_DESCRIPTION =
  "아이디어를 코드로 실현하는 개발자 김규영의 마이링크입니다.";

/**
 * 배포 환경 변수로부터 Next.js metadataBase URL을 안전하게 생성합니다.
 */
function resolveMetadataBase(): URL {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (!trimmed) continue;

    const normalized = /^https?:\/\//i.test(trimmed)
      ? trimmed
      : `https://${trimmed}`;

    try {
      return new URL(normalized);
    } catch {
      continue;
    }
  }

  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "MyLink",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-canvas text-ink">
        <QueryProvider>
          <FirebaseAnalytics />
          <FirestoreLinksSync />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
