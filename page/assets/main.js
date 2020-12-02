onload = () => {
	const messages = document.querySelector("messages");
	
	let version;
	
	const showMessage = (message, buttons) => {
		const m = messages.appendChild(document.createElement("message"));
		m.textContent = message;
		
		if (buttons) {
			const bs = m.appendChild(document.createElement("message-buttons"));
			
			for (let name in buttons) {
				const b = bs.appendChild(document.createElement("message-button"));
				b.textContent = name;
				b.onclick = () => {
					buttons[name]();
				}
			}
		}
	};
	
	const update = async () => {
		const nversion = await fetch("page/api/version?c=" + Math.random()).then(r => r.json());
		
		if (version) {
			if (nversion != version) {
				showMessage("Version " + nversion + " just released!", {
					"View": () => {
						location.href = "?version=" + nversion;
					}
				});
			}
		}
		
		version = nversion;
		
		setTimeout(() => update(), 30000);
	};
	
	update();
}