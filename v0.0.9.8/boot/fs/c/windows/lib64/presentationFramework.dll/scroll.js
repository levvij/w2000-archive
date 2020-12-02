UI.extend("Scroll", env => {
	const e = env.element("ui-scroll");

	e.scrollToTop = () => {
		e.native.firstChild.scrollTop = 0;
	};

	e.scrollToBottom = () => {
		e.native.firstChild.scrollTop = e.native.firstChild.scrollHeight;
	}

	return e;
});