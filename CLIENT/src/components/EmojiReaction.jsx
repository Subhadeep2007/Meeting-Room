import { useState } from "react";

const emojis = [
    "👍",
    "❤️",
    "😂",
    "👏",
    "🎉",
    "😮",
];

const EmojiReaction = ({ onSelect }) => {

    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (emoji) => {
        onSelect(emoji);
        setIsOpen(false);
    };

    return (
    <div
        className="
           fixed
top-[62%]
right-8
z-[9999]
        "
    >

        {/* Emoji Button */}
        <button
            type="button"
            onClick={(e) => {
                e.stopPropagation();
                setIsOpen((prev) => !prev);
            }}
            className="
                w-11
                h-11
                rounded-full
                bg-black/80
                hover:bg-black
                text-white
                flex
                items-center
                justify-center
                shadow-xl
                border
                border-white/10
                cursor-pointer
            "
        >
            <span className="text-2xl">
                😄
            </span>
        </button>

        {/* Emoji Panel */}
        {isOpen && (
            <div
                onClick={(e) => e.stopPropagation()}
                className="
                    absolute
                    top-full
                    right-0
                    mt-3
                    flex
                    items-center
                    gap-1
                    p-2
                    rounded-2xl
                    bg-gray-900
                    border
                    border-gray-700
                    shadow-2xl
                    whitespace-nowrap
                "
            >

                {emojis.map((emoji) => (
                    <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelect(emoji)}
                        className="
                            w-10
                            h-10
                            rounded-xl
                            flex
                            items-center
                            justify-center
                            text-2xl
                            hover:bg-white/10
                            hover:scale-125
                            transition
                            cursor-pointer
                        "
                    >
                        {emoji}
                    </button>
                ))}

            </div>
        )}

    </div>
);
};

export default EmojiReaction;