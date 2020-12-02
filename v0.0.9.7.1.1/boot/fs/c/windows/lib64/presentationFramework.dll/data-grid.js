UI.extend("DataGrid", (env, cols, rows) => {
	const container = env.element("ui-data-grid-container");

	const innerContainer = env.element("ui-data-grid-container-inner");
	container.add(innerContainer);

	const grid = env.element("ui-data-grid");
	innerContainer.add(grid);

	const header = env.element("ui-data-grid-header");
	grid.add(header);

	for (let col of cols) {
		const cell = env.element("ui-data-grid-cell");

		const innerCell = env.element("ui-data-grid-cell-inner");
		innerCell.native.textContent = col.name || col.text || col || "";
		cell.add(innerCell);

		header.add(cell);
	}

	const body = env.element("ui-data-grid-body");
	grid.add(body);

	const render = () => {
		body.clear();

		let rowIndex = 0;
		for (let row of rows) {
			const r = env.element("ui-data-grid-row");
			r.contextMenu = row.contextMenu;
			body.add(r);

			container[rowIndex] = {};

			let colIndex = 0;
			for (let col of row.columns) {
				const c = env.element("ui-data-grid-cell");
				r.add(c);

				const renderColumn = col => {
					c.native.textContent = col.text === undefined ? col : col.text;
					c.contextMenu = col.contextMenu;

					col.align && (c.align = col.align);
					col.tooltip && Tooltip.register(c, col.tooltip);
				};

				Object.defineProperty(container[rowIndex], colIndex, {
					set(value) {
						renderColumn(value);
					}
				});

				renderColumn(col);

				colIndex++;
			}

			rowIndex++;
		};
	};

	container.bind("rows", () => rows, value => {
		rows = value;
		render();
	});

	render();

	return container;
});