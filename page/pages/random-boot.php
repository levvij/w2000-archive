<?php

function title() {
	return "Booting...";
}

function render() {
	global $versions;
	
	$vs = [];
	
	foreach ($versions as $v) {
		if (version_successful($v)) {
			array_push($vs, $v);
		}
	}
	
	shuffle($vs);
	
	redirect("https://dotcdn.us/win-versions/v" . $vs[0] . "/boot/");
}

?>