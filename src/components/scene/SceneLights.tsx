"use client";

export default function SceneLights(){

return(

<>

<ambientLight intensity={0.4}/>

<directionalLight

position={[4,4,5]}

intensity={2}

/>

<pointLight

position={[0,0,0]}

intensity={15}

color="#00d9ff"

/>

</>

);

}
