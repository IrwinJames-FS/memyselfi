import { HexagonLayout, Shape, ShapeGrid, ShapeGridCell } from "@irwinproject/shapley";
import { Box, Paper, Stack } from "@mui/material";

import './style.css';
import Loading from "../../components/Loading";
import useBreakpoint from "../../hooks/useBreakpoint";


const LS = "10rem";

export default function GridBanner(){
	const xl = useBreakpoint("xl");
	const lg = useBreakpoint("lg");
	const md = useBreakpoint('md');
	const sm = useBreakpoint('sm');
	console.log(xl ? 'xl' : lg ? 'lg' : md ? 'md' : sm ? 'sm' : 'xs' )
	const COLUMNS = xl ? 255 : lg ? 127 : md ? 63 : sm ? 31 : 23;
	const HCOLS = Math.floor(COLUMNS/2)
	const SCOLS = HCOLS-2;
	const LR = `${xl ? 2 : lg ? 4 : md ? 9 : sm ? 16 : 20}vw`
	const rows = ranged(
		[COLUMNS, false, 2],
		[HCOLS],
		[1, true],
		[HCOLS],
		[SCOLS],
		[5, true],
		[SCOLS],
		[SCOLS],
		[5,true],
		[SCOLS],
		[SCOLS],
		[5, true],
		[SCOLS],
		[SCOLS+1],
		[3,true],
		[SCOLS+1],
		[COLUMNS]
	);
	
	return (<Box sx={{position: 'relative'}}>
		<ShapeGrid {...{
			id:"shape-banner",
			cellColumns: `repeat(${COLUMNS}, 1fr 2fr) 1fr`,
			cellSize: [3, 2],
			layoutFn: HexagonLayout(COLUMNS, 'hexagon')
		}}>
			{rows}
			
		</ShapeGrid>
		<Box sx={{position: 'absolute', top: xl ? '0.25vw': lg ? '0.5vw':'1vw', left: 0, right: 0, bottom: 0, display: 'flex', justifyContent:'center', alignItems: 'center'}}>
			<Loading width={LR} height={LR}/>
		</Box>
	</Box>)
}
function ranged(...args:[ln: number, omitted?: boolean, alternating?:0 | 1 | 2][]){
	let o = 0;
	const els = [];
	for(const [ln, omitted = false, alternating = 0] of args){
		els.push(...range(o, ln, omitted, alternating))
		o+=ln
	}
	return els
}
function* range(o: number, length: number, omitShape:boolean = false, alternating: 0 | 1 | 2 = 0){
	const ao = alternating ? alternating-1:alternating
	for(let i = o; i<length+o;i++){
		yield <ShapeGridCell key={i}>{(omitShape || (alternating && (i+ao)%2)) ? <></>:<Shape/>}</ShapeGridCell>
	}
}