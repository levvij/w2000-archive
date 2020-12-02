function main() {
	if (!arguments[0]) {
		Application.run(fs.extinfo("$").opener);
	} else if (arguments[0].includes("://")) {
		Application.load(fs.extinfo(arguments[0].split("://")[0] + "://").opener, arguments[0]);
	} else {
		Application.run(arguments[0]);
	}
	
	exit();
}