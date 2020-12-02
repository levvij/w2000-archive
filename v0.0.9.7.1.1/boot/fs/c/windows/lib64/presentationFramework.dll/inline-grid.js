UI.extend("InlineGrid", (env, cols, rows) => {
	const g = public.Grid(cols, rows);
	g.native.setAttribute("inline", "");
	return g;
});