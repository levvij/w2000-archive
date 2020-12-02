function URL(url, base) {
	if (url && url.href) {
		url = url.href;
	}
	
	if (base && base.href) {
		base = base.href;
	}
	
	const p = new global.URL(url, base);
	const u = {
		protocol: /^[a-zA-Z]+:\/\//.test(url) ? url.split("//")[0] : (
			/^[a-zA-Z]+:\/\//.test(base) ? base.split("//")[0] : null
		),
		host: p.host,
		hostname: p.hostname,
		port: p.port,
		pathname: p.pathname,
		search: p.search,
	};
	
	u.href = u.protocol + "//" + u.hostname + (u.port ? ":" + u.port : "") + u.pathname + u.search;
	
	return u;
}

Networking.URL = URL;