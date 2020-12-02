/// process management
/// C 2019 levvij

// log unit
const unit = globalConsole.createUnit("process.dll");

await DLL.load("timer.dll");

let topProcessId = 1;

function Tray(process) {
	let icon;
	let contextMenu;

	const public = {
		oniconchange: Event("Tray icon change"),
		oncontextmenuchange: Event("Tray context menu change"),
		get icon() {
			return icon;
		},
		set icon(value) {
			if (value != icon) {
				icon = value;

				public.oniconchange();
			}
		},
		get contextMenu() {
			return contextMenu;
		},
		set contextMenu(menu) {
			if (menu != contextMenu) {
				contextMenu = menu;

				public.oncontextmenuchange();
			}
		},
		click() {},
		remove() {
			process.trays.splice(process.trays.indexOf(public), 1);
			process.ontrayremove(public);
			Process.ontrayremove(process, public);
		}
	};

	return public;
}

function Process(path) {
	const name = fs.name(path);

	const checkExit = () => {
		if (public.exited) {
			throw new Error("Process " + name + " already exited with code: " + public.exitCode);
		}
	};

	const public = {
		name,
		path,
		pid: topProcessId++,
		log: globalConsole.createUnit(name),
		onexit: Event("Process exit"),
		onnewwindow: Event("Process new window"),
		onnewtimer: Event("Process new timer"),
		ontimerstop: Event("Process timer stop"),
		onnewtray: Event("Process new tray"),
		ontrayremove: Event("Process tray remove"),
		windows: [],
		timers: [],
		trays: [],
		scopedEnvironnement: ScopedEnvironnement(path),
		get memoryUsage() {
			return public.scopedEnvironnement.measure() + public.graphicsMemoryUsage;
		},
		get graphicsMemoryUsage() {
			let total = 0;
			
			for (let w of public.windows) {
				total += w.memoryUsage;
			}
			
			return total;
		},
		addWindow(w) {
			checkExit();

			w.onchildcreate.subscribe(child => {
				public.addWindow(child);
			});

			w.onclose.subscribe(() => {
				public.windows.splice(public.windows.indexOf(w), 1);
			});

			w.onerror.subscribe(e => {
				public.error("window-render", e);
			});

			public.windows.push(w);

			public.onnewwindow(w);
			Process.onnewwindow(public, w);
		},
		addTimer(t) {
			checkExit();

			t.onstop.subscribe(() => {
				public.ontimerstop(t);
				Process.ontimerstop(public, t);
			});

			public.timers.push(t);

			public.onnewtimer(t);
			Process.onnewtimer(public, t);
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

			if (Process.active.includes(public)) {
				Process.active.splice(Process.active.indexOf(public), 1);
			}

			public.exitCode = code;
			public.exited = true;

			public.onexit(code);
			Process.onexit(public, code);

			for (let t of public.timers) {
				t.stop();
			}

			for (let p of public.windows) {
				p.close();
			}

			for (let p of public.trays) {
				p.remove();
			}
		},
		kill() {
			public.exit(Process.ExitCode.externallyExited);
		},
		error(area, error) {
			public.log.error(area, error);

			if (!public.exited) {
				for (let win of public.windows) {
					win.break();
				}

				UI.ErrorBox(configuration.errorWindow.title.replace("%n", public.name), configuration.errorWindow.text.replace("%n", public.name).replace("%e", error.message));

				public.exit(Process.ExitCode.generalError);
			}
		},
		createTray() {
			const t = new Tray(public);

			public.trays.push(t);

			public.onnewtray(t);
			Process.onnewtray(public, t);

			return t;
		}
	};

	Process.active.push(public);
	Process.onstart(public);

	return public;
}

Process.ExitCode = {
	success: {},
	generalError: {},
	invalidParameters: {},
	externallyExited: {},
	generalError: {}
};

Process.onstart = Event("Process start");
Process.onexit = Event("Process exit");
Process.onnewwindow = Event("Process new window");
Process.onnewtimer = Event("Process new timer");
Process.ontimerstop = Event("Process timer stop");
Process.onnewtray = Event("Process new tray");
Process.ontrayremove = Event("Process remove tray");

Process.active = [];

const Application = {
	// edit file in appropriate software
	async edit(path) {
		unit.action("edit", path);

		const extinfo = fs.extinfo(fs.ext(path));

		if (extinfo && extinfo.editor) {
			return await Application.load(extinfo.editor, path);
		} else {
			return await Application.load(fs.extinfo("*").editor, path);
		}
	},

	// open / run file in appropriate software
	// follows links
	// opens exes
	async run(path, ...args) {
		unit.action("run", path, ...args);

		// open http links in browser
		if (path.startsWith("http://") ||  path.startsWith("https://")) {
			return await Application.load(config.extrun.http, path);
		}

		// open nttp links in browser
		if (path.startsWith("nttp://")) {
			return await Application.load(config.extrun.nttp, path);
		}

		if (fs.isDirectory(path) && !fs.isExecuteable(path)) {
			return await Application.load(fs.extinfo(".").opener, path, ...args);
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
					const extinfo = fs.extinfo(fs.ext(path));

					if (extinfo && extinfo.opener) {
						return await Application.load(extinfo.opener, path, ...args);
					} else {
						throw new Error("Can't open or run '" + fs.fix(path) + "'");
					}
				}
		}
	},

	// load application with arguments
	async load(path, ...args) {
		unit.action("load", path, ...args);

		const exeinfo = fs.exeinfo(path);

		for (let dll of exeinfo.dependencies) {
			await DLL.load(dll);
		}

		if (Version(config.version) < Version(exeinfo.requirements.os.version)) {
			throw new Error("Application '" + exeinfo.name + "' requires OS version '" + exeinfo.requirements.os.version + "' (Currently installed version is '" + config.version + "')");
		}

		const process = new Process(path);
		process.log.mark("start");

		const proxies = {
			Window: {
				object: Window,
				construct() {
					return function(...args) {
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
			},
			Timer: {
				object: {
					get top() {
						return Timer.top;
					}
				},
				construct() {
					return function(fx, time) {
						const t = new Timer(fx, time);
						process.addTimer(t);

						return t;
					};
				},
				get(k) {
					return Timer[k];
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
		
		const exports = {};
		
		for (let dll of DLL.loadedModules) {
			for (let exp in dll.exports) {
				exports[exp] = dll.exports[exp];
			}
		}
		
		const persistentState = {};
		const persistentPath = fs.paths.programData(path) + "/pstate.json";
		
		if (fs.exists(persistentPath)) {
			const d = JSON.parse(await fs.read(persistentPath)).state;
			
			for (let k in d) {
				persistentState[k] = d[k];
			}
		}
		
		persistentState.save = async () => {
			let f = "";
			for (let part of persistentPath.split("/")) {
				if (!fs.exists(f + part)) {
					await fs.mkdir(f + part);
				}
				
				f += part + "/"
			}
			
			if (!fs.exists(persistentPath)) {
				await fs.create(persistentPath, "{}");
			}
			
			await fs.write(persistentPath, JSON.stringify({
				value: exeinfo.version,
				state: persistentState
			}));
		};
		
		if (!fs.exists(persistentPath)) {
			for (let key in (exeinfo.initialPersistentState || {})) {
				persistentState[key] = exeinfo.initialPersistentState[key];
			}
			
			await persistentState.save();
		}
		
		const params = {
			...exports,
			
			application: {
				persistentState,
				path,
				log: process.log,
				arguments: args,
				process,
				resource(p) {
					const pp = fs.fix(path + "/resources/" + p);

					if (fs.exists(pp)) {
						return fs.fix(pp);
					}

					throw new Error("Resource '" + p + "' not found");
				}
			},
			arguments: args,
			exit(code) {
				process.exit(code);
			},
			configuration: exeinfo.configuration,
			process,
			
			fs,
			get config() {
				console.warn("config is deprecated");
				
				return config;	
			},
			get console() {
				console.warn("console is deprecated. Use application.log instead");
				
				return config;
			},
			Object,
			DLL,
			Math,
			RegExp,
			Error,
			Promise,
			
			setTimeout(handler, time) {
				console.warn("setTimeout is deprecated");
				
				return setTimeout(handler, time);
			},
			setInterval(handler, time) {
				console.warn("setInterval is deprecated");
				
				return setInterval(handler, time);
			}
		};

		for (let key in proxies) {
			params[key] = proxy(proxies[key]);
		}

		if (fs.exists(path)) {
			const scope = process.scopedEnvironnement.createVoidScope("const arguments = application.arguments; " + await fs.read(path + "/main.js"), "Application Main");
			scope.run(params);

			return process;
		} else {
			throw new Error("Application " + path + " does not exist");
		}
	}
};

DLL.export("Process", Process);
DLL.export("Application", Application);