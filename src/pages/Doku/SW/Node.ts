export default class Node {
	value: number
	leftNode: this
	rightNode: this

	constructor(value: number){
		this.value = value;
		this.leftNode = this;
		this.rightNode = this;
	}

	*right(){
		yield* walk(this, n=>n.rightNode);
	}

	*left(){
		yield* walk(this.leftNode, n=>n.leftNode);
	}

	*rightNodes(){
		yield* walkNodes(this, n=>n.rightNode);
	}

	*leftNodes(){
		yield* walkNodes(this, n=>n.leftNode);
	}
}

export function* walk<T extends Node>(node: T, token: (n:T)=>T | undefined){
	let nd: T | undefined = node;
	while (nd){
		const next = token(nd);
		yield nd;
		nd = (next === node || next === nd) ? undefined:next;
	}
}

export function* walkNodes<T extends Node>(node: T, token: (n:T)=>T | undefined){
	let nd: T | undefined = token(node);
	while (nd){
		const next = token(nd);
		yield nd;
		nd = (next === node || next === nd) ? undefined:next;
	}
}