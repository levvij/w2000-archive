<?php

require("page/classes/snapshots.php");

function title() {
	return "Booting...";
}

function render() {
	global $last_version;
	global $last_snapshot;
	
	switch ($_GET["dynboot"]) {
		case "latest-release": {
			redirect("https://dotcdn.us/win-versions/v$last_version/boot/");
			
			break;
		}
		case "latest-snapshot": {
			redirect($last_snapshot->bootpath);
			
			break;
		}
		default: {
			echo "Unknown dynboot";
		}
	}
}

?>