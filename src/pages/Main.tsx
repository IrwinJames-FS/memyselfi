import { HexagonLayout, Shape, ShapeGrid, ShapeGridCell } from "@irwinproject/shapley";
import { Layout } from "../components"
import { Box, Paper, Stack, Typography } from "@mui/material";

import './style.css';
import { Css, Html, Javascript } from "@mui/icons-material";
import { FaGolang, FaJs, FaPhp, FaPython, FaSwift } from "react-icons/fa6"
import { SiCplusplus, SiLua } from "react-icons/si";

export default function Main(){
	console.log("Loading main app");
	return (<Layout>
		<Stack alignItems="center">
			<ShapeGrid {...{
				id: 'home-grid',
				cellColumns: 'repeat(2, 1fr) 1fr',
				cellSize: [2,3],
				layoutFn: HexagonLayout(2, 'hexagonVert', true)
			}}>
				<ShapeGridCell>
					<Shape style={{padding: '0.5rem'}}>
						<Typography variant="h4" sx={{textDecoration: 'underline', backgroundClip: 'text'}}>About Me</Typography>
						<Typography sx={{backgroundClip: 'text', fontSize: {xs: '0.75rem', md: '1rem'}}}>Programming has been an outlet for me. I taught myself python in sixth grade. By high school I had a strong understanding of HTML / CSS / JS. I took classes in VB and C++ and taught myself objective-c and Swift and high school. Since graduating I try to learn new languages, concepts and algorithms as time allows. </Typography>
					</Shape>
				</ShapeGridCell>
				<ShapeGridCell>
					<Shape>
						<ShapeGrid {...{
							className: "icon-grid",
							cellColumns: 'repeat(3, 1fr 2fr) 1fr',
							cellSize:[3,2],
							style: {
								flexGrow: 1,
							},
							layoutFn: HexagonLayout(3, 'hexagon', false, true)
						}}>
							<ShapeGridCell>
								<Shape>
									<FaPhp size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<FaGolang size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<FaSwift size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<FaJs size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<FaPython size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<SiLua size={64}/>
								</Shape>
							</ShapeGridCell>
							<ShapeGridCell>
								<Shape>
									<SiCplusplus size={64}/>
								</Shape>
							</ShapeGridCell>
						</ShapeGrid>
					</Shape>
				</ShapeGridCell>
			</ShapeGrid>
		</Stack>
	</Layout>)
}