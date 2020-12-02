/// file system
/// C 2019 levvij

// all files are on the server but users can create own files in localStorage
// when reading a file, we try to get it from localStorage first

// we scan all files in reload with ray.php to know what exists
// all link (.lnk) files are preresolved
const log = globalConsole.createUnit("fs");

async function NTFS() {
	const providers = [];
	
	const public = {
		// holds all providers
		// call reload() after adding a provider
		providers,
		// reloads whole file system
		async reload() {
			log.action("reload");
			
			for (let provider of providers) {
				await provider.reload();
			}
		},
		// gets free quota
		get free() {
			return public.capacity - public.used;
		},
		// gets capacity
		get capacity() {
			return providers.reduce((a, c) => a + c.capacity, 0);
		},
		// gets used space
		get used() {
			return providers.reduce((a, c) => a + c.used, 0);
		},
		// creates a new file
		async create(path, content = "", mime = "text/plain") {
			path = public.fix(path);
			content = content + "";

			log.action("create", path, content.length);
			
			if (public.exists(path)) {
				throw new Error("File '" + path + "' already exists");
			}
			
			if (!public.exists(public.parentPath(path))) {
				throw new Error("Parent directory of '" + path + "' does not exist");
			}

			for (let provider of providers) {
				if (provider.canCreate(path, content, mime)) {
					await provider.createFile(path, content, mime);
					
					return;
				}
			}
			
			throw new Error("Cannot create '" + path + "'. Access denied");
		},
		// creates a new file
		async createBlob(path, blob) {
			path = public.fix(path);

			log.action("createblob", path);
			
			if (public.exists(path)) {
				throw new Error("File '" + path + "' already exists");
			}
			
			if (!public.exists(public.parentPath(path))) {
				throw new Error("Parent directory of '" + path + "' does not exist");
			}

			for (let provider of providers) {
				if (provider.canCreate(path, blob)) {
					await provider.createBlobFile(path, blob);
					
					return;
				}
			}
			
			throw new Error("Cannot create '" + path + "'. Access denied");
		},
		// writes to existing file
		async write(path, content = "") {
			path = public.fix(path);
			content = content + "";
			
			log.action("write", path, content.length);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canWrite(path, content)) {
					await provider.write(path, content);

					return;
				}
			}

			throw new Error("Cannot write '" + path + "'. Access denied");
		},
		// writes blob to existing file 
		async writeBlob(path, blob) {
			path = public.fix(path);
			
			log.action("writeblob", path);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canWrite(path, blob)) {
					await provider.write(path, blob);

					return;
				}
			}

			throw new Error("Cannot write '" + path + "'. Access denied");
		},
		// creates directory
		async mkdir(path) {
			path = public.fix(path);
			
			log.action("mkdir", path);
			
			for (let provider of providers) {
				if (provider.canCreate(path)) {
					await provider.createDirectory(path);
					
					return;
				}
			}
			
			throw new Error("Cannot create '" + path + "'. Access denied");
		},
		// reads file
		async read(path) {
			path = public.fix(path);
			
			log.action("read", path);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canRead(path)) {
					return await provider.read(path);
				}
			}
			
			throw new Error("Cannot read '" + path + "'. Access denied");
		},
		// reads file as blob
		async readBlob(path) {
			path = public.fix(path);
			
			log.action("readblob", path);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canRead(path)) {
					return await provider.readBlob(path);
				}
			}
			
			throw new Error("Cannot read '" + path + "'. Access denied");
		},
		// reads file as blob
		async readURI(path) {
			path = public.fix(path);
			
			log.action("readuri", path);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canRead(path)) {
					return await provider.readURI(path);
				}
			}
			
			throw new Error("Cannot read '" + path + "'. Access denied");
		},
		// fixes paths (// => /)
		fix(path) {
			return ((path || "") + "").split("/").filter(c => c).join("/");
		},
		// lists all files inside directory (returns full paths)
		list(path) {
			path = public.fix(path);
			
			const items = [];
			
			for (let provider of providers) {
				items.push(...provider.list(path));
			}
			
			return items.filter((f, i) => items.indexOf(f) == i);
		},
		// same as list, but recursive
		listAll(path) {
			path = public.fix(path);
			
			const items = [];
			
			for (let provider of providers) {
				items.push(...provider.listAll(path));
			}
			
			return items.filter((f, i) => items.indexOf(f) == i);
		},
		// check if file/directory exists
		exists(path) {
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.exists(path)) {
					return true;
				}
			}
			
			return false;
		},
		// check if path is a directory
		isDirectory(path) {
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.exists(path)) {
					return provider.isDirectory(path);
				}
			}
				
			throw new Error("Path '" + path + "' does not exist");
		},
		// check if path is a directory
		isFile(path) {
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.exists(path)) {
					return provider.isFile(path);
				}
			}
			
			throw new Error("Path '" + path + "' does not exist");
		},
		// check if file is a link
		isLink(path) {
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.exists(path)) {
					return provider.isLink(path);
				}
			}
			
			throw new Error("Path '" + path + "' does not exist");
		},
		// check if path is a root disk
		isDisk(path) {
			return public.disks.includes(public.fix(path));
		},
		// gets all disks connected to the computer
		get disks() {
			const disks = [];
			
			for (let provider of providers) {
				disks.push(...provider.disks);
			}
			
			return disks.filter((d, i) => disks.indexOf(d) == i);
		},
		// get path of parent
		parentPath(path) {
			return public.fix(path).split("/").slice(0, -1).join("/");
		},
		// get extention (last)
		ext(path) {
			return public.fix(path).split("/").pop().split(".")[1] || "";
		},
		// get name (c/test.txt -> test.txt)
		name(path) {
			return public.fix(path).split("/").pop();
		},
		// get name without ext (c/test.txt -> test, c/a.b.c -> a.b)
		nameWithoutExt(path) {
			if (path.includes(".")) {
				return public.name(path).split(".").slice(0, -1).join(".");
			}

			return public.name(path);
		},
		// fix ext (test.PNG -> test.png)
		fixExt(path) {
			if (path.includes(".")) {
				return public.nameWithoutExt(path) + "." + public.ext(path).toLowerCase();
			}
			
			return path;
		},
		// get title (file name or link title)
		title(path) {
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.canResolve(path)) {
					const l = provider.resolve(path);
					
					if (l.title) {
						return l.title;
					}
				}
			}
			
			return path.split("/").pop();
		},
		// get properties of icon
		iconProperties(path) {
			const cs = public.fix(path).replace(config.fs.icons.base, "").split("/");
			
			return {
				library: cs[0],
				address: parseInt(cs[1].replace("0x", ""), 16),
				size: +cs[2],
				qualtiy: +(cs[3].split(".")[0])
			};
		},
		// gets icon path of path
		icon(path, ...sizes) {
			const scaled = img => {
				if (fs.exists(img)) {
					return img;
				}

				for (let q of config.fs.icons.qualities) {
					for (let s of [...sizes, -1, ...config.fs.icons.sizes]) {
						if (fs.exists(config.fs.icons.base + img + "/" + s + "/" + q + ".png")) {
							return config.fs.icons.base + img + "/" + s + "/" + q + ".png";
						}
					}
				}
			};
			
			// computer
			if (!path) {
				return scaled(config.fs.icons.computer);
			}

			// check if icon has <lib>/<addr> format
			if (fs.exists(config.fs.icons.base + path)) {
				return scaled(path);
			}

			// get exe icon from config icons
			if (public.fix(path) in config.fs.icon) {
				return scaled(config.fs.icon[public.fix(path)]);
			}

			// disks
			if (public.isDisk(path)) {
				return scaled(config.fs.icons.disk);
			}

			// directory icon
			if (public.exists(path) && public.isDirectory(path)) {
				return scaled(config.fs.icons.directory);
			}

			// get icon of referenced path
			if (public.ext(path) == "lnk") {
				for (let provider of providers) {
					if (provider.canResolve(path)) {
						const link = provider.resolve(path);
						
						if (link.icon) {
							return scaled(link.icon);
						}

						if (link.path.startsWith("http://") || link.path.startsWith("https://")) {
							return scaled(config.fs.icons.web);
						}

						return public.icon(link.path, ...sizes);
					}
				}
			}

			// get icon from config
			return scaled(config.fs.icons[public.ext(path)] || config.fs.icons.default);
		},
		// get pretty name (like Desktop) or title
		prettyName(path) {
			return config.fs.prettyName[public.fix(path)] || public.title(path);
		},
		// find file in whole fs
		find(name) {
			return ray.filter(e => e.includes(name));
		},
		// resolves link
		resolve(path) {
			if (!public.exists(path)) {
				throw new Error("Link '" + path + "' does not exist");
			}
			
			path = public.fix(path);
			
			for (let provider of providers) {
				if (provider.canResolve(path)) {
					return provider.resolve(path);
				}
			}
			
			throw new Error("Link '" + path + "' cannot be resolved. Access denied");
		},
		// gets next available name
		// New File.txt
		// New File (1).txt
		// New File (2).txt
		// ...
		nextName(path, name) {
			if (!public.exists(path + "/" + name)) {
				return public.fix(path + "/" + name);
			}

			if (name.includes(".")) {
				// logic for files with ext

				let i = 1;
				while (public.exists(path + "/" + public.nameWithoutExt(name) + " (" + i + ")." + public.ext(name))) {
					i++;
				}

				return path + "/" + public.nameWithoutExt(name) + " (" + i + ")." + public.ext(name);
			} else {
				// logic for files without ext

				let i = 1;
				while (public.exists(path + "/" + name + " (" + i + ")")) {
					i++;
				}

				return path + "/" + name + " (" + i + ")";
			}
		},
		// search in searchpaths (not globsearch)
		search(path, paths) {
			for (let p of paths) {
				for (let file of public.list(p)) {
					if (public.name(file) == path) {
						return file;
					}
				}
			}
		},
		// gets readable file type name (Text Document, Weblink, ABC File, ...)
		fileTypeName(path) {
			return (public.isDirectory(path) ? config.fs.typeName.directory : config.fs.typeName[public.ext(path)]) || config.fs.typeName.default.replace("%", public.ext(path).toUpperCase());
		},
		// gets size of item
		async size(path) {
			return (await public.readBlob(path)).size;
		},
		// gets readable size from bytes (KB, MB, ...)
		readableSize(bytes) {
			if (bytes < 1024) {
				return bytes + " B";
			}

			let u = -1;
			do {
				bytes /= 1024;
				u++;
			} while (Math.abs(bytes) >= 1024)

			return bytes.toFixed(1) + " " + ["KB", "MB", "GB", "TB"][u];
		},
		// gets description of file
		description(path) {
			return config.fs.description[public.fix(path)] || "";
		},
		// gets disk name of path
		diskOf(path) {
			return path.split("/")[0];
		},
		// delete file
		async delete(path) {
			path = public.fix(path);
			
			if (!public.exists(path)) {
				throw new Error("Path '" + path + "' does not exist");
			}
			
			for (let provider of providers) {
				if (provider.canDelete(path)) {
					await provider.delete(path);
					
					return;
				}
			}
			
			throw new Error("Cannot delete '" + path + "'. Access Denied");
		},
		// rename file
		async rename(path, newPath) {
			path = public.fix(path);
			
			log.action("rename", path, newPath);
			
			// converts relative paths (only name, no ../ stuff) to abs paths
			if (!newPath.includes("/")) {
				newPath = public.parentPath(path) + "/" + newPath;
			}
			
			if (path == newPath) {
				return;
			}
			
			if (!public.exists(path)) {
				throw new Error("Cannot rename '" + path + "'. Source does not exist");
			}
			
			if (!public.exists(public.parentPath(newPath))) {
				throw new Error("Cannot rename '" + path + "'. Parent does not exist");
			}
			
			if (fs.isDirectory(path)) {
				await fs.mkdir(newPath);

				for (let file of fs.list(path)) {
					await fs.rename(file, newPath + "/" + fs.name(file), fs.mime(file));
				}

				await fs.delete(path);
			} else if (fs.isLink(path)) {
				const data = await fs.resolve(path);
				
				console.log(path, data)
				
				await fs.delete(path);
				await fs.link(newPath, data.path, data.title, data.icon);
			} else {
				const blob = await fs.readBlob(path);
				
				await fs.delete(path);
				await fs.createBlob(newPath, blob);
			}
		},
		// link
		async link(path, to, title, icon) {
			path = public.fix(path);
			to = public.fix(to);
			
			if (public.exists(path)) {
				throw new Error("File '" + path + "' already exists");
			}
			
			for (let provider of providers) {
				if (provider.canLink(path, to)) {
					await provider.link(path, to, title, icon);
					
					return;
				}
			}
			
			throw new Error("Cannot link '" + path + "'. Access denied");
		},
		// gets mime type
		mime(path) {
			path = public.fix(path);
			
			if (!public.exists(path)) {
				throw new Error("File '" + path + "' does not exist");
			}
			
			if (public.isDirectory(path)) {
				return "";
			}
			
			for (let provider of providers) {
				if (provider.exists(path)) {
					return provider.mime(path);
				}
			}
			
			throw new Error("Cannot read mime type of '" + path + "'. Access denied");
		}
	}
	
	providers.push(NTFS.STZR(config.fs.stzr, public));
	// providers.push(NTFS.LSSP(config.fs.lssp, public));
	providers.push(NTFS.RRSP(config.fs.rrsp, public));
	
	await public.reload();
	
	return public;
}

DLL.export("NTFS", NTFS);