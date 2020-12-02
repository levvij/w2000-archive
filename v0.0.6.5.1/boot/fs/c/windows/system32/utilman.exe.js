const test = new Window("Test Window", 400, 300);
test.icon = "c/windows/system32/imageres/exe.png";
test.render(ui => {
	const grid = ui.Grid([
		"50%", "30%", "20%"
	], [
		"40px", "40px", "*", "20px"
	]);

	ui.root.add(grid);

	for (let i = 0; i < 4; i++) {
		for (let c of grid[i]) {
			c.add(ui.Label("x " + i));
		}
	}

	grid[1][0].add(ui.Button("Alert", () => {
		ui.Alert("Important", "So this is a test alert", "Ait Man", () => {
			console.log("done");
		});
	}));

	grid[1][1].add(ui.Button("Btn Win", () => {
		const win = ui.createButtonWindow("ARGGGGHHHH!!", "Btn window", ui.Button("Easy", () => {
			console.log("easy");

			win.close();
		}), ui.Button("JAHCOIN", () => {
			console.log("Jah");

			win.close();
		}));
	}));

	grid[1][2].add(ui.Button("Window", () => {
		const win = ui.createChildWindow("Test", 600, 300);

		win.render(ui => {
			ui.root.add(ui.Label("Jahnseh on my wrist"));
		});
	}));
});