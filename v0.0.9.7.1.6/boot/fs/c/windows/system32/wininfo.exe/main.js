const window = new Window("System Information", 300, 300);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(async ui => {
	const tabs = ui.Tabs([
		"General",
		"Hardware",
		"Storage",
		"Files"
	]);
	ui.root.add(tabs);

	const general = ui.StackPanel();
	tabs[0].add(general);
	
	const logoContainer = ui.StackPanel();
	logoContainer.background = "white";
	logoContainer.padding = "10px";
	
	const logo = ui.Image("c/windows/branding/logo.png");
	logo.width = 250;
	logoContainer.add(logo);
	
	general.add(logoContainer);
	general.add(ui.Separator());
	general.add(ui.Label("Version: " + Management.os.version + " (" + Management.os.buildDate.toDateString() + ", " + (Management.os.beta ? "Beta" : "Release") + ")"));
	
	general.add(ui.Separator());
	
	const hardware = ui.StackPanel();
	
	hardware.add(ui.Label("CPU Cores: " + (Management.cpu.cores || "Unknown")));
	hardware.add(ui.Label("Host platform: " + Management.host.platform));
	hardware.add(ui.Label("Host vendor: " + Management.host.vendor));
	
	hardware.add(ui.Separator());
	
	hardware.add(ui.Label("Connection Downlink: " + Management.connection.downlink + "/" + Management.connection.type));
	hardware.add(ui.Label("Host: " + Management.host.os));
	
	hardware.add(ui.Separator());
	
	hardware.add(ui.Label("Device Memory: " + fs.readableSize(Management.memory.deviceTotal)));
	hardware.add(ui.Label("Max Memory: " + fs.readableSize(Management.memory.total)));
	hardware.add(ui.Label("VM Memory: " + fs.readableSize(Management.memory.vmSize)));
	hardware.add(ui.Label("Used Memory: " + fs.readableSize(Management.memory.used)));
	
	tabs[1].add(hardware);
	
	const storage = ui.Grid(["100%"], ["auto", "10px", "*"]);
	const storageInfo = ui.StackPanel();
	
	storageInfo.add(ui.Label("Total Used: " + fs.readableSize(fs.used)));
	storageInfo.add(ui.Label("Max Size: " + fs.readableSize(fs.capacity)));
	storageInfo.add(ui.Label("Free: " + fs.readableSize(fs.free)));
	
	storage[0][0].add(storageInfo);
	
	const storageList = ui.List(fs.providers.map(p => ({
		text: p.name
	})));
	storage[2][0].add(storageList);
	
	tabs[2].add(storage);
	
	const fileTypes = ui.StackPanel();
	
	const files = fs.listAll("c/");
	const types = {};
	
	for (let file of files) {
		if (fs.isFile(file)) {
			let ext = fs.ext(file) || "";
		
			if (ext in types) {
				types[ext].count++;
				types[ext].size += await fs.size(file);
			} else {
				types[ext] = {
					name: fs.fileTypeName(file),
					count: 1,
					size: await fs.size(file)
				};
			}
		}
	}
	
	fileTypes.add(ui.Label("Files: " + files.length + ", Total size: " + fs.readableSize(fs.used)));
	fileTypes.add(ui.Separator());
	
	for (let type of Object.keys(types).sort((a, b) => types[a].size == types[b].size ? 0 : types[a].size > types[b].size ? -1 : 1)) {
		fileTypes.add(ui.Label(types[type].name + ": " + fs.readableSize(types[type].size) + " (" + types[type].count + " files)"));
	}
	
	fileTypes.add(ui.Separator());
	
	for (let cat of [{
		name: "Media",
		exts: ["mp3", "mp4", "png", "jpg", "html"]
	}, {
		name: "System",
		exts: ["js", "css", "json", "bat"]
	}, {
		name: "Fonts",
		exts: ["ttf", "woff"]
	}]) {
		let total = 0;
		
		for (let ext of cat.exts) {
			total += types[ext] ? types[ext].size : 0;
		}
		
		fileTypes.add(ui.Label(cat.name + ": " + fs.readableSize(total)));
	}
	
	tabs[3].add(fileTypes);
});