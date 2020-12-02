async function main() {
	if (arguments.has("p")) {
		properties(arguments.get("p"));
	} else if (arguments.has("m")) {
		move(arguments.get("m"), arguments.get("m", 1));
	} else if (arguments[0] && await fs.exists(arguments[0]) && await fs.isLink(arguments[0])) {
		properties(arguments[0]);
	} else {
		explore(arguments[0] || "");
	}
}