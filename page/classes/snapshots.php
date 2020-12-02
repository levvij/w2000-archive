<?php

$snapshots = [];

foreach (scandir("../win-snapshots/versions/") as $version) {
	if ($version[0] == "v") {
		foreach (scandir("../win-snapshots/versions/$version") as $snapshot) {
			if ($snapshot[0] != ".") {
				array_push($snapshots, json_decode(json_encode([
					"version" => str_replace("v", "", $version),
					"snapshot" => $snapshot,
					"bootpath" => "https://dotcdn.us/win-snapshots/versions/$version/$snapshot/"
				])));
			}
		}
	}
}

$last_snapshot = end($snapshots);

?>