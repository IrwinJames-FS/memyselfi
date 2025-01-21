import DLX from "./DLX"
interface WorkerMessage{
	data: {
		cmd: number,
		puzzle: number[]
	}
}
self.onmessage = ({data: {cmd, puzzle}}: WorkerMessage) => {
	const dlx = new DLX();
	switch (cmd) {
		case 0: return dlx.solvePuzzle(puzzle);
	}
}