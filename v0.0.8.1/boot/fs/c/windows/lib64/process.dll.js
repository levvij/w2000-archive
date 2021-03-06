/// process management
/// C 2019 levvij

// log unit
const unit = globalConsole.createUnit("process.dll");

function Process(name) {
	const checkExit = () => {
		if (public.exited) {
			throw new Error("Process " + name + " already exited with code: " + public.exitCode);
		}
	};
	
	const public = {
		name,
		log: globalConsole.createUnit(name),
		onexit: Event("Process exit"),
		windows: [],
		addWindow(w) {
			checkExit();
			
			w.onchildcreate.subscribe(child => {
				public.addWindow(child);
			});
			
			w.onclose.subscribe(() => {
				public.windows.splice(public.windows.indexOf(w), 1);
			});
			
			public.windows.push(w);
		},
		exit(key) {
			let code;
			
			for (let k in Process.ExitCode) {
				if (Process.ExitCode[k] == key) {
					code = k;
				}
			}
			
			if (!code) {
				throw new Error("Invalid exit code");
			}
			
			public.log.mark("exit", code);
			
			public.exitCode = code;
			public.exited = true;
			
			public.onexit(code);
			
			for (let p of public.windows) {
				p.close();
			}
			
			Process.active.splice(Process.active.indexOf(public), 1);
		}
	};
	
	Process.onstart(public);
	Process.active.push(public);
	
	return public;
}

Process.ExitCode = {
	success: {},
	generalError: {},
	invalidParameters: {},
	externallyExited: {}
};

Process.onstart = Event("Process start");

Process.active = [];

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
		
		const process = new Process(fs.name(path));
		process.log.mark("start");
		
		const proxies = {
			Window: {
				object: Window,
				construct() {
					return function (...args) {
						const w = new Window(...args);
						process.addWindow(w);
						
						return w;
					};
				},
				set(k, value) {
					Window[k] = value;
				},
				get(k) {
					return Window[k];
				}
			}
		};
		
		const proxy = prop => {
			const f = prop.construct();
			
			for (let k in prop.object) {
				Object.defineProperty(f, k, {
					get() {
						return prop.get(k);
					},
					set(value) {
						prop.set(k, value);
					}
				});
			}
			
			return f;
		};
		
		args.has = p => {
			return args.includes("-" + p) || args.includes("/" + p);
		};

		args.get = p => {
			return args[(args.indexOf("-" + p) + 1) || (args.indexOf("/" + p) + 1) || -1];
		};
		
		const start = [{
			path,
			log: process.log,
			arguments: args,
			process
		}, args, code => {
			process.exit(code);
		}];
		
		for (let key in proxies) {
			start.push(proxy(proxies[key]));
		}

		if (fs.exists(path)) {
			(new(Object.getPrototypeOf(async function() {}).constructor)(
				"application", 
				"arguments", 
				"exit",
				...Object.keys(proxies),
				await fs.read(path)))(...start);
		} else {
			throw new Error("Application " + path + " does not exist");
		}
	}
};

DLL.export("Process", Process);
DLL.export("Application", Application);