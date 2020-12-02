// main config
const config = {
	hosts: {
		localhost: "%c"
	},
	css: {
		"cursor-default": "url('fs/c/windows/system32/icons/accwiz/0x00F3/32/0.png'), auto",
		"window-close": "url('fs/c/windows/lib64/presentationFramework.dll/close.png')",
		"window-max": "url('fs/c/windows/lib64/presentationFramework.dll/max.png')",
		"window-min": "url('fs/c/windows/lib64/presentationFramework.dll/min.png')"
	},
	csc: {
		list: "c/windows/csc/styles",
		root: "c/windows/csc/"
	},
	fontgen: {
		sizes: [11, 12, 15, 17, 19, 21, 23, 25],
		weights: ["normal", "bold"],
		families: [
			{
				varName: "",
				name: "tahoma-regular",
				file: "url('fs/c/windows/fonts/tahoma-%w.ttf?s=%s')"
			}
		]
	},
	mouse: {
		contextMenu: 500,
		doubleClick: 200
	},
	dll: {
		paths: [
			"c/windows/lib64/",
			"c/windows/system32/"
		]
	},
	console: {
		lineHeight: 1.1
	},
	window: {
		minWidth: 100,
		minHeigth: 50,
		minDisplayBorderOffset: {
			x: 25,
			y: 25
		},
		initialOffset: {
			x: 20,
			y: 20
		},
		initialPosition: {
			x: 50,
			y: 50
		},
		borderSize: {
			x: 6,
			y: 33
		}
	},
	cmd: {
		defaultPath: "c/",
		path: [
			"c/windows/system32",
			"c/windows/migrosoft",
			"c/windows/lib64",
			"c/windows/levvij"
		],
		commandDelay: 10
	},
	ui: {
		openFileDialog: {
			title: "Open",
			done: "Done",
			width: 500,
			height: 400
		},
		buttonWindow: {
			width: 350,
			height: 120
		},
		keys: {
			ctrl: "Ctrl",
			f1: "F1",
			f2: "F2",
			f3: "F3",
			f4: "F4",
			f5: "F5",
			f6: "F6",
			f7: "F7",
			f8: "F8",
			f9: "F9",
			f10: "F10",
			f11: "F11",
			f12: "F12"
		},
		messageBox: {
			ok: "OK",
			error: {
				icon: "explorer/0x006F",
				title: "Error"
			},
			warning: {
				icon: "explorer/0x006E",
				title: "Warning"
			},
			info: {
				icon: "explorer/0x006D",
				title: "Info"
			}
		},
		chart: {
			itemHeight: 12,
			itemMarginBottom: 5,
			scale: 0.4,
			height: 12,
			template: "%t: %v",
			fill: "#FFFFFF",
			fillDark: "#e5e3de",
			colorTemplate: "hsl(%v, 90%, 40%)",
			colorDelta: 39,
			colorStart: 230
		},
		errorWindow: {
			text: "%n stopped working\nError: %e",
			title: "%n stopped working"
		}
	},
	ie: {
		startURL: "http://google.com",
		bookmarks: []
	},
	user: {
		path: "c/users/guest/",
		desktop: "c/users/guest/desktop",
		documents: "c/users/guest/documents",
		music: "c/users/guest/music",
		start: "c/windows/ime/start.ime"
	},
	extrun: {
		http: "c/windows/migrosoft/ie.exe",
		nttp: "c/windows/migrosoft/ie.exe",
		html: "c/windows/migrosoft/ie.exe",
		directory: "c/windows/system32/explorer.exe",
		png: "c/windows/system32/paint.exe",
		txt: "c/windows/system32/notepad.exe",
		js: "c/windows/levvij/start.exe",
		bat: "c/windows/system32/cmd.exe",
		cmd: "c/windows/system32/cmd.exe",
		jpg: "c/windows/system32/paint.exe",
		jpeg: "c/windows/system32/paint.exe",
		gif: "c/windows/system32/paint.exe",
		mp3: "c/windows/migrosoft/wmi.exe",
		mp4: "c/windows/migrosoft/wmi.exe"
	},
	extedit: {
		default: "c/windows/system32/notepad.exe",
		txt: "c/windows/system32/notepad.exe",
		jpg: "c/windows/system32/paint.exe",
		jpeg: "c/windows/system32/paint.exe",
		gif: "c/windows/system32/paint.exe",
		png: "c/windows/system32/paint.exe",
		lnk: "c/windows/system32/explorer.exe",
		mp3: -1,
		wav: -1,
		mp4: -1,
	},
	fs: {
		providers: [
			{
				type: "stzr",
				name: "Cloud",
				key: "stzr_key",
				root: "https://dotcdn.us/stzr/container/%c/%p",
				api: {
					create: "https://dotcdn.us/stzr/create/",
					meta: "https://dotcdn.us/stzr/meta/",
					write: "https://dotcdn.us/stzr/write/",
					mkdir: "https://dotcdn.us/stzr/mkdir/",
					link: "https://dotcdn.us/stzr/link/",
					delete: "https://dotcdn.us/stzr/delete/"
				}
			},
			{
				type: "rrsp",
				name: "Remote",
				root: "fs/",
				deleteList: "rrsp_dl"
			}
		],
		root: "fs/",
		ray: "fs/ray.php",
		prefix: "wray_fsx_",
		disk: "c/",
		icons: {
			qualities: [0, 1],
			sizes: [64, 48, 32, 16, 8, 4, 2, 96],
			base: "c/windows/system32/icons/",
			directory: "shell32/0x0004",
			directoryOpen: "shell32/0x0005",
			default: "shell32/0x0001",
			disk: "shell32/0x0009",
			computer: "explorer/0x0064",
			lnk: "floimg/0x0000",
			
			bat: "c/windows/system32/imageres/bat.png",
			js: "shell32/0x0003",
			exe: "shell32/0x0003",
			dll: "shell32/0x009A",
			
			gif: "mspaint/0x0002",
			jpg: "mspaint/0x0002",
			jpeg: "mspaint/0x0002",
			png: "mspaint/0x0002",
			
			ttf: "fontext/0x0002",
			
			mov: "quartz/0x0064",
			mp4: "quartz/0x0065",
			mpeg: "quartz/0x0066",
			
			mp3: "quartz/0x00C8",
			mid: "quartz/0x012C",
			
			pdf: "c/windows/system32/imageres/pdf.png",
			rtf: "c/windows/system32/imageres/rtf.png",
			txt: "shell32/0x0098",
			zip: "c/windows/system32/imageres/zip.png",
			
			html: "mshtml/0x0A65",
			web: "mshtml/0x0A65",
			url: "mshtml/0x0A65",
		},
		prettyName: {
			"": "My Computer",
			"c": "Local Disk (C:)",
			"c/public": "Public share",
			"c/programFiles": "Program Files",
			"c/programData": "Program Data",
			"c/perfLogs": "Performance Logs",
			"c/tmp": "Temporary Files",
			"c/windows": "Windows System Files",
			"c/users": "Users",
			"c/users/guest": "Guest User (Me)",
			"c/users/guest/desktop": "Desktop",
			"c/users/guest/documents": "Documents",
			"c/users/guest/music": "Music",
			"e": "Data (E:)",
			"d": "Data (D:)"
		},
		description: {
			"": "Displays the files and folders on your computer",
		},
		icon: {
			"": "shell32/0x0010",
			"c/users/guest/desktop/computer.lnk": "explorer/0x0064",
			"c/windows/fonts": "shell32/0x0027",
			"c/windows/migrosoft/ie.exe": "shell32/0x0200",
			"c/windows/system32/paint.exe": "mspaint/0x0002",
		},
		typeName: {
			default: "% File",
			directory: "File Folder",
			bat: "Windows Batch File",
			exe: "Application",
			gif: "Animated Image",
			jpg: "Image",
			jpeg: "Image",
			mid: "MIDI File",
			mov: "Video",
			mp3: "MP3 Audio",
			mp4: "Video",
			mpeg: "Video",
			mega: "Agy",
			png: "Image",
			pdf: "PDF-Document",
			rtf: "Rich Text Document",
			txt: "Text Document",
			url: "Weblink",
			zip: "Compressed Folder",
			lnk: "Shortcut",
			html: "Web Document",
			dll: "Application Extension"
		}
	},
	taskBar: {
		start: "Start"
	},
	globalConsole: {
		action: "font-weight: bold",
		mark: "font-weight: bold; color: #396DA5",
		warn: "font-weight: bold; background: #FFFF00; color: #000000",
		error: "font-weight: bold; background: #FF0000; color: #FFFFFF",
		info: "color: #666666"
	},
	networking: {
		dns: "https://dotcdn.us/wprx/dns/",
		proxy: [
			"https://dotcdn.us/wprx/"
		],
		speed: 0,
		nogap: {
			address: "wss://nogap.dotcdn.us/",
			version: "1.0.1.0"
		}
	},
	error: "https://dotcdn.us/win-api/reporting/new.php",
	tooltip: {
		timeout: 1500
	}
};