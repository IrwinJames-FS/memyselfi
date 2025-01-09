import { Vector4 } from "three"
import { ShapeDescriptor } from "./descriptors/types"

export type ShapeProps = {
	count?: number
} & ParticleShapesProps

export type ParticleShapesProps = {
	count?: number,
	descriptor?: ShapeDescriptor
	color?: Vector4
}