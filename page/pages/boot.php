<?php

require("page/classes/bundles.php");

function title() {
	return "Boot";
}

function render() {
	$programs = version_programs("../win-beta/fs/");
	
	?>

<row>
	<col-4>
		<iframe boot src="/win-beta/?!/win-roots/dev">
			
		</iframe>
		
		<hr />
		
		<button button onclick="bridge.restart()">
			<i class="la la-power-off"></i> Restart
		</button>
		
		<hr />
		
		<?php
	
	foreach ($programs as $program) {
		
		?>
		
		<button button thin onclick="bridge.loadApplication('<?= htmlspecialchars("$program->path/$program->file", ENT_QUOTES) ?>')">
			<img pixelated src="<?= icon($program->icon, 16) ?>" />
			
			<?= $program->name ?>
		</button>
		
		<?php
		
	}
	
		?>
	</col-4>
	
	<col-2>
		<script src="page/assets/bridge.js"></script>
		<script>
		
			const bridge = new Bridge(document.querySelector("iframe[boot]"));
			
		</script>
	</col-2>
</row>

<?php

}

?>