export default class DW {
	messageId:number = 0
	worker: Worker
	promises: Map<number, {resolve: (event: MessageEvent)=>void, reject: (error: ErrorEvent)=>void}> = new Map()
	constructor(){
		//@ts-expect-error tsconfig needs to remain the way it is. 
		this.worker = new Worker(new URL('./SW/index.ts', import.meta.url), {type: 'module'});
		this.worker.onmessage = e => {
			const {id, ...data} = e.data;
			if(this.promises.has(id)){
				const { resolve } = this.promises.get(id)!;
				resolve(e);
				this.promises.delete(id);
			}
		}
		this.worker.onerror = e => {
			const {id, ...error} = e.error;
			if(this.promises.has(id)){
				const { reject } = this.promises.get(id)!;
				reject(e);
				this.promises.delete(id);
			}
		}
	}

	async post(cmd: number, puzzle: number[], solution?:number[]): Promise<MessageEvent>{
		return new Promise((resolve, reject)=>{
			const id = this.messageId++;
			this.promises.set(id, {resolve, reject});
			this.worker.postMessage({id, cmd, puzzle, solution})
		})
	}
}