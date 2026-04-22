import { Newsreader, Inter, JetBrains_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const newsreader = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["400", "500", "600"],
});

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Topic AI | Admin Control",
  description: "Secure administrative interface for the Topic AI platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased selection:bg-terracotta/20`}>
      <body className="bg-parchment text-near-black font-sans leading-relaxed">
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#faf9f5",
              color: "#141413",
              border: "1px solid #e8e6dc",
              borderRadius: "12px",
              fontSize: "15px",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
