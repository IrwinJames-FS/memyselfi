const std = @import("std");
const allocator = std.heap.page_allocator;
const ZLX = @import("zlx.zig");
pub fn main() !void {
    std.debug.print("Checking if solve in place works in a validator\n", .{});
    var zlx = try ZLX.ZLX.init(allocator);
    defer zlx.deinit();
    var nodes = ZLX.Set(*ZLX.Node).init(allocator);
    try zlx.solveInPlace(&nodes);
    std.debug.print("How many nodes did I get {}\n", .{nodes.size});
    zlx.coverNodes(try nodes.items());
    std.debug.print("Grid size {}\n", .{zlx.size});
    const newNodes = ZLX.Set(*ZLX.Node).init(allocator);
    try zlx.solveInPlace(&nodes);
    std.debug.print("Total new nodes {}\n", .{newNodes.size});
}
