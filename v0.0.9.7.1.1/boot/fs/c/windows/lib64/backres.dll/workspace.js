workspace.contextMenu = [{
		text: "Refresh",
		click() {
			Desktop.update();
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
				if (input.files && input.files.length) {
					Interaction.lock();

					for (let file of input.files) {
						await fs.createBlob(fs.nextName(fs.paths.user.desktop, fs.fixExt(file.name)), file);
					}

					input.value = "";
					Desktop.update();

					Interaction.unlock();
				}
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
					const path = fs.nextName(fs.paths.user.desktop, "New Folder");

					await fs.mkdir(path);
					Desktop.rename(path);
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
					const path = fs.nextName(fs.paths.user.desktop, "New Textfile.rtf");

					await fs.create(path);
					Desktop.rename(path);
				}
			},
			{
				text: "Text Document",
				icon: fs.icon(config.fs.icons.txt, 16),
				async click() {
					const path = fs.nextName(fs.paths.user.desktop, "New Textfile.txt");

					await fs.create(path);
					Desktop.rename(path);
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
			Application.load("c/windows/system32/explorer.exe", "-p", fs.paths.user.desktop);
		}
	}
];