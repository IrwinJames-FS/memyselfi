import { Paper, Typography } from "@mui/material";
import { Layout } from "../../components";

export default function CalenDraw(){
	return (<Layout>
		<Paper sx={{mx: {md:'5rem'}, padding:'1rem', '.MuiTypography-root':{my: '1rem'}}}>
			<a href="https://apps.apple.com/us/app/calendraw-calendar-notes/id1500028479"><Typography variant="h3">CalenDraw</Typography></a>
			<Typography>CalenDraw gives power back to hand writing. Our brains remember hand written notes better. CalenDraw is a virtual appointment book designed around this concept. plans, notes, appointment can all be written in. CalenDraw process the hand writing so notes and appointments can be searched and recalled easily. </Typography>
			<Typography>I worked with the developer of CalenDraw to add in a full text searchable layer that can efficiently search the context of each note. CalenDraw is built on core data which does not have full text search support. we implemented an SQLite layer that processes the hand writing and converts it to searchable text on device. This ensures the users plans or notes are secure and not shared with any 3rd party servers. </Typography>
		</Paper>
	</Layout>)
}