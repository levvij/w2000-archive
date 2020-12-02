const properties = {};
const log = globalConsole.createUnit("csc");

// generate fonts
for (let family of config.fontgen.families) {
	const fname = "f_" + Math.random().toString(36).substr(2);
	
	for (let s of config.fontgen.sizes) {
		let fsname = fname + "_" + s;
		
		for (let weight of config.fontgen.weights) {
			const file = family.file.replace("%s", s).replace("%w", weight);
			
			log.action("font-load", family.name + "@" + s + "px/" + weight);

			const face = new FontFace(fsname, file, { 
				style: "normal", 
				weight
			});
			
			if (s == config.fontgen.forcedSize && family.forced) {
				await face.load();
			}
			
			if (!config.beta) {
				face.load();
			}
			
			document.fonts.add(face);

			properties["font" + (family.varName ? "-" + family.varName : "") + s + (weight == "normal" ? "" :weight)] = "font-size:" + s + "px;font-family:" + fsname + ";font-weight:" + weight;
		}
	}
}

// set css variables
for (let prop in config.css) {
	document.body.style.setProperty("--" + prop, config.css[prop]);
	properties[prop] = config.css[prop];
}

const style = document.createElement("style");

const render = content => {
	for (let prop in properties) {
		content = content.split("@" + prop + "()").join(properties[prop] + ";");
	}
	
	return content;
}

console.log(properties);

// add and render s.css
for (let file of (await fs.read(config.csc.list)).split("\n")) {
	if (file.trim()) {
		style.textContent += "/* " + file + " */\n\n" + render(await fs.read(config.csc.root + file.trim()));
	}
}

document.head.appendChild(style);