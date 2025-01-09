import { ShapeDescriptor } from "./types";
import { p } from './constants';
export const TetrahedronDescriptor: ShapeDescriptor = [
	[
		-p, p, 0,
		 p, p, 0,
		 0,-p, p,
		 0,-p,-p
	],
	[
		0,1,2,
		0,2,3,
		0,1,3,
		1,2,3
	]
]