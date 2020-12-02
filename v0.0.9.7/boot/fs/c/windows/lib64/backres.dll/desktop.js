function Desktop(element, path) {
	const desktop = document.createElement("desktop");
	element.appendChild(desktop);

	let renamingFile;

	const public = {
		update() {
			desktop.textContent = "";

			for (let file of fs.list(path)) {
				const open = () => {
					Application.run(file).catch(e => {
						console.error(e);
						
						UI.ErrorBox("Error opening " + fs.name(file), "The application could not start because a error occured:\n" + e.message + "\n" + e.stack);
					});
				}
				
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
							open();
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
				
				fs.readURI(fs.icon(file, 32)).then(url => {
					img.src = url;
				});
				
				item.appendChild(img);

				if (fs.ext(file) == "lnk") {
					const img = document.createElement("img");
					img.setAttribute("overlay", "");
					
					fs.readURI(fs.icon(configuration.icons.link, 32)).then(url => {
						img.src = url;
					});
					
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
					open();
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
	
	Application.load(...configuration.autostart);

	return public;
}

DLL.export("Desktop", new Desktop(workspace, fs.paths.user.desktop));