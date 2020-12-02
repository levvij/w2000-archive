function Desktop(element, path) {
	const desktop = document.createElement("desktop");
	element.appendChild(desktop);

	let renamingFile;
	let select;
	
	const open = async file => {
		try {
			await Application.run(file);
		} catch(e) {
			console.error(e);

			UI.ErrorBox("Error opening " + fs.name(file), "The application could not start because a error occured:\n" + e.message + "\n" + e.stack);
		}
	}
	
	desktop.addEventListener("mousedown", event => {
		if (!event.button && (document.elementFromPoint(event.pageX, event.pageY) || {}).tagName == "DESKTOP") {
			select = {
				startX: event.pageX,
				startY: event.pageY,
				element: desktop.appendChild(document.createElement("select-area"))
			};

			for (let item of Array.from(desktop.querySelectorAll("desktop-item"))) {
				item.removeAttribute("selected");
				
				if (item.originalContextMenu) {
					item.contextMenu = item.originalContextMenu;
					item.originalContextMenu = null;
				}
			}
		}
	});
	
	desktop.addEventListener("mousemove", event => {
		if (select) {
			select.element.style.left = Math.min(event.pageX, select.startX);
			select.element.style.top = Math.min(event.pageY, select.startY);

			select.element.style.width = Math.abs(event.pageX - select.startX);
			select.element.style.height = Math.abs(event.pageY - select.startY);
			
			const selectionBox = select.element.getBoundingClientRect();
			const elements = desktop.querySelectorAll("desktop-item");
			
			select.items = [];
			
			for (let element of elements) {
				element.removeAttribute("selected");
				
				const box = element.getBoundingClientRect();
				
				if (selectionBox.top - box.height < box.top && selectionBox.bottom + box.height > box.bottom &&
				   selectionBox.left - box.width < box.left && selectionBox.right + box.width > box.right) {
					element.setAttribute("selected", "");
					
					select.items.push(element);
				}
			}
		}
	});
	
	desktop.addEventListener("mouseup", event => {
		if (select) {
			for (let item of Array.from(desktop.querySelectorAll("select-area"))) {
				item.remove();
			}
			
			if (select.items && select.items.length > 1) {
				const selectedItems = select.items;
				
				for (let item of select.items) {
					item.originalContextMenu = item.contextMenu;
					
					item.contextMenu = [{
						text: "Open",
						async click() {
							for (let item of selectedItems) {
								await open(item.path);
								
								public.update();
							}
						}
					}];
					
					UI.draggable(item, () => {
						return {
							files: selectedItems.map(i => i.path)
						};
					}, () => {
						public.update();
					});
				}
			}
			
			select = null;
		}
	});

	const public = {
		update() {
			desktop.textContent = "";
			
			UI.dropZone(desktop, async item => {
				if (item.files) {
					Application.run(...configuration.move.replace("%s", item.files).replace("%d", path));
				}
			});

			for (let file of fs.list(path)) {
				const item = document.createElement("desktop-item");
				item.path = file;
				
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
							open(file);
						}
					},
					{
						text: "Edit",
						click() {
							Application.edit(file);
						},
						disabled: fs.extinfo(fs.ext(file)) ? !fs.extinfo(fs.ext(file)).editors.length : true
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
				img.draggable = false;
				
				fs.readURI(fs.icon(file, 32)).then(url => {
					img.src = url;
				});
				
				item.appendChild(img);
				
				UI.draggable(item, () => {
					return {
						files: [file]
					};
				}, () => {
					public.update();
				});
				
				if ((fs.isDirectory(file) || (fs.isLink(file) && fs.resolve(file).path && fs.isDirectory(fs.resolve(file).path) && !fs.isExecuteable(fs.resolve(file).path))) && !fs.isExecuteable(file)) {
					UI.dropZone(item, async container => {
						if (container.files) {
							Application.run(...configuration.move.replace("%s", container.files).replace("%d", file));
						}
					});
				}

				if (fs.isLink(file)) {
					const meta = fs.meta(fs.resolve(file).path);
					
					if (!meta || !meta.noLinkIcon) {
						const img = document.createElement("img");
						img.setAttribute("overlay", "");

						fs.readURI(fs.icon(configuration.icons.link, 32)).then(url => {
							img.src = url;
						});

						item.appendChild(img);
					}
				}

				const text = document.createElement("text");
				text.textContent = fs.prettyName(file);
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
					open(file);
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
	
	fs.listen(path, () => {
		public.update();
	});
	
	Application.load(...configuration.autostart);

	return public;
}

DLL.export("Desktop", new Desktop(workspace, fs.paths.user.desktop));