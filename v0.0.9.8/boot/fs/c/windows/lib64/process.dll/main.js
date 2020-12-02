/// process management
/// C 2019 levvij

// log unit
const unit = globalConsole.createUnit("process.dll");

let topProcessId = 1;

function Process(path) {
	const name = fs.name(path);

	const checkExit = () => {
		if (public.exited) {
			throw new Error("Process " + name + " already exited with code: " + public.exitCode);
		}
	};
	
	const env = new ScopedEnvironnement(path);

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
		onnewthread: Event("Process new thread"),
		onthreaddone: Event("Process thread done"),
		windows: [],
		timers: [],
		trays: [],
		threads: [],
		
		getEnvironnement(key) {
			if (key == DLL.private) {
				return env;
			}
		},
		
		get memoryUsage() {
			return env.measure() + public.graphicsMemoryUsage;
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
		addThread(t) {
			checkExit();

			t.ondone.subscribe(() => {
				public.onthreaddone(t);
				Process.onthreaddone(public, t);
			});
			
			public.threads.push(t);
			
			public.onnewthread(t);
			Process.onnewthread(public, t);
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
		},
		sleep(ms) {
			return new Promise(done => {
				setTimeout(() => done(), ms);
			});
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
Process.onnewthread = Event("Process new thread");
Process.onthreaddone = Event("Process thread done");

Process.active = [];

DLL.export("Process", Process);