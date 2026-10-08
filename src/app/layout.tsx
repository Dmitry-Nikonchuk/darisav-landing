import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@fontsource-variable/inter/wght.css";
import "@fontsource-variable/playfair-display/wght.css";
import "./globals.css";

export const metadata: Metadata = {
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
  },
  twitter: {
    card: "summary",
    title: "Дария Савич — брови, ресницы и обучение",
    description:
      "Оформление бровей и ресниц, ламинирование и авторский курс Blonde Formula.",
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
