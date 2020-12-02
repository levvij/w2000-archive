<?php

require("page/classes/nogap.php");

function title() {
	return "Nogap Client";
}

function render() {
	$info = nogap_stats();
	
	if ($info) {
		$info = json_decode($info);
		$found = false;
		
		foreach ($info->clients as $client) {
			$client = htmlentities($client);
			
			if ($client == $_GET["nogap-client"]) {
				$found = true;
		?>
		
		<h1>
			<?= $client ?> - NoGAP
		</h1>
		
		<script src="https://nogap.dotcdn.us/lib/ng.js"></script>
		
		<box>
			<section>
				<alert>
					<key-value>
						<key>Version</key>
						<value version>Fetching...</value>
					</key-value>

					<key-value>
						<key>Host (Agent)</key>
						<value host>Fetching...</value>
					</key-value>
				</alert>
			</section>
			
			<h2>
				Servers
			</h2>
			
			<row row></row>

			<script>

				const container = document.currentScript.parentElement;
				const clientId = <?= json_encode($client) ?>;
				
				function vvv(s) {
					return [...s.split("."), ...Array(16).fill("0")].slice(0, 16).map(v => v.padStart(8, 0)).join(".");
				}

				(async () => {

					const ng = await NoGap();
					const client = ng.Client(clientId);

					const version = (await client.request(0, "/version")).data;
					container.querySelector("[version]").textContent = version;
					
					if (vvv(version) >= vvv("1.0.2.0")) {
						const host = (await client.request(0, "/host")).data;
						container.querySelector("[host]").textContent = host;
					} else {
						container.querySelector("[host]").textContent = "Host requires nogap 1.0.2.0 or newer";
					}
					
					const servers = (await client.request(0, "/servers")).data;
					for (let server of servers) {
						const col = document.createElement("col-2");
						container.querySelector("[row]").appendChild(col);
						
						const card = document.createElement("card");
						col.appendChild(card);
						
						const cardBody = document.createElement("card-body");
						card.appendChild(cardBody);
						
						const title = document.createElement("card-title");
						title.textContent = server.port ? server.name : "* Meta Server";
						cardBody.appendChild(title);
						
						const text = document.createElement("card-text");
						text.textContent = "Server running on port " + server.port;
						cardBody.appendChild(text);
						
						const list = document.createElement("card-list");
						card.appendChild(list);
						
						const link = document.createElement("a");
						link.href = "/win-beta?+!/win-roots/dev&*[\"nttp://" + clientId + ":" + server.port + "\"]";
						link.textContent = "Open in W2000 IE";
						list.appendChild(link);
					}

				})();

			</script>
		</box>
		
		<?php
			}
		}
		
		if (!$found) {
			?>
		
	<alert>
		Client '<?= htmlentities($client) ?>' is currently not online on <a href="<?= $nogap ?>/stats"><?= $nogap ?></a>
	</alert>
		
		<?php
		}
	} else {
		?>
		
	<alert>
		NoGap is currently not available (<a href="<?= $nogap ?>/stats"><?= $nogap ?></a>)
	</alert>
		
		<?php
	}
}

?>