<?php

function title() {
	return "Icon";
}

function render() {
	$cs = explode("/", $_GET["icon"]);
	$module = $cs[0];
	$icon = $cs[1];
	
	$sizes = array_slice(scandir("icons/$module/$icon"), 2);
	
	?>
		<h1 class="mt-2">
			<?=$module?> / <?=$icon?>
		</h1>

		<code>
			await Icon.fromModule("<?= $module ?>", <?= $icon ?>);
		</code>
		
		<row no-wrap>
			<col-1></col-1>
			
			<?php
		
	foreach (scandir("icons/$module/$icon/" . $sizes[0]) as $quality) {
		if ($quality[0] != ".") {
			?>
			
			<col-auto head><?=explode(".", $quality)[0]?></col-auto>
			
			<?php
		}
	}
			
			?>
		</row>
			
		<?php
	foreach ($sizes as $size) {
	?>
		<row no-wrap>
			<col-1 head><?=$size?>x<?=$size?></col-1>
		<?php
		foreach (scandir("icons/$module/$icon/$size") as $quality) {
			if ($quality[0] != ".") {
		?>
			<col-auto>
				<img src="<?="icons/$module/$icon/$size/$quality"?>" />
			</col-auto>
		<?php
			}
		}
		?>
		</row>
		<?php
	}
}

?>