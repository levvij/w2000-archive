const window = new Window("IconSurf", 600, 400);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	const split = ui.SplitView();
	const content = ui.MenuView();
	split.content.add(content);
	
	let quality = -1;
	let size = -1;
	
	let library;
	const renderLibrary = () => {
		content.content.clear();
		
		const list = ui.List(fs.listAll(library).filter(f => fs.isFile(f)).map(file => {
			const info = fs.iconProperties(file);
			
			if ((info.qualtiy == quality || quality == -1) && (info.size == size || size == -1)) {
				return {
					text: "0x" + info.address.toString(16).padStart(4, 0) + " " + info.size + "(" + info.qualtiy + ")",
					icon: file
				}
			}
		}).filter(e => e), UI.ListStyle.bigIcons);
		
		content.content.add(list);
	};
	
	content.menus.add(ui.Menu([
		{
			text: "Quality",
			items: [-1, ...config.fs.icons.qualities].map(q => ({
				text: "Quality: " + (q == -1 ? "All" : q),
				check() {
					quality = q;
					renderLibrary();
				}
			}))
		},
		{
			text: "Size",
			items: [-1, ...config.fs.icons.sizes].map(s => ({
				text: "Size: " + (s == -1 ? "All" : s),
				check() {
					size = s;
					renderLibrary();
				}
			}))
		}
	]));
	
	split.navigation.add(ui.List(fs.list(config.fs.icons.base).filter(f => fs.isDirectory(f)).map(lib => ({
		text: fs.name(lib),
		activate() {
			library = lib;
			renderLibrary();
		}
	}))));
	
	ui.root.add(split);
});