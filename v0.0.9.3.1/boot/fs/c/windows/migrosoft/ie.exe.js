/// the most god awful program, IE6
/// C 2019 levvij

await DLL.load("print.dll");

let url = arguments[0] || config.ie.startURL;

// create the 496000 pixels of hell
const window = new Window("Internet Explorer", 800, 620);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

window.icon = fs.icon(application.path, 16);

window.render(ui => {
	const grid = ui.Grid(["100%"], [
		"auto", "*", "auto"
	]);
	ui.root.add(grid);

	const browser = ui.WebControl(url);
	browser.ontitlechange.subscribe(() => {
		window.title = browser.title + " - Internet Explorer";
	});

	const box = ui.ToolbarBox();
	grid[0][0].add(box);

	const menu = ui.Menu([{
			text: "File",
			items: [{
					text: "New",
					items: [{
							text: "Window",
							click() {
								Application.load(application.path);
							}
						},
						{},
						// just some random links
						{
							text: "Message",
							click() {
								browser.source = "http://4chan.org"
							}
						},
						{
							text: "Post",
							click() {
								browser.source = "http://facebook.com"
							}
						},
						{
							text: "Contact",
							click() {
								browser.source = "http://theuselessweb.com"
							}
						},
						{
							text: "Internet Call",
							click() {
								browser.source = "http://omegle.com"
							}
						},
						{},
						{
							text: "Blank Window",
							click() {
								Application.load(application.path, "about:blank");
							}
						}
					]
				},
				{
					text: "Open...",
					click() {
						// opens html file in browser

						ui.OpenFileDialog({
							allowFile: true
						}).then(r => {
							browser.source = "file://" + r;
						});
					}
				},
				{
					text: "Edit",
					key: "ctrl+e",
					click() {
						// saves and edits html file

						ui.SaveAsDialog({
							path: config.user.documents,
							default: fs.name(fs.nextName(config.user.documents, browser.title + ".html"))
						}).then(r => {
							fs.create(r, browser.document);

							Application.edit(r);

							browser.source = "file://" + r;
						});
					}
				},
				{
					text: "Save",
					key: "ctrl+s",
					click() {
						// saves html file

						ui.SaveAsDialog({
							path: config.user.documents,
							default: fs.name(fs.nextName(config.user.documents, browser.title + ".html"))
						}).then(r => {
							fs.create(r, browser.document);
						});
					}
				},
				{},
				{
					text: "Page Setup...",
					disabled: true
				},
				{
					text: "Print...",
					key: "ctrl+p",
					click() {
						const document = new PrinterDocument();
						document.writeHTML(browser.document);
						document.print();
					}
				},
				{},
				// these are just random links
				{
					text: "Send...",
					items: [{
							text: "Page by E-mail...",
							click() {
								browser.source = "http://www.arngren.net/"
							}
						},
						{
							text: "Link by E-mail...",
							click() {
								browser.source = "http://www.dpgraph.com/"
							}
						},
						{
							text: "Shortcut to Desktop...",
							click() {
								fs.create(config.user.desktop + "/" + browser.title + ".lnk", browser.source + "#29%\n" + browser.title);
								desktop.update();
							}
						}
					]
				},
				{
					text: "Import and Export...",
					disabled: true
				},
				{},
				{
					text: "Properties",
					click() {
						// just a window containing all images in c/
						const sub = ui.createChildWindow("Properties of " + browser.title, 250, 400);
						sub.render(ui => {
							const scroll = ui.Scroll();

							for (let file of fs.listAll("c/").filter(f => fs.ext(f) == "png")) {
								scroll.add(ui.Image(file));
							}

							scroll.add(ui.Label("http://www.isleuth.com/"));

							ui.root.add(scroll);
						});
					}
				},
				{
					text: "Close",
					click() {
						window.close();
					}
				}
			]
		},
		{
			text: "Edit",
			items: [{
					text: "Cut",
					key: "ctrl+x",
					disabled: true
				},
				{
					text: "Copy",
					key: "ctrl+c",
					disabled: true
				},
				{
					text: "Paste",
					key: "ctrl+v",
					disabled: true
				},
				{},
				{
					text: "Select All",
					key: "ctrl+a",
					disabled: true
				},
				{},
				{
					text: "Find (on This Page)...",
					key: "ctrl+f",
					disabled: true
				}
			]
		},
		{
			text: "View",
			items: [{
				text: "Full Screen",
				key: "f11",
				click() {
					window.max();
				}
			}]
		},
		{
			text: "Favorites",
			items: [{
					text: "Add to Favorites...",
					disabled: true
				},
				{
					text: "Organize Favorites...",
					disabled: true
				}
			]
		},
		{
			text: "Tools",
			items: [{
				text: "Networking",
				click() {
					Application.load("c/windows/system32/netyrn.exe");
				}
			}]
		},
		// just more links
		{
			text: "Help",
			items: [{
					text: "Contents and Index",
					click() {
						browser.source = "https://dotcdn.us/office";
					}
				},
				{
					text: "Tip of the Day",
					click() {
						browser.source = "https://cached.imagescaler.hbpl.co.uk/resize/scaleWidth/1486/cached.offlinehbpl.hbpl.co.uk/news/OMC/Nike_1280-20150120104711373.jpg";
					}
				},
				{
					text: "For Netscape Users",
					click() {
						browser.source = "http://edition.cnn.com/EVENTS/1996/year.in.review/";
					}
				},
				{
					text: "Tour",
					click() {
						browser.source = "https://tubularinsights.com/rise-online-video-break-internet/";
					}
				},
				{
					text: "Online Support",
					disabled: true
				},
				{
					text: "Send Feedback",
					click() {
						browser.source = "https://park.org/";
					}
				},
				{},
				{
					text: "About Internet Explorer",
					click() {
						browser.source = "about:about";
					}
				}
			]
		}
	]);
	box.add(menu);

	const addressBar = ui.TextBox(url);
	const nav = ui.Menu([{
			text: "Back",
			icon: "c/windows/migrosoft/ie/back.png",
			click() {
				browser.back();
				addressBar.value = browser.source;
			}
		},
		{
			icon: "c/windows/migrosoft/ie/forward.png",
			click() {
				browser.forward();
				addressBar.value = browser.source;
			}
		},
		{
			icon: "c/windows/migrosoft/ie/cancel.png",
			click() {
				browser.source = "about:blank";
			}
		},
		{
			icon: "c/windows/migrosoft/ie/refresh.png",
			click() {
				browser.source = browser.source + "#";
			}
		},
		{
			icon: "c/windows/migrosoft/ie/home.png",
			click() {
				const links = [
					"https://www.cameronsworld.net/",
					"https://web.archive.org/web/20010516021255/http://www.geocities.com:80/SunsetStrip/Stadium/1153/",
					"https://web.archive.org/web/20091027091256/http://geocities.com/CapeCanaveral/Lab/1703/",
					"https://web.archive.org/web/20091027062546/http://geocities.com/Paris/8311/",
					"https://web.archive.org/web/20091026235519/http://geocities.com/SoHo/3163/",
					"https://web.archive.org/web/20091027025705/http://geocities.com/willy_um/", 
					"https://web.archive.org/web/20090821091848/http://geocities.com/Area51/Atlantis/1561/", 
					"https://web.archive.org/web/20091027064822/http://geocities.com/Petsburgh/Park/8573/", 
					"https://web.archive.org/web/20091027015018/http://geocities.com/RodeoDrive/2500/", 
					"https://web.archive.org/web/20091027044317/http://geocities.com/SunsetStrip/Diner/2428/", 
					"https://web.archive.org/web/20091027041634/http://geocities.com/Eureka/Company/9200/", 
					"https://web.archive.org/web/20091027042655/http://geocities.com/TimesSquare/Dungeon/7737/", 
					"https://web.archive.org/web/19990826024018/http://www.geocities.com:80/Athens/8262/", 
					"https://web.archive.org/web/20091027070448/http://geocities.com/Yosemite/Gorge/2519/", 
					"https://web.archive.org/web/20021127185335/http://www.geocities.com:80/RainForest/Andes/8473/", 
					"https://web.archive.org/web/20020812120502/http://www.geocities.com:80/doug-tricarico/moviedogad.html", 
					"https://web.archive.org/web/20091027065456/http://geocities.com/TelevisionCity/Lot/6301/", 
					"https://web.archive.org/web/20000818212624/http://www.geocities.com:80/SoHo/3672/", 
					"https://web.archive.org/web/20091027090853/http://www.geocities.com/Paris/2070/", 
					"https://web.archive.org/web/19991013171113/http://www.geocities.com:80/SoHo/4671/", 
					"https://web.archive.org/web/19991009092442/http://www.geocities.com:80/SunsetStrip/Stage/1347/", 
					"https://web.archive.org/web/20091026233539/http://geocities.com/Vienna/Choir/4798/", 
					"https://web.archive.org/web/20020215213739/http://www.geocities.com:80/Tokyo/1388/cutlet-spicy.html", 
					"https://web.archive.org/web/20010723075142/http://www.geocities.com:80/SoHo/Lofts/6832/", 
					"https://web.archive.org/web/20000302062255/http://www.geocities.com:80/WestHollywood/Parade/6200/menu.html", 
					"https://web.archive.org/web/20020409095925/http://geocities.com/collegepark/1003/", 
					"https://web.archive.org/web/20091027012806/http://geocities.com/Pentagon/Bunker/5770/", 
					"https://web.archive.org/web/20020205175637/http://www.geocities.com:80/SunsetStrip/Theater/5781/", 
					"https://web.archive.org/web/20030220103724/http://www.geocities.com:80/SiliconValley/Station/1907/", 
					"https://web.archive.org/web/20011008034511/http://www.geocities.com:80/Area51/Dimension/2133/", 
					"https://web.archive.org/web/20091027063814/http://geocities.com/Eureka/Vault/4817/", 
					"https://web.archive.org/web/20091027053624/http://geocities.com/CapitolHill/3859/", 
					"https://web.archive.org/web/20090902161235/http://geocities.com/Area51/Portal/7298/", 
					"https://web.archive.org/web/20091027132616/http://geocities.com/SouthBeach/Tidepool/9111/", 
					"https://web.archive.org/web/20010424091242/http://www.geocities.com:80/SouthBeach/Docks/3921/",
					"http://www.wonder-tonic.com/geocitiesizer/content.php?theme=3&music=1&url=vzug.com",
					"https://web.archive.org/web/20000521004911/http://www.geocities.com:80/Area51/Dimension/1401/titanic.html", 
					"https://web.archive.org/web/19991001174757/http://www.geocities.com:80/Area51/Shire/", 
					"https://web.archive.org/web/20091027054144/http://geocities.com/Baja/Desert/4220/", 
					"https://web.archive.org/web/20091026234243/http://geocities.com/RodeoDrive/2366/", 
					"https://web.archive.org/web/20011004205041/http://www.geocities.com:80/Heartland/Farm/8123/NativeAmerican.html", 
					"https://web.archive.org/web/20010331021727/http://geocities.com/collegepark/gym/9229/drugtest.html", 
					"https://web.archive.org/web/20091027045453/http://geocities.com/wonggea/", 
					"https://web.archive.org/web/20091027113447/http://www.geocities.com/RainForest/3159/", 
					"https://web.archive.org/web/20021130044226/http://www.geocities.com:80/Hollywood/Heights/1640/", 
					"https://web.archive.org/web/20010517213934/http://www.geocities.com:80/hollywood/studio/7770/", 
					"https://web.archive.org/web/20010721205641/http://www.geocities.com:80/SoHo/Cafe/8054/", 
					"https://web.archive.org/web/20091027060355/http://geocities.com/WestHollywood/Chelsea/7899/", 
					"https://web.archive.org/web/20010724033129/http://www.geocities.com:80/EnchantedForest/Meadow/2400/", 
					"https://web.archive.org/web/20091027070555/http://geocities.com/EnchantedForest/Dell/1330/", 
					"https://web.archive.org/web/20021118151407/http://www.geocities.com:80/Heartland/6459/dinoicons.html", 
					"https://web.archive.org/web/20011117070504/http://www.geocities.com:80/Heartland/Pointe/3538/foal.html", 
					"https://web.archive.org/web/20011128104238/http://www.geocities.com:80/Heartland/5442/", 
					"https://web.archive.org/web/20030227190003/http://www.geocities.com:80/RainForest/5224/awareness.htm", 
					"https://web.archive.org/web/20090821210334/http://geocities.com/SunsetStrip/Garage/4229/", 
					"https://web.archive.org/web/20091027083023/http://geocities.com/Area51/Labyrinth/1423/", 
					"https://web.archive.org/web/20091027082610/http://geocities.com/TelevisionCity/Stage/7808/", 
					"https://web.archive.org/web/20010421202730/http://geocities.com/rainforest/5326/index2.html", 
					"https://web.archive.org/web/20091027034727/http://geocities.com/CollegePark/2828/", 
					"https://web.archive.org/web/20091027073013/http://geocities.com/Colosseum/Dugout/2048/", 
					"https://web.archive.org/web/20010906171329/http://www.geocities.com:80/rainforest/2306/", 
					"https://web.archive.org/web/20010424022023/http://geocities.com/soho/2825/", 
					"https://web.archive.org/web/20091027081620/http://geocities.com/CapeCanaveral/Cockpit/2211/"
				];

				browser.source = links[Math.floor(links.length * Math.random())];
			}
		}
	]);
	box.add(nav);

	const address = ui.Menu([{
			text: "Address"
		},
		{
			input: addressBar,
			width: "100%"
		},
		{
			text: "Go",
			icon: "c/windows/migrosoft/ie/go.png",
			click() {
				browser.source = addressBar.value;
			}
		}
	]);
	box.add(address);

	const bookmarks = ui.Menu([{
			text: "Links"
		},
		...config.ie.bookmarks.map(bm => ({
			text: bm.title,
			click() {
				browser.source = bm.url;
			},
			icon: "c/windows/migrosoft/ie/page.png"
		}))
	]);
	box.add(bookmarks);

	const bottomBar = ui.InfoBar([{
			text: "Done",
			width: "100%"
		},
		{
			text: "My Computer"
		},
		{
			text: "Connecting..."
		}
	]);
	grid[2][0].add(bottomBar);

	browser.onstatechange.subscribe(state => {
		bottomBar[0].text = state;
	});

	// update address bar
	browser.onurlchange.subscribe((url, cangoback, cangoforward) => {
		addressBar.value = url;

		if (cangoback) {
			nav[0].enable();
		} else {
			nav[0].disable();
		}

		if (cangoforward) {
			nav[1].enable();
		} else {
			nav[1].disable();
		}
	});

	nav[0].disable();
	nav[1].disable();

	// try to update proxy info
	const tryConnect = () => {
		if (browser.http.node) {
			bottomBar[2].text = "Connected to Proxy: " + browser.http.node.address;
		} else {
			setTimeout(tryConnect, 1);
		}
	};

	tryConnect();

	grid[1][0].add(browser);
});