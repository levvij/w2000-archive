/// windows media player (audio & video)
/// C 2019 levvij

// load liba
await DLL.load("wmplib.dll");
await DLL.load("timer.dll");

const player = new WMPLib();
const window = new Window("Windows Media Player", 300, 400);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

let timer;
let list;
let listIndex = -1;
let item;
let open = true;

// stop playing when window closes
window.onclose.subscribe(() => {
	open = false;
	
	if (item) {
		item.pause();
	}
});

// bin space bar to play/pause
window.bindKey(" ", () => {
	if (item) {
		if (item.playing) {
			item.pause();
		} else {
			item.play();
		}
	}
});

// bind arrow keys to jump in song
window.bindKey("arrow-left", () => {
	if (item) {
		item.seek(item.currentPosition - 5);
	}
});

window.bindKey("arrow-right", () => {
	if (item) {
		item.seek(item.currentPosition + 5);
	}
});

const render = path => {
	window.render(async ui => {
		const grid = ui.Grid([ "100%" ], [
			"auto", "*", "auto", "auto"
		]);
		
		ui.root.add(grid);
		
		// the info box was actually that ugly
		const info = ui.FixedText();
		info.padding = "10px";
		info.height = "150px";
		grid[3][0].background = "black";
		grid[3][0].foreground = "white";
		grid[3][0].add(info);
		
		// menu
		const menu = ui.Menu([
			{
				text: "Open",
				click() {
					ui.OpenFileDialog({
						allowDirectory: true,
						allowFile: true
					}).then(p => {
						render(p);
					});
				}
			}
		]);
		
		grid[0][0].add(menu);
		
		const controls = ui.Menu([
			{
				text: ">",
				disabled: true,
				click() {
					controls[0].disable();
					controls[1].enable();

					item.play();
				}
			},
			{
				text: "||",
				disabled: true,
				click() {
					controls[0].enable();
					controls[1].disable();

					item.pause();
				}
			}
		]);
		grid[2][0].add(controls);
		
		const slider = ui.Slider(0, 0, 1);
		slider.disabled = true;
		grid[2][0].add(slider);
		
		slider.onchange.subscribe(value => {
			item.seek(value);
		});
		
		if (path) {
			if (!fs.exists(path)) {
				ui.ErrorBox("File '" + path + "' does not exist").then(() => {
					render();
				});
			} else if (fs.isDirectory(path)) {
				list = fs.list(path).filter(r => r.endsWith(".mp3"));
				
				if (list.length) {
					render(list[listIndex = 0]);
				} else {
					info.text = "No MP3-files found in " + fs.fix(path);
				}
			} else {
				info.show();
				info.text = "Loading...";
				
				if (item) {
					item.pause();
				}
				
				if (fs.ext(path) == "mp3") {
					item = await player.loadAudio(path);
					
					slider.disabled = false;
					slider.max = item.duration;
					
					if (timer) {
						timer.stop();
					}
					
					timer = new Timer(() => {
						slider.value = item.currentPosition;
					}, 100);

					if (open) {
						item.play();
						
						item.onend.subscribe(() => {
							if (listIndex == -1) {
								item.seek(0);
							} else {
								render(list[listIndex = (listIndex + 1) % list.length]);
							}
						});

						controls[1].disabled = false;

						// write song info to info box
						info.text = " Title:  " + item.tag.title + "\n" +
							"Artist:  " + item.tag.artist + "\n" +
							" Album:  " + item.tag.album;

						// add list info if playing list
						if (listIndex != -1) {
							info.text += "\n\n Playing Song " + (listIndex + 1) + " of " + list.length;
						}
					}
				} else if (fs.ext(path) == "mp4") {
					item = await player.loadVideo(path);
					item.play();
					
					slider.disabled = false;
					slider.max = item.duration;
					
					if (timer) {
						timer.stop();
					}
					
					timer = new Timer(() => {
						slider.value = item.currentPosition;
					}, 100);
					
					window.width = item.width;
					window.height = item.height + 50;
					
					grid[1][0].add(ui.Video(item));
					controls[1].disabled = false;
					
					info.hide();
				}
			}
		}
	});
};

render(arguments[0]);