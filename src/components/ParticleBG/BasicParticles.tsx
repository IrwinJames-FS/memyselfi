import { useRef } from "react"
import _ from "@react-three/fiber";
import { Points } from "three";

const BasicParticles = () => {
	const points = useRef<Points | null>(null);
	return <points ref={points}>
		<sphereGeometry args={[1, 48, 48]}/>
		<pointsMaterial color="rgba(28,128,248, 1)" size={0.015} sizeAttenuation/>
	</points>
};

export default BasicParticles;