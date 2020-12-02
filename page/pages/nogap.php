<?php

require("page/classes/nogap.php");

function title() {
	return "NoGap";
}

function render() {
	$info = nogap_stats();
	
	if ($info) {
		$info = json_decode($info);
		
		?>
		
		<h1>
			NoGAP
		</h1>
		
		<p>
			Version <?= htmlentities($info->version) ?> is running at <a href="<?= nogap_stats_url() ?>"><?= nogap_server() ?></a>.
		</p>
		
		<tree>
		<?php
			
			foreach ($info->clients as $client) {
			
			?>
		
		<tree-item client="<?= htmlentities($client) ?>">
			<a href="?nogap-client=<?= htmlentities($client) ?>">
				<?= htmlentities($client) ?>
			</a>
			
			<script>
			
				if (document.currentScript.parentElement.getAttribute("client") == localStorage._cypp) {
					document.currentScript.parentElement.remove();
				}
				
			</script>
		</tree-item>
		
		<?php
				
			}
			
			?>
		</tree>
		<?php
	} else {
		?>
		
	<alert>
		NoGap is currently not available (<a href="<?= nogap_stats_url() ?>"><?= nogap_server() ?></a>)
	</alert>
		
		<?php
	}
}

?>