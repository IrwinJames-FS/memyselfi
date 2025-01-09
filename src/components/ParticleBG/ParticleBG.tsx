'use client';
import { Canvas } from "@react-three/fiber";
import { useEffect, useMemo, useState } from "react";

import { CubeBg, DodecahedronBG, IcosahedronBG, OctahedronBG, TetrahedronBG } from "./Shapes";
import { Vector4 } from "three";


const bgs = [
	DodecahedronBG,
	IcosahedronBG,
	OctahedronBG,
	CubeBg,
	TetrahedronBG
]
const decUnit = 1/256;
const ParticleBG = () => {
	const [di, setDescriptor] = useState(0);
	const S = useMemo(()=>bgs[di], [di]);
	const [{color}, setColor] = useState<{color: Vector4}>({color:new Vector4(0,0,1,0.5)})
	useEffect(()=>{
		let dir: 0 | 1 | 2 = 0;
		let lastUpdate = 0;
		let frame = -1
		const draw = (time:number)=>{
			if (time-lastUpdate < 128) return frame = requestAnimationFrame(draw);
			lastUpdate = time;
			//console.log(decUnit, dir, time);
			setColor(({color}) => {
				switch (dir){
					case 0: 
						color.add({x:decUnit, y:0,z:-decUnit, w:0});
						if(color.x >= 1) dir = (dir+1)%3;
						break;
					case 1:
						color.add({x:-decUnit, y: decUnit, z:0, w:0});
						if(color.y >= 1) dir = (dir+1)%3;
						break;
					case 2:
						color.add({x:0, y: -decUnit, z:decUnit, w:0});
						if(color.z >= 1) dir = (dir+1)%3;
						break;
				}
				return {color};
			});
			return frame = requestAnimationFrame(draw)
		}
		requestAnimationFrame(draw);
		const t = setInterval(()=>{
			setDescriptor(d=>(d+1)%bgs.length);
		}, 2e4);
		return ()=>{
			clearInterval(t);
			cancelAnimationFrame(frame);
		}
	}, []);
	return (<Canvas {...{
	camera: {
		position: [2,2,2],
	},
	style: {
		position:'fixed',
		top: 0,
		left: 0,
		width: '100dvw',
		height: '100dvh',
		zIndex: -1,
	}
}}>
	<ambientLight intensity={0.5}/>
	<directionalLight position={[-1,2,2]} intensity={4}/>
	<S count={5e3} color={color}/>
</Canvas>);
}

export default ParticleBG