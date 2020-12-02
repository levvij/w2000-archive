/// core library
/// C 2019 levvij

// corelib loggin unit
const unit = globalConsole.createUnit("mscorlib");

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
	
	unit.action(forceReload ? "fore-load" : "load", path);
	
	const public = {
		path,
		name: path.split("/").pop(),
		exports: {},
		submodules: [],
		dependencies: []
	}

	// inner load with body
	const load = async (body, p) => {
		let fx;

		try {
			// create async function
			fx = (new(Object.getPrototypeOf(async function() {}).constructor)("DLL", "// " + path + "\n\n" + body));
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
				window[name] = value;
			}
		});
	};

	// if fs is already loaded
	if (window.fs) {
		// search for path
		if (fs.exists(path) && fs.isDirectory(path)) {
			const body = await fs.read(path + "/meta.dli");
			
			for (let line of body.split("\n")) {
				unit.action("subload", path + "/" + line);

				await load(await fs.read(path + "/" + line), (fs.name(path) + "/" + line));
				
				public.submodules.push(line);
			}
		} else if (fs.exists(path)) {
			await load(await fs.read(path), path);
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
		await load(await (await fetch(config.fs.root + path + ".js?v=" + +(new Date()))).text(), path);
	}
	
	// add to loaded modules (for caching / monitoring)
	DLL.loadedModules.push(public);
	
	return public;
};