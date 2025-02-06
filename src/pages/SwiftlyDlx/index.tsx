import { Paper, Typography } from "@mui/material";
import { Layout } from "../../components";

export default function SwiftlyDlx(){
	return (<Layout>
		<Paper sx={{ mx: { md: "5rem"}, padding: "1rem",'.MuiTypography-root':{my: '1rem'} }}>
			<Typography variant="h4"><a href="https://github.com/snymax/SwiftlyDLX">SwiftlyDlx</a></Typography>

			<Typography>If you have seen by now I like sudoku. Really I like the dancing links algorithm. If implemented properly it functions like a well oiled machine. With swifts dynamic sort of type safety I was able to build a generic dancing links implementation that uses hashing methods to turn a descriptor object into an integer and back. This allows the algorithms to be used in an optimized manner without mutating the data a node or column might be describing. In short it makes it easier for someone unfamiliar with the way the algorithm works to utilize it without as many pitfalls.</Typography>
		</Paper>
	</Layout>)
}