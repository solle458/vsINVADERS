'use client';

import DifficultySelector from "./components/DifficultySelector";
import RankingButton from "./components/RankingButton";

export default function Home() {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-3xl font-bold underline">
          Welcome to the Maze App!
        </h1>
        <DifficultySelector />
      </div>
      <div className="absolute bottom-4 right-4">
        <RankingButton />
      </div>
    </div>
  );
}
