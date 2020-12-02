const window = new Window("test", 100, 100);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

let i = 0;
const timers = [];

window.render(ui => {
	ui.root.add(ui.Button("New Timer", () => {
		timers.push(new Timer(() => {
			i++;
			
			window.render();
		}, 1000));
	}));
	
	ui.root.add(ui.Label("i = " + i));
	
	ui.root.add(ui.List(timers.map(c => ({
		text: "Timer " + c.id + " " + (c.running ? "Running" : "Stopped"),
		activate() {
			c.stop();
			
			window.render();
		}
	}))));
});