UI.extend("List", (env, items = [], style = UI.ListStyle.default, selectedIndex = -1) => {
	const c = env.element("ui-list-container");
	const e = env.element("ui-list");
	let selected = items[selectedIndex];
	
	c.native.setAttribute("style", "default");

	for (let key in UI.ListStyle) {
		if (UI.ListStyle[key] == style) {
			c.native.setAttribute("style", env.nameTransform(key));
		}
	}

	c.add(e);

	// rerender list
	const render = () => {
		e.clear();

		for (let i of items) {
			if (!i.id) {
				i.id = Cypp.createId();
			}
		}

		for (let item of items) {
			const l = env.element("ui-list-item");
			const t = env.element("ui-list-item-text");
			const tt = env.element("ui-list-item-text-inner");

			// add item
			l.contextMenu = item.contextMenu;

			t.add(tt);
			tt.native.textContent = item.text;

			// add icon
			if (item.iconPath) {
				l.add(env.Icon(item.iconPath, style.size));
			} else if (item.icon) {
				l.add(env.Image(item.icon));
			}

			// disable item
			if (item.disabled) {
				l.native.setAttribute("disabled", "");
			}

			// draggable
			if (item.draggable) {
				l.makeDraggable(item.draggable.ondrag, item.draggable.ondrop);
			}

			if (item.dropContainer) {
				l.makeDropContainer(item.dropContainer.ondrop);
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

					const old = selected;

					selected = item;
					item.activate && item.activate(item, old);
					render();
				}
			};

			if (selected == item || (selected && selected.id == item.id)) {
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
});