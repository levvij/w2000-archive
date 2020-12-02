const properties = async file => {
	const window = new Window((await Path.getPrettyName(file)) + " Properties", 370, 400);
	window.buttonStyle = Window.ButtonStyle.close;

	window.render(async ui => {
		const tabs = ui.Tabs([
			"General",
			"Storage"
		]);

		const extinfo = await Path.extInfo(Path.ext(file));

		const contents = [
			[{},
				...(await fs.isDirectory(file)) ? [{
					title: "Type:",
					value: await Path.getFileTypeName(file)
				}] : [{
						title: "Type of file:",
						value: await Path.getFileTypeName(file)
					},
					{
						title: "Opens with:",
						value: extinfo && await Path.exeInfo(extinfo.opener).name
					}, {}
				],
				...(file ? [{
						title: "Location:",
						value: file,
						tooltip: "Stored in " + (await fs.providerOf(file) || {
							name: "Unknown"
						}).name + " provider"
					},
					...await fs.isDirectory(file) ? [{
						title: "Contains:",
						value: (await fs.listFiles(file)).length + " Files, " + (await fs.listDirectories(file)).length + " Folders"
					}] : [{
							title: "Size:",
							value: Path.readableSize(await fs.size(file) || 0)
						},
						{
							title: "Size on disk:",
							value: Path.readableSize(await fs.sizeOnDisk(file) || 0)
						}
					], {},
					...((await fs.isDirectory(file)) ? [{
						title: "Created:",
						value: (await fs.times(file)).ctime.toLongString()
					}] : [{
							title: "Created:",
							value: (await fs.times(file)).ctime.toLongString()
						},
						{
							title: "Modified:",
							value: (await fs.times(file)).ctime.toLongString()
						}
					])
				] : [])
			],
			[{
				title: "Provider:",
				value: (await fs.providerOf(file)).name
			}]
		];

		for (let i = 0; i < contents.length; i++) {
			const stack = ui.StackPanel();
			tabs[i].add(stack);

			if (!i) {
				const headGrid = ui.InlineGrid(["80px", "*"], ["32px"]);
				stack.add(headGrid);

				headGrid[0][0].add(ui.Icon(file, 32));

				const name = ui.TextBox(Path.name(file));
				name.margin = "5px 0";
				headGrid[0][1].add(name);
			}

			for (let item of contents[i]) {
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
		}

		ui.root.add(tabs);
	});
};

const move = async (files, dest) => {
	application.log.action("move", files, dest);

	if (await fs.isLink(dest)) {
		dest = await fs.resolve(dest).path;
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

			const fromLabel = ui.Label("From '" + await Path.getPrettyName(Path.parentPath(files[0])) + "' to '" + await Path.getPrettyName(dest) + "'");
			fromLabel.padding = "5px 0";
			stack.add(fromLabel);

			const files = (await Promise.all(files.map(async f => await fs.isDirectory(f) ? [f, ...(await fs.listAll(f))] : [f]))).flat();
			let totalSize = 0;

			for (let file of files) {
				totalSize += await fs.size(file);
			}

			const fileCount = files.length;

			const progressBar = ui.ProgressBar(0, fileCount);
			stack.add(progressBar);

			const duration = ui.Label("Calculating remaining time...");
			stack.add(duration);

			let index = 0;
			let moved = 0;

			const start = +new Date();

			for (let i = 0; i < files.length; i++) {
				progressBar && (progressBar.value = i);
				fileNameLabel.text = await Path.getPrettyName(files[i]);

				await fs.move(files[i], dest, async (from, to) => {
					moved += await fs.size(from) || 1024;

					duration.text = Math.ceil((totalSize / moved * (+new Date() - start) - (+new Date() - start)) / 1000) + "s remaining";
					fileNameLabel.text = from.replace(files[i], await Path.getPrettyName(files[i]));
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
} else if (arguments[0] && await fs.exists(arguments[0]) && await fs.isLink(arguments[0])) {
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

		window.icon = Icon.fromPath(window.state.path, 16);
		window.title = await Path.getPrettyName(window.state.path);

		const box = ui.ToolbarBox();
		grid[0][0].add(box);

		if (!window.state.path || await fs.exists(window.state.path)) {
			const fileContextMenu = [{
				text: "New",
				disabled: !window.state.path,
				items: [{
						text: "Folder",
						icon: Icon.directory(16),
						async click() {
							renamePath = await Path.nextName(window.state.path, "New Folder");
							await fs.mkdir(renamePath);
							window.render();
						}
					}, {},
					...fs.creators.map(creator => ({
						text: creator.name,
						icon: Icon.fromExt(creator.ext, 16),
						async click() {
							window.state.renamePath = await Path.nextName(window.state.path, "New " + creator.name + "." + creator.ext);
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
					window.state.path = Path.parentPath(window.state.path);
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
					async click() {
						const text = addressBar.value;

						if (await fs.exists(text)) {
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

			const title = ui.Title(await Path.getPrettyName(window.state.path), 5);
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

			const renderSelectedItem = async () => {
				if (window.state.selectedItem) {
					const item = window.state.selectedItem;

					selectText.text = "";
					selectText.add(ui.Title(Path.name(item), 7));

					const type = ui.Label(await Path.getFileTypeName(item));
					type.padding = "0 0 15px 0";
					selectText.add(type);

					if (await fs.isDisk(item)) {
						const infos = fs.providers.map(p => p.diskInfo(item));

						const chart = ui.Chart({
							valueTransform: value => Path.readableSize(value),
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
					} else if (await fs.isFile(item)) {
						const size = ui.Label("Calculating size...");
						size.padding = "0 0 15px 0";
						selectText.add(size);

						fs.size(item).then(async bytes => {
							if (window.state.selectedItem == item) {
								size.text = "Size: " + Path.readableSize(bytes);

								const description = ui.Label(await Path.getDescription(item));
								selectText.add(description);
							}
						});
					} else if (await fs.isDirectory(item)) {
						const files = (await fs.listFiles(item)).length;
						const folders = (await fs.listDirectories(item)).length;

						selectText.add(ui.Label((files + folders) ? "Content: " + files + " Files and " + folders + " Folders" : "There are no items in " + await Path.getPrettyName(item)));

						const description = ui.Label(await Path.getDescription(item));
						selectText.add(description);
					}
				} else {
					if (await fs.exists(window.state.path)) {
						const meta = await fs.meta(window.state.path);
						selectText.text = "";

						if (meta && meta.description) {
							for (let block of meta.description.split("\n")) {
								selectText.add(ui.Label(block)).padding = "0 0 10px 0";
							}
						}

						const files = (await fs.listFiles(window.state.path)).length;
						const folders = (await fs.listDirectories(window.state.path)).length;

						if (files + folders) {
							selectText.add(ui.Label("Content: " + files + " Files and " + folders + " Folders")).padding = "0 0 10px 0";
							selectText.add(ui.Label("Select an item to view its description."));
						} else {
							selectText.add(ui.Label("There are no items in " + await Path.getPrettyName(window.state.path)));
						}
					} else {
						selectText.add(ui.Label("Select an item to view its description."));
					}
				}
			};

			const renderList = async () => {
				if (window.state.path) {
					const open = async p => {
						if ((await fs.extinfo(Path.ext(p)) && (await fs.extinfo(Path.ext(p))).opener) ||  await fs.isExecuteable(p)) {
							Application.run(p).catch(e => {
								UI.ErrorBox("Error opening " + Path.name(p), "The application could not start because a error occured:\n" + e.message);
							});
						} else {
							UI.ErrorBox("Error opening " + Path.name(p), "No application can open '" + Path.getFileTypeName(p) + "'");
						}
					};

					list.contextMenu = fileContextMenu;

					const items = [];

					for (let p of await fs.list(window.state.path)) {
						items.push({
							text: Path.getPrettyName(p),
							iconPath: p,
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
							dropContainer: (await fs.isDirectory(p)) && {
								async ondrop(item) {
									if (item.files) {
										move(item.files.filter(f => f != p), p);
									}

									renderList();
								}
							},
							contextMenu: (await fs.isDirectory(p)) ? [{
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
							}, ...((await fs.isExecuteable(p)) ? [{
								text: "Show Package Contents",
								click() {
									window.state.history.push(p);

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
							async select() {
								const resolved = await fs.isLink(p) && await fs.resolve(p);

								if (await fs.isExecuteable(p)) {
									open(p);
								} else if (await fs.isDirectory(p)) {
									window.state.history.push(p);

									window.state.path = p;
									window.render();
								} else if (resolved && await fs.isDirectory(resolved.path) && await !fs.isExecuteable(resolved.path)) {
									window.state.history.push(window.state.path = resolved.path);
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
						});
					}

					list.items = items;
				} else {
					list.items = fs.disks.map(d => ({
						text: Path.getPrettyName(d),
						iconPath: d,
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