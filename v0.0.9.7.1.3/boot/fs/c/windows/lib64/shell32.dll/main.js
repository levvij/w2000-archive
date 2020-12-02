function Shell(path) {
	const shellex = buffer => Array.from(buffer.match(/(\"([\S\t ]*?)\")|\S*/g) || []).filter(p => p).map(v => v[0] == "\"" ? v.slice(1, -1) : v);
	
	const public = {
		echo: true,
		async run(text) {
			const parts = shellex(text);

			if (parts.length) {
				switch (parts[0]) {
					case "echo": {
						return parts.slice(1).join(" ");
					}
					case "clear": {
						clear();
						
						return "";
					}
					case "dir": {
						return fs.list(fs.abs(parts[1], path)).join("\n");
					}
					default: {
						const paths = [path, ...config.path];
						const program = fs.search(parts[0], paths) || fs.search(parts[0] + ".exe", paths);

						if (program) {
							await Application.load(program, ...parts.slice(1));
							
							return "";
						} else {
							return "No program or shell internal '" + parts[0] + "' found";
						}
					}
				}
			} else {
				return "";
			}
		},
		runBatch(text) {
			return new Promise(done => {
				const lines = text.split("\n").map(l => l.trim());
				let index = -1;
				const jumps = {};

				const next = async () => {
					index++;

					const line = lines[index];

					if (index < lines.length) {
						const elements = shellex(line);

						if (!line || line[0] == ";") {
							next();
						} else if (line[0] == ":") {
							jumps[line.substr(1)] = index;

							setTimeout(() => next(), configuration.commandDelay);
						} else if (line[0] == "@" && elements[0] == "@echo") {
							public.echo = elements[1] == "on";

							setTimeout(() => next(), configuration.commandDelay);
						} else if (elements[0] == "goto") {
							index = jumps[elements[1]];

							setTimeout(() => next(), configuration.commandDelay);
						} else {
							await public.run(line);

							setTimeout(() => next(), configuration.commandDelay);
						}
					} else {
						done(); 
					}
				};

				next();
			});
		}
	}
	
	return public;
}

DLL.export("Shell", Shell);