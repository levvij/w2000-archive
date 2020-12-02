<?php

$versions = [];

foreach (scandir(".") as $version) {
	if ($version[0] == "v") {
		array_push($versions, str_replace("v", "", $version));
	}
}

$last_version = end($versions);

function version_successful($version) {
	if (!file_exists("v$version/release.zip")) {
		return false;
	}
	
	if (file_exists("v$version/tests.json")) {
		$tests = json_decode(file_get_contents("v$version/tests.json"));

		if ($tests) {
			foreach ($tests as $test) {
				if (!$test->success) {
					return false;
				}
			}
		}
	}
	
	return true;
}

function version_build_timestamp($version) {
	if (file_exists("v$version/boot/fs/c/windows/ime/gen/buildTime.prop")) {
		return file_get_contents("v$version/boot/fs/c/windows/ime/gen/buildTime.prop");
	}
	
	if (file_exists("v$version/boot/fs/c/windows/ime/gen/buildTime.js")) {
		return explode(")", explode("Date(", file_get_contents("v$version/boot/fs/c/windows/ime/gen/buildTime.js"))[1])[0];
	}
}

function version_builddate($version) {
	$stamp = version_build_timestamp($version);
	
	if ($stamp) {
		return format_date($stamp);
	}
	
	return "Unknown Builddate";
}

function format_date($stamp) {
	if ($stamp) {
		return date("d.m.Y h:i:s", intval($stamp) / 1000);
	} else {
		return "Unknown";
	}
}

function format_timespan($from, $to) {
	return @floor(($from - $to) / 86400000) . " days";
}

function version_changes($version, $tag = "li", $max = 0, $className = "") {
	global $versions;
	
	$i = 0;
	$lines = explode("\n\n", file_get_contents("../win-beta/changes"));
	
	$html = "";
	$found = false;
	
	foreach ($lines as $group) {
		$v = explode(" ", explode("\n", $group)[0])[1];
		
		if ($found && in_array($v, $versions)) {
			return $html . (($max && $i > $max) ? "<div><small>+" . ($i - $max) . " Change" . ($i - $max == 1 ? "" : "s") . "</small></div>" : "");
		} else {
			if ($v == $version) {
				$found = true;
			}
			
			if ($found) {
				foreach (array_slice(explode("\n", $group) , 1) as $line) {
					if (trim($line)) {
						if (!($max && $i >= $max))
						{
							$html .= "<$tag class='$className'>" . htmlentities(trim(str_replace("*", "", $line))) . ($v == $version ? "" : ($max ? "*" : "<sup>$v</sup>")) . "</$tag>";
						}
						
						$i++;
					}
				}
			}
		}
	}
}

function version_format($version) {
	return "v" . htmlentities($version);
}

function version_size($version) {
	if (file_exists("v$version/release.zip")) {
		return filesize("v$version/release.zip");
	}
}

function format_size($bytes, $precision = 1) {
	$units = ["B", "KB", "MB", "GB", "TB"]; 

    $bytes = max($bytes, 0); 
    $pow = floor(($bytes ? log($bytes) : 0) / log(1024)); 
    $pow = min($pow, count($units) - 1); 

    $bytes /= pow(1024, $pow);

    return round($bytes, $precision) . ' ' . $units[$pow]; 
}

function version_tests($version) {
	if (file_exists("v$version/tests.json")) {
		return json_decode(file_get_contents("v$version/tests.json"));
	}
}

function version_exists($version) {
	global $versions;
	
	return array_search($version, $versions);
}

function version_cmp($s) {
	$items = explode(".", $s);
	
	for ($i = count($items); $i < 16; $i++) {
		array_push($items, "");
	}
	
	for ($i = 0; $i < 16; $i++) {
		$items[$i] = str_pad($items[$i], 8, "0", STR_PAD_LEFT);
	}
	
	return join(".", $items);
}

function version_beta_version() {
	return file_get_contents("../win-beta/fs/c/windows/ime/gen/version.prop");
}

function version_after($version) {
	global $versions;
	
	$index = array_search($version, $versions);
	
	if ($index == count($versions) - 1) {
		return;
	}
	
	return $versions[$index + 1];
}

function version_before($version) {
	global $versions;
	
	$index = array_search($version, $versions);
	
	if (!$index) {
		return;
	}
	
	return $versions[$index - 1];
}

function version_successful_before($version) {
	global $versions;
	
	for ($i = array_search($version, $versions) - 1; $i > 0; $i--) {
		if (version_successful($versions[$i])) {
			return $versions[$i];
		}
	}
}

?>