/// Remote Read Only storage provider
/// C 2019 levvij

const log = globalConsole.createUnit("fs/rrsp");

function RRSP(config, fs) {
	let ray;
	let links;
	let cache;
	let blobCache;
	
	const public = {
		name: config.name,
		free: 0,
		async reload() {
			log.action("reload");
			
			// get server ray
			const lray = await (await fetch(config.ray)).json();
			links = {};
			cache = {};
			blobCache = {};
			ray = {};

			// last item of ray is the total size of the remote files
			public.used = public.capacity = lray.reduce((a, c) => a + c.size, 0);
			
			for (let item of lray) {
				ray[item.name] = item;
			}

			// init localStorage delete list
			if (!localStorage[config.deleteList]) {
				localStorage[config.deleteList] = "[]";
			}

			// remove locally deleted files
			for (let path of JSON.parse(localStorage[config.deleteList])) {
				delete ray[path];
			}
		},
		disks: [
			config.disk
		],
		diskInfo(disk) {
			if (disk == config.disk) {
				return {
					name: config.name,
					used: public.used,
					capacity: public.capacity,
					free: 0
				};
			}
			
			return {
				name: config.name,
				used: 0,
				capacity: 0,
				free: 0
			};
		},
		exists(path) {
			return path in ray;
		},
		canRead(path) {
			return path in ray;
		},
		async read(path) {
			if (cache[path]) {
				log.action("read", "cache", path);
				
				return cache[path];
			}
			
			log.action("read", "fetch", path);
			
			return cache[path] = await fetch(config.root + ray[path].source + "?v=" + +(new Date())).then(r => r.text());
		},
		async readBlob(path) {
			if (blobCache[path]) {
				log.action("readblob", "cache", path);
				
				return blobCache[path];
			}
			
			log.action("readblob", "fetch", path);
			
			return blobCache[path] = await fetch(config.root + ray[path].source + "?v=" + +(new Date())).then(r => r.blob());
		},
		readURI(path) {
			log.action("readuri", path);
			
			return config.root + ray[path].source;
		},
		isDirectory(path) {
			return ray[path].type == "d";
		},
		isFile(path) {
			return ray[path].type == "f";
		},
		isLink(path) {
			return ray[path].link;
		},
		canResolve(path) {
			return path in ray && !!ray[path].link;
		},
		resolve(path) {
			const l = ray[path].link;
			
			return {
				path: l.path,
				title: l.title,
				icon: l.icon
			}
		},
		list(path) {
			const items = [];
			const layer = path.split("/").length + 1;
			
			for (let key in ray) {
				if (key.startsWith(path + "/") && key != path && key.split("/").length == layer) {
					items.push(key);
				}
			}
			
			return items;
		},
		listAll(path) {
			const items = [];
			
			for (let key in ray) {
				if (key.startsWith(path + "/") && key != path) {
					items.push(key);
				}
			}
			
			return items;
		},
		canLink(path, to) {
			return false;
		},
		canCreate(path) {
			return false;
		},
		canWrite(path) {
			return false;
		},
		canDelete(path) {
			return path in ray;
		},
		async delete(path) {
			if (fs.isDirectory(path)) {
				for (let file of fs.list(path)) {
					await fs.delete(file);
				}
			}
			
			localStorage[config.deleteList] = JSON.stringify([...JSON.parse(localStorage[config.deleteList]), path]);
			
			delete ray[path];
		},
		mime(path) {
			return ray[path].mime;
		}
	}
	
	return public;
}

NTFS.RRSP = RRSP;