UI.extend("TextBox", (env, initial) => {
	const textbox = env.element("ui-textbox");
	const input = env.element("input");

	textbox.bind("value", () => {
		return input.native.value;
	}, value => {
		input.native.value = value;
	});

	initial && (textbox.value = initial);
	input.event("onchange", "Textbox value change", e => e.target.value);

	textbox.add(input);

	return textbox;
});