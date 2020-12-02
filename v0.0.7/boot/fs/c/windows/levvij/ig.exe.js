/// stop looking thru these files 
/// C 2019 levvij

const http = Networking.HTTP();
const window = new Window("ig", 300, 300);

window.render(ui => {
	ui.root.add(ui.Label("loading"));
	
	http.request("https://www.instagram.com/snoopdogg/?__a=1").then(d => {
		ui.root.add(ui.Label(Object.keys(d)));
	});
});