import DLH from "./DLH"
import DLN from "./DLN";
declare global{
	interface Set<T> {
		equals: (n: Set<T> | undefined)=>boolean
	}
}
Set.prototype.equals = function(n){
	if(!n || this.size !== n.size) return false;
	for(const d of this){
		if (!n.has(d)) return false;
	}
	return true;
}
export const toPuz = (solution: Set<number>): number[] => {
	const vals = new Array(81).fill(0);
	for(const n of solution){
		
		
		const v = n%9;
		const i = Math.floor(n/9);
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
	debug: boolean = false;
	cancelled: boolean = false;
	get size(){
		if(!this.root)  return 0;
		let n = 0;
		for(const r of this.root.right()) n += r.size;
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
	pickLargest(): DLH | undefined {
		if(!this.root) return undefined;
		let largest = this.root;
		for(const column of this.root.right()){
			if(column.size > largest.size){
				if(column.size === 1) return column;
				largest = column;
			}
		}
		return largest;
	}

	pickRandom(): DLH | undefined {
		if(!this.root) return undefined;
		const value = Math.floor(Math.random() * 324);
		let column = this.root
		for(let i = 0; i<value;i++){
			column = column.rightNode;
		}
		return column;
	}
	

	hasNodes(rows: Set<number>):Set<number>{
		if(!this.root) return new Set();
		const existing = new Set<number>();
		for(const column of this.root.right()){
			for(const node of column.down()){
				if(rows.has(node.value)) {
					existing.add(node.value);
					rows.delete(node.value);
				}
			}
		}
		return existing;
	}

	convertPuzzle(puzzle: number[]): DLN[] | undefined{
		if(puzzle.length !== 81) throw new Error("Sudoku puzzles must have 81 values");
		let rows = new Set(puzzle.flatMap((v,i)=>v>0 ? [i*9+(v-1)]:[]));
		const rowSize = rows.size;
		const existing = this.hasNodes(new Set(rows));
		if(existing.size !== rowSize) {
			console.log("missing nodes", existing.size, rows.size);
			return undefined;
		}

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

	
	solvePuzzle(puzzle: number[]): number[] | undefined {
		const nodes = this.convertPuzzle(puzzle);
		if(!nodes) return undefined;
		let solution: Set<number> | undefined | void = undefined;
		this.coverNodes(...nodes);
		solution = this.solve();
		this.uncoverNodes(...nodes);
		return solution ? toPuz(solution):undefined;
	}

	validPuzzle(puzzle: number[]): boolean | undefined{
		const nodes = this.convertPuzzle(puzzle);
		if(!nodes) return false;
		this.coverNodes(...nodes);
		const valid = this.valid();
		this.uncoverNodes(...nodes);
		return valid;
	}

	generate(rndVals: number, each:(partial: Set<number>)=>void, min?: number): Set<number> | undefined | void{
		console.log("Generating");
		const partialNodes = this.randPartial(rndVals);
		if(!partialNodes) throw new Error("Unable to make a possible puzzle with that many random values");
		this.coverNodes(...partialNodes);
		const solution = this.solveNodes()!; //i know a solution exists
		this.uncoverNodes(...partialNodes);
		//console.log("Solution", solution, partialNodes.length);
		const partial = this.partial([...partialNodes, ...solution], min, each);
		//console.log("Partial", partial?.size);
		
		//const partial = new Set(solution.map(p=>p.value));
		return partial
	}

	sortKeysByImpact(solution: DLN[]){
		const impacts = new Array(solution.length).fill(0);
		for(let i = 0; i<solution.length; i++){
			impacts[i] = solution[i].column.size;
		}
		return Array.from(solution.keys()).sort((a,b)=>impacts[b]-impacts[a]);
	}

	sortByImpact(solution: DLN[]){
		return this.sortKeysByImpact(solution).map(i=>solution[i]);
	}

	sortImpactfulKeys(master:DLN[], kys: Set<number>){
		const impacts: Record<number, number> = {};
		for(const i of kys){
			impacts[i] = master[i].size;
			
		}
		return Array.from(kys).sort((a,b)=>impacts[b]-impacts[a]);
	}
	/**
	 * Cover all and start attempting to pick a valid at 
	 * @param master 
	 * @param min 
	 * @returns 
	 */
	partial(master: DLN[], min: number = 17, each: (partial: Set<number>)=>void): Set<number> | undefined{
		/*
		1. Cover grid
		2. 
		*/
		let partial: Set<number> = new Set(master.map(m=>m.value));
		let part: Set<number> = new Set();
		const minifier = (values: Set<number>) => {
			if(partial.size === min) return;
			if(this.solution.size >= min){
				const valid = !!this.valid();
				if(valid) {
					partial = new Set(Array.from(part).map(p=>master[p].value));
					each(partial);
					return;
				}
			}
			
			const clone = new Set(values);
			const sortedKeys = this.sortImpactfulKeys(master, values);
			for(const i of sortedKeys){
				clone.delete(i);
				if(this.solution.size >= partial.size - 1) continue;
				const node = master[i];
				part.add(i);
				this.coverNodes(node);
				minifier(clone);
				this.uncoverNodes(node);
				part.delete(i);
			}
		}
		minifier(new Set(master.keys()));
		return partial;
	}
	min(solution: DLN[], m: number = 17, p: number=81): Set<number> | undefined | void{
		if(!solution.length || (p !== undefined && this.solution.size >= p-2)) return undefined;
		const sortedSolution = this.sortByImpact(solution);
		let partial: Set<number> | undefined | void = undefined;
		for(let i = 0; i<sortedSolution.length;i++){
			const node = sortedSolution[i];
			
			this.coverNodes(node);
			
			if(this.solution.size >= m){
				if(this.valid()){
					if(!partial || this.solution.size < partial.size){
						console.log("Found valid partial", this.solution.size);
						partial = new Set(this.solution);
						p = partial.size;
						//a better partial cannot be found in this iteration so might as well end
						break;
					}
				}
			}
			if(!partial || partial.size-1 > this.solution.size) {
				const part = this.min([...sortedSolution.slice(0, i),...sortedSolution.slice(i+1)], m, p);
				if(part && (!partial || part.size < partial.size)){
					console.log("found better", part.size, partial?.size, p);
					partial = part;
					p = part.size;
					
				} 
			}
			this.uncoverNodes(node);
			if(partial?.size === m) break;
		}
		return partial;
	}

	rand(length: number): DLN[] | undefined | void{
		const column = this.pickRandom();
		if(!column) return [];
		this.cover(column);
		let nodes: DLN[] | undefined | void = undefined;
		for(const down of column.down()){
			this.solution.add(down.value);
			this.coverRow(down);
			if(length == 0){
				nodes = this.solveNodes()
			} else {
				nodes = this.randPartial(length-1);
			}
			this.uncoverRow(down);
			this.solution.delete(down.value);
			if(nodes) {
				nodes.push(down);
				break;
			}
		}
		this.uncover(column);
		return nodes;
	}

	randPartial(length: number): DLN[] | undefined{
		if(!length){
			const valid = this.valid();
			console.log(valid ? "valid" : valid === undefined ? "unsolvable":"multiple values")
			return valid !== undefined ? []:undefined
		}
		const column = this.pickRandom();
		if(!column) return [];
		this.cover(column);
		let nodes: DLN[] | undefined = undefined;
		for(const down of column.down()){
			this.solution.add(down.value);
			this.coverRow(down);
			nodes = this.randPartial(length-1);
			this.uncoverRow(down);
			this.solution.delete(down.value);
			if(nodes) {
				nodes.push(down);
				break;
			}
		}
		this.uncover(column);
		return nodes;
	}

	solve(): Set<number> | undefined | void {
		
		//pick a column
		const column = this.pickColumn();
		if(!column) return new Set(this.solution);
		this.cover(column)
		let solution: Set<number> | undefined | void = undefined;
		for(const down of column.down()){
			this.solution.add(down.value);
			this.coverRow(down);
			solution = this.solve();
			this.uncoverRow(down);
			this.solution.delete(down.value);
			if(solution) break;
		}
		this.uncover(column);
		return solution;
	}

	solvable(): boolean {
		const column = this.pickColumn();
		if(!column) return true;
		this.cover(column);
		let solved:boolean = false;
		for(const down of column.down()){
			this.coverRow(down);
			solved = this.solvable();
			this.uncoverRow(down);
			if(solved) break;
		}
		this.uncover(column);
		return solved;
	}

	solveNodes(): DLN[] | undefined | void {
		//pick a column
		const column = this.pickColumn();
		if(!column) return [];
		this.cover(column)
		let solution: DLN[] | undefined | void = undefined;
		for(const down of column.down()){
			this.solution.add(down.value);
			this.coverRow(down);
			solution = this.solveNodes();
			this.uncoverRow(down);
			this.solution.delete(down.value);
			if(solution){
				solution.push(down);
				break;
			}
		}
		this.uncover(column);
		return solution;
	}

	minify(solution: DLN[]): Set<number> {
		let current: Set<number> = new Set();
		let partial: Set<number> | undefined = undefined;
		const minifier = (rem: DLN[]): void  => {
			rem.sort((a,b)=>a.size-b.size);
			let routes:[DLN, DLN[]][] = [];
			for(const node of rem) {
				this.coverNodes(node);
				const diffs = this.variants(solution);
				this.uncoverNodes(node);
				if(diffs.length == 0) {
					console.log("Found valid", current.size);
					partial = new Set([...current, node.value]);
					return;
				}
				routes.push([node, diffs]);
			}
			routes.sort((a,b)=>a[1].length - b[1].length);
			for(const [node, diffs] of routes){
				this.coverNodes(node);
				current.add(node.value);
				minifier(diffs);
				this.uncoverNodes(node);
				current.delete(node.value);
				if(partial) return;
			}

		}
		minifier([...solution]);
		console.log(partial!.size);
		return partial!;
	}
	variants(solution: DLN[]): DLN[]{
		let diffs: DLN[] = [];
		for(const node of solution) {
			if(!node.column.isConnected) continue;
			this.cover(node.column);
			let solvable = false;
			for(const down of node.downNodes()){ //skipping this node 
				this.coverRow(down);
				solvable = this.solvable();
				this.uncoverRow(down);
				if(solvable) break;
			}
			this.uncover(node.column);
			if(solvable) diffs.push(node);
		}
		return diffs;
	}
	/**
	 * Either it returns a solution. false if multiple solutions were found and undefined if no solutions were found.
	 */
	valid(solution?: Set<number> | false): boolean | undefined {
		const column = this.pickColumn();
		if(solution === false) return false; //just in case
		if(!column) return solution ? this.solution.equals(solution) ? true:false:true;
		this.cover(column);
		for(const down of column.down()){
			this.solution.add(down.value);
			this.coverRow(down);
			const v = this.valid(solution);
			this.uncoverRow(down);
			if(v && !solution){
				solution = new Set(this.solution);
			}
			this.solution.delete(down.value);
			if(v === false) {
				solution = false;
				break;
			}
		}
		this.uncover(column);
		if(solution === false) return false;
		return solution ? true:undefined;
	}



	disconnect(column: DLH) {
		//if(!column.root) return false;
		if(column === this.root){
			this.root = column.rightNode === column ? undefined:column.rightNode;
		}
		column.disconnect();
	}

	reconnect(column: DLH) {
		column.reconnect();
		if(!this.root || column.value < this.root.value) this.root = column;
	}

	coverNodes(...nodes: DLN[]){
		let covered = true;
		for(const node of nodes){
			this.solution.add(node.value);
			for(const r of node.right()) this.cover(r.column);
		}
		return covered;
	}

	uncoverNodes(...nodes: DLN[]){
		for(const node of nodes.reverse()){
			this.solution.delete(node.value);
			for(const l of node.left()) this.uncover(l.column);
		}
	}
	coverRow(row: DLN){
		for(const r of row.rightNodes()) this.cover(r.column)
	}

	uncoverRow(row: DLN){
		for(const l of row.leftNodes()){
			this.uncover(l.column);
		}
	}

	cover(column: DLH){
		this.disconnect(column);
		for(const d of column.down()){
			for(const r of d.rightNodes()){
				if(this.debug) console.log("Disconnecting");
				r.disconnect();
			}
		}
	}

	

	uncover(column: DLH){
		for(const u of column.up()){
			for(const l of u.leftNodes()){
				l.reconnect();
			}
		}
		this.reconnect(column);
		if(!this.root || column.value < this.root.value) this.root = column;
	}
}