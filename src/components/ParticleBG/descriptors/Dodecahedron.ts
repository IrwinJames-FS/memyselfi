import { ShapeDescriptor } from "./types";
import { p } from './constants';
const a = 0.7235;
const b = p*a; //scale phi
const t = 1/p;

/*
The dodecahedron is a little more complicated.
while yes the points can be statically positioned like the rest the most difficult part is determining the center point of a dodecahedron
This is only necessary to ensure particle dispersment is uniform all the triangles in the geometry should be equal lateral

*/

console.log("theta", a, a*2)
export const DodecahedronDescriptor: ShapeDescriptor = [
	[
		//ico planes
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

		//widest points
		-t,-p, 0, //12
		 t,-p, 0, //13
		-t, p, 0, //14
		 t, p, 0, //15

		 0,-t,-p, //16
		 0,-t, p, //17
		 0, t,-p, //18
		 0, t, p, //19

		-p, 0,-t, //20
		 p, 0,-t, //21
		-p, 0, t, //22
		 p, 0, t, //23

		 //the square
		-1,-1,-1, //24
		 1,-1,-1, //25
		-1,-1, 1, //26
		 1,-1, 1, //27
		-1, 1,-1, //28
		 1, 1,-1, //29
		-1, 1, 1, //30
		 1, 1, 1, //31

	],
	[
		0,12,13,
		0,12,24,
		0,24,16,
		0,16,25,
		0,25,13,

		1,12,13,
		1,12,26,
		1,26,17,
		1,17,27,
		1,27,13,

		2,14,15,
		2,14,28,
		2,28,18,
		2,18,29,
		2,29,15,

		3,14,15,
		3,14,30,
		3,30,19,
		3,19,31,
		3,31,15,

		4,20,22,
		4,20,24,
		4,24,12,
		4,12,26,
		4,26,22,

		5,21,23,
		5,21,25,
		5,25,13,
		5,13,27,
		5,27,23,

		6,20,22,
		6,22,30,
		6,30,14,
		6,14,28,
		6,28,20,

		7,21,23,
		7,21,29,
		7,29,15,
		7,15,31,
		7,31,23,

		8,16,18,
		8,16,24,
		8,24,20,
		8,20,28,
		8,28,18,

		9,16,18,
		9,16,25,
		9,25,21,
		9,21,29,
		9,29,18,

		10,17,19,
		10,17,26,
		10,26,22,
		10,22,30,
		10,30,19,

		11,17,19,
		11,17,27,
		11,27,23,
		11,23,31,
		11,31,19
	]
]