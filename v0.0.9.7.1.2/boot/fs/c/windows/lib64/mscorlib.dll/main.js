/// core library
/// C 2019 levvij

// corelib loggin unit
const unit = globalConsole.createUnit("mscorlib");
const global = window;

// dll run
function DLL(run) {
	run();
}

// all loaded modules
DLL.loadedModules = [];

// load DLL
DLL.load = async (path, forceReload) => {
	if (!forceReload) {
		const loaded = DLL.loadedModules.find(m => m.path == path);
		if (loaded) {
			unit.action("load", path, "cached");
			
			return loaded;
		}
	}
	
	unit.action(forceReload ? "force-load" : "load", path);
	
	const public = {
		path,
		name: path.split("/").pop(),
		exports: {},
		submodules: [],
		dependencies: []
	}
	
	let exeinfo;
	
	// check meta
	const loadMeta = async () => {
		exeinfo = await (window.fs ? fs.exeinfo(path) : fetch(config.fs.root + path + "/meta.json?v=" + Math.random().toString(36).substr(2)).then(r => r.json()));
		
		for (let dll of exeinfo.dependencies) {
			await DLL.load(dll);
		}
		
		if (Version(config.version) < Version(exeinfo.requirements.os.version)) {
			throw new Error("Application '" + exeinfo.name + "' requires OS version '" + exeinfo.requirements.os.version + "' (Currently installed version is '" + config.version + "')");
		}
	};

	// inner load with body
	const load = async (body, p) => {
		let fx;

		try {
			// create async function
			fx = (new(Object.getPrototypeOf(async function() {}).constructor)("DLL", "configuration", "// " + path + "\n\n" + body));
			fx.name = path.split("/").join("_");
		} catch (e) {
			// throw parsing errors
			throw new Error(e.message.trim() + "@" + p);
		}

		// run main dll function with DLL object (masked)
		await fx({
			loadedModules: DLL.loadedModules,
			async load(path) {
				// add dependency
				const dll = await DLL.load(path, forceReload);
				
				public.dependencies.push(dll);
				
				return dll;
			},
			export(name, value) {
				// add export
				
				public.exports[name] = value;
				global[name] = value;
			},
			resource(p) {
				return fs.fix(path + "/resources/" + p);
			},
			private: {}
		}, exeinfo.configuration);
	};

	// if fs is already loaded
	if (window.fs) {
		// search for path
		if (fs.exists(path)) {
			await loadMeta();
			await load(await fs.read(path + "/main.js"), fs.name(path));
			
			for (let file of fs.listAll(path)) {
				if (file != fs.fix(path + "/main.js") && fs.ext(file) == "js") {
					unit.action("subload", file);

					await load(await fs.read(file), (fs.name(path) + "/" + fs.name(file)));

					public.submodules.push(file);
				}
			}
		} else {
			// use searchpaths to find dll
			const find = fs.search(path, config.dll.paths);

			if (find) {
				// load dll with full name
				return await DLL.load(find, forceReload);
			} else {
				throw new Error("Cannot find '" + path + "'");
			}
		}
	} else {
		// load directly from fetch
		await loadMeta();
		await load(await (await fetch(config.fs.root + path + "/main.js?v=" + +(new Date()))).text(), path);
	}
	
	// add to loaded modules (for caching / monitoring)
	DLL.loadedModules.push(public);
	
	return public;
};

// converts version string into a string for comparing
// up to 6 segments, each containing 3 digits
// format: 1.2.3.4.5.6~canary
function Version(str = "0") {
	const rc = str.split("-")[1];
	
	return [...str.split("-")[0].split(".").map(v => v.padStart(8, 0)), ...Array(16).fill("0".repeat(8))].slice(0, 16).join(".") + (rc ? "-" + rc : "");
}