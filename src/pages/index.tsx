import Image from "next/image";
import { Inter } from "next/font/google";
import Scoreboard from "@/components/Scoreboard";
import { ControlBar } from "@/components/ControlBar";
import RoundWins from "@/components/RoundWins";
import YouTubeVideo from "@/components/VideoPlayer";

const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main className="bg-gray-100 pb-32 min-h-screen">
      <div className="grid grid-cols-2">
        <div className="relative">
          <YouTubeVideo videoId="jsgxMLVAnu4" />
        </div>
        <div className="p-8">
          <Scoreboard />
        </div>
      </div>
      <RoundWins />
      <ControlBar />
    </main>
  );
}
