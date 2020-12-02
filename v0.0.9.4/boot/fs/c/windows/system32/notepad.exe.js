let path = arguments[0];
const window = new Window((path ? fs.prettyName(path) : "Untitled") + " - Notepad", 500, 700);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	const grid = ui.Grid(["100%"], [
		"auto", "*"
	]);
	ui.root.add(grid);

	const box = ui.ToolbarBox();
	grid[0][0].add(box);

	const textArea = ui.TextArea();
	grid[1][0].add(textArea);
	
	const menu = ui.Menu([
		{
			text: "File",
			items: [
				{
					text: "New",
					key: "ctrl+n",
					click() {
						Application.load(application.path);
					}
				},
				{
					text: "Open...",
					key: "ctrl+o",
					click() {
						ui.OpenFileDialog({
							allowFile: true
						}).then(r => {
							Application.load(application.path, r);
						});
					}
				},
				{
					text: "Save",
					key: "ctrl+s",
					click() {
						if (path) {
							fs.write(path, textArea.value);
						} else {
							ui.SaveAsDialog({
								path: config.user.documents,
								default: fs.name(fs.nextName(config.user.documents, "New Textfile.txt"))
							}).then(p => {
								fs.create(path = p, textArea.value);
							});
						}
					}
				},
				{
					text: "Save As...",
					click() {
						ui.SaveAsDialog({
							path: fs.parentPath(path),
							default: fs.name(fs.nextName(path ? fs.parentPath(path) : config.user.documents, "New Textfile.txt"))
						}).then(p => {
							fs.create(path = p, textArea.value);
						});
					}
				}, {},
				{
					text: "Print...",
					click() {
						const w = open();
						w.document.body.textContent = textArea.value;
						w.print();
						w.close();
					}
				}
			]
		}
	]);
	box.add(menu);
	
	(path ? fs.read(path) : Promise.resolve("")).then(text => {
		textArea.value = text;
	});
});