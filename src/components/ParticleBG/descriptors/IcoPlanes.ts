import { ShapeDescriptor } from "./types";
import { p } from './constants';

const a = 0.7235;
const b = p*a; //scale phi
export const IcoPlanes: ShapeDescriptor = [
	[
		 0,-b,-a, //0
		 0,-b, a, //1
		 0, b,-a, //2
		 0, b, a, //3
		-b,-a, 0, //4
		 b,-a, 0, //5
		-b, a, 0, //6
		 b, a, 0, //7
		-a, 0,-b, //8
		 a, 0,-b, //9
		-a, 0, b, //10
		 a, 0, b, //11
	],
	[
		0,1,3,
		0,3,2,
		4,5,7,
		4,7,6,
		8,9,11,
		8,11,10,
	]
]