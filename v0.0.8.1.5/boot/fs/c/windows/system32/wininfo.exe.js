const window = new Window("System Information", 300, 300);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	const tabs = ui.Tabs([
		"General",
		"Hardware",
		"Storage",
		"Files",
		"Configuration"
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
	general.add(ui.Label("Version: " + config.version + " (" + config.buildTime.getDate() + "." + (config.buildTime.getMonth() + 1) + "." + config.buildTime.getFullYear() + ", " + (config.beta ? "Beta" : "Release") + ")"));
	
	general.add(ui.Separator());
	
	const hardware = ui.StackPanel();
	
	try {
		hardware.add(ui.Label("CPU Cores: " + (navigator.hardwareConcurrency || "Unknown")));
		hardware.add(ui.Label("Host platform: " + navigator.platform));
		hardware.add(ui.Label("Host vendor: " + navigator.vendor));
	} catch (e) {}
	
	hardware.add(ui.Separator());
	
	try {
		hardware.add(ui.Label("Connection Downlink: " + navigator.connection.downlink + "/" + navigator.connection.effectiveType));
		hardware.add(ui.Label("Host: " + navigator.userAgent.split("(")[1].split(";")[0]));
	} catch (e) {}
	
	hardware.add(ui.Separator());
	try {
		hardware.add(ui.Label("Device Memory: " + (navigator.deviceMemory ? avigator.deviceMemory + "GB" : "Unknown")));
		hardware.add(ui.Label("Max Memory: " + fs.readableSize(performance.memory.jsHeapSizeLimit)));
		hardware.add(ui.Label("Total Memory: " + fs.readableSize(performance.memory.totalJSHeapSize)));
		hardware.add(ui.Label("Used Memory: " + fs.readableSize(performance.memory.usedJSHeapSize)));
	} catch (e) {}
	
	tabs[1].add(hardware);
	
	const storage = ui.Grid(["100%"], ["auto", "*"]);
	const storageInfo = ui.StackPanel();
	
	storageInfo.add(ui.Label("Total Used: " + fs.readableSize(fs.used)));
	storageInfo.add(ui.Label("Max Size: " + fs.readableSize(fs.capacity)));
	storageInfo.add(ui.Label("Free: " + fs.readableSize(fs.free)));
	
	storage[0][0].add(storageInfo);
	
	const storageList = ui.List(fs.providers.map(p => ({
		text: p.name
	})));
	storage[1][0].add(storageList);
	
	tabs[2].add(storage);
	
	const fileTypes = ui.StackPanel();
	
	const files = fs.listAll("c/");
	const types = {};
	
	for (let file of files) {
		if (fs.isFile(file)) {
			let ext = fs. fileTypeName(file);
			
			if (!ext) {
				ext = "Other";
			}
		
			if (ext in types) {
				types[ext]++;
			} else {
				types[ext] = 1;
			}
		}
	}
	
	fileTypes.add(ui.Label("Files: " + files.length));
	
	fileTypes.add(ui.Separator());
	
	for (let type of Object.keys(types).sort((a, b) => types[a] == types[b] ? 0 : types[a] > types[b] ? -1 : 1)) {
		fileTypes.add(ui.Label(type + ": " + types[type]));
	}
	
	tabs[3].add(fileTypes);
	
	const leaf = branch => Object.keys(branch).map(k => {
		switch (typeof branch[k]) {
			case "object": {
				if (branch[k]) {
					if (typeof branch[k].getMonth == "function") {
						return {
							title: k + ": " + branch[k].toISOString()
						}
					} else {
						return {
							title: k,
							items: leaf(branch[k])
						};
					}
				} else {
					return {
						title: k + ": " + branch[k]
					}
				}
			}
			case "array": {
				return {
					title: k,
					items: branch[k].map(v => leaf(v))
				};
			}
			case "number":
			case "string":
			case "boolean": {
				return {
					title: k + ": " + branch[k]
				};
			}
		}
	});
	
	tabs[4].add(ui.TreeView(leaf(config)));
});