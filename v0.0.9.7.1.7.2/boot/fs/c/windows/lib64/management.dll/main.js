DLL.export("Management", {
	cpu: {
		get cores() {
			return navigator.hardwareConcurrency;
		}
	},
	host: {
		get os() {
			return ((navigator.userAgent || "").split("(")[1] || "").split(";")[0];
		},
		get platform() {
			return navigator.platform;
		},
		get vendor() {
			return navigator.vendor;
		}
	},
	connection: {
		get downlink() {
			return (navigator.connection || {}).downlink;
		},
		get type() {
			return (navigator.connection || {}).effectiveType;
		}
	},
	memory: {
		get deviceTotal() {
			return (navigator.deviceMemory || 0) * 1000 * 1000 * 1000;
		},
		get total() {
			return ((performance || {}).memory || {}).jsHeapSizeLimit;
		},
		get used() {
			return ((performance || {}).memory || {}).usedJSHeapSize;
		},
		get vmSize() {
			return ((performance || {}).memory || {}).totalJSHeapSize;
		},
		get vmPaddingSize() {
			return ((((performance || {}).memory || {}).totalJSHeapSize || 0) - (((performance || {}).memory || {}).usedJSHeapSize || 0)) || null;
		},
		get free() {
			return ((((performance || {}).memory || {}).jsHeapSizeLimit || 0) - (((performance || {}).memory || {}).totalJSHeapSize || 0)) || null;
		},
		getUsage() {
			const sectors = Process.active.map(process => ({
				name: process.name,
				usage: process.memoryUsage
			}));
			
			if (((performance || {}).memory || {}).usedJSHeapSize) {
				sectors.push({
					name: "screen",
					usage: screen.pixelDepth * screen.height * screen.width / 8
				});
				
				sectors.push({
					name: "browser vm",
					usage: ((performance || {}).memory || {}).usedJSHeapSize - sectors.reduce((a, c) => a + c.usage, 0)
				});
			}
			
			return sectors;
		}
	},
	os: {
		get version() {
			return config.version;
		},
		get buildDate() {
			return config.buildTime;
		},
		get beta() {
			return config.beta;
		}
	}
})