import { Paper, Typography } from "@mui/material";
import { Layout } from "../../components";

export default function DLXjs(){
	return (<Layout>
		<Paper sx={{mx: {md:'5rem'}, padding:'1rem', '.MuiTypography-root':{my: '1rem'}}}>
			<Typography variant="h3">DLXjs</Typography>
			<Typography>My father in law loves sudoku. I went down a rabbit hole of different methods to solve sudoku until I stumbled across the dancing links algorithm. This algorithm provides a logical recursive process that can efficiently solve exact cover problems. On the <a href="./doku">Doku</a> page you can see some examples of how the dancing links algorithm can be applied. </Typography>
			<Typography>After implementing dancing links in a few environments I discovered that map and array based implementations (<a href="https://www.cs.mcgill.ca/~aassaf9/python/algorithm_x.html">example</a>) typically perform much less efficiently then a true implementation. However true implementations can be tedious and if mismanaged can cause indefinite loops.</Typography>
			<Typography>DLXjs is an attempt to create a reusable and flexible dancing links solver and validator. Using javascript dancing links can still be highly effective but due to limitations of javascript runtimes it would likely not be effective on highly complex exact cover problems. However this is still a novel example of dancing links.</Typography>
			<Typography variant="h4">Technologies</Typography>
			<Typography>DLXjs is built entirely in typescript and should be deployable in any js environment.</Typography>
			<Typography>The example I have on <a href="./doku">doku</a> is a method of using zig for manual memory management to optimize the algorithm further. While this may restrict environments it can be implemented. (React Native has basic support), Tizen and smart tvs are typically built on a chromium browser but I have not tested if they support WebAssembly.</Typography>
		</Paper>
	</Layout>)
}