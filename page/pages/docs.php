<?php

function title() {
	return "Docs";
}

function render() {
	global $PRODUCT_NAME;
	
	$path = $_GET["docs"];
	
	if (strpos($path, "..") !== false) {
		die("Illegal Path");
	}
	
	$fpath = "../win-docs/$path";
	
	if (!file_exists($fpath)) {
		die("Documentation page not found");
	}
	
	$html = file_exists("$fpath/index.html") ? file_get_contents("$fpath/index.html") : file_get_contents("$fpath");
	$html = str_replace("%pn%", $PRODUCT_NAME, $html);
	
	$parts = [
		explode("href=\"", $html)[0]
	];
	
	foreach (array_slice(explode("href=\"", $html), 1) as $block) {
		$cs = explode("\"", $block);
		$link = $cs[0];
		
		if (strpos($cs[0], "http://") === false && strpos($cs[0], "https://") === false) {
			$link = "?docs=$link";
		}
		
		array_push($parts, "$link\"" .  join("\"", array_slice($cs, 1)));
	}
	
	$html = join("href=\"", $parts);
	
	$parts = [
		explode("<pre", $html)[0]
	];
	
	foreach (array_slice(explode("<pre", $html), 1) as $block) {
		$cs = explode("</pre>", $block);
		$ds = explode(">", $cs[0]);
		
		$before = $ds[0];
		$content = join(">", array_slice($ds, 1));
		$after = $cs[1];
		
		$spacing = strlen(@end(explode("\n", end($parts))));
		
		$lines = [];
		foreach (explode("\n", $content) as $line) {
			array_push($lines, substr($line, $spacing));
		}
		
		array_push($parts, "$before>" . trim(join("\n", $lines)) . "</pre>" . $after);
	}
	
	$html = join("<pre", $parts);
	
	?> 

	<link rel="stylesheet" href="page/assets/docs.css?v=<?= rand(0, 10000) ?>" />

	<doc>
		<?= $html ?>
	</doc>
	
	<?php
}

?>