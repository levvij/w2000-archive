const shell = new Shell();
const window = new Window("cmd.exe " + (arguments[0] || ""), 500, 300);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.state.path = arguments[0] || configuration.defaultPath;
window.state.buffer = "";

if (arguments.has("h")) {
	window.min();
}

window.render(async ui => {
	const scroll = ui.Scroll();
	ui.root.add(scroll);
	
	const box = ui.Console();
	scroll.add(box);
	
	const clear = () => {
		window.state.buffer = "";
		box.console.clear();
	}
	
	const insert = t => {
		box.console.write(t);
		window.state.buffer += t;
	};
	
	const output = o => {
		window.state.buffer = "";
		
		if (shell.echo) {
			box.console.write((o ?" \n" + o : "") + "\n" + window.state.path + "> ");
		} else {
			box.console.write(o ? o + "\n" : "");
		}
	};
	
	for (let key of " qwertzuiopasdfghjklyxcvbnm,.-1234567890'/\":") {
		window.bindKey(key, () => {
			insert(key);
		});
	}
	
	window.bindKey("backspace", () => {
		if (window.state.buffer.length) {
			box.console.write("\b \b");
			window.state.buffer = window.state.buffer.slice(0, -1);
		}
	});
	
	window.bindKey("enter", async () => {
		output(await shell.run(window.state.buffer));
	});
	
	if (fs.exists(window.state.path) || (window.state.path.length == 2 && window.state.path[1] == "/")) {
		if (window.state.path.endsWith(".bat")) {
			await shell.runBatch(await fs.read(window.state.path));
			
			window.close();
		} else {
			clear();
			output("Migrosoft Windows 2000 [Version " + config.version + "]\n(C) Copyright 1985-2019 @qregy\n\n");
		}
	} else {
		const p = window.state.path;
		window.state.path = "";
		
		clear();
		output("path '" + p + "' does not exist");
	}
	
	window.onresize.subscribe(() => {
		box.console.resize();
	});
});

