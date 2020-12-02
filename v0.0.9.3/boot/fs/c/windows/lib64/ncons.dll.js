function Unit(con, name, level) {
	const public = {
		action(act, ...data) {
			console.log("%c[" + name + "/" + act + "]%c", config.globalConsole.action, "", ...data);
			con.writeln("[" + name + "/" + act + "] " + data.join(" "));
		},
		mark(act, ...data) {
			console.log("%c[" + name + "/" + act + "]%c", config.globalConsole.mark, "", ...data);
			con.writeln("[" + name + "/" + act + "] " + data.join(" "));
		}
	}
	
	return public;
}

const globalConsole = {
	createUnit(name) {
		return new Unit({
			writeln(){}
		}, name);
	},
	dump(...dump) {
		console.log("DUMP\n", ...dump);
	}
};