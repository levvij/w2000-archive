/// DLL Explorer
/// C 2019 levvij

await DLL.load("dllinsp.dll");

// create window
const window = new Window("DLL Export Viewer", 700, 500);
let currentDll;

// main render
window.render(ui => {
	const grid = ui.Grid(["250px", "*"], ["100%"]);
	ui.root.add(grid);

	// create dll list (unique by path)
	const dlls = ui.List(DLL.loadedModules.filter((d, i) => DLL.loadedModules.map(l => l.path).indexOf(d.path) == i).map(dll => ({
		text: dll.name,
		select() {
			currentDll = dll;
			window.render();
		}
	})));
	grid[0][0].add(dlls);

	if (currentDll) {
		// inspect dll
		const inspector = new DLLInspect(currentDll.path);

		const content = ui.Grid(["100%"], ["auto", "*"]);
		grid[0][1].add(content);

		// object explorer function
		const items = [];
		const rec = (ob, key, path) => {
			if (ob === null || ob === undefined) {
				return {
					title: key + " " + (ob === null ? "null" : "undefined")
				};
			}
			
			if (items.map(i => i[0]).includes(ob)) {
				return {
					title: key + " = " + items.find(i => i[0] == ob)[1]
				};
			}

			items.push([ob, path]);

			switch (typeof ob) {
				case "function":
					{
						return {
							title: "ƒ " + key + "(" + ob.length + ")",
							items: [...Object.keys(ob).map(k => rec(ob[k], k, path + "." + k))]
						};
					}
				case "object":
					{
						if (Array.isArray(ob)) {
							return {
								title: key + "[" + ob.length + "]",
								items: ob.map((e, i) => rec(e, i, path + "[" + i + "]"))
							};
						} else {
							return {
								title: key + " {" + Object.keys(ob).length + "}",
								items: Object.keys(ob).map(k => rec(ob[k], k, path + "." + k))
							};
						}
					}
				case "boolean":
					{
						return {
							title: key + " bool(" + ob + ")"
						};
					}
				case "number":
					{
						return {
							title: key + " number(" + ob + ", 0x" + ob.toString(16).padStart(8, 0) + ")",
							items: [{
									title: ob,
									font: UI.fonts.monospace
								},
								{
									title: "0b" + ob.toString(2),
									font: UI.fonts.monospace
								},
								{
									title: "0x" + ob.toString(16),
									font: UI.fonts.monospace
								}
							]
						};
					}
				case "string":
					{
						return {
							title: key + " string(" + ob.length + ")",
							items: [{
								title: ob,
								font: UI.fonts.monospace
							}]
						};
					}
				case "symbol":
					{
						return {
							title: key + " symbol(" + ob + ")"
						};
					}
			}
		};

		// create tree
		const tree = ui.TreeView(inspector.objects.map(o => rec(o.value, o.name + " [0x" + o.location.toString(16).padStart(8, 0) + "]", o.name)));
		content[0][0].add(tree);
	}
});