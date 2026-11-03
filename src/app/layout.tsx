import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://darisav.by"),
  title: {
    default: "Дария Савич — брови, ресницы и обучение",
    template: "%s | Дария Савич",
  },
  description:
    "Оформление и ламинирование бровей и ресниц у Дарии Савич. Авторский курс Blonde Formula по осветлению бровей. Услуги, портфолио и запись онлайн.",
  keywords: [
    "брови",
    "ресницы",
    "ламинирование ресниц",
    "оформление бровей",
    "обучение бровистов",
    "Дария Савич",
  ],
  openGraph: {
    title: "Дария Савич — брови, ресницы и обучение",
    description:
      "Оформление бровей и ресниц, ламинирование и авторский курс Blonde Formula.",
    locale: "ru_BY",
    type: "website",
    images: [
      {
        url: "/images/hero-daria-mobile.jpg",
        width: 1122,
        height: 1402,
        alt: "Дария Савич — оформление бровей и обучение",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Дария Савич — брови, ресницы и обучение",
    description:
      "Оформление бровей и ресниц, ламинирование и авторский курс Blonde Formula.",
    images: ["/images/hero-daria-mobile.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Дария Савич",
  jobTitle: "Мастер по оформлению бровей и ресниц, преподаватель",
  knowsAbout: [
    "Оформление бровей",
    "Ламинирование бровей",
    "Ламинирование ресниц",
    "Обучение осветлению бровей",
  ],
  sameAs: ["https://www.instagram.com/dariii.sav/", "https://t.me/dariiisav"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="ru"
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}
