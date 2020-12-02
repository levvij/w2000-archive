const window = new Window("Windows Task Manager", 400, 420);
window.onclose.subscribe(() => exit(Process.ExitCode.success));
window.icon = fs.icon("taskmgr/0x006B", 16);

window.render(ui => {
	const tabs = ui.Tabs([
		"Applications",
		"Processes",
		"Performance"
	]);
	ui.root.add(tabs);
	
	const applicationGrid = ui.Grid(["*"], ["*", "auto"]);
	tabs[0].add(applicationGrid);
	
	const applicationList = ui.List([]);
	
	applicationGrid[0][0].add(applicationList);
	applicationGrid[1][0].add(ui.Button("End Task", () => {
		applicationList.selectedItem.process.kill();
	}));
	
	const processGrid = ui.Grid(["*"], ["*", "auto"]);
	tabs[1].add(processGrid);
	
	const processDataView = ui.DataGrid(["Name", "PID", "Timers"], []);
	processGrid[0][0].add(processDataView);
	
	const update = () => {
		applicationList.items = Process.active.filter(p => p.windows.length).map(p => ({
			text: p.windows[0].title,
			icon: p.windows[0].icon,
			tooltip: p.path,
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
		}));
		
		processDataView.rows = Process.active.map(process => ({
			contextMenu: [
				{
					text: "End Process",
					click() {
						process.kill();
					}
				}
			],
			columns: [
				{
					text: process.name,
					tooltip: process.path
				},
				{
					text: process.pid,
					align: UI.Align.right
				},
				{
					text: process.timers.filter(c => c.running).length + "/" + process.timers.length,
					align: UI.Align.right
				}
			]
		}));
	};
	
	update();
	
	Event.subscribe(Process.onexit, Process.onstart, Process.onnewwindow, Process.onnewtimer, Process.ontimerstop, () => update());
});