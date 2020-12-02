Assert.test("FS User Root Path", "c/users/guest/", [], () => {
	return fs.paths.user.path;
});

Assert.test("FS User Documents Path", "c/users/guest/documents", [], () => {
	return fs.paths.user.documents;
});

Assert.test("FS User Desktop Path", "c/users/guest/desktop", [], () => {
	return fs.paths.user.desktop;
});