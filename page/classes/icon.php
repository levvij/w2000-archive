<?php

function icon($name, $size, $fallback = null) {
	$quality = 0;
	
	if ($fallback) {
		if (!file_exists("icons/$name/$size/$quality.png")) {
			return icon($fallback, $size);
		}
	}
	
	return "icons/$name/$size/$quality.png";
}

?>