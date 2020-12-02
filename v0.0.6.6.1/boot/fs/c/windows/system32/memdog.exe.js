/// Memory Dog (Memory watcher)
/// C 2019 levvij

// -a allocates string with given length
if (arguments.has("a")) {
	window.memoryDog = window.memoryDog || [];
	window.memoryDog.push("#".repeat(+arguments.get("a")));
} else if (performance && performance.memory) {
	const window = new Window("Memory Dog", 180, 185);

	window.render(ui => {
		const chart = ui.Chart({
			valueTransform: v => fs.readableSize(v),
			segments: [{
				text: "Used Memory",
				value: performance.memory.usedJSHeapSize
			}, {
				text: "Browser Memory",
				value: performance.memory.totalJSHeapSize - performance.memory.usedJSHeapSize
			}, {
				text: "Free Memory",
				value: performance.memory.jsHeapSizeLimit - performance.memory.totalJSHeapSize
			}]
		});

		chart.margin = "5px";

		ui.root.add(chart);

		setTimeout(() => window.render(), 100);
	});
} else {
	UI.ErrorBox("Error", "Cannot get memory information");
}