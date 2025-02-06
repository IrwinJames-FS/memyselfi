const std = @import("std");
const allocator = std.heap.page_allocator;
const ZLX = @import("zlx.zig");
pub fn main() !void {
    std.debug.print("Checking if solve in place works in a validator\n", .{});
    var zlx = try ZLX.ZLX.init(allocator);
    defer zlx.deinit();
    const solution = try zlx.mkSolutionList(null);
    try zlx.rand(solution, 9);
    try zlx.print(solution);
}
