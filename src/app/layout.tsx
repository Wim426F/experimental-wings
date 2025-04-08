import "./globals.css";
import "leaflet/dist/leaflet.css";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Experimental Wings",
  description: "Track Flights, Connect Enthusiasts",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="p-4 bg-gray-800 text-white text-center">
          <h1>Experimental Wings</h1>
        </header>
        <main className="h-[calc(100vh-8rem)]">{children}</main>
        <footer className="p-4 bg-gray-800 text-white text-center">
          Track Flights, Connect Enthusiasts
        </footer>
      </body>
    </html>
  );
}