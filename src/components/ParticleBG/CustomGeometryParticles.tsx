import { useFrame } from "@react-three/fiber";
import { FC, useMemo, useRef } from "react";
import { MathUtils, Points } from "three";
type CustomGeometryParticlesProps = {
	count?: number,
}
const CustomGeometryParticles: FC<CustomGeometryParticlesProps> = ({count=2000}) => {
	const particlesPosition = useMemo(()=>{
		const positions = new Float32Array(count * 3);
		const d = 1;
		for(let i = 0; i < count; i++) {
			const t = MathUtils.randFloatSpread(360);
			const p = MathUtils.randFloatSpread(360);
			positions.set([
				d*Math.sin(t)*Math.cos(p),
				d*Math.sin(t)*Math.sin(p),
				d*Math.cos(t)
			], i*3);
		}
		return positions
	}, [count]);
	const ref = useRef<Points | null>(null);

	useFrame(state=>{
		const { clock } = state;
    
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;


      ref.current!.geometry.attributes.position.array[i3] += Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
      ref.current!.geometry.attributes.position.array[i3 + 1] += Math.cos(clock.elapsedTime + Math.random() * 10) * 0.01;
      ref.current!.geometry.attributes.position.array[i3 + 2] += Math.sin(clock.elapsedTime + Math.random() * 10) * 0.01;
    }

    ref.current!.geometry.attributes.position.needsUpdate = true;
	});
	return (<points ref={ref}>
		<bufferGeometry>
			<bufferAttribute {...{
				attach: 'attributes-position',
				count: particlesPosition.length / 3,
				array: particlesPosition,
				itemSize: 3
			}}/>
		</bufferGeometry>
		<pointsMaterial {...{
			size: 0.015,
			color: 'rgba(28,128,248,1)',
			sizeAttenuation: true,
			depthWrite: false
		}}/>
	</points>);
};

export default CustomGeometryParticles;