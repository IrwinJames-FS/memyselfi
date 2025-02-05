import { Paper, Typography } from "@mui/material";
import { Layout } from "../components";

export default function About(){
	return (<Layout>
		<Paper sx={{ mx: { md: "5rem"}, padding: "1rem",'.MuiTypography-root':{my: '1rem'} }}>
			<Typography variant="h3">About Me</Typography>
			<Typography>Hello, my name is James Irwin welcome to my little slice of the internet.</Typography>
			<Typography>I guess you can say I am full stack developer however I enjoy exploring new languages and environments as well.</Typography>
		</Paper>
	</Layout>)
}