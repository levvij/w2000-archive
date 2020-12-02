<?php

$roots = [];

foreach (array_reverse(scandir("../win-roots")) as $root) {
	if ($root[0] != "." && is_dir("../win-roots/$root") && $root != "undefined") {
		$info = json_decode(file_get_contents("../win-roots/$root/info.json"));
		$info->id = $root;
		
		array_push($roots, $info);
	}
}

function root_get($id) {
	foreach (scandir("../win-roots") as $root) {
		if ($root[0] != "." && is_dir("../win-roots/$root") && $root == $_GET["root"]) {
			$info = json_decode(file_get_contents("../win-roots/$root/info.json"));
			$info->id = $root;
			
			return $info;
		}
	}
}

?>