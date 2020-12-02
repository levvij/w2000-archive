/// Window / window management
/// C 2019 levvij

function Window(titletext, width, height, parent) {
	// create elements
	const element = document.createElement("window");
	const inner = document.createElement("window-inner");
	const title = document.createElement("window-title");
	const body = document.createElement("window-body");
	const buttonsContainer = document.createElement("window-buttons");
	const cover = document.createElement("window-cover");
	
	// create window id
	const id = Cypp.createId();

	// add elements
	workspace.appendChild(element);
	element.appendChild(inner);
	element.appendChild(cover);
	inner.appendChild(title);
	inner.appendChild(body);
	inner.appendChild(buttonsContainer);
	
	// disable contextMenu 
	inner.contextMenu = true;
	
	let ui;
	let resizeable = true;
	let ico;
	const keys = {};
	
	// create logger
	const log = globalConsole.createUnit("window-" + Cypp.shortenId(id));

	const public = {
		id,
		
		// events
		onclose: Event("Window close"),
		onstatechange: Event("Window state change"),
		onresize: Event("Window resize"),
		
		// hierarchy
		parent,
		childWindows: [],
		
		// size (limited / capped)
		get width() {
			return parseInt(element.style.width) - config.window.borderSize.x;
		},
		set width(value) {
			if (value < config.window.minWidth) {
				value = config.window.minWidth;
			}

			element.style.width = value + config.window.borderSize.x;
		},
		get height() {
			return parseInt(element.style.height) - config.window.borderSize.y;
		},
		set height(value) {
			if (value < config.window.minHeigth) {
				value = config.window.minHeigth;
			}

			element.style.height = value + config.window.borderSize.y;
		},
		
		// location (limited / capped)
		get x() {
			return parseInt(element.style.left);
		},
		set x(value) {
			if (value < config.window.minDisplayBorderOffset.x - public.width) {
				value = config.window.minDisplayBorderOffset.x - public.width;
			}

			if (value > workspace.clientWidth - config.window.minDisplayBorderOffset.x) {
				value = workspace.clientWidth - config.window.minDisplayBorderOffset.x;
			}

			element.style.left = value;
			public.prestinePosition = false;
		},
		get y() {
			return parseInt(element.style.top);
		},
		set y(value) {
			if (value < 0) {
				value = 0;
			}

			if (value > workspace.clientHeight - config.window.minDisplayBorderOffset.y) {
				value = workspace.clientHeight - config.window.minDisplayBorderOffset.y;
			}

			element.style.top = value;
			public.prestinePosition = false;
		},
		
		// z index
		get z() {
			return +element.style.zIndex;
		},
		set z(value) {
			element.style.zIndex = value;
		},
		
		// window title text
		get title() {
			return title.textContent;
		},
		set title(value) {
			title.textContent = value;
			
			public.icon = ico;
		},
		
		// window title icon
		set icon(icon) {
			ico = icon;
			
			if (title.querySelector("img")) {
				title.querySelector("img").remove();
			}
			
			if (icon) {
				const img = document.createElement("img");
				img.src = config.fs.root + "/" + icon;
				title.appendChild(img);
				title.setAttribute("icon", "");
			} else {
				title.removeAttribute("icon");
			}
		},
		
		// render
		// passing a function will set this function as the renderer and executing
		// just running render() will use the old renderer function
		render(fx) {
			ui.clear();
			
			if (fx) {
				log.action("render", "new render function");
				public.renderFunction = fx;
				
				fx(ui);
			} else {
				log.action("render", "rerender");
				
				public.renderFunction(ui);
			}	
		},
		
		// create sub window
		createChildWindow(...args) {
			log.action("child", "new child window");
			
			const w = new Window(...args, public);
			public.childWindows.push(w);
			return w;
		},
		
		// window state
		get active() {
			return element.hasAttribute("active");
		},
		focus() {
			if (!public.active) {
				element.setAttribute("active", "");
				element.removeAttribute("min");
				
				public.z = Math.max(...Window.instances.map(i => i.z)) + 100;
			}
		},
		blur() {
			element.removeAttribute("active");
		},
		
		// window visibility
		get minimized() {
			return element.hasAttribute("min");
		},
		get maximized() {
			return element.hasAttribute("max");
		},
		min() {
			log.action("state", "minimized");
			element.setAttribute("min", "");
			
			if (Window.instances.length - 1) {
				Window.activateTop(public);
			}
			
			Window.onstatechange(public);
			public.onstatechange();
		},
		max() {
			log.action("state", "maximized");
			if (public.maximized) {
				element.removeAttribute("max");
			} else {
				element.setAttribute("max", "");
			}
			
			Window.onstatechange(public);
			public.onstatechange();
		},
		
		// close window
		close() {
			log.action("state", "closed");
			
			// remove window from instances and parents childWindows
			Window.instances.splice(Window.instances.indexOf(public), 1);
			
			if (parent) {
				parent.childWindows.splice(parent.childWindows.indexOf(public), 1);
			}

			// remove from workplace 
			element.remove();

			if (parent) {
				Window.activate(parent);
			} else {
				if (Window.instances.length) {
					Window.activateTop(public);
				}
			}
			
			if (public == Window.activeWindow) {
				Window.activateTop(public);
			}
			
			// run events
			Window.onclose(public);
			public.onclose();
		},
		
		// set button style
		set buttonStyle(value) {
			buttonsContainer.textContent = "";

			if (value == Window.ButtonStyle.all) {
				const min = document.createElement("button");
				min.setAttribute("min", "");
				buttonsContainer.appendChild(min);
				min.onclick = () => public.min();

				const max = document.createElement("button");
				max.setAttribute("max", "");
				buttonsContainer.appendChild(max);
				max.onclick = () => public.max();
			}

			if (value != Window.ButtonStyle.none) {
				const close = document.createElement("button");
				close.setAttribute("close", "");
				buttonsContainer.appendChild(close);
				close.onclick = () => public.close();
			}
		},
		doneMoving() {
			element.removeAttribute("moving");
		},
		
		// break window & add windows 2000 glitch effect
		break() {
			// get properties
			const style = getComputedStyle(element);
			const headerStyle = getComputedStyle(title).backgroundColor;
			const height = title.getBoundingClientRect().height;
			
			// clear item
			element.textContent = "";
			
			// create canvas
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");
			
			canvas.width = public.width;
			canvas.height = public.height;
			
			// renderer
			const clone = async () => {
				if (Window.activeWindow && Window.activeWindow != public) {
					ctx.fillStyle = style.borderLeftColor;
					ctx.fillRect(Window.activeWindow.x - public.x, Window.activeWindow.y - public.y, Window.activeWindow.width - 1, Window.activeWindow.height - 1);
					
					ctx.fillStyle = style.borderBottomColor;
					ctx.fillRect(Window.activeWindow.x - public.x + 1, Window.activeWindow.y - public.y + 1, Window.activeWindow.width - 1, Window.activeWindow.height - 1);
					
					ctx.fillStyle = style.backgroundColor;
					ctx.fillRect(Window.activeWindow.x - public.x + 1, Window.activeWindow.y - public.y + 1, Window.activeWindow.width - 2, Window.activeWindow.height - 2);
					
					ctx.fillStyle = headerStyle;
					ctx.fillRect(Window.activeWindow.x - public.x + 1, Window.activeWindow.y - public.y + 1, Window.activeWindow.width - 2, height);
				}
				
				setTimeout(() => clone(), 10);
			}
			
			element.appendChild(canvas);
			setTimeout(() => clone(), 10);
		},
		
		// bind key
		bindKey(key, fx) {
			keys[key] = fx;
		},
		
		// is window resizeable (used by resize)
		get resizeable() {
			return resizeable && Window.activeWindow == public;
		},
		
		// ovverride resizability
		set resizeable(value) {
			resizeable = value;
		}
	};

	// main ui object
	ui = new UI(public, body);
	const resize = new Resize(public, element);

	// activate window
	Window.activate(public);

	// set initial values
	public.z = Math.max(...Window.instances.map(i => i.z)) + 100;
	public.width = width;
	public.height = height;
	
	// take topmost window with a prestine position as guide
	public.x = parent ? Math.max(...parent.childWindows.filter(c => c.prestinePosition).map(c => c.x), parent.x) + config.window.initialOffset.x : Math.max(...Window.instances.filter(c => c.prestinePosition).map(c => c.x), config.window.initialPosition.x) + config.window.initialOffset.x;
	public.y = parent ? Math.max(...parent.childWindows.filter(c => c.prestinePosition).map(c => c.y), parent.y) + config.window.initialOffset.y : Math.max(...Window.instances.filter(c => c.prestinePosition).map(c => c.y), config.window.initialPosition.y) + config.window.initialOffset.y;
	public.title = titletext;
	public.prestinePosition = true;
	public.buttonStyle = Window.ButtonStyle.all;

	// add click hander for clickout cover
	cover.onclick = () => {
		Window.activate(public);
	};

	// move start handler
	title.ontouchstart = title.onmousedown = e => {
		Window.moving = public;
		Window.activate(public);
		element.setAttribute("moving", "");

		if (e.touches) {
			Window.movePos = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};
		}
	};

	// add window to instances
	Window.instances.push(public);
	Window.onopen(public);
	
	// check key combination
	const checkKeyCombination = (key, event) => {
		const elements = key.toLowerCase().split("+");
		
		if (elements.includes("ctrl")) {
			if (!event.ctrlKey && !event.metaKey) {
				return;
			}
			
			elements.splice(elements.indexOf("ctrl"), 1);
		}
		
		if (elements.includes("shift")) {
			if (!event.shiftKey) {
				return;
			}
			
			elements.splice(elements.indexOf("shift"), 1);
		}
		
		if (elements.includes("arrow-up")) {
			if (!event.key == "ArrowUp") {
				return;
			}
			
			elements.splice(elements.indexOf("arrow-up"), 1);
		}
		
		if (elements.includes("arrow-down")) {
			if (!event.key == "ArrowDown") {
				return;
			}
			
			elements.splice(elements.indexOf("arrow-down"), 1);
		}
		
		if (elements.includes("arrow-left")) {
			if (!event.key == "ArrowLeft") {
				return;
			}
			
			elements.splice(elements.indexOf("arrow-left"), 1);
		}
		
		if (elements.includes("arrow-right")) {
			if (!event.key == "ArrowRight") {
				return;
			}
			
			elements.splice(elements.indexOf("arrow-right"), 1);
		}
		
		if (elements.includes("alt")) {
			if (!event.altKey) {
				return;
			}
			
			elements.splice(elements.indexOf("alt"), 1);
		}
		
		for (let item of elements) {
			if (item == event.key.toLowerCase()) {
				elements.splice(elements.indexOf("alt"), 1);
			}
		}
		
		if (!elements.length) {
			keys[key]();
			event.preventDefault && event.preventDefault();
		}
	}
	
	// add key handler
	public.keydown = event => {
		for (let key in keys) {
			checkKeyCombination(key, event);
		}
	};

	return public;
}

// all open window instances
Window.instances = [];

// window events
Window.onopen = Event("Window open");
Window.onactivechange = Event("Active window change");
Window.onclose = Event("Window close");
Window.onstatechange = Event("Window state change");

// activate window
Window.activate = window => {
	if (Window.activeWindow) {
		Window.activeWindow.blur();
	}
	
	Window.activeWindow = window;

	if (window) {
		window.focus();
	}
	
	Window.onactivechange(window);
};

// activate topmost window
Window.activateTop = source => {
	Window.activate(Window.instances.filter(i => i != source && !i.minimized).sort((a, b) => a.z == b.z ? 0 : a.z > b.z ? -1 : 1)[0]);
};

// window button styles
Window.ButtonStyle = {
	all: {},
	close: {},
	none: {}
};

// mouse move handler 
const move = e => {
	if (Window.moving) {
		if (e.touches) {
			Window.moving.x += e.touches[0].clientX - Window.movePos.x;
			Window.moving.y += e.touches[0].clientY - Window.movePos.y;

			Window.movePos = {
				x: e.touches[0].clientX,
				y: e.touches[0].clientY
			};
		} else {
			Window.moving.x += e.movementX;
			Window.moving.y += e.movementY;
		}
	}
};

// register move handlers
workspace.addEventListener("mousemove", move);
workspace.addEventListener("touchmove", move);

// stop handler
const stop = () => {
	if (Window.moving) {
		Window.moving.doneMoving();
		Window.moving = null;
	}
};

// register stop handler
workspace.addEventListener("mouseup", stop);
workspace.addEventListener("mouseleave", stop);
workspace.addEventListener("touchend", stop);

// add global keydown handler
Window.keydown = onkeydown = event => {
	if (event && event.preventDefault && (event.key.length > 1 && event.key[0] == "F")) {
		event.preventDefault();
	}
	
	// route event to current active window
	if (Window.activeWindow) {
		Window.activeWindow.keydown(event);
	}
};

DLL.export("Window", Window);