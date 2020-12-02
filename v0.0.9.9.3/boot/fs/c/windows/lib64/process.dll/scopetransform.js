const scopedEnvironmentTag = "/*ST_" + Math.random().toString(16).substr(2) + "*/";
const scopeDebugTag = "/*SD_%c*/";
const scopedSourceTag = "SR_" + Math.random().toString(16).substr(2);
const scopeDebugFinder = /\/\*SD\_[0-9a-f]+\*\//g;
const scopedDebuggingInfos = {};

function Scope(environment, fx, name) {
	const compile = code => {
		let out = "";
		let inString = false;
		let block = "";
		let blockLevel = 0;
		let scoped;
		let exp = "";
		let arguments = [];
		let inBrackets = 0;
		const defines = [];

		for (let i = 0; i < code.length; i++) {
			const c = code[i];

			if (blockLevel < 0) {
				return {
					out
				};
			}

			if (inString) {
				if (blockLevel) {
					block += c;
				} else {
					out += c;
				}

				if (c == inString && code[i - 1] != "\\") {
					inString = false;
				}
			} else {
				if (!blockLevel) {
					const nextWord = code.substr(i).split(" ")[0].split("\t")[0].split("\n")[0];

					if (nextWord == "var" || nextWord == "let" || nextWord == "const") {
						i += nextWord.length;
						out += "var ";

						const exp = code.substr(i).trim().split(";")[0].trim();
						const name = exp.split(" ")[0].split("\t")[0].split("\n")[0];

						if (!exp.includes("=")) {
							defines.push(name);
						}

						continue;
					}

					if (nextWord == "unscoped") {
						i += nextWord.length;

						continue;
					}

					if (nextWord == "//") {
						const rest = code.substr(i).split("\n")[0];

						out += "/* " + rest.substr(2) + " */\n";
						i += rest.length;

						continue;
					}

					if (nextWord == "/*") {
						let c = i;

						while (code[i]) {
							i++;

							if (code[i] == "*" && code[i + 1] == "/") {
								break;
							}
						}

						out += code.slice(c, i + 2);
						i++;

						continue;
					}
				}

				switch (c) {
					case "(":
						{
							if (blockLevel) {
								block += c;
							} else {
								inBrackets++;

								out += c;
							}

							break;
						}
					case ")":
						{
							if (blockLevel) {
								block += c;
							} else {
								inBrackets--;

								out += c;
							}

							break;
						}
					case ";":
						{
							if (blockLevel) {
								block += c;

								break;
							} else {
								out += ";";
								exp = "";

								break;
							}
						}
					case "\"":
					case "'":
						{
							inString = c;

							if (blockLevel) {
								block += c;
							} else {
								out += c;
							}

							break;
						}
					case "{":
						{
							if (!blockLevel) {
								scoped = false;

								if (code.substr(0, i).match(/((((function\s*\S*))\s*\((.*?)\)))\s*$/g)) {
									scoped = true;
								} else if (code.substr(0, i).match(/(\=\>)\s*$/g)) {
									scoped = true;

									const before = code.substr(0, i).split("=>").slice(-2)[0].trim();

									if (before[before.length - 1] == ")") {
										arguments = before.substr(0, before.length - 1).split("(").pop().split(",").map(i => i.trim()).filter(a => a);
									} else {
										arguments = [
											before.split("(").pop().split(" ").pop().split("\t").pop().split("\n").pop()
										];
									}
								} else if (code.substr(0, i).match(/(for)\s*\(((var)|(let)|(const))\s+(.*?)\)\s*$/g)) {
									scoped = true;

									const variable = code.substr(0, i).match(/(for)\s*\(((var)|(let)|(const))\s+(.*?)\)\s*$/g)[0].match(/((var)|(let)|(const))\s*\S+/g)[0];

									arguments = [
										variable.replace(variable.split(" ")[0].split("\n")[0].split("\t")[0], "").trim()
									];
								} else if (code.substr(0, i).match(/((((if)|(for))\s*\((.*?)\))|(else))\s*$/g)) {
									scoped = true;
								}
							}

							blockLevel++;
							block += c;

							break;
						}
					case "}":
						{
							blockLevel--;
							block += c;

							if (!blockLevel) {
								if (scoped) {
									out += "{with(__scoped(__scope, {" + arguments + "})){try{{" + compile(block.slice(1, -1)).out + "}__scope.__scope_close()}catch(e){throw new ScopeError(e,__scope)}}}";
								} else {
									out += block;
								}

								arguments = [];
								block = "";
								exp = "";
							}

							break;
						}
					default:
						{
							if (blockLevel) {
								block += c;
							} else {
								out += c;
							}
						}
				}

				if (!blockLevel) {
					exp += c;
				}
			}
		}

		if (blockLevel > 0) {
			throw new SyntaxError("Cannot compile file, blocklevel: " + blockLevel);
		}

		return {
			out: defines.map(d => "var " + d + "=null;").join(";") + out
		};
	};

	const build = code => {
		return `
const __scoped = ${(parent, args) => {
			const id = Math.random().toString(16).substr(2);
			
			const scope = {
				__scope_id: id,
				__scope_close(child) {
					parent.__scope_close && parent.__scope_close(scope);
					
					if (child) {
						scope.__scope_children.splice(scope.__scope_children.indexOf(child), 1);
					}
					
					if (!scope.__scope_children.length) {
						environment.scopes.splice(environment.scopes.indexOf(scope), 1);
					}
				},
				__scope_children: [],
				__scope_parent: parent,
				__scope_explore() {
					try {
						const scopes = [];
						const names = [];
						
						const showVariables = scope => {
							scopes.push(scope);
							console.log("%cSCOPE %c0x" + id, "font-weight: bold", "");
							console.log("size: " + Path.readableSize(Object.measure(scope)));
							console.group("Variables");
							
							for (let key in scope) {
								if (!key.startsWith("__scope")) {
									console.log("%c" + key + " (" + Path.readableSize(Object.measure(scope[key])) + ") " + (names.includes(key) ? "%c[overridden]" : "%c"), names.includes(key) ? "opacity: 0.7" : "", "", scope[key]);
									
									names.push(key);
								}
							}
							
							if (scope.__scope_parent) {
								console.groupCollapsed("Parent scope");
								
								if (!scopes.includes(scope.__scope_parent)) {
									showVariables(scope.__scope_parent);
								}
								
								console.groupEnd();
							}
							
							console.groupEnd();
						}

						showVariables(scope);

						console.groupEnd();
					} catch (e) {
						console.log("could not load scoped stack trace", scope, e);
					}
				}
			};
			
			for (let key in args) {
				scope.__scope_size += Object.measure(scope[key] = args[key]);
			}
			
			scope.__scope_proxy = new Proxy(scope, {
				has(scope, prop) { 
					return true;
				},
				get(scope, prop) {
					if (prop == "this") {
						return;
					}
					
					if (prop == "undefined") {
						return undefined;
					}
					
					if (prop == "null") {
						return null;
					}
					
					if (prop == Symbol.unscopables) {
						return Symbol.unscopables;
					}
					
					if (prop == "__scoped") {
						return __scoped;
					}

					if (prop == "__scope") {
						return scope;
					}

					if (prop in scope) {
						return scope[prop];
					}

					if (prop in parent.__scope_proxy) {
						return parent.__scope_proxy[prop];
					}
					
					throw new ScopeError("Undeclared variable '" + prop + "'", scope);
				},
				set(scope, prop, value, target) {
					if (target != scope.__scope_proxy) {
						target[prop] = value;
							
						return;
					}
					
					if (prop in scope) {
						scope[prop] = value;
						
						return;
					}
					
					let s = scope;
					while (s.__scope_parent) {
						if (prop in s) {
							s[prop] = value;
							
							return;
						}
						
						s = s.__scope_parent;
					}
					
					scope[prop] = value;
				}
			});
			
			parent.__scope_children.push(scope);
			environment.scopes.push(scope);
			
			return scope.__scope_proxy;
}}
const __scope = {
	__scope_proxy: parameters,
	__scoped,
	__scope_children: [],
};

return ${compile(code).out}`;
	};

	const builtSource = build(fx + "");

	return {
		environment,
		builtSource,
		run(parameters) {
			parameters.ScopeError = ScopeError;
			
			return new Promise(done => {
				const id = "_" + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + "_" + +(new Date());
				ScopedEnvironment.crossload[id] = {};

				const fname = "program_" + name.replace(/[^a-zA-Z0-9]/g, "_");
				
				const blob = new Blob([
					"ScopedEnvironment.crossload." + id + "." + fname + " = function " + fname + "(environment, parameters) { " + builtSource + "}"
				], {
					type: "text/plain"
				});

				const script = document.createElement("script");
				script.src = URL.createObjectURL(blob);
				script.async = true;
				
				script.onload = () => {
					const runnable = ScopedEnvironment.crossload[id][fname](environment, parameters);
					
					runnable().then(() => {
						done();
					});
				};
				
				document.head.appendChild(script);
			});
		}
	};
}

Object.measure = (object, items = []) => {
	let total = 0;
	items.push(object);

	if (object instanceof Element) {
		return 0;
	}

	switch (typeof object) {
		case "object":
			{
				for (let k in object) {
					if (!(Object.getOwnPropertyDescriptor(object, k) || {}).get && !items.includes(object[k])) {
						total += k.length * 2 + Object.measure(object[k], items);
					}
				}

				return total;
			}
		case "function":
			{
				return (object + "").length * 2;
			}
		case "string":
			{
				return object.length * 2;
			}
		case "number":
			{
				return 8;
			}
		case "boolean":
			{
				return 4;
			}
	}

	return 0;
}

DLL.export("ScopeError", function(error, scope) {
	if (!(error instanceof Error)) {
		error = new Error(error);
	}

	if (!error.scopeHandled) {
		const time = new Date();
		
		console.log("Gathering information about scope error...");
		
		(async () => {
			const files = [];
			const lines = error.stack.split("\n").slice(1).map(l => l.trim().replace("at ", ""));

			for (let line of lines) {
				try {
					const source = "blob:" + location.protocol + "//" + location.host + "/" + line.split("blob:" + location.protocol + "//" + location.host + "/")[1].split(")")[0].trim();
					const url = source.split(":").slice(0, -2).join(":");
					const content = await fetch(url).then(res => res.text());

					const file = {
						url,
						source,
						line: +source.split(":").slice(-2)[0],
						letter: +source.split(":").pop(),
						content: content.split("\n"),
						debuggingInformation: scopedDebuggingInfos[(content.match(scopeDebugFinder) || [])[0]]
					};
					
					file.sourceLine = +((file.content[file.line] || "").split("*")[2]);
					files.push(file);
					
					await new Promise(done => {
						setTimeout(() => {
							done();
						}, 200);
					});

					console.log("Gathered information about scope error (" + files.length + "/" + lines.length + ")...");
				} catch (e) {
					console.log("Could not gather information about scope error (" + files.length + "/" + lines.length + ")...", e);
				}
			}

			console.group("%c[report]%c\n\nSCOPE ERROR: " + error.name + ": " + error.message, "background: #871e72; color: white", "");
			console.log("time: " + time);
			console.group("Stack Trace");

			for (let file of files) {
				const scopedEnvironment = file.content.join().includes(scopedEnvironmentTag);
				
				console.group("%c" + file.content[file.line - 1].trim() + "%c [%c" + (scopedEnvironment ? "scoped" : "system") + "%c]", (scopedEnvironment ? "" : "opacity: 0.7; ") + "font-weight: normal", "", scopedEnvironment ? "color: #088" : "color: #999", "");
				
				file.debuggingInformation && file.debuggingInformation();
				
				console.groupCollapsed("Source");

				let lines = [];
				
				for (let i = Math.max(file.line - 25, 0); i < Math.min(file.line + 8, file.content.length); i++) {
					if (file.content[i].includes(scopedSourceTag)) {
						lines.push([
							+file.content[i].split("*")[2] + 1, 
							decodeURIComponent(atob(file.content[i].split("*")[1].split(scopedSourceTag)[1]))
						]);
					}
				}
				
				console.log(file.source + "\n");
				console.log(lines.filter(l => l[0] < file.sourceLine).map(l => l.join(": ")).join("\n"));
				
				console.log(
					"%c" + file.sourceLine + ": " 
					+ file.content[file.line - 1].substr(0, file.letter - 1) 
					+ "%c" + file.content[file.line - 1].substr(file.letter - 1),
					"color: red",
					"color: red; font-weight: bold; text-decoration: underline"
				);
				
				console.log(lines.filter(l => l[0] > file.sourceLine).map(l => l.join(": ")).join("\n"));
				
				console.groupEnd();
				console.groupEnd();
			}
			
			console.groupEnd();
			
			console.group("Scope Information");
			scope.__scope_explore();
			console.groupEnd();
		})();

		error.scopeHandled = scope;
	}

	return error;
});

function ScopedEnvironment(name, debuggingInformation) {
	const debuggingId = scopeDebugTag.replace("%c", Math.random().toString(16).substr(2));
	
	scopedDebuggingInfos[debuggingId] = debuggingInformation;
	
	const environment = {
		debug: config.beta,
		createScope(code, info) {
			return Scope(environment, scopedEnvironmentTag + "/* SCOPE " + name + "\n" + info + " */" + code, name);
		},
		createVoidScope(code, info) {
			return Scope(environment, "async () => { " + scopedEnvironmentTag + debuggingId + "/* VOID-SCOPE " + name + "\n" + info + " */\n" + code.split("\n").map((c, i) => "/*" + scopedSourceTag + btoa(encodeURIComponent(c)) + "*" + i + "*/\n" + c).join("\n") + " }", name);
		},
		scopes: [],
		measure() {
			return Object.measure(environment);
		}
	}

	return environment;
}

ScopedEnvironment.crossload = {};

DLL.export("ScopedEnvironment", ScopedEnvironment);