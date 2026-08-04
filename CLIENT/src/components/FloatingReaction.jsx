const FloatingReaction = ({

reaction

}) => {

return(

<div

className="absolute bottom-10 right-10 text-5xl animate-bounce"

>

{reaction.emoji}

</div>

);

};

export default FloatingReaction;