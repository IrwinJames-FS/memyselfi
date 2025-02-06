import {Paper, Typography } from "@mui/material";
import { Layout } from "../../components";
import GridBanner from "./GridBanner";

export default function Shapley(){
	return (<Layout>
		<GridBanner/>
		<Paper sx={{mx: {md:'5rem'}, padding:'1rem', '.MuiTypography-root':{my: '1rem'}}}>
			<a href="https://irwinjames-fs.github.io/shapley/?path=/docs/getting-started--docs"><Typography variant="h3">Shapley</Typography></a>
			<Typography>I get tired of using rectangles all the time. Frameworks like Swift-ui offer components where custom paths can be drawn. Shapleys goal is to bring this same behavior to html. Using svg as a backing layer similar behavior to the Path component from swift-ui can be achieved. Shapley uses generator functions and svg to create cachable and modifiable paths that both operate efficiently.</Typography>
			<Typography>Shapley uses generator methods as a source of truth. this allows me to support multiple formats without having to consume the entire path at once. parsing can be done lazily and while this may not be the best for highly animated components, this performs nicely in many situations.</Typography>
			<Typography>In addition to generators allowing for a lazy consumption of data it also allows for a simple method to create queued mutations. For example suppose you programmatically generate a triangle. and want to animate said triangle by translating, rotating and scaling the geometry. If the path commands were stored as an array I would need to iterate over each command for every mutation. Using generator methods we can simply say the next time this value is iterated over it needs to have these operations done on it. The next render loop will trigger the updates and present the new information</Typography>
			<Typography variant="h4">Cross environment ready</Typography>
			<Typography>Shapley is designed to be used both on the client side as well as the server side. I am still working on supporting parsing full SVGs into Shapley however for now the components can be used in any JSX context. In addition to the components Shapley ships the class <a href="https://irwinjames-fs.github.io/shapley/?path=/docs/geometry-d-d--docs">D</a>. D acts as an abstraction of the path commands or the <i>d</i> property on the path component. In future iterations I plan to add a similar api to that ove the canvas api. Currently each path can be traversed and the path as a whole can be modified or each command can be modified individually. </Typography>
		</Paper>
	</Layout>)
}