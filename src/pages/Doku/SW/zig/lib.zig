const std = @import("std");
const DLXTOOLS = @import("zlx.zig");
const DLX = DLXTOOLS.ZLX;
const Node = DLXTOOLS.Node;

const allocator = std.heap.page_allocator;
var dlx: *DLX = undefined;
extern fn statusUpdate([*]i8) void;

export fn init() void {
    dlx = allocator.create(DLX) catch return;
    dlx.* = DLX.init(allocator) catch undefined;
}

export fn allocPuzzle() ?[*]i8 {
    const ptr = allocator.alloc(i8, 81) catch return null;
    for (0..81) |i| {
        ptr[i] = 0;
    }
    return ptr.ptr;
}

export fn allocLen() ?[*]usize {
    const ptr = allocator.alloc(usize, 1) catch return null;
    return ptr.ptr;
}

export fn allocValidity() ?[*]i8 {
    const ptr = allocator.alloc(i8, 1) catch return null;
    return ptr.ptr;
}

export fn deallocPuzzle(p: [*]i8) void {
    const puz: *[81]i8 = @ptrCast(p);
    allocator.free(puz);
}

export fn deallocList(p: [*]i16, len: usize) void {
    const slice = p[0..len];
    allocator.free(slice);
}

export fn deallocLen(len: [*]usize) void {
    const l: *[1]usize = @ptrCast(len);
    allocator.free(l);
}

export fn deallocValidity(val: [*]i8) void {
    const v: *[1]i8 = @ptrCast(val);
    allocator.free(v);
}

export fn random(p: [*]i8) void {
    const solution = dlx.mkSolutionList(null) catch return;
    var prng = std.rand.DefaultPrng.init(blk: {
        var seed: u64 = undefined;
        std.posix.getrandom(std.mem.asBytes(&seed)) catch return;
        break :blk seed;
    });
    dlx.rand(solution, 9, &prng) catch return;
    const nodes = dlx.minify(solution) catch return;
    const puz: *[81]i8 = @ptrCast(p);

    dlx.toPuzzle(puz, nodes);
}

export fn status(p: [*]i8, sz: [*]usize, vld: [*]i8) ?[*]i16 {
    const puzzle: *[81]i8 = @ptrCast(p);
    const validity: *[1]i8 = @ptrCast(vld);
    validity[0] = -1;
    const len: *[1]usize = @ptrCast(sz);
    const nodes = dlx.coverPuzzle(puzzle) catch return null;
    defer dlx.uncoverNodes(nodes);
    validity[0] = if (dlx.quickValid()) |v| if (v) 1 else 0 else -1;
    const possibles = dlx.getAvailableNodes() catch return null;
    len[0] = possibles.len;
    return possibles.ptr;
}
export fn solve(p: [*]i8) bool {
    //this is just a pointer modifications wont change length
    const puz: *[81]i8 = @ptrCast(p);
    if (puzzleComplete(puz)) return true;
    dlx.solvePuzzle(puz) catch return false;
    return true;
}

fn puzzleComplete(p: *[81]i8) bool {
    return for (p) |v| {
        if (v == 0) break false;
    } else true;
}
export fn generate(p: [*]i8) void {
    const puz: *[81]i8 = @ptrCast(p);
    const nodes = dlx.coverPuzzle(puz) catch return;
    const solution = dlx.mkSolutionList(nodes) catch return;
    if (puzzleComplete(puz)) {
        dlx.uncoverNodes(nodes);
    } else {
        defer dlx.uncoverNodes(nodes);
        dlx.solve(solution) catch return;
    }

    const part = dlx.minimize(solution, updater) catch return;
    @memcpy(puz, &nodeToPuzzle(part));
}

fn updater(p: []*Node) void {
    var puzzle = nodeToPuzzle(p);
    statusUpdate(@ptrCast(&puzzle));
}
pub fn nodeToPuzzle(nodes: []*Node) [81]i8 {
    var puzzle = [_]i8{0} ** 81;
    for (nodes) |node| {
        const index: usize = @as(usize, @intCast(@divFloor(node.index, 9)));
        const value: i8 = @as(i8, @intCast(@mod(node.index, 9) + 1));
        puzzle[index] = value;
    }
    return puzzle;
}
pub fn printSolution(nodes: []*Node) void {
    const puzzle = nodeToPuzzle(nodes);
    printPuzzle(puzzle);
}

pub fn printPuzzle(puzzle: [81]i8) void {
    for (0..9) |i| {
        std.debug.print("||{}|{}|{}||{}|{}|{}||{}|{}|{}||\n", .{ puzzle[i * 9], puzzle[i * 9 + 1], puzzle[i * 9 + 2], puzzle[i * 9 + 3], puzzle[i * 9 + 4], puzzle[i * 9 + 5], puzzle[i * 9 + 6], puzzle[i * 9 + 7], puzzle[i * 9 + 8] });
    }
}
