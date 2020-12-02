const window = new Window("Run", 350, 150);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	
});