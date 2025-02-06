import { Divider, Paper, Stack, Typography } from "@mui/material";
import { Layout } from "../../components";

export default function CraftyCalc(){
	return <Layout>
		<Paper sx={{mx: {md:'5rem'}, padding: '1rem', mb:'1rem'}}>
			<Typography variant="h3">Crafty Calc</Typography>
			<Typography>Playing minecraft I wanted a tool that could be used to help players build 3D shapes using cubes or voxels.</Typography>
			<Typography>This project was really an opportunity to explore the Metal api on iOS as it has just been released at the time.</Typography>

		</Paper>

		<Paper sx={{mx: {md:'5rem'}, padding: '1rem', '.MuiTypography-root':{my: '1rem'}}}>
			<Typography variant="h4">Technologies</Typography>
			<Typography>Initially the plan with crafty calc was to generate two dimensional diagrams to illustrate where blocks would need to be placed to create the desired effect. I started this project around the time the Metal API had been released and wanted to incorporate some newer technologies.</Typography>
			<Divider/>
			<Typography variant="h6">Metal</Typography>
			<Typography>I built a render pipeline that handled vector and uv data. In order to create a video like tutorial I created a reusable geometry and a buffer that acted as a queue for voxels waiting to be placed. the render loop waits until a desired time period has ellapsed at which point a new voxel is added to the scene.</Typography>
			<Divider/>
			<Typography variant="h6">Marching cubes in reverse</Typography>
			<Typography>The marching cubes algorithm is an efficient way to clip large geometries into smaller geometries. While this algorithm is used widely in graphical rendering I wanted to use it in a non conventional manner. If marching cubes can be used to split larger geometries into smaller geometries I could use the same algorithm to convert a 3d model into a voxelized and symmetric voxel object.</Typography>
			<Typography variant="h6">Symmetrical Voxels? ... Voxels?</Typography>
			<Typography>Voxels is a term used to explain a 3d unit. games like minecraft are refered to as voxel based games because each block, or item is a voxel as well. Swift actually has something called a VoxelArray which converts 3d models to voxels however has not regard for symmetry.</Typography>
			<Typography>A voxel array is helpful when you want to simplify a geometry and express it as particles. for example clouds. a cloud made out of rigid triangles will look funny (mario64). One option that can be used is a high res model that can be used at a distance however clouds closer to the fov can be simplified and particles emitted from the simplified geometries vertex locations. The same shape will be represented however can appear as a gas.</Typography>
			<Typography>While such an array is extremely useful in some situation I needed a method to generate voxels that are uniformely placed. Marching cubes uses a grid and scores each intersection the geometry makes with the grid using weights assiged to each grid intersection. By evaluating these weights marching cubes can determine if the geometry can be sliced into two smaller geometries at a specific location. Instead I used these weights to determine if a voxel should be placed at the intersection point. </Typography>
			<Divider/>
			<Typography variant="h6">Swift-UI</Typography>
			<Typography>Crafty calc offered controls that allowed each model to be resized. These inputs were built using Swift-ui and UI-Kit as the TextField in swiftUI lacks a lot of granular controls that the UITextField offers. </Typography>
		</Paper>
	</Layout>
}