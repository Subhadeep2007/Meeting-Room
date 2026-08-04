import {

Mic,

MicOff,

Video,

VideoOff,

Hand,

Crown

} from "lucide-react";

const ParticipantCard=({

participant,

})=>{

return(

<div
    className={`
        flex
        items-center
        justify-between
        p-3
        rounded-lg
        transition
        ${
            participant.isSpeaking
                ? "border-2 border-green-500 bg-green-900"
                : "hover:bg-gray-700"
        }
    `}
>
<div className="flex items-center gap-3">

<img

src={participant.profilePicture?.url}

alt=""

className="w-10 h-10 rounded-full"

/>

<div>

<div className="font-semibold text-white">

{participant.username}

</div>

<div className="text-xs text-gray-400">

{

participant.isHost

?

"Host"

:

participant.isCoHost

?

"Co Host"

:

"Participant"

}

</div>

</div>

</div>

<div className="flex gap-2">

{

participant.cameraEnabled

?

<Video size={18}/>

:

<VideoOff size={18}/>

}

{

participant.microphoneEnabled

?

<Mic size={18}/>

:

<MicOff size={18}/>

}

{

participant.handRaised

&&

<Hand

size={18}

className="text-yellow-400"

/>

}

{

participant.isHost

&&

<Crown

size={18}

className="text-yellow-400"

/>

}

</div>

</div>

);

};

export default ParticipantCard;