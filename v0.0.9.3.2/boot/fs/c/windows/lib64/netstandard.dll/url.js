function URL(url, base) {
	const parse = url => {
		const o = {
			protocol: url.includes("://") ? url.split("://")[0] + ":" : null,
			host: url.includes("://") ? url.split("/")[2].split(":")[0] : null,
			hostname: url.includes("://") ? url.split("/")[2].split(":")[0] : null,
			port: url.includes("://") ? url.split("/")[2].split(":")[1] : null,
			pathname: url.includes("://") ? "/" + url.split("/").slice(3).join("/").split("?")[0] : url.split("?")[0],
			search: url.split("?").slice(1).join("?") ? "?" + url.split("?").slice(1).join("?") : null
		}
		
		o.href = o.protocol + "//" + o.hostname + (o.pathname || "") + (o.search || "");
		
		return o;
	};
	
	if (base) {
		const u = parse(url);
		const b = parse(base);
		
		const o = {
			protocol: u.protocol || b.protocol,
			host: u.host || b.host,
			hostname: u.hostname || b.hostname,
			port: u.port || b.port,
			pathname: u.pathname || b.pathname,
			search: u.search || b.search
		}
		
		o.href = o.protocol + "//" + o.hostname + (o.pathname || "") + (o.search || "");
		
		return o;
	} else {
		return parse(url);
	}
}

Networking.URL = URL;