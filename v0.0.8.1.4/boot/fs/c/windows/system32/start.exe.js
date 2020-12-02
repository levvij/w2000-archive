if (!arguments[0]) {
	Application.run("c/windows/system32/cmd.exe");
} else if (arguments[0].startsWith("http://") || arguments[0].startsWith("https://")) {
	Application.load("c/windows/migrosoft/ie.exe", arguments[0]);
} else {
	Application.run(arguments[0]);
}