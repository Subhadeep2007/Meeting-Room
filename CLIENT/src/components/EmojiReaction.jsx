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
        <div className="relative">

            {/* Emoji Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="
                    w-10
                    h-10
                    sm:w-11
                    sm:h-11
                    rounded-full
                    bg-black/70
                    hover:bg-black/90
                    text-white
                    flex
                    items-center
                    justify-center
                    backdrop-blur
                    shadow-lg
                    transition
                    hover:scale-105
                "
                title="Reactions"
            >
                <span className="text-xl sm:text-2xl">
                    😄
                </span>
            </button>


            {/* Emoji Panel */}
            {isOpen && (

                <div
                    className="
                        absolute
                        right-0
                        bottom-12
                        sm:bottom-14
                        flex
                        items-center
                        gap-1
                        sm:gap-2
                        px-2
                        py-2
                        rounded-2xl
                        bg-gray-900/95
                        border
                        border-gray-700
                        shadow-2xl
                        backdrop-blur
                        z-[100]
                    "
                >

                    {emojis.map((emoji) => (

                        <button
                            key={emoji}
                            type="button"
                            onClick={() => handleSelect(emoji)}
                            className="
                                w-9
                                h-9
                                sm:w-10
                                sm:h-10
                                flex
                                items-center
                                justify-center
                                rounded-xl
                                hover:bg-white/10
                                hover:scale-125
                                transition
                                text-xl
                                sm:text-2xl
                            "
                            title={`React ${emoji}`}
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