import { Alert, Box, Button, Paper, Stack } from "@mui/material";
import { Layout } from "../../components"
import DLX from "./DLX"
import DokuBoard from "./DokuBoard";
import { ChangeEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import Htn from "../../components/Htn";
import { ArrowBack, ArrowDownward, ArrowForward, ArrowLeft, ArrowUpward } from "@mui/icons-material";
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
	const dlx = new DLX();
	
	//const solution = dlx.solve();
	const [isLoading, setLoading] = useState<boolean>(false);
	const [puzzle, setPuzzle] = useState<number[]>(new Array(81).fill(0));
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [locked, setLocked] = useState<Set<number> | undefined>();
	const [{isValid, possibleValues}, setIsValid] = useState<{isValid:undefined | boolean, possibleValues:Set<number>[]}>({isValid:false, possibleValues:[]});
	const relatives = useMemo(()=>{
		if(!~selectedIndex) return new Set<number>();
		const {row, column, box} = MAPS[selectedIndex];
		return new Set([...ROWS[row], ...COLUMNS[column], ...BOXS[box]]);
	}, [selectedIndex])

	const onChange = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
		const val = parseFloat(e.key);
		if(!isNaN(val)) setPuzzle(s=>[...s.slice(0, index),val, ...s.slice(index+1)]);
	};

	const getRandomPuzzle = async () => {
		setLoading(true);
		setIsValid(({isValid: false, possibleValues: []}))
		const {newboard:{grids:[{solution, value}]}} = await fetch('https://sudoku-api.vercel.app/api/dosuku').then(r=>r.json()) as SudokuApiResult;
		const puz = await enforceValidity(value.flatMap(v=>v), solution.flatMap(v=>v));
		setLocked(new Set(Array.from(puz.keys()).filter(i=>puz[i])));
		setPuzzle(puz);
		setLoading(false);
		
	}

	const enforceValidity = async (puz: number[], solution: number[]): Promise<number[]> => {
		const {data: {puzzle}} = await dw.post(1, puz, solution)
		return puzzle;
	}

	const solvePuzzle = async () => {
		setLoading(true);
		const {data:{solution}}= await dw.post(0, puzzle);
		if(!solution){
			console.log("Puzzle not solved");
			return;
		}
		setPuzzle(solution)
		setLoading(false);
	}

	const checkValid = async (puzzle: number[]) => {
		const {data: {isValid, possibleValues}} = await dw.post(2, puzzle);

		setIsValid({isValid, possibleValues});
	}

	const onSelect = (index: number) => {
		setSelectedIndex(index);
	}

	const shiftRight = ()=>{
		const puz = new Array(81).fill(0);
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				puz[y*9+((x+3)%9)] = puzzle[y*9+x];
			}
		}
		setLocked(new Set(Array.from(puz.keys()).filter(i=>puz[i])));
		setPuzzle(puz);
	}

	const shiftLeft = ()=>{
		const puz = new Array(81).fill(0);
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				puz[y*9+((x+6)%9)] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}
		setLocked(new Set(Array.from(puz.keys()).filter(i=>puz[i])));
		setPuzzle(puz);
	}

	const shiftDown = ()=>{
		const puz = new Array(81).fill(0);
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				puz[((y+3)%9)*9+x] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}
		setLocked(new Set(Array.from(puz.keys()).filter(i=>puz[i])));
		setPuzzle(puz);
	}

	const shiftUp = ()=>{
		const puz = new Array(81).fill(0);
		for(let y = 0; y<9; y++){
			for(let x = 0; x<9;x++){
				puz[((y+6)%9)*9+x] = puzzle[y*9+x]; //moving 6 forward is the same as subtracting 3 without risk of hitting negative number
			}
		}
		setLocked(new Set(Array.from(puz.keys()).filter(i=>puz[i])));
		setPuzzle(puz);
	}

	useEffect(()=>{
		checkValid(puzzle);
	}, [puzzle]);

	return (<Layout>
		<Stack justifyContent="flex-start" alignItems="center" gap="1rem" sx={{my:"5rem"}}>
			<Paper sx={{ display: "inline-block"}}>
				<Stack alignItems="center">
					{!isLoading && isValid === false && <Alert severity="warning">Puzzle has multiple solutions</Alert>}
					{!isLoading && isValid === undefined && <Alert severity="error">Puzzle is not solvable</Alert>}
					{!isLoading && isValid && <Alert severity="success">Puzzle only has one solution</Alert>}
					{isLoading && <Alert severity="info">Generating puzzle.</Alert>}
					{isLoading ? <Loading {...{width: "200px", height: "200px", end: 11, strokeWidth: 0.05}}/>:<DokuBoard {...{
						puzzle, onChange, onSelect, relatives, selectedIndex, locked: locked ?? new Set(), possibleValues
					}}/>}
					<Stack direction="row" justifyContent="space-between">
						<Stack>
							<Button variant="contained" onClick={getRandomPuzzle}>Get Random Puzzle</Button>
							<Button variant="contained" onClick={solvePuzzle}>Solve Puzzle</Button>
							<Button variant="contained" onClick={()=>checkValid(puzzle)}>Check Valid</Button>
						</Stack>
						<ShapeGrid {...{
							cellColumns: 'repeat(3, 1fr 2fr) 1fr',
							cellSize: [3,2],
							layoutFn: HexagonLayout(3, 'hexagon', false, true)
						}}>
							<ShapeGridCell>
								<Htn onClick={shiftUp}><ArrowUpward/></Htn>
							</ShapeGridCell>
							<ShapeGridCell>
								<Htn onClick={shiftLeft}><ArrowBack/></Htn>
							</ShapeGridCell>
							<ShapeGridCell>
								<Htn onClick={shiftRight}><ArrowForward/></Htn>
							</ShapeGridCell>
							<ShapeGridCell>
								<Htn onClick={shiftDown}><ArrowDownward/></Htn>
							</ShapeGridCell>
						</ShapeGrid>
					</Stack>
				</Stack>
			</Paper>
		</Stack>
	</Layout>)
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

