import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
      <main className={inter.className}>
          <p className={`text-center my-4`}>Aki Template</p>
      </main>
  );
}
