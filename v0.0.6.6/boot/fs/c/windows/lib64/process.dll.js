/// process management
/// C 2019 levvij

// log unit
const unit = globalConsole.createUnit("process.dll");

const Application = {
	// edit file in appropriate software
	async edit(path) {
		unit.action("edit", path);

		if (config.extedit[fs.ext(path)]) {
			return await Application.load(config.extedit[fs.ext(path)], path);
		} else {
			return await Application.load(config.extedit.default, path);
		}
	},
	
	// open / run file in appropriate software
	// follows links
	// opens exes
	async run(path, ...args) {
		unit.action("run", path, ...args);

		if (fs.isDirectory(path)) {
			return await Application.load(config.extrun.directory, path, ...args);
		}
		
		// open links in ie
		if (path.startsWith("http://") || path.startsWith("https://")) {
			return await Application.load(config.extrun.http, path);
		}

		switch (fs.ext(path)) {
			case "js":
				{
					return await Application.load(path.split(".").slice(0, -1).join("."), ...args);
				}
			case "exe":
				{
					return await Application.load(path, ...args);
				}
			case "lnk":
				{
					return await Application.run(await fs.resolve(path).path, ...args);
				}
			default:
				{
					if (config.extrun[fs.ext(path)]) {
						return await Application.load(config.extrun[fs.ext(path)], path, ...args);
					} else {
						throw new Error("Can't open or run '" + fs.fix(path) + "'");
					}
				}
		}
	},
	
	// load application with arguments
	async load(path, ...args) {
		unit.action("load", path, ...args);
		args.has = p => {
			return args.includes("-" + p) || args.includes("/" + p);
		};

		args.get = p => {
			return args[(args.indexOf("-" + p) + 1) || (args.indexOf("/" + p) + 1) || -1];
		};
		
		const log = globalConsole.createUnit(fs.name(path));
		log.mark("start");

		if (fs.exists(path)) {
			(new(Object.getPrototypeOf(async function() {}).constructor)("application", "arguments", await fs.read(path)))({
				path,
				log,
				arguments: args,
			}, args);
		} else {
			throw new Error("Application " + path + " does not exist");
		}
	}
};

DLL.export("Application", Application);