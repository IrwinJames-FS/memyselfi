import { Alert, Box, Button, FormControlLabel, List, ListItem, Menu, Paper, Stack, Switch, TextField, Toolbar, Typography } from "@mui/material";
import { Layout } from "../../components"
import DokuBoard from "./DokuBoard";
import { ChangeEvent, ChangeEventHandler, KeyboardEvent, KeyboardEventHandler, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Htn from "../../components/Htn";
import { ArrowBack, ArrowDownward, ArrowForward, ArrowLeft, ArrowUpward, LeakAddSharp } from "@mui/icons-material";
import { HexagonLayout, ShapeGrid, ShapeGridCell } from "@irwinproject/shapley";
import DW from "./DW";
import Loading from "../../components/Loading";

const ROWS: Set<number>[] = [];
const COLUMNS: Set<number>[] = [];
const BOXS: Set<number>[] = [];
const MAPS: {row:number, column:number, box: number}[] = []
for(let i = 0; i<9; i++){
	ROWS.push(new Set());
	COLUMNS.push(new Set());
	BOXS.push(new Set());
}

for(let i = 0; i<81; i++){
	const row = Math.floor(i/9);
	const column = i%9;
	const box = (Math.floor(row/3)*3)+Math.floor(column/3);

	ROWS[row].add(i);
	COLUMNS[column].add(i);
	BOXS[box].add(i);

	MAPS.push({row, column, box});
}

const dw = new DW();

export default function Doku(){
	//const solution = dlx.solve();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [generatorId, setGenerating] = useState<number>(-1);
	const isGenerating = useMemo(()=>!!~generatorId, [generatorId]);
	const [puzzle, setPuzzle] = useState<number[]>(new Array(81).fill(0));
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [locked, setLocked] = useState<Set<number> | undefined>();
	const [{isValid, possibleValues}, setIsValid] = useState<{isValid:undefined | boolean, possibleValues:Set<number>[]}>({isValid:false, possibleValues:[]});
	const [swappingEl, setSwapping] = useState<HTMLElement | null>(null);
	const isSwapping = useMemo(()=>!!swappingEl, [swappingEl]);
	const relatives = useMemo(()=>{
		if(!~selectedIndex) return new Set<number>();
		const {row, column, box} = MAPS[selectedIndex];
		return new Set([...ROWS[row], ...COLUMNS[column], ...BOXS[box]]);
	}, [selectedIndex])

	const onChange = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		const val = e.key === "Backspace" ? 0:parseFloat(e.key);
		if(!isNaN(val)) setPuzzle(s=>[...s.slice(0, index),val, ...s.slice(index+1)]);
	};

	const getRandomPuzzle = async () => {
		setLoading(true);
		
		setIsValid(({isValid: false, possibleValues: []}));
		const {data: {puzzle}} = await dw.post(3, []);
		setLocked(new Set<number>(Array.from((puzzle as number[]).keys()).filter(i=>puzzle[i]>0)))
		setPuzzle(puzzle);
		setLoading(false);
		
	}

	const solvePuzzle = async () => {
		setLoading(true);
		const {data:{solution}}= await dw.post(0, puzzle);
		setLoading(false);
		if(!solution){
			return;
		}
		setPuzzle(solution)
	}

	const checkValid = async (puzzle: number[]) => {
		const {data: {isValid, possibleValues}} = await dw.post(1, puzzle);
		if(!possibleValues) {
			return;
		}
		//console.log(isValid, possibleValues);
		setIsValid({isValid, possibleValues});
	}

	const generate = async () => {
		console.log(puzzle);
		const data = await dw.poll(2, {puzzle}, ({data:{puzzle}})=>{
			setPuzzle(puzzle)
		}, ({data:{puzzle}})=>{
			if(puzzle) setPuzzle(puzzle);
			setGenerating(-1);
		} );
		setGenerating(data);
	}
	const cancelGeneration = () => {
		if(!generatorId) return;
		dw.cancel(generatorId);
		setLocked(new Set(Array.from(puzzle.keys()).filter(i=>puzzle[i])));
		checkValid(puzzle)
		setGenerating(-1);
	}
	const onSelect = (index: number) => {
		setSelectedIndex(index);
	}

	const shiftRight = ()=>{
		const puz = new Array(81).fill(0);
		const lk = new Set<number>();
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				if(locked?.has(y*9+x)) lk.add(y*9+((x+3)%9));
				puz[y*9+((x+3)%9)] = puzzle[y*9+x];
			}
		}
		setLocked(lk.size ? lk : undefined);
		setPuzzle(puz);
	}

	const shiftLeft = ()=>{
		const puz = new Array(81).fill(0);
		const lk = new Set<number>();
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				if(locked?.has(y*9+x)) lk.add(y*9+((x+6)%9));
				puz[y*9+((x+6)%9)] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}
		setLocked(lk.size ? lk:undefined);
		setPuzzle(puz);
	}

	const shiftDown = ()=>{
		const puz = new Array(81).fill(0);
		const lk = new Set<number>();
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				if(locked?.has(y*9+x)) lk.add(((y+3)%9)*9+x);
				puz[((y+3)%9)*9+x] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}
		setLocked(lk.size ? lk : undefined);
		setPuzzle(puz);
	}

	const shiftUp = ()=>{
		const puz = new Array(81).fill(0);
		const lk = new Set<number>();
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				if(locked?.has(y*9+x)) lk.add(((y+6)%9)*9+x);
				puz[((y+6)%9)*9+x] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}

		setLocked(lk.size ? lk : undefined);
		setPuzzle(puz);
	}

	const clear = () => {
		setPuzzle(new Array(81).fill(0));
		setLocked(new Set());
	}

	const reset = () => setPuzzle(p=>p.map((p,i)=>locked?.has(i) ? p:0))

	const toggleLock = useCallback(() => {
		setLocked(l=>l ? undefined:new Set(Array.from(puzzle.keys()).filter(i=>puzzle[i])));
	}, [puzzle]);

	const printPuzzle = useCallback(()=>{
		const board = document.getElementById("doku-board")!;
		const iframe = document.createElement('iframe');
		//iframe.style.display = 'none';
		document.body.appendChild(iframe);
		const prow = (r: number) => {
			const i = r*9
			return `<tr>${puzzle.slice(i,i+9).map(v=>`<td>${v || ' '}</td>`).join('')}</tr>`;
		}
		iframe.contentWindow?.document.write(`<html>
	<head>
		<style>
			#doku-board{
				width: 90vw;
				border-collapse: collapse;
				margin: 0 auto;
			}
			#doku-board td{
				display: 'inline-block';
				border: 1px solid #000;
				text-align: center;
				width:calc(90vw / 9);
				height: calc(90vw / 9);
				aspect-ratio: 1 / 1;
				font-weight: bold;
				font-size: 2rem;
				-webkit-print-color-adjust: exact;
  				print-color-adjust: exact;
			}
			#doku-board tr td:nth-of-type(3n+3):not(:nth-of-type(9)){
				border-right-width: 3px;
			}
			#doku-board tr:nth-of-type(3n+3):not(:nth-of-type(9)) td {
				border-bottom-width: 3px;
			}
			#doku-board tr:nth-of-type(even) td:nth-of-type(odd) {
				background-color:#EEE;
			}
			#doku-board tr:nth-of-type(odd) td:nth-of-type(even) {
				background-color:#EEE;
			}
		</style>
	</head>
	<body>
		<table id="doku-board">
			<tbody>
				${prow(0)}
				${prow(1)}
				${prow(2)}
				${prow(3)}
				${prow(4)}
				${prow(5)}
				${prow(6)}
				${prow(7)}
				${prow(8)}
			</tbody>
		</table>
	</body>
</html>`);
		iframe.contentWindow?.print();
		document.body.removeChild(iframe);
	}, [puzzle]);

	const valueSwap = (vals: number[]) => {
		const puz = new Array(81).fill(0);
		for(let i = 0; i<81;i++){
			if(!puzzle[i]) continue;
			else puz[i] = vals[puzzle[i]-1]
		}
		setPuzzle(puz);
		setSwapping(null);
	}

	useEffect(()=>{
		if(!isGenerating) checkValid(puzzle);
	}, [puzzle]);

	
	return (<Layout>
		<Stack justifyContent="flex-start" alignItems="center" gap="1rem" sx={{my:"5rem"}}>
			<Paper sx={{ display: "inline-block"}}>
				{!isGenerating && !isLoading && isValid === false && <Alert severity="warning">Puzzle has multiple solutions</Alert>}
				{!isGenerating && !isLoading && isValid === undefined && <Alert severity="error">Puzzle is not solvable</Alert>}
				{!isGenerating && !isLoading && isValid && <Alert severity="success">{puzzle.filter(p=>p).length === 81 ? "Puzzle is solved":"Puzzle only has one solution"}</Alert>}
				{(isGenerating || isLoading) && <Alert severity="info">Generating puzzle.</Alert>}
				<Stack alignItems={{xs:"center",md:"flex-start"}} direction={{xs: "column", md:"row"}}>
					{isLoading ? <Loading {...{width: "200px", height: "200px", end: 11, strokeWidth: 0.05}}/>:<DokuBoard {...{
						puzzle, onChange, onSelect, relatives, selectedIndex, locked: locked ?? new Set(), possibleValues, showPossibles: !isGenerating
					}}/>}
					
					<Stack direction="column" justifyContent="space-between" gap="1rem">
						{isGenerating && <Stack direction="row">
							<Loading width="3.5rem" height="3.5rem"/>
							<Alert severity="info">{puzzle.filter(d=>d>0).length} values provided.</Alert>
							<Htn onClick={cancelGeneration} sx={{bgcolor:'error.main', color:'error.contrastText'}}>Stop</Htn>
						</Stack>}
						
						<Stack gap="0.5rem">
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={clear}>Clear</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={reset}>Reset</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={toggleLock}>{locked ? "Unlock":"Lock"}</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={getRandomPuzzle}>Get Random Puzzle</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={solvePuzzle}>Solve Puzzle</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={generate}>Find Smallest</Button>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={e=>setSwapping(e.currentTarget)}>Value Swap</Button>
							<Menu anchorEl={swappingEl} open={isSwapping} onClose={()=>setSwapping(null)}>
								<Typography variant="h6">Swap values</Typography>
								<Swapper onSwap={valueSwap}/>
							</Menu>
							<Button variant="contained" disabled={isGenerating || isLoading} onClick={printPuzzle}>Print</Button>
							
						</Stack>
						<Stack>
							<ShapeGrid {...{
								cellColumns: 'repeat(3, 1fr 2fr) 1fr',
								cellSize: [3,2],
								layoutFn: HexagonLayout(3, 'hexagon', false, true)
							}}>
								<ShapeGridCell>
									<Htn disabled={isGenerating || isLoading} onClick={shiftUp}><ArrowUpward/></Htn>
								</ShapeGridCell>
								<ShapeGridCell>
									<Htn disabled={isGenerating || isLoading} onClick={shiftLeft}><ArrowBack/></Htn>
								</ShapeGridCell>
								<ShapeGridCell>
									<Htn disabled={isGenerating || isLoading} onClick={shiftRight}><ArrowForward/></Htn>
								</ShapeGridCell>
								<ShapeGridCell>
									<Htn disabled={isGenerating || isLoading} onClick={shiftDown}><ArrowDownward/></Htn>
								</ShapeGridCell>
							</ShapeGrid>
						</Stack>
					</Stack>
				</Stack>
			</Paper>
			<Paper sx={{alignSelf:'stretch', margin: '2rem', padding: '2rem', '.MuiTypography-root': {
				mb: '1rem'
			}}}>
				<Typography variant="h3">Doku Tools</Typography>
				<Typography>Doku is a small toolkit to solve, validate and generate sudoku puzzles. My father-in-law loves sudoku, spending hours making his own puzzles and variations of the game. I noticed that his puzzles sometimes had more than one solution and decided to build him a tool to simply check if a puzzle has a singular solution. During the development process I became fascinated with the idea of programmatically generating a sudoku puzzle. The concept is simple, but the implementation becomes very complex.</Typography>
				<Typography>Trying to efficiently pick the least number of values to provide while ensuring only one solution is viable can be tricky. Ultimately, I don’t think it is feasible to check every combination until a known smallest partial is found I have provided an implementation you can try if you like… you will be here a while. Instead, I have found using heuristics I can generate a difficult puzzle in a short period of time by returning the first partial discovered. I do plan on building on this concept further. It is my belief that I can further improve the generation problem in a couple ways. First, instead of selecting a node based on its size or impact to the grid but rather its impact on its respective rules. Further optimization can be achieved by only searching the first have of the nodes in each iteration and picking nodes by symmetrical pairs. </Typography>
				<Typography>In the above example you can see the current result of my heuristic-based generator by clicking the “Get Random Puzzle” button. The above board can be used to play a sudoku game if you like however is geared toward authoring sudoku boards. Each value placed will check if the puzzle has an error or if the puzzle has multiple solutions and update the possible values for each cell.</Typography>
				<Typography>To avoid blocking the main context (which handles the background animation and UI interface Doku has been built in zig and compile to wasm which is loaded into a WebWorker. WebWorkers like having access to another thread. Workers are also cancellable. Using JavaScript, the DLX memory heap is not fixed in fact it grows quite a bit while its running. This is due to JavaScript’s referencing system duplicating or moving object references as the object changes. Using zig, a fixed exact cover grid can be declared in memory and mutated in place. This results in each iteration essentially storing an additional 4 bytes necessary to backtrack.</Typography>

			</Paper>
		</Stack>
	</Layout>)
}

interface Handler {
	value: string,
	inputRef: RefObject<HTMLInputElement>,
	error: boolean,
	onChange: ChangeEventHandler<HTMLInputElement>,
	onKeyDown: KeyboardEventHandler<HTMLInputElement>
}

interface SwapperProps {
	onSwap: (val: number[]) => void
}
function Swapper(props:SwapperProps){
	const [errs, setErrs] = useState<boolean[]>(new Array(9).fill(false));
	const hasErrs = useMemo(()=>!!errs.find(d=>d), [errs]);
	const [values, setValues] = useState<number[]>([1,2,3,4,5,6,7,8,9]);
	const [focus, setFocus] = useState<number>(0);
	const refs = [
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
		useRef<HTMLInputElement>(null),
	]
	const next = (e: Event,index: number) => {
		setFocus((index+1)%9);
		e.stopPropagation();
		e.preventDefault();
	}
	const handler = (index: number):Handler => ({
		value: values[index] ? ''+values[index]:'',
		inputRef:refs[index],
		error:errs[index],
		onKeyDown: e=>{
			console.log(e);
			if(e.metaKey) return;
			if(e.key == "Backspace"){
				return setValues(v=>{
					v[index] = 0;
					return [...v];
				})
			} 
			if(e.key == "Tab" ) {
				return next(e as unknown as Event, index);
			}
			if(isNum(e.key)){
				const k = parseInt(e.key);
				setValues(v=>{
					v[index] = k;
					return [...v];
				})
				return 
			} 
			e.preventDefault();
			e.stopPropagation();
		},
		onChange: e=>{
			const errs = new Array(9).fill(false);
			const st = new Set<number>();
			for(let i = 0; i<9; i++){
				if(!values[i]) {
					errs[i] = true;
				} else if(st.has(values[i])) errs[i] = true; //duplicate swap
				else st.add(values[i]);
			}
			setErrs(errs);
			next(e as unknown as Event, index);
		}
	});
	
	useEffect(()=>{
		console.log("Shifting", focus, refs[focus].current?.focus());
		refs[focus].current?.focus();
	}, [focus])
	return (<Stack component="form" gap={1} sx={{
		'.MuiInputBase-root': {
			width: '4rem',
			height: '4rem',
			'input':{
				textAlign: 'center'
			}
		}
	}}>
		<Stack direction="row" gap={1}>
			<TextField label="1" {...handler(0)}/>
			<TextField label="2" {...handler(1)}/>
			<TextField label="3" {...handler(2)}/>
		</Stack>
		<Stack direction="row" gap={1}>
			<TextField label="4" {...handler(3)}/>
			<TextField label="5" {...handler(4)}/>
			<TextField label="6" {...handler(5)}/>
		</Stack>
		<Stack direction="row" gap={1}>
			<TextField label="7" {...handler(6)}/>
			<TextField label="8" {...handler(7)}/>
			<TextField label="9" {...handler(8)}/>
		</Stack>
		<Stack>
			<Button variant="contained" disabled={hasErrs} onClick={()=>props.onSwap(values)}>Swap</Button>
		</Stack>
	</Stack>)
}
const isNum = (val: string) => {
	const v = parseInt(val);
	return v > 0 && v < 10;
}

interface SudokuApiResult{
	newboard: {
		grids: {
			difficulty: string,
			solution: number[][],
			value: number[][]
		}[]
	}
}

