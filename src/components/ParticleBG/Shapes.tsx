import { FC } from "react";
import { ShapeProps } from "./types";
import ParticleShapes from "./ParticleShapes";
import { CubeDescriptor, DodecahedronDescriptor, IcosahedronDescriptor, OctahedronDescriptor, TetrahedronDescriptor } from "./descriptors";

export const CubeBg: FC<ShapeProps> = ({count, ...props}) => (<ParticleShapes {...{count, descriptor: CubeDescriptor, ...props}}/>);

export const OctahedronBG: FC<ShapeProps> = ({count, ...props}) => (<ParticleShapes {...{count, descriptor: OctahedronDescriptor, ...props}}/>);

export const TetrahedronBG: FC<ShapeProps> = ({count, ...props}) => (<ParticleShapes {...{count, descriptor: TetrahedronDescriptor, ...props}}/>);

export const IcosahedronBG: FC<ShapeProps> = ({count, ...props}) => (<ParticleShapes {...{count, descriptor: IcosahedronDescriptor, ...props}}/>);

export const DodecahedronBG: FC<ShapeProps> = ({count, ...props}) => (<ParticleShapes {...{count, descriptor: DodecahedronDescriptor, ...props}}/>);
