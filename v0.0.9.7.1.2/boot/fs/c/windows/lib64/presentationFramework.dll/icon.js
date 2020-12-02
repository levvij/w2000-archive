UI.extend("Icon", (env, path, size) => {
	const i = env.element("ui-icon");

	i.native.style.height = i.native.style.width = size + "px";
	i.add(env.Image(fs.icon(path, size)));

	if (fs.exists(path) && fs.isLink(path)) {
		i.add(env.Image(fs.icon(".lnk", size)));
	}

	return i;
});