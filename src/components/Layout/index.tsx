import { ReactNode } from "react";
import ParticleBG from "../ParticleBG";
import { AppBar, createTheme, CssBaseline, PaletteOptions, ThemeProvider, Toolbar, Typography, useMediaQuery } from "@mui/material";
import { DefaultColorScheme } from "@mui/material/styles/createThemeWithVars";
import { D, ShapeCache } from "@irwinproject/shapley";
import Topbar from "../Topbar";

const modes: Record<DefaultColorScheme, PaletteOptions> = {
	light: {
		background: {
			paper: "#FFFC"
		}
	},
	dark: {
		background:{
			paper: "#333C"
		}
	}
}

const useCreateTheme = () => {
	const mode = useMediaQuery('(prefers-color-scheme: dark)') ? 'dark':'light'
	return createTheme({
		palette: {
			mode: mode,
			...modes[mode]
		},
		cssVariables: true
	})
}
export default function Layout({children}:{children: ReactNode}){
	const theme = useCreateTheme();
	return (<>
		<ShapeCache shapes={{
			hexagon: D.polygon(6, {cornerRadius: 0.1}),
			hexagonVert: D.polygon(6, {cornerRadius: 0.1, rotation:30})
		}}/>
		<ThemeProvider theme={theme}>
			<CssBaseline/>
			<ParticleBG/>
			<Topbar/>
			{children}
		</ThemeProvider>
	</>)
}