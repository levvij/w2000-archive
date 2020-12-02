let path = arguments[0] || config.cmd.defaultPath;
let buffer = "";

const shell = new Shell();
const window = new Window("cmd.exe " + (arguments[0] || ""), 500, 300);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

if (arguments.has("h")) {
	window.min();
}

window.render(async ui => {
	const scroll = ui.Scroll();
	ui.root.add(scroll);
	
	const box = ui.Console();
	scroll.add(box);
	
	const clear = () => {
		buffer = "";
		box.console.clear();
	}
	
	const insert = t => {
		box.console.write(t);
		buffer += t;
	};
	
	const output = o => {
		buffer = "";
		
		if (shell.echo) {
			box.console.write((o ?" \n" + o : "") + "\n" + path + "> ");
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
		if (buffer.length) {
			box.console.write("\b \b");
			buffer = buffer.slice(0, -1);
		}
	});
	
	window.bindKey("enter", async () => {
		output(await shell.run(buffer));
	});
	
	if (fs.exists(path) || (path.length == 2 && path[1] == "/")) {
		if (path.endsWith(".bat")) {
			await shell.runBatch(await fs.read(path));
			
			window.close();
		} else {
			clear();
			output("Migrosoft Windows 2000 [Version " + config.version + "]\n(C) Copyright 1985-2019 @qregy\n\n");
		}
	} else {
		const p = path;
		path = "";
		
		clear();
		output("path '" + p + "' does not exist");
	}
	
	window.onresize.subscribe(() => {
		box.console.resize();
	});
});

