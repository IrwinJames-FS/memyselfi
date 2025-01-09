import { ShapeDescriptor } from "./types";
import { p } from "./constants";
export const CubeDescriptor: ShapeDescriptor = [
	[
		-p, p, p,
		 p, p, p,
		 p,-p, p,
		-p,-p, p,
		-p, p,-p,
		 p, p,-p,
		 p,-p,-p,
		-p,-p,-p
	],
	[
		0,1,2,
		0,2,3,
		0,4,5,
		0,5,1,
		0,7,4,
		0,7,3,
		6,5,4,
		6,7,4,
		6,2,3,
		6,7,3,
		6,2,1,
		6,1,5
	]
]