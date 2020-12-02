/// Memory Dog (Memory watcher)
/// C 2019 levvij

// -a allocates string with given length
if (arguments.has("a")) {
	window.memoryDog = window.memoryDog || [];
	window.memoryDog.push("#".repeat(+arguments.get("a")));
} else {
	const window = new Window("Memory Watch", 180, 185);
	window.onclose.subscribe(() => exit(Process.ExitCode.success));

	window.render(ui => {
		const chart = ui.Chart({
			valueTransform: v => fs.readableSize(v),
			segments: [...Management.memory.getUsage().map(m => ({
				text: m.name,
				value: m.usage
			})), {
				text: "Browser Memory",
				value: Management.memory.vmPaddingSize
			}, {
				text: "Free Memory",
				value: Management.memory.free
			}]
		});

		chart.margin = "5px";

		ui.root.add(chart);
	});
	
	new Timer(window.render, 100);
}