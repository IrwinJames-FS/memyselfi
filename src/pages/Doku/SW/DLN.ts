import DLH from "./DLH";
import Node, { walk, walkNodes } from "./Node";

export default class DLN extends Node{
	topNode: this
	bottomNode: this
	column: DLH
	wasRoot: boolean = false;
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

	get size(){
		const s = new Set<number>();
		var sz = 0;
		for(const r of this.right()){
			sz += r.column.size;
			for(const d of r.downNodes()){
				s.add(d.value);
			}
		}
		return (sz*2) + (sz-s.size) + (this.column.size*3);
	}
	*up(){
		yield* walk(this.topNode, n=>n.topNode);
	}

	*down(){
		yield* walk(this, n=>n.bottomNode);
	}

	*upNodes(){
		yield* walkNodes(this, n=>n.topNode);
	}

	*downNodes(){
		yield* walkNodes(this, n=>n.bottomNode);
	}

	disconnect(){
		this.column.size--;
		this.topNode.bottomNode = this.bottomNode;
		this.bottomNode.topNode = this.topNode;
		if(this.column.root === this){
			this.column.root = this.bottomNode === this ? undefined:this.bottomNode;
		}
	}

	reconnect(){
		this.column.size++;
		this.topNode.bottomNode = this;
		this.bottomNode.topNode = this;
		if(!this.column.root) this.column.root = this;
	}
}