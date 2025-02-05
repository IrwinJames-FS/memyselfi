import DLX, { toPuz } from "./DLX";
var instance: WebAssembly.Instance;
var fd_text = "";
var gen_id: number = -1;
const memory = new WebAssembly.Memory({initial: 1});
const importObject: WebAssembly.Imports = {
  env:{
    memory,
    statusUpdate(ptr:number){
      if(!~gen_id) return;
      //@ts-expect-error need declaration
      const arr = Array.from(new Int8Array(instance.exports.memory.buffer, ptr, 81));
      self.postMessage({ id:gen_id, puzzle: arr });
    }
  },
  wasi_snapshot_preview1:{
    fd_write,
    path_open:(...args:unknown[])=>console.log("path_open: ", ...args),
    fd_read: (...args:unknown[])=>console.log("fd_read: ", ...args),
    fd_close: (...args:unknown[])=>console.log("fd_close: ", ...args),
    random_get: ()=>{}
  }
};
//@ts-ignore
function fd_write(fd, iovs_ptr, iovs_len, nwritten_ptr) {
  const memory = instance.exports.memory;
  //@ts-expect-error need declaration
  const view = new DataView(memory.buffer);
  let totalWritten = 0;
  
  // Read each iovec (input/output vector)
  for (let i = 0; i < iovs_len; i++) {
      // Each iovec is 8 bytes: 4 for ptr, 4 for length
      const ptr = view.getUint32(iovs_ptr + i * 8, true); // true for little-endian
      const len = view.getUint32(iovs_ptr + i * 8 + 4, true);
      
      //@ts-expect-error Read the actual data
      const bytes = new Uint8Array(memory.buffer, ptr, len);
      fd_text+= new TextDecoder().decode(bytes);

      totalWritten += len;
  }
  // Handle different file descriptors
  switch (fd) {
    case 2: // stdout
        break;
    case 3: // stderr
        break;
    default:
        throw new Error(`Unsupported file descriptor: ${fd}`);
}
  
  // Write the total number of bytes written
  view.setUint32(nwritten_ptr, totalWritten, true);
  
  return 0; // Success
}
//@ts-expect-error it works in js.
const instancePromise = fetch(new URL("./zig/lib.wasm", import.meta.url))
.then(r=>r.arrayBuffer())
.then(bytes=>WebAssembly.instantiate(bytes, importObject))
.then(inst=> {
  instance = inst.instance;
  //@ts-ignore 
  instance.exports.init();
  return inst.instance
});
interface WorkerMessage {
  data: {
    id: number;
    cmd: number;
    puzzle: number[];
    solution?: number[];
  };
}

const deallocPuzzle = (ptr: number) => {
  //@ts-expect-error need declaration.
  instance.exports.deallocPuzzle(ptr);
}

const generateWasm = (id: number, puzzle: number[]) => {
  gen_id = id;
  const puz = new Int8Array(puzzle);

  //@ts-ignore
  const puzPtr = instance.exports.allocPuzzle();
  //@ts-expect-error need declaration.
  const buffer = new Int8Array(instance.exports.memory.buffer);
  
  
  buffer.set(puz, puzPtr);
  //@ts-expect-error need declaration.
  instance?.exports.generate(puzPtr);
  //@ts-expect-error is memory not a live buffer. I guess i'll have to use the exports memory
  const wasmSolution = Array.from(new Int8Array(instance.exports.memory.buffer, puzPtr, 81));
  deallocPuzzle(puzPtr);
  return wasmSolution
}

const randomWasm = () => {
  const puz = new Int8Array(new Array(81).fill(0));
  //@ts-ignore
  const puzPtr = instance.exports.allocPuzzle();
  //@ts-ignore
  const buffer = new Int8Array(instance.exports.memory.buffer);

  buffer.set(puz, puzPtr);
  //@ts-ignore
  instance.exports.random(puzPtr);
  //@ts-ignore
  const wasmSolution = Array.from(new Int8Array(instance?.exports.memory.buffer, puzPtr, 81));
  const sz = wasmSolution.reduce((o,v)=>v>0?o+1:o,0);
  deallocPuzzle(puzPtr);
  return wasmSolution;
}
const solveWasm = (puzzle: number[])=>{
  const puz = new Int8Array(puzzle);
  //@ts-ignore
  const puzPtr = instance.exports.allocPuzzle();

  //@ts-ignore
  const buffer = new Int8Array(instance.exports.memory.buffer);
  
  
  buffer.set(puz, puzPtr);
  
  
  //@ts-expect-error need declaration.
  instance?.exports.solve(puzPtr);
  //@ts-ignore
  const wasmSolution = Array.from(new Int8Array(instance?.exports.memory.buffer, puzPtr, 81));
  deallocPuzzle(puzPtr);
  return wasmSolution;
}

interface Status{
  isValid?: boolean,
  possibleValues: Set<number>[]
}
const checkValidity = (puzzle: number[]) => {
  //@ts-ignore
  const puzPtr = instance.exports.allocPuzzle();
  const puz = new Int8Array(puzzle);
  //@ts-ignore
  const buffer = new Int8Array(instance.exports.memory.buffer);
  buffer.set(puz, puzPtr);
  //@ts-ignore
  const lenPtr = instance.exports.allocLen();
  //@ts-ignore
  const vldPtr = instance.exports.allocValidity();
  //@ts-expect-error need declaration.
  const result = instance?.exports.status(puzPtr, lenPtr, vldPtr);
  let len = 0;
  //@ts-ignore
  const vld = new Int8Array(instance.exports.memory.buffer, vldPtr, 1)[0];
  const status:Status = {possibleValues: [], isValid: vld == -1 ? undefined : vld == 1 ? true : false};
  if(result >= 0){
    //@ts-ignore
    const sizeBuffer = new Uint32Array(instance.exports.memory.buffer, lenPtr, 1);
    len = sizeBuffer[0];
    //@ts-ignore
    const possibles = new Int16Array(instance.exports.memory.buffer, result, len);
    const pns = new Set(possibles);
    const possibleValues: Set<number>[] = [];
    for(let i = 0; i<81; i++){
      const r = i*9;
      const ps = new Set<number>();
      for(let j = 0; j<9; j++){
        if(pns.has(r+j)) ps.add(j+1);
      }
      possibleValues.push(ps);
    }
    status.isValid = vld == -1 ? undefined : vld == 1 ? true : false;
    status.possibleValues = possibleValues;
  }
  //@ts-ignore
  instance.exports.deallocList(result, len);
  //@ts-ignore
  instance.exports.deallocLen(lenPtr);
  //@ts-ignore
  instance.exports.deallocValidity(vldPtr);
  return status;
}

self.onmessage = async ({
  data: { id, cmd, puzzle },
}: WorkerMessage) => {
  await instancePromise;
  const dlx = new DLX();
  switch (cmd) {
    case 0: return self.postMessage({ id, solution: solveWasm(puzzle) });
    case 1: return self.postMessage({ id, ...checkValidity(puzzle) });
    case 2: return self.postMessage({id, puzzle: generateWasm(id, puzzle)});
    case 3: return self.postMessage({id, puzzle: randomWasm()});
  }
};
