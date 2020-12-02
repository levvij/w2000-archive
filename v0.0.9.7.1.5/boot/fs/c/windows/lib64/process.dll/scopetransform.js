function Scope(environnement, fx) {
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
				console.log("blocklevel lower");

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
								if (inBrackets) {
									out += ";";
								} else {
									out += ";__scope.__scope_location(" + (i + 2) + ");";
								}

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
									out += "{with(__scoped(__scope, {" + arguments + "}, '" + (environnement.debug ? btoa(encodeURIComponent(block)) : "") + "')){try{{\n" + compile(block.slice(1, -1)).out + "}__scope.__scope_close()}catch(e){throw new ScopeError(e,__scope)}}\n}";
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
const __scoped = ${(parent, args, source) => {
			source = decodeURIComponent(atob(source));
			
			const scope = {
				__scope_close(child) {
					parent.__scope_close && parent.__scope_close(scope);
					
					if (child) {
						scope.__scope_children.splice(scope.__scope_children.indexOf(child), 1);
					}
					
					if (!scope.__scope_children.length) {
						environnement.scopes.splice(environnement.scopes.indexOf(scope), 1);
					}
				},
				__scope_source: source,
				__scope_children: [],
				__scope_parent: parent,
				__scope_current_location: 0,
				__scope_location(loc) {
					scope.__scope_current_location = loc;
				},
				__scope_stack(before = 4, after = 2) {
					const line = scope.__scope_source.substr(scope.__scope_current_location).split("\n").length;
					
					return scope.__scope_source.split("\n").slice(line - before, after + before + 1);
				},
				__scope_explore() {
					try {
			console.log(scope.__scope_stack());

			const scopes = [];
			const showVariables = scope => {
				scopes.push(scope);
				console.groupCollapsed("Variables in scope" + (scope.__scope_parent ? "" : " (root scope)"));

				for (let key in scope) {
					if (!key.startsWith("__scope")) {
						console.log("%c" + key + "%c", "font-weight:bold", "", scope[key]);
					}
				}

				if (scope.__scope_parent) {
					if (!scopes.includes(scope.__scope_parent)) {
						showVariables(scope.__scope_parent);
					}
				} else {
					for (let key in scope.__scope_proxy) {
						if (!key.startsWith("__scope")) {
							console.log("%c" + key + "%c", "font-weight:bold;color:#06c", "", scope.__scope_proxy[key]);
						}
					}
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
			environnement.scopes.push(scope);
			
			return scope.__scope_proxy;
}}
const __scope = {
	__scope_proxy: parameters,
	__scope_source: "${btoa(encodeURIComponent(code))}",
	__scoped,
	__scope_children: [],
	__scope_source: ""
};

return ${compile(code).out}`;
	};

	const builtSource = build(fx + "");

	return {
		environnement,
		builtSource,
		async run(parameters) {
			parameters.ScopeError = ScopeError;

			return await new Function("environnement", "parameters", builtSource)(environnement, parameters)();
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
	
	error.message += "\n--- Scope\n" + scope.__scope_stack();

	if (!error.scopeHandled) {
		console.group("SCOPE ERROR: " + error.message);

		scope.__scope_explore();

		error.scopeHandled = scope;
	}

	return error;
});

DLL.export("ScopedEnvironnement", function(name) {
	const environnement = {
		debug: config.beta,
		createScope(code, info) {
			return Scope(environnement, "/* SCOPE " + name + "\n" + info + " */" + code);
		},
		createVoidScope(code, info) {
			return Scope(environnement, "async () => { /* VOID-SCOPE " + name + "\n" + info + " */\n" + code + " }");
		},
		scopes: [],
		measure() {
			return Object.measure(environnement);
		}
	}

	return environnement;
});