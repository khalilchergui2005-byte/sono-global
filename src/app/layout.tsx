import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  weight: ["400", "600", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://sono-global.com'),
  other: { google: "notranslate" },
  title: {
    default: "Sono Global Travel | وكالة سفر جزائرية",
    template: "%s | Sono Global Travel",
  },
  description: "وكالة سفر جزائرية متخصصة في الطيران والفنادق والباقات السياحية والاستشارات. احجز رحلتك الآن.",
  keywords: ["سفر", "طيران", "فنادق", "باقات سياحية", "وكالة سفر جزائر", "حجز طيران", "travel algeria"],
  authors: [{ name: "Sono Global Travel" }],
  creator: "Sono Global Travel",
  openGraph: {
    type: "website",
    locale: "ar_DZ",
    url: "https://sono-global.com",
    siteName: "Sono Global Travel",
    title: "Sono Global Travel | وكالة سفر جزائرية",
    description: "وكالة سفر جزائرية متخصصة في الطيران والفنادق والباقات السياحية.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Sono Global Travel" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sono Global Travel | وكالة سفر جزائرية",
    description: "وكالة سفر جزائرية متخصصة في الطيران والفنادق والباقات السياحية.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        {children}
      </body>
    </html>
  );
}
