<?php

$bundles = [];

foreach (scandir("../win-bundles") as $bundle) {
	if ($bundle[0] != "." && file_exists("../win-bundles/$bundle/release.zip")) {
		array_push($bundles, $bundle);
	}
}

function bundle_size($bundle) {
	return filesize("../win-bundles/$bundle/release.zip");
}

function bundle_iquery($bundle) {
	if (file_exists("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/iquery.prop")) {
		return file_get_contents("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/iquery.prop");
	}
	
	if (file_exists("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/iquery.js")) {
		return substr(trim(explode("config.injectedQuery = '", file_get_contents("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/iquery.js"))[1]), 0, -2);
	}
	
	return "";
}

function bundle_version($bundle) {
	if (file_exists("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/version.prop")) {
		return file_get_contents("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/version.prop");
	}
	
	if (file_exists("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/version.js")) {
		return substr(trim(explode("config.version = '", file_get_contents("../win-bundles/$bundle/boot/fs/c/windows/ime/gen/version.js"))[1]), 0, -2);
	}
	
	return "-1";
}

?>