<?php

function title() {
	return "Icons";
}

function render() {
	$modules = [];
	
	foreach (scandir("icons") as $module) {
		if ($module[0] != ".") {
			array_push($modules, [
				"name" => $module,
				"icons" => scandir("icons/$module")
			]);
		}
	}
	
	usort($modules, function ($item1, $item2) {
    	return count($item2["icons"]) <=> count($item1["icons"]);
	});
	
	?>
<h1 class="mt-2">
	Windows Icons
</h1>

<p>
	These icons were extracted from the Windows 2000 WINNT/system32 folder. Every icon is available in multiple sizes and qualities.
	
	<a href="?all-icons">
		<i class="la la-th"></i> View all Icons (Grid View)
	</a>
</p>

<row>
	<?php
	
	foreach ($modules as $module) {
		
		?>
	<col-1>
		<card>
			<img m card-img pixelated src="icons/<?=$module["name"] . "/" . $module["icons"][2] . "/" . @end(scandir("icons/" . $module["name"] . "/" . $module["icons"][2])) . "/0.png"?>" />

			<card-body>
				<card-title>
					<?=$module["name"]?>
				</card-title>
				<card-text>
					<?=count($module["icons"]) - 2?> icons
				</card-text>
			</card-body>

			<card-list>
				<a href="?icon-module=<?=$module["name"]?>">
					<i class="la la-ellipsis-h"></i> Explore Module
				</a>
			</card-list>
		</card>
	</col-1>

		<?php
	}
	?>
</row>
	<?php
}

?>