import DLH from "./DLH";
import Node, { walk } from "./Node";

export default class DLN extends Node{
	topNode: this
	bottomNode: this
	column: DLH

	constructor(row: number, column: DLH){
		super(row);
		
		this.column = column;
		this.column.size++;
		if(column.root){
			this.topNode = column.root.topNode as this;
			this.bottomNode = column.root as this;
			this.topNode.bottomNode = this;
			this.bottomNode.topNode = this;
		} else {
			column.root = this;
			this.topNode = this;
			this.bottomNode = this;
		}
	} 

	*up(){
		yield* walk(this, n=>n.topNode);
	}

	*down(){
		yield* walk(this, n=>n.bottomNode);
	}

	disconnect(){
		
		this.topNode.bottomNode = this.bottomNode;
		this.bottomNode.topNode = this.topNode;
		if(this.column.root === this){
			this.column.root = this.bottomNode === this ? undefined:this.bottomNode;
		}
	}

	reconnect(){
		this.topNode.bottomNode = this;
		this.bottomNode.topNode = this;
		if(!this.column.root) this.column.root = this;
	}
}