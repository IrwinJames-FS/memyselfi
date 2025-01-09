import { ShapeDescriptor } from "./types";
import { p } from './constants';
export const OctahedronDescriptor: ShapeDescriptor = [
	[
		 0, p, 0, //0
		 0,-p, 0, //1
		 0, 0, p, //2
		 0, 0,-p, //3
		-p, 0, 0, //4
		 p, 0, 0, //5
	],
	[
		0,2,4,
		0,2,5,
		0,3,4,
		0,3,5,
		1,2,4,
		1,2,5,
		1,3,4,
		1,3,5
	]
]