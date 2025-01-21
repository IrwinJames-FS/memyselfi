import DLX from "./DLX"
interface WorkerMessage{
	data: {
		id: number
		cmd: number,
		puzzle: number[]
		solution?: number[]
	}
}
const enforceValidity = (dlx: DLX, puz: number[], solution: number[]) => {
	if(!solution.length) return puz;
	const valid = dlx.validPuzzle(puz);
	if(valid) return puz;
	let minSize = 2916;
	let minIndex = -1;
	for(let i = 0; i<81; i++){
		if(puz[i] === 0){
			puz[i] = solution[i];
			const nodes = dlx.convertPuzzle(puz);
			dlx.coverRows(nodes);
			const v = dlx.valid();
			const size = dlx.size;
			dlx.uncoverRows(nodes);
			if(v) return puz;
			puz[i] = 0;
			
			if(size < minSize){
				minSize = size;
				minIndex = i;
			}
		}
	}
	puz[minIndex] = solution[minIndex];
	return enforceValidity(dlx, puz, solution);
}

const solve = (dlx: DLX, puzzle: number[])=>{
	const solution = dlx.solvePuzzle(puzzle);
	return solution;
}

const checkValidity = (dlx: DLX, puzzle: number[]) => {
	const nodes = dlx.convertPuzzle(puzzle);
	dlx.coverRows(nodes);
	const valid = dlx.valid();
	const possibles = dlx.hasNodes(new Set(new Array(729).fill(0).keys()));
	console.log(possibles);
	const possibleValues: Set<number>[] = new Array(81);
	for(let i = 0; i<81; i++){
		possibleValues[i] = new Set();
		if(puzzle[i]) continue;
		const startingRow = i*9;
		
		for(let j = 0; j<9; j++){
			const r = startingRow+j;
			if(possibles.has(r)) possibleValues[i].add(j+1);
		}
	}
	dlx.uncoverRows(nodes);
	return {isValid: valid ? true:valid, possibleValues};
}
self.onmessage = ({data: {id, cmd, puzzle, solution}}: WorkerMessage) => {
	const dlx = new DLX();
	switch (cmd) {
		case 0: return self.postMessage({id, solution: solve(dlx, puzzle)})
		case 1: return self.postMessage({id, puzzle:enforceValidity(dlx, puzzle, solution ?? new Array(81).fill(0))})
		case 2: return self.postMessage({id, ...checkValidity(dlx, puzzle)});
	}
}