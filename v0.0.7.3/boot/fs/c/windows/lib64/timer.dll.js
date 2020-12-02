/// timers
/// C 2019 levvij

function Timer(fx, time) {
	// create interval
	let handle = setInterval(fx, time);
	
	const public = {
		id: Cypp.createId(),
		running: true,
		stop() {
			clearInterval(handle);
			public.running = false;
		},
		restart(t = time) {
			if (public.running) {
				public.stop();
			}
			
			public.running = true;
			
			handle = setInterval(fx, t);
			time = t;
		},
		set time(value) {
			public.restart(value);
		},
		get time() {
			return time;
		}
	};
	
	return public;
}

DLL.export("Timer", Timer);