type Props = {
    label: string;
    onClick: () => void;
}

export default function DungeonButton({ label, onClick }: Props) {
    return (
        <button
            onClick={onClick}
            className="bg-yellow-100 text-yellow-600 border-4 border-yellow-600 font-mono text-lg px-4 py-2 tracking-widest shadow-[4px_4px_0_#222] hover:brightness-125"
        >
            ▶︎ {label}
        </button>
    );
}
