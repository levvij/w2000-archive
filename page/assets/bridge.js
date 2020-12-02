function Bridge(frame) {
	const queue = {};
	
	const rawRequest = (route, data) => new Promise(done => {
		const id = Math.random().toString(16).substr(2);
		
		frame.contentWindow.postMessage(JSON.stringify([
			"pmde-root",
			id,
			route,
			data
		]));
		
		queue[id] = res => {
			done(res);
		};
	});
	
	const send = async (route, data) => {
		const allowed = await rawRequest(".exists", route);
		
		if (allowed) {
			return await rawRequest(route, data);
		} else {
			throw new Error("Routes '" + route + "' does not exist on pmde target");
		}
	}
	
	addEventListener("message", event => {
		const data = JSON.parse(event.data);
					
		if (data[0] == "pmde-root") {
			if (queue[data[1]]) {
				queue[data[1]](data[2]);
				
				delete queue[data[1]];
			} else {
				console.warn("no item in queue for '" + data[1] + "'");
			}
		}
	});
	
	const public = {
		reconnect() {
			return new Promise(done => {
				const i = setInterval(() => {
					send(".connect").then(meta => {
						clearInterval(i);
						
						public.meta = meta;
						
						done();
					});
				}, 100);
			});
		},
		async getProcesses() {
			return await send("getProcesses");
		},
		async loadApplication(path, ...args) {
			await send("loadApplication", [path, ...args]);
		},
		restart() {
			const src = frame.src;
			
			frame.onload = () => {
				frame.onload = () => {
					public.reconnect();	
				};
				
				frame.src = src;
			};
			
			frame.src = "about:blank";
		}
	};
	
	frame.onload = () => {
		public.reconnect();
	};
	
	return public;
}