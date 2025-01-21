import DLH from "./DLH"
import DLN from "./DLN";
declare global{
	interface Set<T> {
		equals: (n: Set<T>)=>boolean
	}
}
Set.prototype.equals = function(n){
	if(this.size !== n.size) return false;
	return Array.from(this).find(d=>!n.has(d)) === undefined;
}
const toPuz = (solution: Set<number>) => {
	const vals = new Array(81).fill(0);
	for(const n of solution){
		const i = Math.floor(n/9);
		const v = n%9;
		vals[i]=v+1;
	}
	return vals;
}
const toPuzString = (solution: Set<number>)=>{
	
	return toPuz(solution).join('');
}
/**
 * This will be built to work for sudoku only
 */
export default class DLX {
	root: DLH | undefined
	solution: Set<number> = new Set();
	get size(){
		if(!this.root)  return 0;
		let n = 0;
		for(const r of this.root.right()){
			for(const d of r.down()) n++;
		}
		return n;
	}
	constructor(){
		this.root = new DLH(0);
		const columns: DLH[] = [this.root];
		for(let i = 1;i<324;i++){
			const column = new DLH(i);
			column.rightNode = this.root;
			column.leftNode = this.root.leftNode;
			this.root.leftNode.rightNode = column;
			this.root.leftNode = column;
			columns.push(column);
		}

		//build the cover grid
		for(let i = 0; i<729; i++){
			//get all the associated columns.
			const v = i%9;
			const index = Math.floor(i/9);
			const r = Math.floor(index/9);
			const c = index%9;
			const b = (Math.floor(r/3)*3)+Math.floor(c/3);

			const allFilledNode = new DLN(i, columns[r*9+c]);
			const rowsUniqueNode = new DLN(i, columns[r*9+v+81]);
			const columnsUniqueNode = new DLN(i, columns[c*9+v+162]);
			const boxsUniqueNode = new DLN(i, columns[b*9+v+243]);
			
			allFilledNode.leftNode = boxsUniqueNode
			allFilledNode.rightNode = rowsUniqueNode;
			rowsUniqueNode.leftNode = allFilledNode;
			rowsUniqueNode.rightNode = columnsUniqueNode;
			columnsUniqueNode.leftNode = rowsUniqueNode;
			columnsUniqueNode.rightNode = boxsUniqueNode;
			boxsUniqueNode.leftNode = columnsUniqueNode;
			boxsUniqueNode.rightNode = allFilledNode;

			
		}
	}

	pickColumn(): DLH | undefined {
		if(!this.root) return undefined;
		let smallest = this.root;
		for(const column of this.root.right()){
			if(column.size < smallest.size){
				if(column.size === 1) return column;
				smallest = column;
			}
		}
		return smallest;
	}
	coverRows(rows: DLN[]){
		for(const n of rows){
			this.coverRow(n);
		}
	}

	uncoverRows(rows: DLN[]){
		for(const n of rows.reverse()){
			this.uncoverRow(n);
		}
	}

	hasNodes(rows: Set<number>){
		const missing = new Set(rows);
		if(!this.root) return new Set<number>();
		for(const r of this.root.right()){
			for(const d of r.down()){
				if(missing.has(d.value)){
					missing.delete(d.value);
				}
			}
		}
		return new Set(Array.from(rows).filter(n=>!missing.has(n)));
	}
	convertPuzzle(puzzle: number[]){
		if(puzzle.length !== 81) throw new Error("Sudoku puzzles must have 81 values");
		let rows = new Set(puzzle.flatMap((v,i)=>v>0 ? [i*9+(v-1)]:[]));
		const nodes: DLN[] = [];
		if(!this.root) return nodes;
		for(const r of this.root.right()){
			for(const d of r.down()){
				if(rows.has(d.value)){
					nodes.push(d);
					rows.delete(d.value);
				}
			}
		}
		return nodes;
	}

	coverRow(node: DLN){
		this.solution.add(node.value);
		for(const n of node.right()){
			this.disconnectColumn(n);
		}
	}

	uncoverRow(node: DLN){
		this.solution.delete(node.value);
		for(const n of node.leftNode.left()){
			this.reconnectColumn(n)
		}
	}

	disconnectColumn(node: DLN){
		node.column.disconnect();
		if(this.root === node.column) this.root = node.column.rightNode === node.column ? undefined:node.column.rightNode;
		for(const d of node.down()){
			if(d === node) continue;
			for(const r of d.right()){
				if(r === d) continue;
				r.disconnect();

			}
		}
	}

	reconnectColumn(node: DLN){
		for(const u of node.up()){
			if(u === node) continue; 
			for(const l of u.left()){
				if(l === u) continue;
				l.reconnect();
			}
		}
		node.column.reconnect()
		this.root = node.column;
	}
	

	solve(): Set<number> | undefined{
		const column = this.pickColumn()
		if(!column) return new Set(this.solution);
		for(const row of column.down()){
			this.coverRow(row);
			const solution = this.solve();
			this.uncoverRow(row);
			if(solution) return solution;
		}
	}

	valid(solution: Set<number> | undefined = undefined): Set<number> | undefined | false {
		const column = this.pickColumn();
		if(!column) {
			const sol = new Set(this.solution);
			const a = solution ? toPuz(solution):new Array(81).fill(0);
			const b = toPuz(sol);
			const diffs = new Set<number>();
			for(let i = 0; i<81;i++){
				if(a[i] !== b[i]) diffs.add(i);
			}
			return diffs.size === 0 ? undefined:sol;
		}
		
		let solved: Set<number> | undefined | false = solution;
		for(const row of column.down()){
			this.coverRow(row);
			const valid = this.valid(solved)
			this.uncoverRow(row);
			if(valid === false) return false
			else if (valid){
				if(solved && !valid?.equals(solved)) return false;
				solved = valid
			}
		}
		return solved;
	}

	validPuzzle(puzzle: number[]):boolean | undefined{
		const nodes = this.convertPuzzle(puzzle);
		this.coverRows(nodes);
		const validity = this.valid();
		this.uncoverRows(nodes);
		if(validity) return true;
		return validity;
	}

	solvePuzzle(puzzle: number[]):number[]|undefined{
		const nodes = this.convertPuzzle(puzzle);
		this.coverRows(nodes);
		const solution = this.solve();
		this.uncoverRows(nodes);
		
		if(solution){
			const puzzle = new Array(81).fill(0);
			for(const n of solution){
				const i = Math.floor(n/9);
				const v = n%9;
				puzzle[i] = v+1;
			}
			return puzzle;
		}
	}
}