import { useRouter } from "next/navigation";

export default function RankingButton() {
    const router = useRouter();
    const handleRankingClick = () => {
        router.push("/ranking");
    };

    return (
        <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleRankingClick}
        >
            ランキング
        </button>
    );
}
