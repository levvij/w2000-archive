const properties = file => {
	const window = new Window(fs.prettyName(file) + " Properties", 370, 400);
	window.buttonStyle = Window.ButtonStyle.close;

	window.render(async ui => {
		const tabs = ui.Tabs([
			"General"
		]);

		const stack = ui.StackPanel();
		tabs[0].add(stack);

		const headGrid = ui.InlineGrid(["80px", "*"], ["32px"]);
		stack.add(headGrid);

		headGrid[0][0].add(ui.Icon(file, 32));

		const name = ui.TextBox(fs.name(file));
		name.margin = "5px 0";
		headGrid[0][1].add(name);

		const extinfo = fs.extinfo(fs.ext(file));

		for (let item of [{},
				...fs.isDirectory(file) ? [{
					title: "Type:",
					value: fs.fileTypeName(file)
				}] : [{
						title: "Type of file:",
						value: fs.fileTypeName(file)
					},
					{
						title: "Opens with:",
						value: extinfo && fs.exeinfo(extinfo.opener).name
					}, {}
				],
				...(file ? [{
						title: "Location:",
						value: file,
						tooltip: "Stored in " + (fs.providerOf(file) || {
							name: "Unknown"
						}).name + " provider"
					},
					...fs.isDirectory(file) ? [{
						title: "Size:",
						value: fs.readableSize((await Promise.all(fs.listAll(file).map(v => fs.size(v)))).reduce((a, c) => a + (c || 0), 0))
					}, {
						title: "Size on disk:",
						value: fs.readableSize((await Promise.all(fs.listAll(file).map(v => fs.sizeOnDisk(v)))).reduce((a, c) => a + (c || 0), 0))
					}, {
						title: "Contains:",
						value: fs.list(file).filter(f => fs.isFile(f)).length + " Files, " + fs.list(file).filter(f => fs.isDirectory(f)).length + " Folders"
					}] : [{
							title: "Size:",
							value: fs.readableSize(await fs.size(file) || 0)
						},
						{
							title: "Size on disk:",
							value: fs.readableSize(await fs.sizeOnDisk(file) || 0)
						}
					],
					{},
					...fs.isDirectory(file) ? [{
						title: "Created:",
						value: fs.times(file).ctime.toLongString()
					}] : [{
							title: "Created:",
							value: fs.times(file).ctime.toLongString()
						},
						{
							title: "Modified:",
							value: fs.times(file).ctime.toLongString()
						}
					]
				] : [])
			]) {
			if (item.title) {
				const g = ui.InlineGrid(["80px", "*"], ["*"]);
				g.padding = "5px 0";
				g[0][0].add(ui.Label(item.title));

				const v = ui.Label(item.value);
				v.tooltip = item.tooltip;

				g[0][1].add(v);
				stack.add(g);
			} else {
				stack.add(ui.Separator());
			}
		}

		ui.root.add(tabs);
	});
};

const move = async (files, dest) => {
	application.log.action("move", files, dest);

	if (fs.isLink(dest)) {
		dest = fs.resolve(dest).path;
	}

	files = files.filter((f, i, a) => a.indexOf(f) == i);

	if (files.length) {
		const window = new Window("Moving...", 300, 130);
		window.buttonStyle = Window.ButtonStyle.close;
		
		await window.render(async ui => {
			const stack = ui.StackPanel();
			ui.root.add(stack);

			stack.padding = "10px";

			const image = ui.Image(application.resource("move.gif"));
			image.height = "57px";
			stack.add(image);

			const fileNameLabel = ui.Label("Preparing...");
			fileNameLabel.clipLine = true;
			stack.add(fileNameLabel);

			const fromLabel = ui.Label("From '" + fs.prettyName(fs.parentPath(files[0])) + "' to '" + fs.prettyName(dest) + "'");
			fromLabel.padding = "5px 0";
			stack.add(fromLabel);
			
			const fileCount = files.map(f => fs.isDirectory(f) ? [f, ...fs.listAll(f)] : [f]).reduce((a, c) => a + c.length, 0);

			const progressBar = ui.ProgressBar(0, fileCount);
			stack.add(progressBar);
			
			const duration = ui.Label("Calculating remaining time...");
			stack.add(duration);
			
			const totalSize = (await Promise.all(files.map(f => fs.isDirectory(f) ? [f, ...fs.listAll(f)] : [f]).map(f => Promise.all(f.map(x => fs.size(x)))))).reduce((a, c) => a + c.reduce((a, c) => a + (c || 1024), 0), 0);
			
			let index = 0;
			let moved = 0;
			
			const start = +new Date();
			for (let i = 0; i < files.length; i++) {
				progressBar && (progressBar.value = i);
				fileNameLabel.text = fs.prettyName(files[i]);

				await fs.move(files[i], dest, async (from, to) => {
					moved += await fs.size(from) || 1024;
					
					duration.text = Math.ceil((totalSize / moved * (+new Date() - start) - (+new Date() - start)) / 1000) + "s remaining";
					fileNameLabel.text = from.replace(files[i], fs.prettyName(files[i]));
					progressBar && (progressBar.value = index++);
				});
			}

			progressBar.value = files.length;
		});

		window.close();
	}
};

if (arguments.has("p")) {
	// properties
	properties(arguments.get("p"));
} else if (arguments.has("m")) {
	// move ui
	move(arguments.get("m"), arguments.get("m", 1));
} else if (arguments[0] && fs.exists(arguments[0]) && fs.isLink(arguments[0])) {
	// link properties
	properties(arguments[0]);
} else {
	// standard window
	const window = new Window("", 700, 550);
	window.onclose.subscribe(() => exit(Process.ExitCode.success));

	window.state.path = arguments[0] || "";
	window.state.renamePath = "";
	window.state.listStyle = UI.ListStyle.default;
	window.state.selectedItem = null;

	window.state.history = new History(window.state.path);

	window.render(async ui => {
		const grid = ui.Grid(["100%"], [
			"auto", "*"
		]);
		ui.root.add(grid);

		window.state.selectedItem = null;

		window.icon = fs.icon(window.state.path, 16);
		window.title = fs.prettyName(window.state.path);

		const box = ui.ToolbarBox();
		grid[0][0].add(box);

		if (!window.state.path || fs.exists(window.state.path)) {
			const fileContextMenu = [{
				text: "New",
				disabled: !window.state.path,
				items: [{
						text: "Folder",
						icon: fs.icon(".", 16),
						async click() {
							renamePath = fs.nextName(window.state.path, "New Folder");
							await fs.mkdir(renamePath);
							window.render();
						}
					}, {},
					...fs.creators.map(creator => ({
						text: creator.name,
						icon: fs.icon("." + creator.ext, 16),
						async click() {
							window.state.renamePath = fs.nextName(window.state.path, "New " + creator.name + "." + creator.ext);
							await fs.create(window.state.renamePath, creator.content);
							window.render();
						}
					}))
				]
			}, {}, {
				text: "Create Shortcut",
				disabled: true
			}, {
				text: "Delete",
				disabled: true
			}, {
				text: "Rename",
				disabled: true
			}, {
				text: "Properties",
				click() {
					if (window.state.selectedItem) {
						properties(window.state.selectedItem);
					} else {
						properties(window.state.path);
					}
				}
			}, {}, {
				text: "Close",
				click() {
					window.close();
				}
			}];

			const menu = ui.Menu([{
				text: "File",
				items: fileContextMenu
			}, {
				text: "Edit",
				items: [{
					text: "Undo",
					key: "ctrl+z",
					disabled: true
				}, {}, {
					text: "Cut",
					key: "ctrl+x",
					disabled: true
				}, {
					text: "Copy",
					key: "ctrl+c",
					disabled: true
				}, {
					text: "Paste",
					key: "ctrl+v",
					disabled: true
				}, {
					text: "Paste Shortcut",
					disabled: true
				}, {}, {
					text: "Copy to folder...",
					disabled: true
				}, {
					text: "Move to folder...",
					disabled: true
				}, {}, {
					text: "Select All",
					key: "ctrl+a",
					disabled: true
				}, {
					text: "Invert Selection",
					disabled: true
				}]
			}, {
				text: "View",
				items: [{
					checked: window.state.listStyle == UI.ListStyle.default,
					text: "List",
					check() {
						window.state.listStyle = UI.ListStyle.default;
						window.render();
					}
				}, {
					checked: window.state.listStyle == UI.ListStyle.bigIcons,
					text: "Large Icons",
					check() {
						window.state.listStyle = UI.ListStyle.bigIcons;
						window.render();
					}
				}]
			}]);
			box.add(menu);

			box.add(ui.Menu([{
				text: "Back",
				icon: application.resource("back.png"),
				tooltip: "Back",
				disabled: !window.state.history.canGoBack,
				click() {
					window.state.path = window.state.history.back();
					window.render();
				}
			}, {
				icon: application.resource("forward.png"),
				disabled: !window.state.history.canGoForward,
				tooltip: "Forward",
				click() {
					window.state.path = window.state.history.forward();
					window.render();
				}
			}, {
				icon: application.resource("up-dir.png"),
				disabled: !window.state.path,
				tooltip: "Up",
				click() {
					window.state.path = fs.parentPath(window.state.path);
					window.state.history.push(window.state.path);

					window.render();
				}
			}]));

			const addressBar = ui.TextBox(window.state.path);
			const address = ui.Menu([{
					text: "Address"
				},
				{
					input: addressBar,
					width: "100%"
				},
				{
					text: "Go",
					icon: application.resource("go.png"),
					click() {
						const text = addressBar.value;

						if (fs.exists(text)) {
							window.state.history.push(text);

							window.state.path = text;
							window.render();
						} else {
							UI.ErrorBox("Not found", "Cannot find '" + text + "'.");
						}
					}
				}
			]);
			box.add(address);

			const body = ui.Grid(["180px", "*"], ["100%"]);
			grid[1][0].add(body);

			const scroll = ui.Scroll();
			body[0][0].add(scroll);

			const stack = ui.StackPanel();
			stack.background = "#FFFFFF";
			scroll.add(stack);

			stack.add(ui.Image(application.resource("header.png")));

			const title = ui.Title(fs.prettyName(window.state.path), 5);
			title.padding = "5px 10px";
			stack.add(title);

			const rect = ui.Rect("calc(100% - 10px)", "2px");
			rect.margin = "0 10px 0 0";
			rect.background = "#6699CC";
			stack.add(rect);

			const selectText = ui.Label();
			selectText.padding = "10px";
			stack.add(selectText);

			const list = ui.List([], window.state.listStyle);

			if (window.state.path) {
				list.makeDropContainer(async item => {
					if (item.files) {
						move(item.files, window.state.path);
					}
				});
			}

			body[0][1].add(list);

			const renderSelectedItem = () => {
				if (window.state.selectedItem) {
					const item = window.state.selectedItem;

					selectText.text = "";
					selectText.add(ui.Title(fs.name(item), 7));

					const type = ui.Label(fs.fileTypeName(item));
					type.padding = "0 0 15px 0";
					selectText.add(type);

					if (fs.isDisk(item)) {
						let localSize = 0;

						const infos = fs.providers.map(p => p.diskInfo(item));

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
					} else if (fs.isFile(item)) {
						const size = ui.Label("Calculating size...");
						size.padding = "0 0 15px 0";
						selectText.add(size);

						fs.size(item).then(bytes => {
							if (window.state.selectedItem == item) {
								size.text = "Size: " + fs.readableSize(bytes);

								const description = ui.Label(fs.description(item));
								selectText.add(description);
							}
						});
					} else if (fs.isDirectory(item)) {
						const files = fs.list(item).filter(f => fs.isFile(f)).length;
						const folders = fs.list(item).filter(f => fs.isDirectory(f)).length;
						
						selectText.add(ui.Label((files + folders) ? "Content: " + files + " Files and " + folders + " Folders" : "There are no items in " + fs.prettyName(item)));

						const description = ui.Label(fs.description(item));
						selectText.add(description);
					}
				} else {
					if (fs.exists(window.state.path)) {
						const meta = fs.meta(window.state.path);
						selectText.text = "";

						if (meta && meta.description) {
							for (let block of meta.description.split("\n")) {
								selectText.add(ui.Label(block)).padding = "0 0 10px 0";;
							}
						}

						const files = fs.list(window.state.path).filter(f => fs.isFile(f)).length;
						const folders = fs.list(window.state.path).filter(f => fs.isDirectory(f)).length;

						if (files + folders) {
							selectText.add(ui.Label("Content: " + files + " Files and " + folders + " Folders")).padding = "0 0 10px 0";
							selectText.add(ui.Label("Select an item to view its description."));
						} else {
							selectText.add(ui.Label("There are no items in " + fs.prettyName(window.state.path)));
						}
					} else {
						selectText.add(ui.Label("Select an item to view its description."));
					}
				}
			};

			const renderList = () => {
				if (window.state.path) {
					const open = p => {
						if ((fs.extinfo(fs.ext(p)) && fs.extinfo(fs.ext(p)).opener) ||  fs.isExecuteable(p)) {
							Application.run(p).catch(e => {
								UI.ErrorBox("Error opening " + fs.name(p), "The application could not start because a error occured:\n" + e.message);
							});
						} else {
							UI.ErrorBox("Error opening " + fs.name(p), "No application can open '" + fs.fileTypeName(p) + "'");
						}
					};

					list.contextMenu = fileContextMenu;
					list.items = fs.list(window.state.path).map(p => ({
						text: fs.prettyName(p),
						icon: fs.icon(p, window.state.listStyle == UI.ListStyle.default ? 16 : 48),
						draggable: {
							ondrag() {
								return {
									files: [p]
								}
							},
							ondrop() {
								renderList();
							}
						},
						dropContainer: fs.isDirectory(p) && {
							async ondrop(item) {
								if (item.files) {
									move(item.files.filter(f => f != p), p);
								}

								renderList();
							}
						},
						contextMenu: fs.isDirectory(p) ? [{
							text: "Rename",
							click() {
								window.state.renamePath = p;
								renderList();
							}
						}, {
							text: "Delete",
							click() {
								fs.delete(p).then(() => {
									renderList();
								});
							}
						}, ...(fs.isExecuteable(p) ? [{
							text: "Show Package Contents",
							click() {
								window.state.path = p;
								window.render();
							}
						}] : [])] : [{
								text: "Open",
								click() {
									open(p);
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
									window.state.renamePath = p;
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
									window.state.renamePath = p;
									renderList();
								}
							}
						],
						select() {
							if (fs.isExecuteable(p)) {
								open(p);
							} else if (fs.isDirectory(p)) {
								window.state.history.push(p);

								window.state.path = p;
								window.render();
							} else if (fs.isLink(p) && fs.isDirectory(fs.resolve(p).path)) {
								window.state.history.push(p);

								window.state.path = p;
								window.render();
							} else {
								open(p);
							}
						},
						activate() {
							window.state.selectedItem = p;
							renderSelectedItem();
						},
						deactivate() {
							window.state.selectedItem = null;
							renderSelectedItem();
						}
					}));
				} else {
					list.items = fs.disks.map(d => ({
						text: fs.prettyName(d),
						icon: fs.icon(d, window.state.listStyle == UI.ListStyle.default ? 16 : 48),
						select() {
							window.state.history.push(d);

							window.state.path = d;
							window.render();
						},
						activate() {
							window.state.selectedItem = d;
							renderSelectedItem();
						},
						deactivate() {
							window.state.selectedItem = null;
							renderSelectedItem();
						}
					}));
				}
			}
			
			if (window.state.path) {
				fs.listen(window.state.path, () => {
					renderList();
				})
			}

			renderList();
			renderSelectedItem();
		} else {
			UI.ErrorBox("Not found", "Path '" + window.state.path + "' not found");
		}
	});
}