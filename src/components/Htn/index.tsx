import { Shape } from "@irwinproject/shapley";
import { Button, ButtonProps, Tooltip } from "@mui/material";

import { FC } from "react";

import './style.css';
export type HexLinkProps = ButtonProps & { href?: string };
export default function Htn({children, className, title, disabled, ...props}:HexLinkProps){
	return <Shape sref="hexagon" className={(className ? className+" ":"")+"hex-link"}>
		{disabled ? <Button {...props} disabled>
			{children}
		</Button>:<Tooltip title={title}>
			<Button {...props}>
				{children}
			</Button>
		</Tooltip>}
	</Shape>
}