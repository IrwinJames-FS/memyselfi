const std = @import("std");
const Allocator = std.mem.Allocator;

pub fn Set(comptime T: type) type {
    return struct {
        const Self = @This();
        allocator: Allocator,
        map: std.AutoHashMap(T, void),
        size: usize,

        pub fn init(allocator: Allocator) Self {
            return Self{ .allocator = allocator, .map = std.AutoHashMap(T, void).init(allocator), .size = 0 };
        }

        pub fn deinit(self: *Self) void {
            self.map.clearAndFree();
            self.map.deinit();
        }

        pub fn has(self: *Self, item: T) bool {
            return self.map.contains(item);
        }

        pub fn remove(self: *Self, item: T) bool {
            if (self.map.remove(item)) {
                self.size -= 1;
                return true;
            }
            return false;
        }

        pub fn add(self: *Self, item: T) !bool {
            if (self.has(item)) return false;
            self.size += 1;
            try self.map.put(item, {});
            return true;
        }

        pub fn items(self: *Self) ![]T {
            const its = self.allocator.alloc(T, self.size) catch |err| {
                std.debug.print("Initialer fail\n", .{});
                return err;
            };
            var i: usize = 0;
            var itr = self.map.keyIterator();
            while (itr.next()) |n| {
                its[i] = n.*;
                i += 1;
            }
            return its;
        }

        pub fn itemsIterator(self: *Self) std.AutoHashMap(T, void).KeyIterator {
            return self.map.keyIterator();
        }
    };
}
//for simplicity we will just us the default page allocator
pub const ZLE = error{ SolutionNotFound, MultipleSolutionsFound, ColumnNotConnected };
pub const Node = struct { index: i16, column: *Column, left: *Node, right: *Node, up: *Node, down: *Node };

const Column = struct { node: *Node, size: i8 };

pub const ZLX = struct {
    columns: []Column,
    nodes: []Node,
    root: *Node,
    size: i16,
    allocator: Allocator,
    pub fn init(allocator: Allocator) !ZLX {
        const columns = try allocator.alloc(Column, 324);
        const nodes = try allocator.alloc(Node, 3240);
        const root = try allocator.create(Node);
        var size: i16 = 0;
        root.index = -1;
        root.left = root;
        root.right = root;
        root.up = root;
        root.down = root;

        for (0..324) |columnIndex| {
            const node = &nodes[columnIndex];
            const column = &columns[columnIndex];
            column.size = 0; //the final result
            column.node = node;
            node.index = @intCast(columnIndex);
            node.column = column;
            node.left = root.left;
            node.right = root;
            root.left.right = node;
            root.left = node;
            node.up = node;
            node.down = node;
        }

        for (0..729) |rowIndex| {
            const nodeIndex = rowIndex * 4 + 324;
            const i = rowIndex / 9;
            const v = rowIndex % 9;
            const r = i / 9;
            const c = i % 9;
            const b = r / 3 * 3 + c / 3;

            const cols = [_]usize{ i, r * 9 + v + 81, c * 9 + v + 162, b * 9 + v + 243 };
            var nds: *Node = undefined;
            for (0..4) |o| {
                const node = &nodes[nodeIndex + o];
                node.index = @intCast(rowIndex);
                node.column = &columns[cols[o]];
                node.column.size += 1;
                size += 1;
                node.up = node.column.node.up;
                node.down = node.column.node;
                node.up.down = node;
                node.down.up = node;
                if (o == 0) {
                    nds = node;
                    node.left = node;
                    node.right = node;
                } else {
                    node.left = nds.left;
                    node.right = nds;
                    nds.left.right = node;
                    nds.left = node;
                }
            }
        }
        return ZLX{ .allocator = allocator, .columns = columns, .nodes = nodes, .root = root, .size = size };
    }

    pub fn deinit(self: *ZLX) void {
        self.allocator.free(self.nodes);
        self.allocator.free(self.columns);
        self.allocator.destroy(self.root);
    }

    pub fn coverNodes(self: *ZLX, nodes: []*Node) void {
        for (nodes) |node| {
            self.cover(node);
        }
    }

    pub fn coverColumn(self: *ZLX, column: *Column) void {
        self.size -= @intCast(column.size);
        column.node.left.right = column.node.right;
        column.node.right.left = column.node.left;
        var itr = column.node.down;
        while (itr != column.node) : (itr = itr.down) {
            var ritr = itr.right;
            while (ritr != itr) : (ritr = ritr.right) {
                self.size -= 1;
                ritr.column.size -= 1;
                ritr.up.down = ritr.down;
                ritr.down.up = ritr.up;
            }
        }
    }

    pub fn coverRow(self: *ZLX, row: *Node) void {
        var itr = row.right;
        while (itr != row) : (itr = itr.right) {
            self.coverColumn(itr.column);
        }
    }

    pub fn cover(self: *ZLX, row: *Node) void {
        self.coverColumn(row.column);
        self.coverRow(row);
    }

    pub fn coverPuzzle(self: *ZLX, puzzle: *[81]i8) ![]*Node {
        var nodes = std.ArrayList(*Node).init(self.allocator);
        defer nodes.deinit();
        errdefer self.uncoverNodes(nodes.items);

        for (puzzle, 0..) |val, i| {
            if (val == 0) continue;

            //get the column and if its connected the node
            const column = &self.columns[i]; //the first 81 columns represent the location in the puzzle
            if (column.node.right.left != column.node) return ZLE.ColumnNotConnected;

            const ni: usize = ((i * 9 + @as(usize, @intCast(val - 1))) * 4) + 324;
            const node = &self.nodes[ni];
            self.cover(node);

            try nodes.append(node);
        }
        return nodes.toOwnedSlice();
    }
    pub fn uncoverNodes(self: *ZLX, nodes: []*Node) void {
        var i = nodes.len;
        while (i > 0) : (i -= 1) {
            self.uncover(nodes[i - 1]);
        }
    }
    pub fn uncoverColumn(self: *ZLX, column: *Column) void {
        var itr = column.node.up;
        while (itr != column.node) : (itr = itr.up) {
            var litr = itr.left;
            while (litr != itr) : (litr = litr.left) {
                self.size += 1;
                litr.column.size += 1;
                litr.up.down = litr;
                litr.down.up = litr;
            }
        }
        self.size += column.size;
        column.node.left.right = column.node;
        column.node.right.left = column.node;
    }

    pub fn uncoverRow(self: *ZLX, row: *Node) void {
        var itr = row.left;
        while (itr != row) : (itr = itr.left) {
            //std.debug.print("Pre - {}\n", .{itr.column.node.left.right == itr.column.node});
            self.uncoverColumn(itr.column);
            //std.debug.print("Post - {}\n", .{itr.column.node.left.right == itr.column.node});
        }
    }

    pub fn uncover(self: *ZLX, row: *Node) void {
        self.uncoverRow(row);
        self.uncoverColumn(row.column);
    }

    pub fn pick(self: *ZLX) ?*Column {
        var min: ?*Column = null;
        var itr = self.root.right;
        while (itr != self.root) : (itr = itr.right) {
            if (itr.column.size == 0) return itr.column;
            if (min) |m| {
                if (itr.column.size < m.size) {
                    min = itr.column;
                }
            } else {
                min = itr.column;
            }
        }
        return min;
    }

    pub fn pickRandom(self: *ZLX, prng: *std.rand.DefaultPrng) ?*Column {
        var r = @abs(prng.random().int(i8));
        var itr = self.root.right;
        if (itr.index == -1) return null;
        while (r > 0) : (r -= 1) {
            itr = itr.right;
            if (itr.index == -1) {
                itr = itr.right;
            }
        }
        return itr.column;
    }

    pub fn pickLargest(self: *ZLX) ?*Column {
        var max: ?*Column = null;
        var itr = self.root.right;
        while (itr != self.root) : (itr = itr.right) {
            if (itr.column.size == 0) return itr.column;
            if (max) |m| {
                if (itr.column.size > m.size) {
                    max = itr.column;
                }
            } else {
                max = itr.column;
            }
        }
        return max;
    }

    pub fn solvable(self: *ZLX) bool {
        if (self.pick()) |column| {
            self.coverColumn(column);
            defer self.uncoverColumn(column);
            var itr = column.node.down;
            while (itr != column.node) : (itr = itr.down) {
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                if (self.solvable()) return true;
            }
        } else {
            return true;
        }
        return false;
    }
    pub fn rand(self: *ZLX, solution: *[81]*Node, d: i8, prng: *std.rand.DefaultPrng) error{SolutionNotFound}!void {
        if (self.pickRandom(prng)) |column| {
            self.coverColumn(column);
            defer self.uncoverColumn(column);
            var itr = column.node.down;
            while (itr != column.node) : (itr = itr.down) {
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                if (d > 0) {
                    self.rand(solution, d - 1, prng) catch continue;
                } else {
                    self.solve(solution) catch continue;
                }
                const si: usize = @intCast(@divFloor(itr.index, 9));
                solution[si] = itr;
                return;
            }
        }
    }
    pub fn solveInPlace(self: *ZLX, nodes: *Set(*Node)) !void {
        if (self.pick()) |column| {
            self.coverColumn(column);
            defer self.uncoverColumn(column);
            var itr = column.node.down;
            while (itr != column.node) : (itr = itr.down) {
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                self.solveInPlace(nodes) catch continue;
                _ = try nodes.add(itr);
                return;
            }
        } else {
            return;
        }
        return ZLE.SolutionNotFound;
    }
    pub fn solve(self: *ZLX, solution: *[81]*Node) error{SolutionNotFound}!void {
        if (self.pick()) |column| {
            self.coverColumn(column);
            defer self.uncoverColumn(column);
            var itr = column.node.down;
            while (itr != column.node) : (itr = itr.down) {
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                self.solve(solution) catch continue;
                const si: usize = @intCast(@divFloor(itr.index, 9));
                solution[si] = itr;
                return;
            }
        } else {
            return;
        }
        return ZLE.SolutionNotFound;
    }
    ///converts a sudoku puzzle to dlx then solves and converts back
    pub fn solvePuzzle(self: *ZLX, puzzle: *[81]i8) !void {
        const nodes = try self.coverPuzzle(puzzle);
        defer {
            self.uncoverNodes(nodes);
            self.allocator.free(nodes);
        }

        const solution = try self.mkSolutionList(nodes);
        defer self.allocator.free(solution);
        try self.solve(solution);
        for (solution, 0..) |node, i| {
            puzzle[i] = @intCast(@mod(node.index, 9) + 1);
        }
    }

    pub fn puzzleToNodes(self: *ZLX, puzzle: *[81]i8) !*[81]*Node {
        const solution = try self.allocator.create([81]*Node);
        for (0..81) |i| {
            if (puzzle[i] > 0) {
                const j = (i * 9 + @as(usize, @intCast(puzzle[i] - 1))) * 4 + 324;
                solution[i] = &self.nodes[j];
            }
        }
        return solution;
    }
    pub fn mkSolutionList(self: *ZLX, nodes: ?[]*Node) !*[81]*Node {
        const solution = try self.allocator.create([81]*Node);
        if (nodes) |nds| {
            for (nds) |node| {
                const i: usize = @intCast(@divFloor(node.index, 9));
                solution[i] = node;
            }
        }
        return solution;
    }

    pub fn toPuzzle(_: *ZLX, puzzle: *[81]i8, nodes: []*Node) void {
        for (nodes) |node| {
            const i: usize = @intCast(@divFloor(node.index, 9));
            const v: i8 = @intCast(@mod(node.index, 9) + 1);
            puzzle[i] = v;
        }
    }

    pub fn mkPuzzle(self: *ZLX, nodes: []*Node) ![]i8 {
        const puzzle = try self.allocator.create([81]i8);
        puzzle.* = [_]i8{0} ** 81;
        self.toPuzzle(puzzle, nodes);
        return puzzle;
    }

    pub fn quickValid(self: *ZLX) ?bool {
        var nodes = Set(*Node).init(self.allocator); //this acts as the mutable portion of the solution
        self.solveInPlace(&nodes) catch return null; //null means not solvable... not sure how this works when validating a solved puzzle
        var itr = nodes.itemsIterator();
        while (itr.next()) |node| {
            self.coverColumn(node.*.column);
            defer self.uncoverColumn(node.*.column);
            var ditr = node.*.column.node.down;
            while (ditr != node.*.column.node) : (ditr = ditr.down) {
                if (ditr == node.*) continue;
                self.coverRow(ditr);
                defer self.uncoverRow(ditr);
                if (self.solvable()) {
                    return false;
                }
            }
        }
        return true;
    }

    fn valid(self: *ZLX, solved: *bool) ZLE!void {
        if (self.pick()) |column| {
            self.coverColumn(column);
            defer self.uncoverColumn(column);
            var itr = column.node.down;
            while (itr != column.node) : (itr = itr.down) {
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                self.valid(solved) catch |err| switch (err) {
                    ZLE.SolutionNotFound => continue,
                    else => return err,
                };
            }
        } else {
            if (solved.*) {
                return ZLE.MultipleSolutionsFound;
            } else {
                solved.* = true;
                return;
            }
        }
        return ZLE.SolutionNotFound;
    }

    pub fn isValid(self: *ZLX) ZLE!void {
        var solved = false;
        return self.valid(&solved);
    }

    pub fn isUnique(self: *ZLX) bool {
        self.isValid() catch return false;
        return true;
    }

    ///Attempts to cover each node left in a column if any node in each of the unoccupied 81 spaces is solvable.
    pub fn validate(self: *ZLX, solution: *[81]*Node) ![]*Node {
        var variants = std.ArrayList(*Node).init(self.allocator);
        for (solution) |node| {
            //make sure the column is currently connected
            if (node.column.node.left.right != node.column.node) continue;
            self.coverColumn(node.column);
            defer self.uncoverColumn(node.column);
            var itr = node.column.node.down;
            while (itr != node.column.node) : (itr = itr.down) {
                if (itr == node) continue;
                self.coverRow(itr);
                defer self.uncoverRow(itr);
                if (self.solvable()) {
                    try variants.append(node);
                    break;
                }
            }
        }
        return variants.toOwnedSlice();
    }

    pub fn nodeSize(node: *Node) i16 {
        var size: i16 = 0;
        const ci: i32 = @as(i32, @intCast(node.column.node.index)) |
            (@as(i32, @intCast(node.right.column.node.index)) << 8) |
            (@as(i32, @intCast(node.right.right.column.node.index)) << 16) |
            (@as(i32, @intCast(node.right.right.right.column.node.index)) << 24);
        var iter = node.right;
        while (iter != node) : (iter = iter.right) {
            size += iter.column.size;
            var diter = iter.column.node.down;
            while (diter != iter.column.node) : (diter = diter.down) {
                var riter = diter.right;
                const ri = riter.column.node.index;
                //size += iter.column.size;
                while (riter != diter) : (riter = riter.right) {
                    if ((ci & 0xFF) == ri or
                        (ci >> 8 & 0xFF) == ri or
                        (ci >> 16 & 0xFF) == ri or
                        (ci >> 24 & 0xFF) == ri)
                    {
                        size -= 1;
                    } else {
                        size += 1;
                    }
                }
            }
        }
        return size;
    }

    const Minimizer = struct {
        grid: *ZLX,
        climb: i8,
        solution: *[81]*Node,
        current: std.ArrayList(*Node),
        partial: std.ArrayList(*Node),

        updater: *const fn ([]*Node) void,

        pub fn init(grid: *ZLX, solution: *[81]*Node, updater: *const fn ([]*Node) void) !Minimizer {
            var partial = std.ArrayList(*Node).init(grid.allocator);

            try partial.appendSlice(solution.*[0..]);

            return Minimizer{ .updater = updater, .climb = 81, .grid = grid, .solution = solution, .partial = partial, .current = std.ArrayList(*Node).init(grid.allocator) };
        }

        pub fn deinit(self: *Minimizer) void {
            self.current.deinit();
            self.partial.deinit();
        }

        const Route = struct {
            node: *Node,
            path: []*Node,
        };
        const MiniSort = struct {
            pub fn lessThan(_: MiniSort, a: *Node, b: *Node) bool {
                const aSize = ZLX.nodeSize(a);
                const bSize = ZLX.nodeSize(b);
                return aSize > bSize;
            }
            pub fn routeLessThan(_: MiniSort, a: Route, b: Route) bool {
                return a.path.len < b.path.len;
            }
        };

        pub fn sort(rem: []*Node) void {
            std.mem.sort(*Node, rem, MiniSort{}, MiniSort.lessThan);
        }
        pub fn sortRoute(rem: []Route) void {
            std.mem.sort(Route, rem, MiniSort{}, MiniSort.routeLessThan);
        }
        pub fn minimize(self: *Minimizer, remaining: []*Node, depth: i8) !void {
            Minimizer.sort(remaining);
            for (remaining) |node| {
                if (node.column.node.left.right != node.column.node) continue; //column is not connected indicating this value has already been placed.
                self.grid.cover(node);
                defer self.grid.uncover(node);
                try self.current.append(node);
                defer _ = self.current.pop();
                const diffs = try self.grid.validate(self.solution);
                defer self.grid.allocator.free(diffs);
                if (diffs.len == 0) {
                    self.partial.clearAndFree();
                    try self.partial.appendSlice(self.current.items);
                    self.updater(self.partial.items);
                    return;
                }
                if (depth + 2 >= self.partial.items.len) return;
                try self.minimize(diffs, depth + 1);
            }
        }

        pub fn minify(self: *Minimizer, remaining: []*Node) ![]*Node {
            var routes: []Route = try self.grid.allocator.alloc(Route, remaining.len);
            defer self.grid.allocator.free(routes);
            Minimizer.sort(remaining);
            for (remaining, 0..) |node, i| {
                if (node.column.node.left.right != node.column.node) continue;
                self.grid.cover(node);
                defer self.grid.uncover(node);
                routes[i] = Route{ .node = node, .path = try self.grid.validate(self.solution) };
                if (routes[i].path.len == 0) {
                    try self.current.append(node);
                    return self.current.toOwnedSlice();
                }
            }
            Minimizer.sortRoute(routes);

            for (routes) |route| {
                const node = route.node;
                const rem = route.path;
                self.grid.cover(node);
                defer self.grid.uncover(node);
                try self.current.append(node);
                defer _ = self.current.popOrNull();

                return self.minify(rem) catch continue;
            }
            return ZLE.SolutionNotFound;
        }
    };

    pub fn minimize(self: *ZLX, solution: *[81]*Node, updater: *const fn ([]*Node) void) ![]*Node {
        var minimizer = try Minimizer.init(self, solution, updater);
        defer minimizer.deinit();
        const sol = try self.allocator.alloc(*Node, 81);
        @memcpy(sol, solution);
        try minimizer.minimize(sol, 0);
        return minimizer.partial.toOwnedSlice();
    }

    pub fn minify(self: *ZLX, solution: *[81]*Node) ![]*Node {
        var minimizer = try Minimizer.init(self, solution, undefined);
        defer minimizer.deinit();
        const diffs = try self.validate(solution);
        //Minimizer.sortRoute(diffs);
        if (diffs.len == 0) return diffs; //I just need to return an empty list of nodes and oh look theres one that is not being used. if no diffs here it means nodes that were covered prior to this running being the partial
        return try minimizer.minify(diffs);
    }
    fn formatCell(self: *ZLX, value: i8) ![]const u8 {
        return if (value == 0) " " else try std.fmt.allocPrint(self.allocator, "{}", .{value});
    }
    pub fn print(self: *ZLX, nodes: []*Node) !void {
        const puzzle = try self.mkPuzzle(nodes);
        defer self.allocator.free(puzzle);
        for (0..9) |i| {
            const j = i * 9;
            std.debug.print("||{s}|{s}|{s}||{s}|{s}|{s}||{s}|{s}|{s}||\n", .{
                try self.formatCell(puzzle[j]),
                try self.formatCell(puzzle[j + 1]),
                try self.formatCell(puzzle[j + 2]),
                try self.formatCell(puzzle[j + 3]),
                try self.formatCell(puzzle[j + 4]),
                try self.formatCell(puzzle[j + 5]),
                try self.formatCell(puzzle[j + 6]),
                try self.formatCell(puzzle[j + 7]),
                try self.formatCell(puzzle[j + 8]),
            });
        }
    }

    ///Just a convenience to determine possible numbers later
    pub fn getAvailableNodes(self: *ZLX) ![]i16 {
        var pns = Set(i16).init(self.allocator);
        defer pns.deinit();
        var itr = self.root.right;
        while (itr != self.root) : (itr = itr.right) {
            var ditr = itr.down;
            while (ditr != itr) : (ditr = ditr.down) {
                _ = try pns.add(ditr.index);
            }
        }
        return try pns.items();
    }
};
