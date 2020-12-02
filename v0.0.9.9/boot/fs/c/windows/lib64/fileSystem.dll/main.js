/// file system
/// C 2019 levvij

// all files are on the server but users can create own files in localStorage
// when reading a file, we try to get it from localStorage first

// we scan all files in reload with ray.php to know what exists
// all link (.lnk) files are preresolved
const log = config.beta && globalConsole.createUnit("fs");

async function NTFS() {
    const providers = [];
    const listeners = [];

    let extinfos = {};
    let metas = {};

    const updateFileExts = async() => {
        public.creators = [];

        for (let disk of public.disks) {
            for (let file of await public.listAll(disk)) {
                if (await public.isExecuteable(file) && Path.ext(file) == "exe") {
                    const info = await public.exeinfo(file);

                    if (info.creates) {
                        for (let create of info.creates) {
                            public.creators.push({
                                ext: create.ext,
                                content: create.content,
                                program: file,
                                name: create.name
                            });
                        }
                    }

                    for (let type of info.opens || []) {
                        type.file = file;
                        type.priority = type.priority || 0;

                        if (extinfos[type.ext]) {
                            extinfos[type.ext].openers.push(type);
                        } else {
                            extinfos[type.ext] = {
                                icon: type.icon,
                                openers: [type],
                                editors: []
                            };
                        }
                    }

                    for (let type of info.edits || []) {
                        type.file = file;
                        type.priority = type.priority || 0;

                        if (extinfos[type.ext]) {
                            extinfos[type.ext].editors.push(type);
                        } else {
                            extinfos[type.ext] = {
                                icon: type.icon,
                                editors: [type]
                            };
                        }
                    }
                }
            }
        }

        for (let ext in extinfos) {
            if (extinfos[ext].openers && extinfos[ext].openers.length) {
                extinfos[ext].opener = extinfos[ext].openers.sort((a, b) => a.priority == b.priority ? 0 : a.priority > b.priority ? -1 : 1)[0].file;
            }

            if (extinfos[ext].editors && extinfos[ext].editors.length) {
                extinfos[ext].editor = extinfos[ext].editors.sort((a, b) => a.priority == b.priority ? 0 : a.priority > b.priority ? -1 : 1)[0].file;
            }
        }
    };

    const flush = async path => {
        for (let listener of listeners) {
            let fire = false;

            if (Path.parentPath(path) == listener.path) {
                fire = true;
            }

            if (path.startsWith(listener.path) && listener.path.recursive) {
                fire = true;
            }

            if (fire) {
                await listener.handler();
            }
        }
    };

    const public = {
        // holds all providers
        // call reload() after adding a provider
        providers,
        // reloads whole file system
        async reload() {
            log && log.action("reload");

            for (let provider of providers) {
                log && log.action("reloadfs", provider.name);
                await provider.reload();
            }

            log && log.action("meta", "load");

            metas = {};
            for (let disk of public.disks) {
                for (let file of await public.listAll(disk, true)) {
                    if (Path.name(file) == ".meta") {
                        metas[Path.parentPath(file)] = JSON.parse(await public.read(file));
                    }
                }
            }

            for (let disk of public.disks) {
                if (!(await public.exists(disk))) {
                    await public.mkdir(disk);
                }
            }

            await updateFileExts();
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

        // listens to changes in a path
        listen(path, handler, recursive) {
            path = Path.fix(path);

            const listener = {
                path,
                handler,
                recursive,
                stop() {
                    listeners.splice(listeners.indexOf(listener), 1);
                }
            };

            listeners.push(listener);

            return listener;
        },

        // creates a new file
        async create(path, content = "", mime = "text/plain") {
            path = Path.fix(path);
            content = content + "";

            log && log.action("create", path, content.length);

            if (await public.exists(path)) {
                throw new Error("File '" + path + "' already exists");
            }

            if (!(await public.exists(Path.parentPath(path)))) {
                throw new Error("Parent directory of '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canCreate(path, content, mime)) {
                    await provider.createFile(path, content, mime);
                    await updateFileExts();

                    if (public.name(path) == ".meta") {
                        metas[path] = JSON.parse(content);
                    }

                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot create '" + path + "'. Access denied");
        },
        // creates a new file
        async createBlob(path, blob) {
            path = Path.fix(path);

            log && log.action("createblob", path);

            if (await public.exists(path)) {
                throw new Error("File '" + path + "' already exists");
            }

            if (!(await public.exists(Path.parentPath(path)))) {
                throw new Error("Parent directory of '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canCreate(path, blob)) {
                    await provider.createBlobFile(path, blob);
                    await updateFileExts();

                    if (Path.name(path) == ".meta") {
                        metas[path] = JSON.parse(content);
                    }

                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot create '" + path + "'. Access denied");
        },
        // writes to existing file
        async write(path, content = "") {
            path = Path.fix(path);
            content = content + "";

            log && log.action("write", path, content.length);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canWrite(path, content)) {
                    await provider.write(path, content);
                    await updateFileExts();

                    if (Path.name(path) == ".meta") {
                        metas[path] = JSON.parse(content);
                    }

                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot write '" + path + "'. Access denied");
        },
        // writes blob to existing file 
        async writeBlob(path, blob) {
            path = Path.fix(path);

            log && log.action("writeblob", path);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canWrite(path, blob)) {
                    await provider.write(path, blob);
                    await updateFileExts();

                    if (Path.name(path) == ".meta") {
                        metas[path] = JSON.parse(content);
                    }

                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot write '" + path + "'. Access denied");
        },
        // creates directory
        async mkdir(path) {
            path = Path.fix(path);

            log && log.action("mkdir", path);

            for (let provider of providers) {
                if (provider.canCreate(path)) {
                    await provider.createDirectory(path);

                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot create '" + path + "'. Access denied");
        },
        // reads file size
        async size(path) {
            path = Path.fix(path);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return await provider.size(path);
                }
            }

            throw new Error("Cannot get size of '" + path + "'. Access denied");
        },
        // size on disk
        async sizeOnDisk(path) {
            return Math.ceil(((await public.size(path) || 0) + 1) / 1024) * 1024;
        },
        // get meta
        async meta(path) {
            path = Path.fix(path);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            if (await public.isDirectory(path) || await public.isDisk(path)) {
                return metas[path];
            } else {
                const parentMeta = metas[Path.parentPath(path)];

                if (parentMeta && parentMeta.files) {
                    return parentMeta.files[Path.name(path)];
                }
            }
        },
        // reads file
        async read(path) {
            path = Path.fix(path);

            log && log.action("read", path);

            if (!await public.exists(path)) {
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
            path = Path.fix(path);

            log && log.action("readblob", path);

            if (!await public.exists(path)) {
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
            path = Path.fix(path);

            log && log.action("readuri", path);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canRead(path)) {
                    return await provider.readURI(path);
                }
            }

            throw new Error("Cannot read '" + path + "'. Access denied");
        },
        // lists all files inside directory (returns full paths)
        async list(path, includeHidden) {
            path = Path.fix(path);

            const items = [];

            for (let provider of providers) {
                items.push(...await provider.list(path));
            }

            return items.filter((f, i) => items.indexOf(f) == i).sort((a, b) => a == b ? 0 : a > b ? 1 : -1).filter(c => includeHidden || (Path.name(c)[0] != "." && Path.name(c)[0] != "$"));
        },
        // same as list, but recursive
        async listAll(path, includeHidden) {
            path = Path.fix(path);

            const items = [];

            for (let provider of providers) {
                items.push(...await provider.listAll(path));
            }

            return items.filter((f, i) => items.indexOf(f) == i).sort((a, b) => a == b ? 0 : a > b ? 1 : -1).filter(c => includeHidden || (Path.name(c)[0] != "." && Path.name(c)[0] != "$"));
        },
        // check if file/directory exists
        async exists(path) {
            path = Path.fix(path);

            if (!path) {
                return false;
            }

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return true;
                }
            }

            return false;
        },
        // check if path is a directory
        async isDirectory(path) {
            path = Path.fix(path);

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.isDirectory(path);
                }
            }

            throw new Error("Path '" + path + "' does not exist");
        },
        // check if path is a directory
        async isFile(path) {
            path = Path.fix(path);

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.isFile(path);
                }
            }

            throw new Error("Path '" + path + "' does not exist");
        },
        // check if file is a link
        async isLink(path) {
            path = Path.fix(path);

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.isLink(path);
                }
            }

            throw new Error("Path '" + path + "' does not exist");
        },
        // check if path is a root disk
        async isDisk(path) {
            return public.disks.includes(Path.fix(path));
        },
        // gets all disks connected to the computer
        get disks() {
            const disks = [];

            for (let provider of providers) {
                disks.push(...provider.disks);
            }

            return disks.filter((d, i) => disks.indexOf(d) == i);
        },
        // returns provider of file
        async providerOf(path) {
            for (let provider of providers) {
                if (await provider.exists(path)) {
                    return provider;
                }
            }
        },
        // ctime, mtime
        async times(path) {
            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            path = Path.fix(path);

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.times(path);
                }
            }

            throw new Error("Filetimes of '" + path + "' cannot be read. Access denied");
        },
        // resolves link
        async resolve(path) {
            if (!await public.exists(path)) {
                throw new Error("Link '" + path + "' does not exist");
            }

            path = Path.fix(path);

            for (let provider of providers) {
                if (provider.canResolve(path)) {
                    return provider.resolve(path);
                }
            }

            throw new Error("Link '" + path + "' cannot be resolved. Access denied");
        },

        // search in searchpaths (not globsearch)
        async search(path, paths) {
            for (let p of paths) {
                for (let file of await public.list(p)) {
                    if (Path.name(file) == path) {
                        return file;
                    }
                }
            }
        },
        // delete file
        async delete(path) {
            path = Path.fix(path);

            if (!await public.exists(path)) {
                throw new Error("Path '" + path + "' does not exist");
            }

            for (let provider of providers) {
                if (provider.canDelete(path)) {
                    await provider.delete(path);
                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot delete '" + path + "'. Access Denied");
        },
        async move(path, newPath, onmove) {
            path = Path.fix(path);
            newPath = Path.fix(newPath + "/" + Path.name(path));

            log && log.action("move", path, newPath);

            if (path != newPath) {
                await public.rename(path, newPath, onmove);
            }
        },
        // rename file
        async rename(path, newPath, onrename) {
            path = Path.fix(path);

            log && log.action("rename", path, newPath);

            // converts relative paths (only name, no ../ stuff) to abs paths
            if (!newPath.includes("/")) {
                newPath = Path.fix(Path.parentPath(path) + "/" + newPath);
            }

            if (path == newPath) {
                return;
            }

            if (!await public.exists(path)) {
                throw new Error("Cannot rename '" + path + " to '" + newPath + "'. Source does not exist");
            }

            if (!await public.exists(Path.parentPath(newPath))) {
                throw new Error("Cannot rename '" + path + "' to '" + newPath + "'. Parent does not exist");
            }

            if (newPath.startsWith(path)) {
                throw new Error("Cannot rename '" + path + "' to '" + newPath + "'. Destination is inside of source");
            }

            onrename && await onrename(path, newPath);

            if (await fs.isDirectory(path)) {
                await fs.mkdir(newPath);

                for (let file of await fs.list(path)) {
                    await fs.rename(file, newPath + "/" + Path.name(file), onrename);
                }

                await fs.delete(path);
            } else if (await fs.isLink(path)) {
                const data = await fs.resolve(path);

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
            path = Path.fix(path);
            to = Path.fix(to);

            if (await public.exists(path)) {
                throw new Error("File '" + path + "' already exists");
            }

            for (let provider of providers) {
                if (provider.canLink(path, to)) {
                    await provider.link(path, to, title, icon);
                    await flush(path);

                    return;
                }
            }

            throw new Error("Cannot link '" + path + "'. Access denied");
        },
        // gets mime type
        async mime(path) {
            path = Path.fix(path);

            if (!await public.exists(path)) {
                throw new Error("File '" + path + "' does not exist");
            }

            if (await public.isDirectory(path)) {
                return "";
            }

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.mime(path);
                }
            }

            throw new Error("Cannot read mime type of '" + path + "'. Access denied");
        },
        // is executeable
        async isExecuteable(path) {
            return await public.exists(path) && await public.isDirectory(path) && (Path.ext(path) == "exe" || Path.ext(path) == "dll") && await public.exists(path + "/main.js") && await public.exists(path + "/meta.json");
        },
        // exe info
        async exeinfo(path) {
            path = Path.fix(path);

            if (!await public.exists(path)) {
                throw new Error("Executeable '" + path + "' does not exist");
            }

            if (!await public.isExecuteable(path)) {
                throw new Error("Path '" + path + "' is not a executeable");
            }

            for (let provider of providers) {
                if (provider.exists(path)) {
                    return provider.exeinfo(path);
                }
            }

            throw new Error("Cannot read mime type of '" + path + "'. Access denied");
        },
        // finds opener applications, default application, edit application, icon
        extinfo(ext) {
            return extinfos[ext];
        },
        async isDirectoryOrLinksDirectory(path) {
            if (await public.isDirectory(path)) {
                return true;
            }

            if (await public.isLink(path)) {
                const link = await public.resolve(path);

                if (link && link.path) {
                    return await public.isDirectory(link.path);
                }
            }
        },
        async listDirectories(path) {
            const res = [];

            for (let file of await public.list(path)) {
                if (await public.isDirectory(file)) {
                    res.push(file);
                }
            }

            return res;
        },
        async listFiles(path) {
            const res = [];

            for (let file of await public.list(path)) {
                if (!await public.isDirectory(file)) {
                    res.push(file);
                }
            }

            return res;
        },
        async listFilesWithExt(path, ext) {
            const res = [];

            for (let file of await public.list(path)) {
                if (!await public.isDirectory(file) && Path.ext(file) == ext) {
                    res.push(file);
                }
            }

            return res;
        },
        async isNotExecuteableDirectory(path) {
            return (await fs.isDirectory(path)) && !(await fs.isExecuteable(path));
        }
    }

    for (let prov of config.fs.providers.sort((a, b) => a.order == b.order ? 0 : a.order > b.order ? 1 : -1)) {
        switch (prov.type) {
            case "stzr":
                {
                    providers.push(NTFS.STZR(prov, public));
                    break;
                }

            case "lssp":
                {
                    providers.push(NTFS.LSSP(prov, public));
                    break;
                }

            case "rrsp":
                {
                    providers.push(NTFS.RRSP(prov, public));
                    break;
                }
            case "pmpr":
                {
                    providers.push(NTFS.PMPR(prov, public));
                    break;
                }
        }
    }

    await public.reload();

    return public;
}

DLL.export("NTFS", NTFS);