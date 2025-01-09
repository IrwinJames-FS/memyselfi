import { Point } from "./descriptors/types";

export const geopart = (vertices: number[], indices: number[], r: number) => {
	const total = indices.length/3
	const points = new Float32Array(total*r*3)
	for(let i = 0; i<indices.length; i+= 3){
		const a = snagPoint(vertices, indices[i]);
		const b = snagPoint(vertices, indices[i+1]);
		const c = snagPoint(vertices, indices[i+2])
		points.set(pickRandomPoints(a,b,c,r), i*r);
	}
	return points;
}

const snagPoint = (list:number[], i: number):Point => [
	list[i*3],
	list[i*3+1],
	list[i*3+2]
]

const pickRandomPoints = (a:Point, b: Point, c:Point, r:number):number[] => {
	
	const points: number[] = [];
	for(let i = 0; i<r; i++){
		const r1 = Math.random();
		const r2 = Math.random();
		const t1 = a.map(coord=>(1-Math.sqrt(r1)) * coord);
		const t2 = b.map(coord => Math.sqrt(r1) * (1-r2) * coord);
		const t3 = c.map(coord => Math.sqrt(r1) * r2 * coord);
		points.push(...t1.map((coord,i)=>coord + t2[i] + t3[i]));
	}
	return points;
}
/*
const pickRandomPoints = ([x1, y1, z1]:Point, [x2, y2, z2]: Point, [x3, y3, z3]:Point, r:number):number[] => {
	const points: number[] = [];
	const cp: Point = [
		(y2-y1) * (z3-z1) - (z2-z1) * (y3-y1),
		(z2-z1) * (x3-x1) - (x2-x1) * (x3-x1),
		(x2-x1) * (y3-y1) - (y2-y1) * (x3-x1)
	];
	const epsilon = 0.000001;
	if(Math.abs(cp[0]) < epsilon && Math.abs(cp[1]) < epsilon && Math.abs(cp[2]) < epsilon){
		for(let i = 0; i<r; i++){
			const minX = Math.min(x1, x2, x3);
			const maxX = Math.max(x1, x2, x3);
			const minY = Math.min(y1, y2, y3);
			const maxY = Math.max(y1, y2, y3);
			const minZ = Math.min(z1, z2, z3);
			const maxZ = Math.max(z1, z2, z3);
			points.push(
				Math.random() * (maxX-minX) + minX,
				Math.random() * (maxY - minY) + minY,
				Math.random() * (maxZ - minZ) + minZ);
		}
	} else {
		for(let i = 0; i<r; i++){

			const r1 = (Math.random() - 0.5)
			const r2 = (Math.random() - 0.5)
			points.push(
				x1 + r1 * (x2 - x1) + r2 * (x3 - x1),
				y1 + r1 * (y2 - y1) + r2 * (y3 - y1),
				z1 + r1 * (z2 - z1) + r2 * (x3 - x1)
			)
		}
	}

	
	return points;
}*/