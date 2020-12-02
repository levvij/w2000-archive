const path = arguments[0];
let image = null;

const barWidth = 56;
const defaultSize = {
	x: 400,
	y: 600
};

const window = new Window((path ? fs.prettyName(path) : "Untitled") + " - Paint", defaultSize.x + barWidth, defaultSize.y);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.render(async ui => {
	const grid = ui.Grid([barWidth + "px", "*"], [
		"100%"
	]);
	ui.root.add(grid);
	
	const canvas = ui.Canvas();
	
	grid[0][0].add(ui.Button("TEST", () => {
		canvas.context.save(path);
	}));
	
	if (path && !image) {
		image = await Graphics.Image(path);
		
		window.width = image.width + barWidth;
		window.height = image.height;
		
		canvas.width = image.width || defaultSize.x;
		canvas.height = image.height || defaultSize.y;
		canvas.context.drawImage(image, 0, 0);
		
		grid[0][1].add(canvas);
	}
	
	let pos = null;

	window.onmousedown.subscribe(e => {
		pos = e;
	});
	
	window.onmouseup.subscribe(e => {
		pos = null;
	});
	
	window.onmousemove.subscribe(e => {
		if (pos) {
			const p = canvas.context.createPath();
			p.moveTo(pos.x - barWidth, pos.y);
			p.lineTo(e.x - barWidth, e.y);
			p.draw();
			
			pos = e;
		}
	});
});