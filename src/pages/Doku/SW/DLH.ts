import DLN from "./DLN";
import Node from "./Node";

export default class DLH extends Node {
	root?: DLN
	size: number = 0
	constructor(column: number){
		super(column);
	}

	get isConnected(){
		return this.leftNode.rightNode === this;
	}

	disconnect(){
		this.leftNode.rightNode = this.rightNode;
		this.rightNode.leftNode = this.leftNode;
	}

	reconnect(){
		this.leftNode.rightNode = this;
		this.rightNode.leftNode = this;
	}

	*down(){
		if(!this.root) return;
		yield* this.root.down();
	}

	*up(){
		if(!this.root) return;
		yield* this.root.up()
	}

	*upNodes(){
		if(!this.root) return;
		yield* this.root.upNodes();
	}

	*downNodes(){
		if(!this.root) return;
		yield* this.root.downNodes();
	}
}