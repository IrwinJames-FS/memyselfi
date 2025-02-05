export default class DW {
	messageId:number = 0

	promises: Map<number, {resolve: (event: MessageEvent)=>void, reject: (error: ErrorEvent)=>void}> = new Map()
	polls: Set<number> = new Set();
	_worker?: Worker

	get worker(){
		if(!this._worker){
			this._worker = DW.Worker;
			this._worker.onmessage = e => {
				const {id, ...data} = e.data;
				if(this.promises.has(id)){
					const { resolve } = this.promises.get(id)!;
					resolve(e);
					this.promises.delete(id);
				}
			}
		}
		return this._worker!;
	}
	static get Worker(){
		//@ts-expect-error tsconfig needs to remain the way it is. 
		return new Worker(new URL('./SW/index.ts', import.meta.url), {type: 'module'});
	}
	constructor(){
		
	}

	async post(cmd: number, puzzle: number[], solution?:number[]): Promise<MessageEvent>{
		return new Promise((resolve, reject)=>{
			const id = this.messageId++;
			this.promises.set(id, {resolve, reject});
			this.worker.postMessage({id, cmd, puzzle, solution})
		})
	}

	poll(cmd: number, args: object, each:(evt:MessageEvent)=>void, finish:(evt: MessageEvent)=>void): number{
		const id = this.messageId++;
		let poller: Poller | undefined = this.getPoller(id);
		this.doPoll(id, poller, each, finish)
		this.worker.postMessage({id, cmd, ...args})
		return id;
	}

	async doPoll(id: number, poller: Poller, each: (evt: MessageEvent)=>void, finish:(evt: MessageEvent)=>void){
		let evt: MessageEvent | undefined = await poller.promise;
		do{
			if(evt?.data.done) {
				finish(evt);
				break
			} else if(evt){
				each(evt);
				poller = this.getPoller(id);
				evt = await poller.promise;
			}
		} while (evt);
	}

	cancel(id:number){
		this.worker.terminate()
		this._worker = undefined;
	}
	getPoller(id: number):Poller{
		return {
			id,
			promise: new Promise((resolve, reject)=>{this.promises.set(id, {resolve, reject})})
		}
	}
}

interface Poller{
	id: number,
	promise: Promise<MessageEvent>
}