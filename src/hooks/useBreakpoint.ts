import { Breakpoint, useMediaQuery, useTheme } from "@mui/material";

export default function useBreakpoint(bk: Breakpoint | number){
	const theme = useTheme();
	return useMediaQuery(theme.breakpoints.up(bk))
}