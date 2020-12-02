const path = arguments[0];
let image = {};

const barWidth = 56;
const defaultSize = {
	x: 400,
	y: 600
};

const window = new Window((path ? fs.prettyName(path) : "Untitled") + " - Paint", defaultSize.x + barWidth, defaultSize.y);

window.render(ui => {
	const grid = ui.Grid([barWidth + "px", "*"], [
		"100%"
	]);
	ui.root.add(grid);
	
	const canvas = ui.Canvas();
	canvas.width = image.width || defaultSize.x;
	canvas.height = image.height || defaultSize.y;
	
	if (image.src) {
		canvas.context.drawImage(image, 0, 0);
	}
	
	grid[0][0].add(ui.Image(fs.icon("floimg/0x0003")));
	grid[0][1].add(canvas);
});

if (path) {
	image = new Image();
	
	image.onload = () => {
		window.width = image.width + barWidth;
		window.height = image.height;
		window.render();
	};
	
	image.src = await fs.readURI(path);
}