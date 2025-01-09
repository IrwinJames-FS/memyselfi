import { useFrame } from "@react-three/fiber";
import { FC, useEffect, useMemo, useRef } from "react";
import { Points, Vector4 } from "three";
import { geopart } from "./geopart";
import { CubeDescriptor } from "./descriptors";
import fragmentShader from './particleFragmentShader.glsl';
import vertexShader from './particleVertexShader.glsl';
import { ShapeDescriptor } from "./descriptors/types";
import { ParticleShapesProps } from "./types";

const ParticleShapes: FC<ParticleShapesProps> = ({count = 20, descriptor=CubeDescriptor, color=new Vector4(28/255,128/255,248/255, 1.0)}) => {
	const particlesPosition = useMemo(()=>geopart(...descriptor, count), [count, descriptor]);
	const ref = useRef<Points | null>(null);
	const ct = useMemo(()=>particlesPosition.length/3, [particlesPosition]);
	const uniforms = useMemo(()=>({
		uTime:{value: 0.0},
		uColor:{value: color}
	}), [color]);
	useFrame(state=>{
		const { clock } = state;
		//@ts-ignore
		ref.current!.material.uniforms.uTime.value = clock.elapsedTime;
		ref.current!.rotation.y += 0.001;
	});
	
	return (<points ref={ref}>
		<bufferGeometry>
			<bufferAttribute {...{
				attach: 'attributes-position',
				count: ct,
				array: particlesPosition,
				itemSize: 3
			}}/>
		</bufferGeometry>
		<shaderMaterial {...{
			depthWrite: false,
			fragmentShader,
			vertexShader,
			uniforms
		}}/>
	</points>);
};

export default ParticleShapes;