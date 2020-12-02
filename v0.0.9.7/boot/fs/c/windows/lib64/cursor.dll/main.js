function Cursor() {
	const e = document.createElement("cursor");
	document.body.appendChild(e);
	
	const public = {
		update(x, y, type) {
			if (type) {
				e.style.backgroundImage = type;
			} else {
				const element = document.elementFromPoint(x, y);
				if (element) {
					const s = getComputedStyle(element);

					if (s.getPropertyValue("--cursor")) {
						e.style.backgroundImage = s.getPropertyValue("--cursor");
					}
				}
			}

			e.style.left = x;
			e.style.top = y;
		},
		async load(name) {
			return await fs.readURI(configuration.path.replace("%n", name));
		}
	}
	
	addEventListener("mousemove", event => {
		document.body.setAttribute("cursor", "");
		
		public.update(event.pageX, event.pageY);
	});
	
	public.update(innerWidth / 2, innerHeight / 2);
	
	return public;
}

DLL.export("Cursor", new Cursor());