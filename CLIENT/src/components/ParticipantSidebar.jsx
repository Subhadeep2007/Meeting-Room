import { useState } from "react";

import ParticipantCard from "./ParticipantCard";

const ParticipantSidebar=({

participants,

})=>{

const [search,setSearch]=useState("");

const users=Object.values(participants).filter(

(user)=>

user.username

.toLowerCase()

.includes(

search.toLowerCase()

)

);

return(

<div

className="w-80 bg-gray-900 h-full p-4"

>

<input

type="text"

placeholder="Search"

value={search}

onChange={(e)=>

setSearch(

e.target.value

)

}

className="w-full p-2 rounded mb-4"

/>

<div className="space-y-2">

{

users.map(

(user)=>(

<ParticipantCard

key={user.socketId}

participant={user}

/>

)

)

}

</div>

</div>

);

};

export default ParticipantSidebar;