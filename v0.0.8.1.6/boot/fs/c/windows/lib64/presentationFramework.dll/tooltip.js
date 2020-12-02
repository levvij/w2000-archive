/// Tooltip utility
/// C 2019 levvij

function Tooltip() {
	const public = {
		register(element, text) {
			console.log("TODO: tooltip for ", element, text);
		}
	};
	
	return public;
}

DLL.export("Tooltip", new Tooltip());