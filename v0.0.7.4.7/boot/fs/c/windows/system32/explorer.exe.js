const properties = file => {
	const window = new Window("Properties of " + fs.prettyName(file), 400, 500);

	window.render(ui => {
		const tabs = ui.Tabs([
			"General",
			"Sharing"
		]);
		
		const stack = ui.StackPanel();
		tabs[0].add(stack);
		
		const headGrid = ui.InlineGrid(["80px", "*"], ["32px"]);
		stack.add(headGrid);
		
		headGrid[0][0].add(ui.Icon(file, 32));
		
		const name = ui.TextBox(fs.name(file));
		name.margin = "5px 0";
		headGrid[0][1].add(name);
		
		let items = [];
		
		/*if (fs.isDirectory(file)) {
			
		} else if (fs.isLink(file)) {
			
		} else if (fs.isDisk(file)) {
			
		} else {
			
		}*/
		
		for (let item of items) {
			if (item.title) {
				const g = ui.InlineGrid(["80px", "*"], ["*"]);
				g.padding = "5px 0";
				g[0][0].add(ui.Label(item.title));
				g[0][1].add(ui.Label(item.value));
				stack.add(g);
			} else {
				stack.add(ui.Separator());
			}
		}
		
		ui.root.add(tabs);
	});
};

if (arguments.has("p")) {
	properties(arguments.get("p"));
} else if (arguments[0] && fs.exists(arguments[0]) && fs.isLink(arguments[0])) {
	properties(arguments[0]);
} else {
	let path = arguments[0] || "";
	let renamePath;

	const window = new Window(fs.prettyName(path), 700, 550);

	window.render(ui => {
		const grid = ui.Grid(["100%"], [
			"auto", "*"
		]);
		ui.root.add(grid);
		
		window.icon = fs.icon(path, 16);

		const box = ui.ToolbarBox();
		grid[0][0].add(box);

		const fileContextMenu = [{
			text: "New",
			items: [{
					text: "Folder",
					icon: fs.icon(config.fs.icons.directory, 16),
					async click() {
						renamePath = fs.nextName(path, "New Folder");
						await fs.mkdir(renamePath);
						window.render();
					}
				}, {},
				{
					text: "Rich Text Document",
					icon: fs.icon(config.fs.icons.rtf, 16),
					disabled: true
				},
				{
					text: "Text Document",
					icon: fs.icon(config.fs.icons.txt, 16),
					async click() {
						renamePath = fs.nextName(path, "New Textfile.txt");
						await fs.create(renamePath);
						window.render();
					}
				},
				{
					text: "Wave Sound",
					icon: fs.icon(config.fs.icons.mp3, 16),
					disabled: true
				}
			]
		}];

		const menu = ui.Menu([{
			text: "File",
			items: fileContextMenu
		}]);
		box.add(menu);

		const address = ui.TextBox(path);

		const body = ui.Grid(["180px", "*"], ["100%"]);
		grid[1][0].add(body);

		const scroll = ui.Scroll();
		body[0][0].add(scroll);

		const stack = ui.StackPanel();
		stack.background = "#FFFFFF";
		scroll.add(stack);

		stack.add(ui.Image(fs.icon("floimg/0x0002")));

		const title = ui.Title(fs.prettyName(path), 5);
		title.padding = "5px 10px";
		stack.add(title);

		const rect = ui.Rect("calc(100% - 10px)", "2px");
		rect.margin = "0 10px 0 0";
		rect.background = "#6699CC";
		stack.add(rect);

		const selectText = ui.Label();
		selectText.padding = "10px";
		stack.add(selectText);

		const list = ui.List();
		body[0][1].add(list);

		let selectedItem;
		const renderSelectedItem = () => {
			if (selectedItem) {
				const item = selectedItem;

				selectText.text = "";
				selectText.add(ui.Title(fs.name(item), 7));

				const type = ui.Label(fs.fileTypeName(item));
				type.padding = "0 0 15px 0";
				selectText.add(type);

				if (fs.isDisk(item)) {
					let localSize = 0;
					
					const infos = fs.providers.map(p => p.diskInfo(item));
					
					requestAnimationFrame(() => {
						const chart = ui.Chart({
							valueTransform: value => fs.readableSize(value),
							segments: [...infos.map(i => ({
								text: "Used (" + i.name + ")",
								value: i.used
							})), {
								text: "Free",
								value: infos.reduce((a, c) => a + c.free, 0),
								color: "#FFFFFF"
							}]
						});
						
						selectText.add(chart);
					});
				} else if (fs.isFile(item)) {
					const size = ui.Label("Calculating size...");
					size.padding = "0 0 15px 0";
					selectText.add(size);

					fs.size(item).then(bytes => {
						if (selectedItem == item) {
							size.text = "Size: " + fs.readableSize(bytes);
							
							const description = ui.Label(fs.description(item));
							selectText.add(description);
						}
					});
				} else if (fs.isDirectory(item)) {
					const count = ui.Label("Content: " + fs.list(item).filter(f => fs.isFile(f)).length + " Files and " + fs.list(item).filter(f => fs.isDirectory(f)).length + " Folders");
					selectText.add(count);
					
					const description = ui.Label(fs.description(item));
					selectText.add(description);
				}
			} else {
				selectText.text = "Select an item to view its description.";
			}
		};

		const renderList = () => {
			if (path) {
				list.contextMenu = fileContextMenu;
				list.items = [{
						text: "..",
						select() {
							path = fs.parentPath(path);
							window.render();
						}
					},
					...fs.list(path).map(p => ({
						text: fs.prettyName(p),
						icon: fs.icon(p, 16),
						contextMenu: fs.isDirectory(p) ? [{
							text: "Rename",
							click() {
								renamePath = p;
								renderList();
							}
						}, {
							text:" Delete",
							click() {
								fs.delete(p).then(() => {
									renderList();
								});
							}
						}] : [{
								text: "Open",
								click() {
									Application.run(p);
								}
							},
							{
								text: "Edit",
								click() {
									Application.edit(p);
								}
							}, {},
							{
								text: "Rename",
								click() {
									renamePath = p;
									renderList();
								}
							},
							{
								text: "Delete",
								click() {
									fs.delete(p).then(() => {
										renderList();
									});
								}
							}, {},
							{
								text: "Copy",
								click() {
									renamePath = p;
									renderList();
								}
							}
						],
						select() {
							if (fs.isDirectory(p)) {
								path = p;
								window.render();
							} else {
								Application.run(p).catch(() => {
									ui.ErrorBox("Cannot open " + p);
								});
							}
						},
						activate() {
							selectedItem = p;
							renderSelectedItem();
						},
						deactivate() {
							selectedItem = null;
							renderSelectedItem();
						}
					}))
				];
			} else {
				list.items = fs.disks.map(d => ({
					text: fs.prettyName(d),
					icon: fs.icon(d, 16),
					select() {
						path = d;
						window.render();
					},
					activate() {
						selectedItem = d;
						renderSelectedItem();
					},
					deactivate() {
						selectedItem = null;
						renderSelectedItem();
					}
				}));
			}
		}

		renderList();
	});
}