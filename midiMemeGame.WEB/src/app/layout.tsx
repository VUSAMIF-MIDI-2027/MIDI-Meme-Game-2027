import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";
import { LanguageProvider } from "@/context/LanguageContext";
import { Header } from "@/components/Header/Header";
import { Footer } from "@/components/Footer/Footer";

const dosis = localFont({
  src: [
    {
      path: "./fonts/Dosis-ExtraLight.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/Dosis-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
  ],
});

export const metadata: Metadata = {
  title: "MIDI meme žaidimas",
  description: "„Naktis su MIDI“ renginio meme žaidimo puslapis",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="lt">
      <body className={`${dosis.className} min-h-screen antialiased`}>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col">
            <main className="flex-1 pt-17">
              {children}
            </main>

            <Footer />
          </div>
          <Header />
        </LanguageProvider>
      </body>
    </html>
  );
}
