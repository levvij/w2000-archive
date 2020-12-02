<head>
	<link rel="stylesheet" href="main.css?v=<?= rand(0, 1000) ?>">
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" />
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-title" content="Windows">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<link rel="apple-touch-icon" href="fs/c/windows/branding/icon.png">
	
	<title>Windows</title>
	
	<script src="fs/c/windows/lib64/console.dll/main.js?v=<?= rand(0, 1000) ?>"></script>
	<script src="fs/c/windows/ime/root.js?v=<?= rand(0, 1000) ?>"></script>
	
	<?php
		foreach (scandir("fs/c/windows/ime/gen") as $f) {
			if ($f[0] != ".") {
	?>
	<script src="fs/c/windows/ime/gen/<?= $f ?>?v=<?= rand(0, 1000) ?>"></script>
	<?php
			}
		}
	?>
</head>

<body>
	<screen>
		<workspace></workspace>
		<task-bar></task-bar>

		<full-overlay></full-overlay>
	</screen>
</body>

<script>
	
	// get elements
	const workspace = document.querySelector("workspace");
	const fullOverlay = document.querySelector("full-overlay");
	
	// create console
	const globalConsole = new Console(fullOverlay);
	
</script>
<script src="fs/c/windows/lib64/mscorlib.dll/main.js?v=<?= rand(0, 1000) ?>"></script>
<script>
	
	onload = async () => {
		// load dlls
		globalConsole.writeln("Starting Windows...\n");
		
		const bootLog = globalConsole.createUnit("boot");
		
		// set beta attribute
		if (config.beta) {
			document.body.setAttribute("beta", "");
		}
		
		let params = [];
		
		if (location.pathname == "/") {
			params = await fetch("/config/init").then(r => r.json());
		}
		
		const search = location.search || config.injectedQuery || "";
		
		// add query config
		if (search.substr(1)) {
			if (search[1] == "!") {
				params = [{
					config: search.substr(2)
				}]
			} else {
				params = JSON.parse(decodeURIComponent(search.substr(1)));
			}
		}
		
		const reload = async () => {
			if (!Array.isArray(params)) {
				params = [params];
			}

			for (let param of params) {
				if (!param.loaded) {
					if ("config" in param) {
						params.push(...(await fetch(param.config + "/config/init").then(r => r.json())));
						param.loaded = true;

						await reload();
					}

					if ("rrsp" in param) {
						bootLog.action("queryconf", param.name || "ParamRRSP");
						param.loaded = true;

						config.fs.providers.unshift({
							type: "rrsp",
							name: param.name || "ParamRRSP",
							root: param.rrsp,
							deleteList: "rrsp_" + param.rssp + "_dl",
							ray: param.rayroot || param.rrsp + "/" + param.ray + "?name=" + param.name + "&root=" + param.rrsp
						});
					}
				}
			}
		}
		
		await reload();
		
		// load fs
		await DLL.load("c/windows/lib64/fileSystem.dll");
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/lssp.dll");
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/rrsp.dll");
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/stzr.dll");
		
		// create fs
		fs = await NTFS();
		
		// load all config exts
		for (let file of fs.listAll("c/windows/ime/config")) {
			bootLog.action("autoconfig", fs.name(file));
			
			await DLL.load(file);
		}
		
		// polyfills / runtime
		await DLL.load("c/windows/lib64/runtime.dll");
		
		// crypto
		await DLL.load("c/windows/lib64/cryptography.dll");
		globalConsole.writeln("cypp: " + Cypp.id);
		
		// general
		await DLL.load("c/windows/lib64/pwrmgr.dll");
		await DLL.load("c/windows/lib64/evntmg.dll");
		await DLL.load("c/windows/lib64/management.dll");
		await DLL.load("c/windows/lib64/process.dll");
		await DLL.load("c/windows/lib64/netstandard.dll");
		await DLL.load("c/windows/lib64/cursor.dll");
		await DLL.load("c/windows/lib64/presentationFramework.dll");
		await DLL.load("c/windows/input/forms.dll");
		
		// set webapp attribute if page is viewed in iOS webapp mode
		if (navigator.standalone) {
			document.body.setAttribute("webapp", "");
		}
		
		// load backres (desktop / taskbar)
		await DLL.load("c/windows/lib64/backres.dll");
		
		config.loaded = true;
	};
	
</script>