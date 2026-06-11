import type { Metadata, Viewport } from "next";
import { Archivo, Atkinson_Hyperlegible, Spline_Sans_Mono } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});
// Desenhada pra legibilidade máxima — comerciante de mais idade lê sem esforço
const atkinson = Atkinson_Hyperlegible({
  variable: "--font-atkinson",
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
});
const splineMono = Spline_Sans_Mono({
  variable: "--font-money",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Acerto — crediário digital",
  description: "Crediário digital com cobrança pelo WhatsApp",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f3f1e9",
};

// Layout raiz mínimo: fonts e body. O shell logado (sidebar/bottom-nav) vive em (app)/layout.
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${atkinson.variable} ${splineMono.variable} h-full antialiased`}
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
