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
	
	// create console
	const globalConsole = new Console(document.querySelector("full-overlay"));
	
</script>
<script src="fs/c/windows/lib64/mscorlib.dll/main.js?v=<?= rand(0, 1000) ?>"></script>
<script>
	
	onload = async () => {
		// load dlls
		globalConsole.writeln("Starting Windows v" + config.version + (config.beta ? "b" : "r") + "...\n");
		
		if (!config.beta) {
			globalConsole.lock();
			globalConsole.hideCursor();
		}
		
		config.bootStartTime = new Date();
		config.touch = "ontouchstart" in window;
		
		const bootLog = globalConsole.createUnit("boot");
		
		// set beta attribute
		if (config.beta) {
			document.body.setAttribute("beta", "");
		}
		
		const steps = localStorage.bootSteps || globalConsole.width;
		let currentStep = 0;
		const step = () => {
			if (!config.beta) {
				globalConsole.unlock();
				globalConsole.y = globalConsole.height - 3;
				globalConsole.x = 5;

				const width = globalConsole.width - 10;
				const progress = Math.min(Math.floor(width / steps * ++currentStep), width);

				globalConsole.write("█".repeat(progress) + "▌".repeat(width - progress));

				globalConsole.lock();
			}
		};
		
		let params = [];
		
		step();
		
		if (location.pathname == "/") {
			params = await fetch("/config/init").then(r => r.json());
		}
		
		step();
		
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
					
					if ("release-sim" in param) {
						config.beta = false;
					}
				}
			}
		}
		
		step();
		
		await reload();
		
		// load fs
		step();
		await DLL.load("c/windows/lib64/fileSystem.dll");
		
		step();
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/lssp.dll");
		
		step();
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/rrsp.dll");
		
		step();
		await DLL.load("c/windows/lib64/fileSystem.dll/providers/stzr.dll");
		
		// create fs
		step();
		fs = await NTFS();
		
		// load all config exts
		for (let file of fs.listAll("c/windows/ime/config")) {
			bootLog.action("autoconfig", fs.name(file));
			
			step();
			await DLL.load(file);
		}
		
		// polyfills / runtime
		step();
		await DLL.load("c/windows/lib64/runtime.dll");
		
		// crypto
		step();
		await DLL.load("c/windows/lib64/cryptography.dll");
		
		// power manager
		step();
		await DLL.load("c/windows/lib64/pwrmgr.dll");
		
		// eventmanager
		step();
		await DLL.load("c/windows/lib64/evntmg.dll");
		
		// device management
		step();
		await DLL.load("c/windows/lib64/management.dll");
		
		// process management
		step();
		await DLL.load("c/windows/lib64/process.dll");
		
		// networking
		step();
		await DLL.load("c/windows/lib64/netstandard.dll");
		
		// cursor
		step();
		await DLL.load("c/windows/lib64/cursor.dll");
		
		// ui
		step();
		await DLL.load("c/windows/lib64/presentationFramework.dll");
		
		// forms
		step();
		await DLL.load("c/windows/input/forms.dll");
		
		// set webapp attribute if page is viewed in iOS webapp mode
		if (navigator.standalone) {
			await DLL.load("c/windows/lib64/mobile.dll");
		}
		
		// load backres (desktop / taskbar)
		step();
		await DLL.load("c/windows/lib64/backres.dll");
		
		config.loaded = true;
		config.bootTime = new Date() - config.bootStartTime;
		config.bootEndTime = new Date();
		
		step();
		localStorage.bootSteps = currentStep;
	};
	
</script>