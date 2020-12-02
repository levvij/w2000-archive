const run = () => {
	if (arguments.has("r")) {
		location.reload();
	} else {
		history.back();
	}
};

if (arguments.has("t")) {
	setTimeout(() => run(), 1000 * arguments.get("t"));
} else {
	run();
}