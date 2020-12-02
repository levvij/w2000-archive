/// Development Environnement 
/// C 2019 levvij

await DLL.load("print.dll");

let path = arguments[0];

// create window
const window = new Window((path ? fs.prettyName(path) : "Untitled") + " - AGY Studio", 900, 700);

// add hue rotate effect
let deg = 0;
setInterval(() => {
	if (document.body) {
		document.body.style.filter = "hue-rotate(" + deg++ + "deg)";
	}
}, 7000);

// main render
window.render(ui => {
	const grid = ui.Grid(["100%"], [
		"auto", "*"
	]);
	ui.root.add(grid);

	const body = ui.Grid(["250px", "*"], ["*"]);
	grid[1][0].add(body);

	const box = ui.ToolbarBox();
	grid[0][0].add(box);

	const tree = ui.FileTree(fs.parentPath(path), {
		showFiles: true
	});
	body[0][0].add(tree);
	
	// open corresponding edit if any file is pressed
	// default editor system-wide is devenv.exe
	tree.onselect.subscribe(f => {
		Application.edit(f);
	});
	
	// main code editor
	// its better than visual studio so stfu
	const textArea = ui.TextArea();
	body[0][1].add(textArea);

	const menu = ui.Menu([{
			text: "File",
			items: [{
					text: "New",
					key: "ctrl+n",
					click() {
						// repoen devenv
						Application.load(application.path);
					}
				},
				{
					text: "Open...",
					key: "ctrl+o",
					click() {
						// open new file
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
						// save current file
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
						// save file as
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
						// print body
						
						const document = new PrinterDocument();
						document.write(textArea.value);
						document.print();
					}
				}
			]
		},
		{
			text: "Run",
			click() {
				// run program
				if (path.endsWith(".js")) {
					Application.run(path.split(".").slice(0, -1).join("."));
				} else {
					Application.run(path);
				}
			}
		}
	]);
	box.add(menu);

	// either read or create a new file
	(path ? fs.read(path) : Promise.resolve("")).then(text => {
		textArea.value = text;
	});
});