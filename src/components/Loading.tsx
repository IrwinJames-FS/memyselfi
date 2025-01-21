'use client';
import { Glyph, D } from "@irwinproject/shapley"
import { useEffect, useMemo, useRef, useState } from "react"

interface LoadingProp{
	width?: string
	height?: string
	color?: string
	strokeWidth?: number
	speed?: number
	start?: number
	end?: number
}
const Loading = ({width="2em", height="2em", strokeWidth=0.1, speed=0.1, start=0, end=8, color}:LoadingProp) => {
	const [sides, setSides] = useState(start);
	const dir = useRef(-1);
	const rotation = useRef(0);
	const d = useMemo(()=>''+D.polygon(sides, {radius: 1, rotation:rotation.current, connectAll:true}), [sides])
	useEffect(()=>{
		let frame = -1;
		let lastUpdate = 0
		
		const draw = (time:number)=>{
			
			if((time-lastUpdate) < 32) return frame = requestAnimationFrame(draw);
			
			lastUpdate = time;
			rotation.current = rotation.current+0.5
			setSides(s=>Math.min(Math.max(s+(speed*dir.current), start), end));
			return frame = requestAnimationFrame(draw)
		}
		requestAnimationFrame(draw);
		return ()=>cancelAnimationFrame(frame);
	}, [speed, start, end]);
	useEffect(()=>{
		if(sides === start || sides === end) {
			dir.current *= -1;
		}
	}, [sides, start, end]);
	return <Glyph viewBox="-1.25 -1.25 2.5 2.5" d={d} stroke={color ?? "currentColor"} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" fill={color} width={width} height={height} svgProps={{preserveAspectRatio: "none"}}/>
}

export default Loading