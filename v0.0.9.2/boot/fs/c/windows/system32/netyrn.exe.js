await DLL.load("c/windows/lib64/timer.dll");

const window = new Window("Netwatch", 650, 400);
window.onclose.subscribe(() => exit(Process.ExitCode.success));

let filter = arguments[0] || "";

const render = () => {
	window.title = "Netwatch" + (filter ? ": " + filter : "");
	
	let nodes = Networking.nodes;
	
	if (filter) {
		nodes = nodes.filter(n => n.id == filter || n.address == filter);
	}
	
	window.render(ui => {
		let timer;
		const view = ui.MenuView();
		const split = ui.SplitView();

		const showCommunication = text => {
			split.content.clear();

			const scroll = ui.Scroll();
			split.content.add(scroll);

			const pre = ui.FixedText(text);
			pre.selectable = true;
			scroll.add(pre);
		};

		split.navigation.add(ui.TreeView(nodes.map(node => ({
			title: "Node " + node.id + " (" + node.address + ")",
			items: [
				{
					title: "General",
					select() {
						timer = new Timer(() => {
							showCommunication(
								"Node " + node.id + "\n\n" + 
								"Proxy Address: " + node.address + "\n" + 
								"Connections: \n" +
								"  Active: " + node.communications.filter(c => !c.completed).length + "\n" +
								"  Completed: " + node.communications.filter(c => c.completed).length + "\n" +
								"  Total: " + node.communications.length + "\n\n" +
								"Data volume: \n" +
								"  Sent: " + node.communications.reduce((a, i) => a + (i.request || "").length, 0) + " bytes\n" +
								"  Received: " + node.communications.reduce((a, i) => a + (i.response || "").length, 0) + " bytes"
							);
						}, 10);
					},
					deselect() {
						if (timer) {
							timer.stop();
						}
					}
				},
				...node.communications.map(com => ({
					title: com.identification + " (" + com.address + ":" + com.port + ")",
					items: [{
							title: "General",
							select() {
								let text = "Address: " + com.address + "\n" +
									"Port: " + com.port + "\n" +
									"SSL: " + com.ssl

								showCommunication(text + "\n\nGetting DNS information...");

								Networking.dns.getAddress(com.address).then(ip => {
									showCommunication(text + "\n\nDNS Resolve: " + ip);
								});
							}
						},
						{
							title: "Timing",
							disabled: !com.completed,
							select() {
								showCommunication(
									"Start: " + com.start + "\n" +
									"End: " + com.end + "\n" +
									"Time: " + (com.end - com.start) + "ms"
								);
							}
						},
						{
							title: "Request",
							select() {
								showCommunication(com.request);
							}
						},
						{
							title: "Response",
							select() {
								showCommunication(com.response);
							}
						}
					]
				}))
			]
		}))));
		
		view.menus.add(ui.Menu([
			{
				text: "New Node",
				click() {
					Networking.proxy.createNode().then(node => {
						render();
					});
				}
			}, 
			{
				text: "Refresh",
				click() {
					render();
				}
			}
		]));
		
		const filterInput = ui.TextBox(filter);
		view.menus.add(ui.Menu([
			{
				text: "Filter"
			},
			{
				input: filterInput,
				width: "100%"
			},
			{
				text: "Filter",
				icon: "c/windows/migrosoft/ie/go.png",
				click() {
					filter = filterInput.value;
					render();
				}
			}
		]));
		
		view.content.add(split);
		ui.root.add(view);
	});
};

render();