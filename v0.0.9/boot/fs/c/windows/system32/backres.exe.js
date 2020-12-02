function Desktop(element, path) {
	const desktop = document.createElement("desktop");
	element.appendChild(desktop);

	let renamingFile;

	const public = {
		update() {
			application.log.action("update");
			desktop.textContent = "";

			for (let file of fs.list(path)) {
				const item = document.createElement("desktop-item");
				item.contextMenu = fs.isDirectory(file) ? [{
						text: "Rename",
						click() {
							public.rename(file);
						}
					},
					{
						text: "Delete",
						async click() {
							await fs.delete(file);
							public.update();
						}
					}
				] : [{
						text: "Open",
						click() {
							Application.run(file).catch(() => {
								UI.ErrorBox("Error", "Cannot open '" + file + "'");
							});
						}
					},
					{
						text: "Edit",
						click() {
							Application.edit(file);
						},
						disabled: config.extedit[fs.ext(file)] == -1
					}, {},
					{
						text: "Rename",
						click() {
							public.rename(file);
						}
					},
					{
						text: "Delete",
						async click() {
							await fs.delete(file);
							public.update();
						}
					}
				];

				const img = document.createElement("img");
				img.src = config.fs.root + fs.icon(file, 32);
				item.appendChild(img);

				if (fs.ext(file) == "lnk") {
					const img = document.createElement("img");
					img.setAttribute("overlay", "");
					img.src = config.fs.root + fs.icon(config.fs.icons.lnk, 32);
					item.appendChild(img);
				}

				const text = document.createElement("text");
				text.textContent = fs.title(file);
				item.appendChild(text);

				if (renamingFile == file) {
					text.contentEditable = true;
					text.textContent = fs.name(file);

					const overlay = document.createElement("text-overlay");

					requestAnimationFrame(() => {
						text.focus();

						text.onblur = async () => {
							Interaction.lock();
							
							await fs.rename(renamingFile, text.textContent);
							renamingFile = null;
							public.update();
							
							Interaction.unlock();
						};
					});
				}

				item.ondblclick = item.ontouchend = () => {
					Application.run(file).catch(() => {
						UI.ErrorBox("Error", "Cannot open '" + file + "'");
					});
				};

				desktop.appendChild(item);
			}
		},
		rename(path) {
			renamingFile = path;
			public.update();
		}
	}

	public.update();

	Application.load("c/windows/system32/cmd.exe", "c/windows/system/autorun.bat", "-h");

	return public;
}

function TaskBar(element, path) {
	const start = document.createElement("start");
	start.textContent = config.taskBar.start;
	element.appendChild(start);

	const startOverlay = document.createElement("start-overlay");
	element.appendChild(startOverlay);

	startOverlay.onclick = () => {
		start.removeAttribute("open");
	};

	const startPopup = document.createElement("start-popup");
	element.appendChild(startPopup);

	start.onclick = async () => {
		if (start.hasAttribute("open")) {
			start.removeAttribute("open");
		} else {
			start.setAttribute("open", "");
			startPopup.textContent = "";

			for (let line of (await fs.read(path)).split("\n")) {
				line = line.trim();

				if (line) {
					if (line == "-") {
						startPopup.appendChild(document.createElement("line"));
					} else {
						const item = document.createElement("start-item");
						item.textContent = fs.title(line);
						startPopup.appendChild(item);

						item.onclick = () => {
							start.removeAttribute("open");
							Application.run(line);
						};
					}
				}
			}
		}
	};

	const programs = document.createElement("programs");
	element.appendChild(programs);

	Event.subscribe(Window.onopen, Window.onactivechange, Window.onclose, Window.onstatechange, () => {
		programs.textContent = "";

		const bar = document.createElement("bar");
		programs.appendChild(bar);

		for (let instance of Window.instances.filter(i => !i.parent)) {
			const p = document.createElement("program");
			p.textContent = instance.title;
			programs.appendChild(p);

			if (instance == Window.activeWindow && !instance.minimized) {
				p.setAttribute("active", "");
			}

			p.onclick = () => {
				Window.activate(instance);
			}
		}
	})();
	
	const tray = document.createElement("tray");
	element.appendChild(tray);
	
	const trayIcons = document.createElement("tray-items");
	tray.appendChild(trayIcons);
	
	const trayDate = document.createElement("tray-date");
	tray.appendChild(trayDate);
	
	const updateTrayTime = () => {
		const d = new Date();
		
		trayDate.textContent = d.getHours().toString().padStart(2, 0) + ":" + d.getMinutes().toString().padStart(2, 0);
	};
	
	const updateTrayIcons = () => {
		trayIcons.textContent = "";
		
		for (let process of Process.active) {
			for (let trayItem of process.trays) {
				const item = document.createElement("tray-item");
				trayIcons.appendChild(item);
				
				const image = new Image();
				item.appendChild(image);
				
				// ovverride the event because only the newest one will be rendered and the old ones dont need to be updated
				trayItem.oniconchange = () => {
					image.src = config.fs.root + fs.icon(trayItem.icon, 16);
				};
				
				trayItem.oncontextmenuchange = () => {
					item.contextMenu = trayItem.contextMenu;
				};
				
				trayItem.oniconchange();
				trayItem.oncontextmenuchange();
			}
		}
	};
	
	updateTrayTime();
	updateTrayIcons();
	
	setInterval(() => updateTrayTime(), 500);
	Process.onnewtray.subscribe(() => updateTrayIcons());
}

let activeContextMenu;
let touchStart = 0;

workspace.contextMenu = [{
		text: "Refresh",
		click() {
			location.reload();
		}
	}, {},
	{
		text: "Paste",
		disabled: true
	},
	{
		text: "Import",
		click() {
			const input = document.createElement("input");
			input.type = "file";
			input.multiple = true;
			
			input.onchange = async () => {
				Interaction.lock();
				
				for (let file of input.files) {
					application.log.action("import", file.name);
					
					await fs.createBlob(fs.nextName(config.user.desktop, fs.fixExt(file.name)), file);
				}
				
				input.value = "";
				desktop.update();
				
				Interaction.unlock();
			};
			
			input.click();
		}
	}, {},
	{
		text: "New",
		items: [{
				text: "Folder",
				icon: fs.icon(config.fs.icons.directory, 16),
				async click() {
					const path = fs.nextName(config.user.desktop, "New Folder");

					await fs.mkdir(path);
					desktop.rename(path);
				}
			},
			{
				text: "Shortcut",
				icon: fs.icon(config.fs.icons.lnk, 16),
				disabled: true
			}, {},
			{
				text: "Briefcase",
				icon: fs.icon(config.fs.icons.zip, 16),
				disabled: true
			},
			{
				text: "Bitmap Image",
				icon: fs.icon(config.fs.icons.png, 16),
				disabled: true
			},
			{
				text: "Rich Text Document",
				icon: fs.icon(config.fs.icons.rtf, 16),
				async click() {
					const path = fs.nextName(config.user.desktop, "New Textfile.rtf");

					await fs.create(path);
					desktop.rename(path);
				}
			},
			{
				text: "Text Document",
				icon: fs.icon(config.fs.icons.txt, 16),
				async click() {
					const path = fs.nextName(config.user.desktop, "New Textfile.txt");

					await fs.create(path);
					desktop.rename(path);
				}
			},
			{
				text: "Wave Sound",
				icon: fs.icon(config.fs.icons.mp3, 16),
				disabled: true
			}
		]
	}, {}, {
		text: "Properties",
		click() {
			Application.load("c/windows/system32/explorer.exe", "-p", config.user.desktop);
		}
	}
];

window.desktop = new Desktop(workspace, config.user.desktop);
window.taskBar = new TaskBar(document.querySelector("task-bar"), config.user.start);

globalConsole.hide();