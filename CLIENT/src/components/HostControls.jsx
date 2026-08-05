import{

UserX,

MicOff,

VideoOff,

Lock,

Unlock,

Crown,

Star

}from"lucide-react";

const HostControls=({

participant,

onKick,

onMute,

onDisableCamera,

onTransferHost,

onMakeCoHost,

onLock,

meetingLocked,

})=>{

return(

<div className="flex gap-2">

<button

onClick={()=>onKick(

participant.socketId

)}

>

<UserX/>

</button>

<button

onClick={()=>onMute(

participant.socketId

)}

>

<MicOff/>

</button>

<button

onClick={()=>onDisableCamera(

participant.socketId

)}

>

<VideoOff/>

</button>

<button

onClick={()=>onTransferHost(

participant.userId

)}

>

<Crown/>

</button>

<button

onClick={()=>onMakeCoHost(

participant.userId

)}

>

<Star/>

</button>

<button

onClick={onLock}

>

{

meetingLocked

?

<Unlock/>

:

<Lock/>

}

</button>

</div>

);

};

export default HostControls;