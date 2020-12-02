<?php

function version_libraries_supported($v) {
	global $PROGRAM_FORMAT_VERSION;
	
	return version_cmp($v) >= version_cmp($PROGRAM_FORMAT_VERSION);
}

function version_libraries($p, $lp = "") {
	$ps = [];

	foreach (scandir($p) as $f) {
		if ($f[0] != ".") {
			if (is_dir("$p/$f")) {
				if (pathinfo("$p/$f", PATHINFO_EXTENSION) == "dll") {
					$meta = json_decode(file_get_contents("$p/$f/meta.json"));

					array_push($ps, json_decode(json_encode([
						"file" => $f,
						"name" => $meta->name,
						"version" => $meta->version,
						"author" => $meta->author,
						"path" => "$lp"
					])));
					
					$ps = array_merge($ps, version_libraries("$p/$f", "$lp/$f"));
				} else {
					$ps = array_merge($ps, version_libraries("$p/$f", "$lp/$f"));
				}
			}
		}
	}
	
	usort($ps, function ($a, $b) {
		return strcmp($a->name, $b->name);
	});

	return $ps;
}

function version_beta_libraries() {
	return version_libraries("../win-beta/");
}

?>