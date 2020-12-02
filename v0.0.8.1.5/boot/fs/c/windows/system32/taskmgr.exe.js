const window = new Window("Task Manager", 200, 250);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	const grid = ui.Grid(["*"], ["*", "auto"]);
	ui.root.add(grid);
	
	const list = ui.List(Process.active.map(p => ({
		text: p.name,
		process: p,
		activate(item, old) {
			if (old) {
				for (let w of old.process.windows) {
					w.unhighlight();
				}
			}
			
			for (let w of p.windows) {
				w.highlight();
			}
		}
	})));
	
	grid[0][0].add(list);
	
	grid[1][0].add(ui.Button("End Task", () => {
		list.selectedItem.process.exit(Process.ExitCode.externallyExited);
	}));
});