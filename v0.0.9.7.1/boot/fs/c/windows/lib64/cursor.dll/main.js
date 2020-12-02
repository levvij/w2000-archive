const log = globalConsole.createUnit("cursor");

function Cursor() {
	const e = document.createElement("cursor");
	document.body.appendChild(e);
	
	const cache = {};
	
	const public = {
		update(x, y, type) {
			if (config.touch) {
				return;
			}
			
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
			if (cache[name]) {
				return cache[name];
			}
			
			if (!fs.exists(configuration.path.replace("%n", name))) {
				log.warn("not-found", "cursor '" + name + "' ('" + configuration.path.replace("%n", name) + "') not found");
				
				return await fs.readURI(configuration.path.replace("%n", configuration.default));
			}
			
			return cache[name] = await fs.readURI(configuration.path.replace("%n", name));
		}
	}
	
	if (!config.touch) {
		addEventListener("mousemove", event => {
			document.body.setAttribute("cursor", "");

			public.update(event.pageX, event.pageY);
		});
	
		public.update(innerWidth / 2, innerHeight / 2);
	}
	
	return public;
}

DLL.export("Cursor", new Cursor());