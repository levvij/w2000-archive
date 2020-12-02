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
		
		if (global.Cursor) {
			Cursor.type = await Cursor.load("busy");
		}

		// open links in browser
		for (let protocol of ["http://", "https://", "nttp://"]) {
			if (path.startsWith(protocol)) {
				return await Application.load(fs.extinfo(protocol).opener, path);
			}
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
	load(path, ...args) {
		return new Promise(async done => {
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
				},
				Thread: {
					object: {},
					construct() {
						return function (...args) {
							const thread = DLL.private.thread(args.pop(), args);
							process.addThread(thread);

							return thread;
						}
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

			args.get = (p, osse = 0) => {
				console.log(args, p, ((args.indexOf("-" + p) + 1) || (args.indexOf("/" + p) + 1) || -1) + osse)

				return args[((args.indexOf("-" + p) + 1) || (args.indexOf("/" + p) + 1) || -1) + osse];
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

				Array,
				DLL,
				Math,
				RegExp,
				Error,
				Promise,
				Date,
				JSON,
				isNaN,
				isFinite,
				NaN,
				Object: {
					defineProperty(...args) {
						return Object.defineProperty(...args);
					},
					defineProperties(...args) {
						return Object.defineProperties(...args);
					},
					keys(ob) {
						return Object.keys(ob).filter(k => !k.startsWith("__scope_"));
					}
				},

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
				requestAnimationFrame(async () => {
					const scope = process.getEnvironnement(DLL.private).createVoidScope("const arguments = application.arguments; " + await fs.read(path + "/main.js"), "Application Main");
					
					requestAnimationFrame(() => {
						scope.run(params);

						done(process);
					});
				});
			} else {
				throw new Error("Application " + path + " does not exist");
			}
		});
	}
};

DLL.export("Application", Application);