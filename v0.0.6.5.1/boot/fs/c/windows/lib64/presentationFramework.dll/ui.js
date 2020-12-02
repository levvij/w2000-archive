/// windows2000-ui
/// C 2019 levvij

const transformShortcut = shortcut => shortcut.split("+").map(c => c.length == 1 ? c.toUpperCase() : config.ui.keys[c]).join("+");
const nameTransform = name => name[0] + name.substr(1).split("").map(c => c.toLowerCase() == c ? c : "-" + c.toLowerCase()).join("");

function UI(window, body) {
	// ui element
	const element = tag => {
		const pub = {
			native: document.createElement(tag),
			
			// events
			onadd: Event("Element adds child"),
			onremove: Event("Element removes itself"),
			onadded: Event("Element gets added"),

			// remove element
			remove() {
				pub.native.remove();
				pub.onremove(pub.parent);
			},

			// add child
			add(c) {
				pub.native.appendChild(c.native);
				c.parent = pub;
				pub.onadd(c);
				
				if (c.onadded) {
					c.onadded(pub);
				}
			},

			// bind property
			bind(name, get, set) {
				Object.defineProperty(pub, name, {
					get,
					set
				});
			},

			// bind event
			event(name, desc, transform) {
				pub[name] = new Event(desc);

				pub.native[name] = event => {
					if (transform) {
						pub[name](transform(event, pub));
					} else {
						pub[name](pub);
					}
				};
			},

			// register contextmenu
			set contextMenu(value) {
				pub.native.contextMenu = value;
			},
			get contextMenu() {
				return pub.native.contextMenu;
			},

			// padding
			set padding(value) {
				pub.native.style.padding = value;
			},

			// margin
			set margin(value) {
				pub.native.style.margin = value;
			},
			
			// height
			set height(value) {
				pub.native.style.height = value;
			},
			
			// height
			set width(value) {
				pub.native.style.width = value;
			},

			// background color
			set background(value) {
				pub.native.style.background = value;
			},

			// foreground color
			set foreground(value) {
				pub.native.style.color = value;
			},

			// set content selectable
			set selectable(value) {
				if (value) {
					pub.native.setAttribute("contentselectable", "");
				} else {
					pub.native.removeAttribute("contentselectable");
				}
			},

			// set font (UI.fonts)
			set font(value) {
				if (value) {
					pub.native.setAttribute("font", value);
				}
			},

			// clear content
			clear() {
				pub.native.textContent = "";
			},
			
			// remove hidden attribute
			show() {
				pub.native.hidden = false;
			},
			
			// add hidden attribute
			hide() {
				pub.native.hidden = true;
			}
		};

		return pub;
	};

	// create root element
	const root = element("ui-root");
	body.appendChild(root.native);

	const public = {
		// grid (as in WPF)
		Grid(cols, rows) {
			const grid = element("ui-grid");

			let i = 0;
			for (let row of rows) {
				const r = element("ui-grid-row");
				grid[i] = [];

				if (row == "*") {
					r.native.style.flexGrow = 1;
				} else {
					r.native.style.height = row;
					r.native.style.flexShrink = 0;
				}

				for (let colr of cols) {
					const c = element("ui-grid-cell");

					if (colr == "*") {
						c.native.style.flexGrow = 1;
						c.native.style.width = 1;
					} else {
						c.native.style.width = colr;
						c.native.style.flexShrink = 0;
					}

					grid[i].push(c);

					r.add(c);
				}

				grid.add(r);

				i++;
			}

			return grid;
		},
		
		// inline grid
		InlineGrid(...args) {
			const g = public.Grid(...args);
			g.native.setAttribute("inline", "");
			return g;
		},

		// center element (like <center>)
		Center() {
			return element("ui-center");
		},

		// stackpanel (like WPF, without orientation)
		StackPanel() {
			return element("ui-stack");
		},

		// stackpanel (like WPF, without orientation)
		Canvas() {
			const canvas = element("canvas");
			canvas.context = canvas.native.getContext("2d");

			canvas.bind("width", () => canvas.native.width, value => canvas.native.width = value);
			canvas.bind("height", () => canvas.native.height, value => canvas.native.height = value);

			return canvas;
		},

		// slider input
		Slider(value, min, max, steps) {
			// slider locks when its beeing moved, 
			// to prevent value changes caused by timers from making the knob move
			let locked;
			const input = element("input");
			input.native.type = "range";

			input.native.onmousedown = () => {
				locked = true;
			};

			input.native.onmouseup = () => {
				locked = false;
			};

			// current value
			input.bind("value", () => {
				return input.native.value;
			}, value => {
				if (!locked) {
					input.native.value = value;
				}
			});

			// min value
			input.bind("min", () => {
				return input.native.min;
			}, value => {
				input.native.min = value;
			});

			// max value
			input.bind("max", () => {
				return input.native.max;
			}, value => {
				input.native.max = value;
			});

			// steps
			input.bind("steps", () => {
				return input.native.steps;
			}, value => {
				input.native.steps = value;
			});
			
			// disabled
			input.bind("disabled", () => {
				return input.native.disabled;
			}, value => {
				input.native.disabled = value;
			});

			// defaults
			input.max = max || 100;
			input.min = min || 0;
			input.value = value;
			input.steps = steps || 1;

			input.onchange = new Event("Slider value change");

			let old = value;
			input.native.onchange = () => {
				input.onchange(input.native.value, old);
				old = input.native.value;
			};

			return input;
		},
		
		// icon with size (stacks shared & linked objects automatically)
		Icon(path, size) {
			const i = element("ui-icon");
			
			i.native.style.height = i.native.style.width = size + "px";
						
			i.add(public.Image(fs.icon(path, size)));
			
			if (fs.isLink(path)) {
				i.add(public.Image(fs.icon(config.fs.icons.lnk, size)));
			}
			
			return i;
		},

		// data grid as in not done yet 
		DataGrid(cols, rows) {
			const grid = element("ui-data-grid");

			const header = element("ui-data-grid-header");
			grid.add(header);

			for (let col of cols) {
				const cell = element("ui-data-grid-cell");
				cell.native.textContent = col.name;
				header.add(cell);
			}

			const body = element("ui-data-grid-body");
			grid.add(body);

			for (let row of rows) {
				const r = element("ui-data-grid-row");
				body.add(r);

				for (let col of row.values) {
					const c = element("ui-data-grid-cell");
					c.native.textContent = col;
					r.add(c);
				}
			}

			return grid;
		},
		
		// video from wmplib-video
		Video(video) {
			const v = element("ui-video");
			
			v.native.appendChild(video.player);
			
			return v;
		},

		// simple text label
		Label(text) {
			const label = element("ui-label");

			label.bind("text", () => {
				return label.native.textContent;
			}, value => {
				label.native.textContent = value;
			});

			text != undefined && (label.text = text);

			return label;
		},

		// simple title label
		Title(text, level) {
			const label = element("ui-title");

			label.bind("text", () => {
				return label.native.textContent;
			}, value => {
				label.native.textContent = value;
			});

			label.bind("level", () => {
				return +label.native.getAttribute("level");
			}, value => {
				label.native.setAttribute("level", value);
			});

			text != undefined && (label.text = text);
			label.level = level || 0;

			return label;
		},

		// fixed text (like <pre>)
		FixedText(text) {
			const label = element("ui-pre");

			label.bind("text", () => {
				return label.native.textContent;
			}, value => {
				label.native.textContent = value;
			});

			text != undefined && (label.text = text);

			return label;
		},

		// rect
		Rect(width, height) {
			const rect = element("ui-rect");

			rect.bind("width", () => {
				return rect.native.style.width;
			}, value => {
				rect.native.style.width = value;
			});

			rect.bind("height", () => {
				return rect.native.style.height;
			}, value => {
				rect.native.style.height = value;
			});

			width != undefined && (rect.width = width);
			height != undefined && (rect.height = height);

			return rect;
		},

		// console (like globalConsole / cmd)
		Console() {
			const box = element("ui-console");

			box.console = new Console(box.native);

			return box;
		},

		// simple button
		Button(text, click, key) {
			const button = element("ui-button");

			button.bind("text", () => {
				return button.native.textContent;
			}, value => {
				button.native.textContent = value;
			});

			button.bind("click", () => {
				return button.native.onclick;
			}, value => {
				button.native.onclick = value;
			});

			// key bindings
			button.bind("key", () => {}, value => {
				window.bindKey(value, () => {
					button.click();
				});

				Tooltip.register(button, transformShortcut(value));
			});

			text != undefined && (button.text = text);
			click && (button.click = click);
			key && (button.key = key);

			button.native.tabIndex = UI.tabIndex = (UI.tabIndex || 1) + 1;

			return button;
		},

		// web browser frame 
		WebControl(url) {
			const frame = element("ui-iframe");

			const browser = new Browser(frame, url || config.ie.startURL, window);

			// bind keys
			window.bindKey("f5", () => {
				frame.reload();
			});

			window.bindKey("ctrl+r", () => {
				frame.reload();
			});

			return frame;
		},

		// menu / submenu
		Menu(items) {
			const menu = element("ui-menu");

			// adds all key handlers to window
			// recursive because menus are only expanded / loaded when opened
			const addKeyHandlers = items => {
				for (let item of items) {
					if (item.key) {
						window.bindKey(item.key, () => {
							if (!item.disabled) {
								item.click();
							}
						});
					}

					if (item.items) {
						addKeyHandlers(item.items);
					}
				}
			}

			addKeyHandlers(items);

			// render menu items
			let i = 0;
			for (let item of items) {
				const e = element("ui-menu-item");

				if (item.render) {
					// custom render
					item.render(e);
				} else if (item.input) {
					// add input item
					e.add(item.input);
					e.native.setAttribute("input", "");
				} else {
					// default item style
					e.native.textContent = item.text;

					// add icon
					if (item.icon) {
						const img = document.createElement("img");
						e.native.appendChild(img);
						e.native.setAttribute("icon", "");
						img.src = config.fs.root + item.icon;

						if (!item.text) {
							e.native.setAttribute("empty", "");
						}
					}

					e.native.onclick = () => {
						if (item.click) {
							item.click();
						} else if (item.items) {
							// show context menu when when expanded
							const box = e.native.getBoundingClientRect();
							public.ContextMenu(item.items, box.left, box.bottom);
						}
					}
				}

				// set custom width
				if (item.width) {
					e.native.style.width = item.width;
				}

				// add enable / disable functions
				menu[i] = {
					disable() {
						e.native.disabled = item.disabled = true;
					},
					enable() {
						e.native.disabled = item.disabled = false;
					}
				}
				
				if (item.disabled) {
					e.native.disabled = true;
				}

				i++;
				menu.add(e);
			}

			return menu;
		},

		// info bar (bottom bar in IE)
		InfoBar(items) {
			const bar = element("ui-info-bar");

			for (let i = 0; i < items.length; i++) {
				const e = element("ui-info-bar-item");

				e.bind("text", () => {
					return e.native.textContent;
				}, value => {
					e.native.textContent = value;
				});

				items[i].text && (e.text = items[i].text);

				if (items[i].width) {
					e.native.style.width = items[i].width;
				}

				bar[i] = e;
				bar.add(e);
			}

			return bar;
		},

		// Toolbar box
		ToolbarBox() {
			return element("ui-toolbar-box");
		},

		// Simple container
		Container() {
			return element("ui-container");
		},

		// Scroll container
		Scroll() {
			const e = element("ui-scroll");

			e.scrollToTop = () => {
				e.native.firstChild.scrollTop = 0;
			};

			e.scrollToBottom = () => {
				e.native.firstChild.scrollTop = e.native.firstChild.scrollHeight;
			}

			return e;
		},

		// Split view
		SplitView() {
			const e = element("ui-split");

			e.navigation = element("ui-split-nav");
			e.content = element("ui-split-content");

			e.add(e.navigation);
			e.add(e.content);

			return e;
		},

		// Menu View
		MenuView() {
			const e = element("ui-menu-view");

			e.menus = element("ui-toolbar-box");
			e.content = element("ui-menu-view-content");

			e.add(e.menus);
			e.add(e.content);

			return e;
		},

		// image 
		Image(url) {
			const img = element("img");

			img.bind("source", () => {
				return img.native.src;
			}, value => {
				if (fs.exists(url)) {
					img.native.src = config.fs.root + url;
				} else {
					img.native.src = value;
				}
			});

			url && (img.source = url);

			return img;
		},

		// textbox (like <input>)
		TextBox(initial) {
			const textbox = element("ui-textbox");
			const input = element("input");

			textbox.bind("value", () => {
				return input.native.value;
			}, value => {
				input.native.value = value;
			});

			initial && (textbox.value = initial);
			input.event("onchange", "Textbox value change", e => e.target.value);
			
			textbox.add(input);

			return textbox;
		},

		// textarea (like in HTML)
		TextArea(initial) {
			const input = element("textarea");

			input.bind("value", () => {
				return input.native.value;
			}, value => {
				input.native.value = value;
			});

			initial && (input.value = initial);

			input.event("onchange", "Textarea value change", e => e.target.value);

			return input;
		},

		// windows 2000 style tilted pie chart
		Chart(opts) {
			const container = element("ui-chart");
			
			const legend = element("ui-chart-legend");
			container.add(legend);
			
			const canvas = public.Canvas();
			container.add(canvas);
			
			opts.valueTransform = opts.valueTransform || (value => value);
			
			const render = () => {
				const total = opts.segments.map(s => s.value).reduce((a, c) => a + c, 0);
				
				const centerX = canvas.width / 2;
				const centerY = 1 + canvas.width * config.ui.chart.scale / 2;

				legend.clear();
				
				let last;
				let segmentIndex = 0;
				for (let segment of opts.segments) {
					segment.start = last || 0;
					last = segment.end = (last || 0) + (Math.PI * 2) / total * segment.value;
					
					segment.color = segment.color || config.ui.chart.colorTemplate.replace("%v", segmentIndex * config.ui.chart.colorDelta + config.ui.chart.colorStart);
					
					const item = element("ui-chart-legend-item");
					item.native.setAttribute("style", "--color: " + segment.color);
					item.native.textContent = config.ui.chart.template.replace("%t", segment.text).replace("%v", opts.valueTransform(segment.value));
					legend.add(item);

					segment.startX = -Math.sin(segment.start + Math.PI) * canvas.width / 2 + centerX;
					segment.startY = Math.cos(segment.start + Math.PI) * canvas.width * config.ui.chart.scale / 2 + centerY;
					segment.endX = -Math.sin(segment.end + Math.PI) * canvas.width / 2 + centerX;
					segment.endY = Math.cos(segment.end + Math.PI) * canvas.width * config.ui.chart.scale / 2 + centerY;
					
					segmentIndex++;
				}

				canvas.context.fillStyle = config.ui.chart.fillDark;
				canvas.context.ellipse(centerX, centerY + config.ui.chart.height, canvas.width / 2, canvas.width * config.ui.chart.scale / 2, 0, 0, 2 * Math.PI);
				canvas.context.rect(0, centerY + 1, canvas.width, config.ui.chart.height - 2);
				canvas.context.fill();
				canvas.context.stroke();
				
				canvas.context.beginPath();
				canvas.context.ellipse(centerX, centerY, canvas.width / 2 - 1, canvas.width * config.ui.chart.scale / 2 - 1, 0, 0, 2 * Math.PI);
				canvas.context.ellipse(centerX, centerY + config.ui.chart.height, canvas.width / 2 - 1, canvas.width * config.ui.chart.scale / 2 - 1, 0, 0, 2 * Math.PI);
				canvas.context.rect(1, centerY, canvas.width - 2, config.ui.chart.height);
				canvas.context.fill();
				
				const steps = Math.PI / canvas.width;
				
				for (let segment of opts.segments) {
					canvas.context.beginPath();
					canvas.context.fillStyle = segment.color;
					canvas.context.moveTo(segment.startX, segment.startY);
					
					for (let i = segment.start; i < segment.end; i += steps) {
						const startX = -Math.sin(i + Math.PI) * canvas.width / 2 + centerX;
						const startY = Math.cos(i + Math.PI) * canvas.width * config.ui.chart.scale / 2 + centerY;
						
						canvas.context.lineTo(startX, startY);
					}
					
					for (let i = segment.end; i > segment.start; i -= steps) {
						const startX = -Math.sin(i + Math.PI) * canvas.width / 2 + centerX;
						const startY = Math.cos(i + Math.PI) * canvas.width * config.ui.chart.scale / 2 + centerY;
						
						canvas.context.lineTo(startX, startY + config.ui.chart.height - 1);
					}
					
					canvas.context.fill();
					
					canvas.context.beginPath();
					canvas.context.moveTo(segment.startX, segment.startY);
					canvas.context.lineTo(segment.startX, segment.startY + config.ui.chart.height);
					canvas.context.stroke();
				}
				
				for (let segment of opts.segments.sort((a, b) => a.value == b.value ? 0 : a.value < b.value ? 1 : -1)) {
					canvas.context.beginPath();
					canvas.context.fillStyle = segment.color;
					canvas.context.ellipse(centerX, centerY, canvas.width / 2, canvas.width * config.ui.chart.scale / 2, 0, segment.start - Math.PI / 2, segment.end - Math.PI / 2);
					canvas.context.moveTo(segment.startX, segment.startY);
					canvas.context.lineTo(centerX, centerY);
					canvas.context.lineTo(segment.endX, segment.endY);
					canvas.context.fill();
					canvas.context.stroke();
				}
				
				canvas.context.beginPath();
				canvas.context.moveTo(0, centerY);
				canvas.context.lineTo(0, centerY + config.ui.chart.height + 1);
				canvas.context.moveTo(canvas.width, centerY);
				canvas.context.lineTo(canvas.width, centerY + config.ui.chart.height + 1);
				canvas.context.stroke();
			};
			
			container.onadded.subscribe(parent => {
				canvas.width = container.native.getBoundingClientRect().width;
				canvas.height = canvas.width * config.ui.chart.scale + config.ui.chart.height + 2;
				
				render();
			});
			
			return container;
		},
		
		// tabs
		Tabs(headerTexts, initialIndex = 0) {
			const tabs = element("ui-tabs");
			
			headerTexts = headerTexts.filter((c, i, a) => a.indexOf(c) == i);
			
			const headers = element("ui-tab-headers");
			tabs.add(headers);
			
			const contents = element("ui-tab-contents");
			tabs.add(contents);
			
			let activeIndex = -1;
			
			const open = index => {
				if (activeIndex != -1) {
					headers.native.children[activeIndex].removeAttribute("active");
					contents.native.children[activeIndex].removeAttribute("active");
				}
				
				activeIndex = index;
				
				headers.native.children[activeIndex].setAttribute("active", "");
				contents.native.children[activeIndex].setAttribute("active", "");
			};
			
			for (let item of headerTexts) {
				const header = element("ui-tab-header");
				header.native.textContent = item;
				
				header.native.onclick = () => {
					open(headerTexts.indexOf(item));
				};
				
				headers.add(header);
				contents.add(tabs[headerTexts.indexOf(item)] = element("ui-tab-content"));
			}
			
			tabs.bind("activeIndex", () => {
				return activeIndex;
			}, value => {
				open(value);
			});
			
			open(initialIndex);
			
			return tabs;
		},
		
		// line
		Separator() {
			return element("ui-separator");
		},

		// clear all
		clear() {
			root.native.textContent = "";
		},

		// create child window
		createChildWindow(...args) {
			return window.createChildWindow(...args);
		},

		// create button window (windows like alert, ...)
		createButtonWindow(title, message, ...buttons) {
			const win = public.createChildWindow(title, config.ui.buttonWindow.width, config.ui.buttonWindow.height);

			win.buttonStyle = Window.ButtonStyle.none;

			win.render(ui => {
				const grid = ui.Grid(["100%"], ["100%", config.ui.buttonWindow.height + "px"]);
				ui.root.add(grid);

				grid[0][0].add(ui.Label(message));

				const cent = ui.Center();
				grid[1][0].add(cent);

				for (let btn of buttons) {
					btn.margin = 10;
					cent.add(btn);
				}
			});

			return win;
		},

		// create context menu
		ContextMenu(items, x, y, parent) {
			UI.ContextMenu(items, x, y, parent, window.z);
		},

		// treeView (object explorer in dllexp.exe)
		TreeView(items, parent) {
			const e = element("ui-tree");

			// keep track of selectedItem in root
			const state = parent ? parent.state : {
				selectedItem: null
			};

			e.state = state;

			for (let item of items) {
				const l = element("ui-tree-leaf");
				item.element = l;

				const t = element("ui-tree-text");
				t.native.textContent = item.title;
				t.font = item.font;
				l.add(t);

				// select item
				const select = () => {
					// deselect currently selected item
					if (state.selectedItem) {
						state.selectedItem.element.native.removeAttribute("active");
						state.selectedItem.deselect && state.selectedItem.deselect();
					}

					state.selectedItem = item;
					item.select && item.select();
					l.native.setAttribute("active", "");
				};

				// add subitems if any are present
				if (item.items && item.items.length) {
					const child = public.TreeView(item.items, e);
					l.add(child);

					let timeout = setTimeout(() => {});

					l.native.onclick = ev => {
						// add nutorious windows tree view delay used to differenciate between click / double click
						// please remove this in actual windows
						timeout = setTimeout(() => {
							child.toggle();
						}, config.mouse.doubleClick);

						ev.stopPropagation();
					};

					l.native.ondblclick = ev => {
						select();
						clearTimeout(timeout);

						ev.stopPropagation();
					};

					// add expander icon
					l.add(element("ui-tree-indicator"));
				} else {
					// activate click if no subitems are present
					l.native.onclick = ev => {
						select();

						ev.stopPropagation();
					};
				}

				e.add(l);
			}

			if (!parent) {
				e.native.setAttribute("root", "");
			}

			e.open = () => {
				e.native.setAttribute("open", "");
			};

			e.close = () => {
				e.native.removeAttribute("open", "");
			};

			e.bind("opened", () => {
				return e.native.hasAttribute("open");
			});

			e.toggle = () => {
				if (e.opened) {
					e.close();
				} else {
					e.open();
				}
			};

			e.add(element("ui-tree-last"));

			return e;
		},

		// message box (alert, ...)
		MessageBox(icon, title, message, text) {
			return new Promise(done => {
				const win = public.createButtonWindow(title, message, public.Button(text, () => {
					win.close();

					done();
				}));

				win.buttonStyle = Window.ButtonStyle.none;
				win.moveable = false;
			});
		},

		// error box 
		ErrorBox(message, text) {
			return public.MessageBox(config.ui.messageBox.error.icon, config.ui.messageBox.error.title, message, text || config.ui.messageBox.ok);
		},

		// info box
		InfoBox(message, text) {
			return public.MessageBox(config.ui.messageBox.info.icon, config.ui.messageBox.info.title, message, text || config.ui.messageBox.ok);
		},

		// alert [deprecated]
		Alert(...args) {
			throw Error("Alert is deprecated, use Info/Error Box instead")
		},

		// list view 
		List(items = [], style) {
			const c = element("ui-list-container");
			const e = element("ui-list");
			let selected;
			
			c.native.setAttribute("style", "default");
			
			for (let key in UI.ListStyle) {
				if (UI.ListStyle[key] == style) {
					c.native.setAttribute("style", nameTransform(key));
				}
			}

			c.add(e);

			// rerender list
			const render = () => {
				e.clear();

				for (let item of items) {
					const l = element("ui-list-item");
					const t = element("ui-list-item-text");

					// add item
					l.contextMenu = item.contextMenu;
					t.native.textContent = item.text;

					// add icon
					if (item.icon) {
						l.add(public.Image(config.fs.root + item.icon));
					}

					l.add(t);

					// Scott & Ramona
					l.native.onclick = () => {
						if (selected == item) {
							item.select && item.select(item);
						} else {
							for (let i of e.native.children) {
								i.removeAttribute("selected");
							}

							if (selected) {
								selected.deactivate && selected.deactivate(selected, item);
							}

							selected = item;
							item.activate && item.activate(item);
							render();
						}
					};

					if (selected == item) {
						l.native.setAttribute("selected", "");
					}

					e.add(l);
				}
			};

			c.bind("items", () => items, value => {
				items = value;

				render();
			});

			c.bind("selectedItem", () => selected, value => {
				selected = value;

				render();
			});

			render();

			return c;
		},

		// save as file dialog (like in notepad.exe > file > save as)
		SaveAsDialog(opts) {
			return new Promise(done => {
				const win = window.createChildWindow(opts.title ||  config.ui.openFileDialog.title, config.ui.openFileDialog.width, config.ui.openFileDialog.height);
				win.buttonStyle = Window.ButtonStyle.none;
				let path = opts.path ||  config.user.path;

				// rerender list in current path
				const render = () => {
					const files = fs.list(path).filter(p => fs.isDirectory(p));
					files.push(...fs.list(path).filter(p => !fs.isDirectory(p) && opts.extensions ? opts.extensions.includes(fs.ext(fs)) : 1))

					win.render(ui => {
						const grid = ui.Grid([
							"100%"
						], [
							"*",
							"auto",
							"auto"
						]);
						ui.root.add(grid);

						const input = ui.TextBox(opts.default);
						grid[1][0].add(input);

						const list = ui.List([{
							text: "..",
							value: fs.parentPath(path),
							select() {
								path = fs.parentPath(path);
								render();
							}
						}, ...files.map(f => ({
							value: f,
							icon: fs.icon(f, 16),
							text: fs.prettyName(f),
							activate() {
								if (fs.isDirectory(f)) {
									path = f;
									render();
								} else {
									input.value = fs.name(f);
								}
							}
						}))]);

						grid[0][0].add(list);

						const button = ui.Button(opts.done ||  config.ui.openFileDialog.done, () => {
							if (input.value) {
								win.close();
								done(fs.fix(path + "/" + input.value));
							}
						});

						grid[2][0].add(button);
					});
				};

				render();
			});
		},

		// file tree (as in devenv.exe)
		FileTree(path, opts) {
			let tree;

			const search = path => {
				const items = [];

				for (let f of fs.list(path)) {
					if (fs.isDirectory(f)) {
						if (opts.showFiles || fs.list(f).filter(p => fs.isDirectory(p)).length) {
							items.push({
								title: fs.prettyName(f),
								icon: fs.icon(f, 16),
								items: search(f),
								select() {
									tree.onselect(f);
								}
							});
						} else {
							items.push({
								title: fs.prettyName(f),
								icon: fs.icon(f, 16),
								select() {
									tree.onselect(f);
								}
							});
						}
					} else if (opts.showFiles) {
						items.push({
							title: fs.prettyName(f),
							icon: fs.icon(f, 16),
							select() {
								tree.onselect(f);
							}
						});
					}
				}

				return items;
			};

			tree = public.TreeView(search(path));
			tree.onselect = new Event("File Tree item select");

			return tree;
		},

		// open file dialog (as in notepad.exe)
		OpenFileDialog(opts) {
			return new Promise(done => {
				const win = window.createChildWindow(opts.title ||  config.ui.openFileDialog.title, config.ui.openFileDialog.width, config.ui.openFileDialog.height);
				win.buttonStyle = Window.ButtonStyle.none;
				let path = opts.path ||  config.user.path;

				// rerender list in current path
				const render = () => {
					const files = fs.list(path).filter(p => fs.isDirectory(p));
					let potentialResult;

					if (opts.allowDirectory) {
						potentialResult = path;
					}

					if (opts.allowFile) {
						files.push(...fs.list(path).filter(p => !fs.isDirectory(p)));
					}

					win.render(ui => {
						const grid = ui.Grid([
							"100%"
						], [
							"*",
							"auto"
						]);
						ui.root.add(grid);

						const list = ui.List([{
							text: "..",
							value: fs.parentPath(path),
							select() {
								path = fs.parentPath(path);
								render();
							}
						}, ...files.map(f => ({
							value: f,
							icon: fs.icon(f, 16),
							text: fs.prettyName(f),
							activate() {
								if (
									(fs.isDirectory(f) && opts.allowDirectory) ||
									(fs.isFile(f) && opts.allowFile)
								) {
									potentialResult = f;
								}
							},
							select() {
								if (fs.isDirectory(f)) {
									path = f;
									render();
								} else {
									win.close();
									done(f);
								}
							}
						}))]);

						grid[0][0].add(list);

						const button = ui.Button(opts.done ||  config.ui.openFileDialog.done, () => {
							// decide wether the selected item is suitable
							if (list.selectedItem) {
								if (
									(fs.isDirectory(list.selectedItem.value) && opts.allowDirectory) ||
									(fs.isFile(list.selectedItem.value) && opts.allowFile)
								) {
									console.log(list.selectedItem, list.selectedItem.value, fs.isFile(list.selectedItem.value), opts.allowFile);
									win.close();
									done(list.selectedItem.value);
								} else if (fs.isDirectory(list.selectedItem.value)) {
									path = list.selectedItem.value;
									render();
								}
							} else if (potentialResult) {
								win.close();
								done(potentialResult);
							}
						});

						grid[1][0].add(button);
					});
				};

				render();
			});
		},
		root
	};

	return public;
}

// context menu
UI.ContextMenu = (items, x, y, parent, z) => {
	const root = document.createElement("ui-context-menu");
	root.style.top = y;
	root.style.left = x;
	root.style.zIndex = z + 99;
	workspace.appendChild(root);

	let currentSubMenu;
	let currentlyCheckedItem;

	// add clickout overlay
	const overlay = document.createElement("ui-context-menu-overlay");
	overlay.style.zIndex = z + 98;
	overlay.onclick = () => {
		root.remove();
		overlay.remove();
	};
	workspace.appendChild(overlay);

	// public
	const menu = {
		dismiss(fromParent) {
			root.remove();
			overlay.remove();

			if (parent && !fromParent) {
				parent.dismiss();
			}

			if (currentSubMenu) {
				currentSubMenu.dismiss(true);
			}
		}
	};

	// add all items to the menu
	for (let item of items) {
		if (item.text || item.icon) {
			const e = root.appendChild(document.createElement("ui-context-item"));
			
			item.element = e;

			e.onclick = () => {
				if (item.check) {
					if (currentlyCheckedItem) {
						currentlyCheckedItem.uncheck && currentlyCheckedItem.uncheck();
						currentlyCheckedItem.element.removeAttribute("checked");
						currentlyCheckedItem.checked = false;
					}
					
					currentlyCheckedItem = item;
					item.check();
					item.checked = true;
					e.setAttribute("checked", "");
				}
				
				if (item.click) {
					item.click();
					menu.dismiss();
				}
			};
			
			if (item.checked) {
				e.setAttribute("checked", "");
				currentlyCheckedItem = item;
			}
			
			e.onmouseover = () => {
				if (currentSubMenu) {
					currentSubMenu.dismiss(true);
				}

				if (item.items) {
					const box = e.getBoundingClientRect();
					currentSubMenu = UI.ContextMenu(item.items, box.right, box.top, menu, z);
				}
			};

			e.textContent = item.text;
			root.appendChild(e);

			item.disabled && e.setAttribute("disabled", "");
			item.key && (e.appendChild(document.createElement("ui-context-item-shortcut")).textContent = transformShortcut(item.key));

			if (item.icon) {
				const img = document.createElement("img");
				e.appendChild(img);
				e.setAttribute("icon", "");
				img.src = config.fs.root + item.icon;
			}
			
			if (item.items) {
				e.appendChild(document.createElement("ui-context-more"));
			}
		} else {
			root.appendChild(document.createElement("ui-context-line"));
		}
	}

	return menu;
};

// error box (not the same as buttonWindow)
UI.ErrorBox = (title, text) => {
	const win = new Window(title, config.ui.buttonWindow.width, config.ui.buttonWindow.height);
	win.render(ui => {

	});
};

// context menu handling for touch
let activeContextMenu;
document.body.ontouchstart = event => {
	touchStart = setTimeout(() => {
		if (!Window.moving) {
			document.body.oncontextmenu(event);
		}
	}, config.mouse.contextMenu);
};

// clear timeout
document.body.ontouchend = event => {
	clearTimeout(touchStart);
};

// show context menu
document.body.oncontextmenu = event => {
	// use <bar> in taskbar as actual context
	if (event.target.tagName != "BAR") {
		event.preventDefault();

		if (activeContextMenu) {
			activeContextMenu.dismiss();

			activeContextMenu = null;
		} else {
			const x = event.touches ? event.touches[0].clientX : event.clientX;
			const y = event.touches ? event.touches[0].clientY : event.clientY;

			let element = document.elementFromPoint(x, y);

			while (element) {
				if (element.contextMenu) {
					if (element.contextMenu === true) {
						return;
					} else {
						activeContextMenu = UI.ContextMenu(element.contextMenu, x, y, null, Window.activeWindow ? Window.activeWindow.z + 100 : 100);

						return;
					}
				}

				element = element.parentElement;
			}
		}
	}
};

// fonts supported by [font] in css
UI.fonts = {
	default: "default",
	lowResolution: "lres",
	monospace: "monospace"
};

// list styles
UI.ListStyle = {
	default: {},
	bigIcons: {}
};

// set css variables
for (let prop in config.css) {
	document.body.style.setProperty("--" + nameTransform(prop), config.css[prop]);
}

DLL.export("UI", UI);