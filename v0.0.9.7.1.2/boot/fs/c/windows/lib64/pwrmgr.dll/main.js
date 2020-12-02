DLL.export("PowerManager", {
	shutdown() {
		history.back();
	},
	restart() {
		location.reload();
	}
});