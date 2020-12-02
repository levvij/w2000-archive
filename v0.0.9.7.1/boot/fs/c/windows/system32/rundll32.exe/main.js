const window = new Window("Run", 350, 150);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(ui => {
	const t = "#".repeat(0x8FFF);
});

const t = "#".repeat(0x8FFF);

new Timer(() => {
	(t);
}, 1000);