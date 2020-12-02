<?php

function title() {
	return "Icon Module";
}

function render() {
	$module = $_GET["icon-module"];
	
	?>
		<h1>
			<?=$module?>
		</h1>

		<row>
			<?php

	foreach (scandir("icons/$module") as $icon) {
		if ($icon[0] != ".") {
	?>
			<col-1>
				<card>
					<img m card-img pixelated src="icons/<?="$module/$icon/" . @end(scandir("icons/$module/$icon")) . "/0.png"?>" />

					<card-body>
						<card-title>
							<?=$icon?>
						</card-title>
						<card-text>
							<?=count(scandir("icons/$module/$icon")) - 2?> Sizes, <?= count(scandir("icons/$module/$icon/" . scandir("icons/$module/$icon")[2])) - 2 ?> Quality Levels
						</card-text>
					</card-body>

					<card-list>
						<a href="?icon=<?="$module/$icon"?>">
							<i class="la la-ellipsis-h"></i> View Icon
						</a>
					</card-list>
				</card>
			</col-1>
	<?php
		}
	}

		?>
		</row>
	<?php
}

?>