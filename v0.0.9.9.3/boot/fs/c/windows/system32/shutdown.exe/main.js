function main() {
	if (arguments.has("t")) {
		setTimeout(() => {
			if (arguments.has("r")) {
				PowerManager.restart();
			} else {
				PowerManager.shutdown();
			}
		}, 1000 * +arguments.get("t"));
	} else if (arguments.has("x")) {
		PowerManager.reset();
	} else {
		if (arguments.has("r")) {
			PowerManager.restart();
		} else {
			PowerManager.shutdown();
		}
	}
}