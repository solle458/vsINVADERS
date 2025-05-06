'use client';

import {useParams} from "next/navigation";

export default function GamePage() {
    const params = useParams();
    const difficulty = params?.difficulty;

    return (
        <div>
            <h1>選ばれた難易度: {difficulty}</h1>
        </div>
    );
}
