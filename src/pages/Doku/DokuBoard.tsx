import { Box, Card, Stack, styled, TextField } from '@mui/material';
import './style.css';
import { ChangeEvent, ChangeEventHandler, createContext, KeyboardEvent, KeyboardEventHandler, useContext, useState } from 'react';

interface DokuBoardProps{
	puzzle: number[]
	relatives: Set<number>
	selectedIndex: number
	locked: Set<number>
	possibleValues: Set<number>[]
	showPossibles: boolean
	onChange: (index: number, event: KeyboardEvent<HTMLInputElement>)=>void
	onSelect: (index: number) => void
}

interface DokuRowProps {
	row: number
}

interface DokuCellProps {
	index: number
}

const DokuContext = createContext<DokuBoardProps>({
	puzzle: new Array(81).fill(0),
	relatives: new Set(),
	selectedIndex: -1,
	locked: new Set(),
	possibleValues: [],
	showPossibles: true,
	onChange(){},
	onSelect(){}
});

const useDoku = ()=> useContext(DokuContext);
const DokuRow = ({ row }: DokuRowProps) => {
	return <Stack direction="row" className="doku-row">
		{new Array(9).fill(0).map((_, i)=><DokuCell key={i} {...{index:row*9+i}}/>)}
	</Stack>
}
const DokuCell = ({ index }: DokuCellProps) => {
	const { puzzle, relatives, selectedIndex, onChange, onSelect, locked, possibleValues, showPossibles } = useDoku();
	const changer: KeyboardEventHandler<HTMLInputElement> = e=>onChange(index, e)
	return <Box className={`doku-cell${selectedIndex === index ? ' selected':relatives.has(index) ? ' relative':''}`} sx={{width:{xs:'3rem', md:'4rem'}}}>
		<Card sx={{aspectRatio: '1/1', display: 'flex', justifyContent:'center', alignItems: 'center', position: 'relative'}}>
			{locked.has(index) ? <b>{puzzle[index] ? puzzle[index]:""}</b>:<>
			{showPossibles && <Stack className="possibles" sx={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'space-evenly', '& p':{margin: 0, fontSize:{xs:"0.5rem", md:"0.75rem"}, lineHeight: {xs: "0.5rem", md:"0.75rem"}}, '&>.MuiStack-root':{
				justifyContent: "space-evenly"
			}}}>
				<Stack direction="row">
					<p>{possibleValues[index]?.has(1) && '1'}</p>
					<p>{possibleValues[index]?.has(2) && '2'}</p>
					<p>{possibleValues[index]?.has(3) && '3'}</p>
				</Stack>
				<Stack direction="row">
					<p>{possibleValues[index]?.has(4) && '4'}</p>
					<p>{possibleValues[index]?.has(5) && '5'}</p>
					<p>{possibleValues[index]?.has(6) && '6'}</p>
				</Stack>
				<Stack direction="row">
					<p>{possibleValues[index]?.has(7) && '7'}</p>
					<p>{possibleValues[index]?.has(8) && '8'}</p>
					<p>{possibleValues[index]?.has(9) && '9'}</p>
				</Stack>
			</Stack>}
			<TextField {...{
				autoComplete: "off",
				value: puzzle[index] ? puzzle[index]:"",
				onKeyDown: changer,
				onFocus: ()=>onSelect(index),
				sx:{
					padding: 0,
				},
				slotProps:{
					htmlInput: {
						sx: {
							textAlign: 'center',
							padding: 0,
							height: '100%'
						}
					}
				}
			}}/>
			</>}
		</Card>
	</Box>
}

export default function DokuBoard({puzzle, onChange, onSelect, selectedIndex, relatives, locked, possibleValues, showPossibles=false}: DokuBoardProps){
	return <DokuContext.Provider value={{puzzle, onChange, onSelect, selectedIndex, relatives, locked, possibleValues, showPossibles}}>
		<div id="doku-board">
			<Stack className="doku-board">
				{new Array(9).fill(0).map((_, row)=><DokuRow key={row} {...{row}}/>)}
			</Stack>
		</div>
	</DokuContext.Provider>
}

