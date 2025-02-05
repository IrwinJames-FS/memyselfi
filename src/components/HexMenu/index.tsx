import { MouseEventHandler, ReactNode, useMemo, useState } from "react"
import Htn, { HexLinkProps } from "../Htn";
import { Menu, styled } from "@mui/material";
import { HexagonLayout, Shape, ShapeGrid } from "@irwinproject/shapley";
export type  HexMenuProps = {
	id: string,
	title?: ReactNode
	children?:ReactNode
} & Omit<HexLinkProps, "children">;
export default function HexMenu({title, id, children, onClick, ...props}: HexMenuProps){
	const [anchorEl, setAnchor] = useState<null | HTMLElement>(null);
	const open = !!anchorEl;
	const handleClick: MouseEventHandler<HTMLButtonElement> = (e) => {
		setAnchor(e.currentTarget)
		if(onClick) onClick(e);
	}
	const onClose = ()=>setAnchor(null);
	return (<>
	<Htn 
		aria-controls={open ? id:undefined}
		aria-haspopup="true"
		aria-expanded={open ? true:undefined}
		onClick={handleClick}
		{...props}
		>{title}</Htn>
	<Menu {...{
		id,
		anchorEl,
		open,
		onClose,
		MenuListProps:{
			'aria-labelledby': id,
		},
		slotProps:{
			paper: {
				sx:{
					boxShadow: "none",
				}
			}
		}
	}}>
		<ShapeGrid cellColumns="repeat(3, 1fr 2fr) 2fr" cellSize={[3,2]} layoutFn={HexagonLayout(3, 'hexagon', false, true)}>
			{children}
		</ShapeGrid>
	</Menu>
	</>)
}

const Shx = styled(Shape)({});