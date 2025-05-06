'use client';

import { useRouter } from "next/navigation";
import DungeonButton from './DungeonButton';

export default function DifficultySelector() {
    const router = useRouter();

    const selectDifficulty = (difficulty: string) => {
        router.push(`/game/${difficulty}`);
    };

    return (
        <div className="inline-grid gap-4">
            <DungeonButton label="春のダンジョン" onClick={() => selectDifficulty('spring')} />
            <DungeonButton label="夏のダンジョン" onClick={() => selectDifficulty('summer')} />
            <DungeonButton label="秋のダンジョン" onClick={() => selectDifficulty('autumn')} />
            <DungeonButton label="冬のダンジョン" onClick={() => selectDifficulty('winter')} />
        </div>
    );
}
