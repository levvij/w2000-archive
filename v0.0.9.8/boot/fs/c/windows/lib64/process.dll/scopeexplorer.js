DLL.export("ScopeExplorer", function(globalConsole, scope) {
	let onkey;

	if (!scope.__scope__id) {
		scope.__scope__id = "0x" + Math.random().toString(16).substr(2);
	}

	const options = opts => {
		return new Promise(done => {
			onkey = e => {
				const opt = opts.find(o => o.key == e);

				if (opt) {
					globalConsole.clear();
					
					done(opt);
				}
			}

			globalConsole.write("\n".repeat(globalConsole.height - globalConsole.y - 3 - opts.length) + "-".repeat(globalConsole.width));

			for (let opt of opts) {
				globalConsole.writeln(opt.key + " " + opt.title);
			}
		});
	};

	const programs = [{
		key: "v",
		title: "Variables",
		load() {
			return new Promise(async done => {
				let index = 0;
				let object = scope;
				
				const render = async () => {
					globalConsole.writeln("VARIBALES IN " + scope.__scope__id + "\n");
					
					let i = -1;
					let currentItem;
					
					for (let key in object) {
						if (!key.startsWith("__scope")) {
							i++;
							
							if (i + 3 > index) {
								if (index == i) {
									globalConsole.write("> " + key + " = ");
									
									currentItem = key;
								} else {
									globalConsole.write("  " + key + " = ");
								}

								const item = object[key];
								
								switch (typeof item) {
									case "object": {
										if (item instanceof Array) {
											globalConsole.write("[ ... (" + item.length + ") ]");
										} else if (item == null) {
											globalConsole.write("null");
										} else {
											globalConsole.write("{ ... }");
										}

										break;
									}
									case "boolean": {
										globalConsole.write(item + "");

										break;
									}
									case "string": {
										globalConsole.write("'" + item + "'");

										break;
									}
									case "number": {
										globalConsole.write(item + "");

										break;
									}
									case "function": {
										globalConsole.write("() => { ... }");

										break;
									}
									case "undefined": {
										globalConsole.write("undefined");

										break;
									}
								}
								
								globalConsole.writeln("");
							}
						}
					}

					const opt = await options([{
						title: "Up",
						key: "ArrowUp",
						load() {
							index--;
							
							if (index == -1) {
								index = i;
							}
						}
					}, {
						title: "Down",
						key: "ArrowDown",
						load() {
							index++;
							
							if (index > i) {
								index = 0;
							}
						}
					}, {
						title: "Back to Scope",
						key: "$",
						load() {
							index = 0;
							object = scope;
						}
					}, {
						title: "Select " + (currentItem || ""),
						key: "Enter",
						load() {
							if (object[currentItem]) {
								object = object[currentItem];
								index = 0;
							}
						}
					}, {
						title: "Quit",
						key: "q",
						load() {
							return true;
						}
					}]);

					if (await opt.load()) {
						done();
					} else {
						render();
					}
				};
				
				render();
			});
		}
	}];

	const p = new Promise(async done => {
		const render = async () => {
			globalConsole.writeln("SCOPE " + scope.__scope__id + "\n");

			const screen = await options([
				...programs,
				{
					key: "q",
					title: "Quit",
					load() {
						return true;
					}
				}
			]);

			if (await screen.load()) {
				done();
			} else {
				render();
			}
		};
		
		render();
	});

	return {
		send(e) {
			onkey(e);
		},
		waitForEnd() {
			return new Promise(done => {
				p.then(() => {
					done();
				});
			});
		}
	}
});