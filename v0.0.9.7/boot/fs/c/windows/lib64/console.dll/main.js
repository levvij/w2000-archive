/// CMXER console 
/// C 2019 levvij

// logging unit
function Unit(con, name, level) {
	const public = {
		action(act, ...data) {
			console.log("%c[" + name + "/" + act + "]%c", config.globalConsole.action, "", ...data);
			con.writeln("[" + name + "/" + act + "] " + data.join(" "));
		},
		mark(act, ...data) {
			console.log("%c[" + name + "/" + act + "]%c", config.globalConsole.mark, "", ...data);
			con.writeln("[" + name + "/" + act + "] " + data.join(" "));
		},
		warn(act, ...data) {
			console.warn("%c[" + name + "/" + act + "]%c", config.globalConsole.warn, "", ...data);
			con.writeln("[" + name + "/" + act + "] " + data.join(" "));
		},
		error(act, ...data) {
			console.error("%c[" + name + "/" + act + "]%c", config.globalConsole.error, "", ...data);
			con.writeln("![" + name + "/" + act + "] " + data.join(" "));
		},
		info(act, ...data) {
			console.info("%c[" + name + "/" + act + "]%c", config.globalConsole.info, "", ...data);
		}
	}
	
	return public;
}

// console element
function Console(parent) {
	const element = document.createElement("console");
	element.style.lineHeight = config.console.lineHeight;
	parent.appendChild(element);
	
	let cursor;
	let content;
	
	// put char
	const putc = c => {
		switch (c) {
			case "\t": {
				// tabs
				for (let i = 0; i < 4; i++) {
					putc(" ");
				}

				break;
			}
			case "\n": {
				// new lines
				public.y++;
				public.x = 0;

				break;
			}
			case "\r": {
				// carriage returns
				public.x = 0;
				
				break;
			}
			case "\b": {
				// backspace
				public.x--;
				
				if (public.x == -1) {
					public.x = 0;
				}
				
				break;
			}
			default: {
				// replace char
				const index = (public.width + 1) * public.y + public.x;
				const cc = content.textContent;
				content.textContent = cc.substr(0, index) + c + cc.substr(index + 1);

				// is a new line required?
				if (public.x == public.width - 1) {
					public.x = 0;
					public.y++;
				} else {
					public.x++;
				}
			}
		}
		
		if (public.y == public.height) {
			// remove topmost line and insert empty one
			content.textContent = [
				...content.textContent.split("\n").slice(1),
				"".padStart(public.width, " ")
			].join("\n");
			
			public.y--;
		}
	};
	
	// update cursor position
	const updateCursor = () => {
		let text = "";
		
		for (let i = 0; i < public.y; i++) {
			text += "\n";
		}
		
		text += "".padStart(public.x, " ");
		
		cursor.textContent = text;
	};
	
	const public = {
		width: -1,
		height: -1,
		x: 0,
		y: 0,
		output: "",
		reset() {
			element.textContent = "";
			
			const measurementElement = document.createElement("console-m");
			measurementElement.textContent = "#";
			element.appendChild(measurementElement);

			content = document.createElement("console-text");
			element.appendChild(content);

			cursor = document.createElement("console-cursor");
			cursor.textContent = "#";
			element.appendChild(cursor);

			const charSize = {
				height: measurementElement.offsetHeight,
				width: measurementElement.offsetWidth
			};

			public.width = Math.floor(element.offsetWidth / charSize.width);
			public.height = Math.floor(element.offsetHeight / charSize.height) - 1;

			measurementElement.remove();
			public.clear(true);
		},
		clear(fromReset) {
			// reset console if size is Infinite/NaN (div by 0)
			if (!fromReset && isNaN(public.width)) {
				public.reset();
			}
			
			public.x = 0;
			public.y = 0;
			
			// fill console space with spaces
			const s = [];
			for (let i = 0; i < public.height; i++) {
				s.push("".padStart(public.width, " "));
			}
			
			content.textContent = s.join("\n");
			updateCursor();
		},
		write(s) {
			s = s.toString();
			
			public.output += s;
			
			// write string
			for (let c of s) {
				putc(c);
			}
			
			// update cursor
			updateCursor();
		},
		writeln(s) {
			public.write(s + "\n");
		},
		createUnit(name) {
			// create new unit in console
			return new Unit(public, name);
		},
		
		// show / hide for globalConsole
		show() {
			parent.removeAttribute("hidden");
		},
		hide() {
			parent.setAttribute("hidden", "");
		},
		
		// enable error mode for globalConsole
		errorMode() {
			parent.setAttribute("bsod", "");
			public.show();
		},
		
		// copy cursor position
		copyCursor() {
			return {
				x: public.x,
				y: public.y
			};
		},
		
		// apply cursor position
		applyCursor(c) {
			public.x = Math.min(c.x, public.width - 1);
			public.y = Math.min(c.y, public.height - 1);
			updateCursor();
		},
		
		// resize window
		resize() {
			const buffer = content.textContent;
			const pos = public.copyCursor();
			public.reset();
			
			for (let line of buffer.trimEnd().split("\n")) {
				public.writeln(line.trimEnd());
			}
			
			public.applyCursor(pos);
		},
		
		// dump object to console
		dump(...obj) {
			console.log(obj);
			
			public.show();
			public.writeln("dump");
			
			for (let o of obj) {
				public.writeln(JSON.stringify(o, null, 4));
			}
		}
	}
	
	// initial reset
	public.reset();
	
	return public;
}

// global error handlers
onerror = function (m, f, l, c, e) {
	console.error("FATAL ERROR", ...arguments);
	
	// remove error handler (so that if the error page crashes everything just stops and it looks super cool)
	onerror = () => {};
	
	globalConsole.errorMode();
	globalConsole.clear();
	
	// who actually thought these numbers arnt fake?
	globalConsole.write("*** STOP: 0x" + ((l * c) || 0).toString(16).padStart(8, 0));
	globalConsole.write(" (0x" + (l || 0).toString(16).padStart(8, 0));
	globalConsole.write(",0x" + (c || 0).toString(16).padStart(8, 0));
	globalConsole.write(",0x" + ((e ? e.stack || e || "" : "").length || 0xffff).toString(16).padStart(8, 0) + ")\n");
	
	// print exception
	if (m || (e && !e.stack)) {
		m = m || e;
		
		globalConsole.write(m[0].toUpperCase());
		globalConsole.writeln(m.substr(1).split("").map(c => c == " " ? "_" : "_.:,;/".includes(c) ? c : (c.toUpperCase() == c ? "_" + c : c)).join("").split("_").filter(c => c).join("_").toUpperCase().replace("_@", " @ "));
	} else {
		globalConsole.writeln("B_UNKNOWN_EXCEPTION");
	}
	
	// report error to server
	fetch(config.error, {
		method: "POST",
		body: JSON.stringify({
			message: m,
			file: f,
			line: l,
			col: c,
			stack: e ? (e.stack ? e.stack : e) : null,
			cypp: typeof Cypp == "undefined" ? "" : Cypp.id
		})
	}).then(r => r.json()).then(async id => {
		// complete bsod (aint it cool that my reporting function has a delay?!)
		globalConsole.write("\n*** REPORTED 0x" + id.toString(16).padStart(8, 0) + "\n");
		
		if (e && e.scopeHandled) {
			const scope = e.scopeHandled;
			
			const show = async () => {
				globalConsole.writeln("*** SCOPED ERROR ***");
				globalConsole.writeln(e.message);
				globalConsole.writeln("\n-  " + scope.__scope_source.substr(0, scope.__scope_current_location).split("\n").slice(-5).join("\n-  "));
				globalConsole.writeln(">> " + scope.__scope_source.substr(scope.__scope_current_location).split("\n").filter(l => l.trim())[0]);

				const floc = scope.__scope_source.substr(scope.__scope_current_location).length - scope.__scope_source.substr(scope.__scope_current_location).trimStart().length;
				globalConsole.write("-  " + scope.__scope_source.substr(scope.__scope_current_location + floc).split("\n").slice(1, 2).join("\n-  "));
		
				globalConsole.writeln("\n\n*** PRESS I TO INSPECT *** ");
				globalConsole.write("*** PRESS ANY OTHER TO REBOOT *** ");

				onkeyup = async e => {
					if (e.key == "i" || e.key == "I") {
						globalConsole.clear();
						
						const explorer = new ScopeExplorer(globalConsole, scope);
						
						onkeyup = e => {
							explorer.send(e.key);
						}
						
						console.log("START");

						await explorer.waitForEnd();
						
						console.log("END");
						
						globalConsole.clear();
						show();
					} else {
						location.reload();
					}
				};
			};
			
			await show();
		} else {
			globalConsole.write("*** " + (f || "UNKNOWN LOCATION") + " L" + l + ":C" + c + "\n\n");
			globalConsole.write(e ? "*** " + (e.stack ? "STACK" : "MESSAGE") + "\n" + (e.stack || (e ? "\n" + e : "\n")).split("\n").slice(1).map((l, i) => l.trim().replace("at ", "")).join("\n") : "UNKNOWN ERROR");
			globalConsole.write("\n\n");

			// try to show more stack info
			globalConsole.write("*** EXTENDED STACK\n");
			globalConsole.write((new Error()).stack.split("\n").slice(1).map(l => l.trim()).join("\n"));

			// show reboot message
			setTimeout(() => {
				globalConsole.write("\n\n*** PRESS ANY KEY TO REBOOT *** ");

				// show some very unneeded mess on the screen just because we can
				onkeyup = () => {
					globalConsole.clear();

					location.reload();
				}
			}, 100);
		}
	});
};

// add handler for all promises
addEventListener("unhandledrejection", function(event) {
	console.log(event);
	
	onerror(event.reason.message, "[PROMISE]", 0, 0, event.reason);
});