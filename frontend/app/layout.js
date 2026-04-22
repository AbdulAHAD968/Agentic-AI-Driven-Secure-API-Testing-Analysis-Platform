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
  title: {
    default: "DevSecOps AI Platform | Secure API Intelligence",
    template: "%s | DevSecOps AI"
  },
  description: "DevSecOps AI Platform is a premium platform for automated API vulnerability discovery. Using AI-assisted SAST & DAST to secure modern development lifecycles.",
  keywords: ["DevSecOps", "AI Security", "API Vulnerability", "SAST", "DAST", "Cybersecurity"],
  authors: [{ name: "Abdul Ahad, M. Faizan, M. Hayyan" }],
  creator: "DevSecOps AI Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://devsecops-ai.com",
    title: "DevSecOps AI Platform | Secure API Intelligence",
    description: "The next generation of AI-powered security testing.",
    siteName: "DevSecOps AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "DevSecOps AI Platform | Secure API Intelligence",
    description: "Automated API vulnerability discovery powered by AI.",
    creator: "@devsecops_ai",
  },
  robots: {
    index: true,
    follow: true,
  }
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
