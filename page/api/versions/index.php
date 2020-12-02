<?php

require("../api.php");

function call() {
	global $versions;
	
	$items = [];
	
	foreach ($versions as $version) {
		array_push($items, [
			"id" => $version,
			"version" => version_format($version),
			"successful" => version_successful($version),
			"timestamp" => intval(version_build_timestamp($version))
		]);
	}
	
	return $items;
}

?>