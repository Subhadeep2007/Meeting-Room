const emojis = [

"👍",

"❤️",

"😂",

"👏",

"🎉",

"😮"

];

const EmojiReaction = ({

onSelect

}) => {

return(

<div className="flex gap-2">

{

emojis.map(

(emoji)=>(

<button

key={emoji}

onClick={()=>

onSelect(emoji)

}

className="text-3xl hover:scale-125 transition"

>

{emoji}

</button>

)

)

}

</div>

);

};

export default EmojiReaction;