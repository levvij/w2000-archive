<?php

	// enable error reporting
	error_reporting(E_ALL);
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);

	$ray = [[
		"name" => "c",
		"source" => "c",
		"type" => "p",
		"size" => 0,
		"ctime" => 0,
		"mtime" => 0,
		"mime" => ""
	]];
	$total = 0;

	function search($p) {
		global $ray;
		global $total;
		
		foreach (scandir($p) as $f) {
			if ($f[0] != ".") {
				$d = is_dir("$p/$f");
				$ext = pathinfo("$p/$f", PATHINFO_EXTENSION);
				$path = "$p/$f";
				
				if (!$d && $ext === "js") {
					$path = str_replace(".js", "", $path);
				}
				
				$info = [
					"name" => $path,
					"source" => "fs/$p/$f",
					"type" => $d ? "d" : "f",
					"size" => filesize("$p/$f"),
					"ctime" => filectime("$p/$f"),
					"mtime" => filemtime("$p/$f"),
					"mime" => mime_content_type("$p/$f")
				];
				
				if ($ext === "lnk") {
					$lines = explode("\n", file_get_contents("$p/$f"));
					
					$info["link"] = [
						"path" => trim(@$lines[0]),
						"title" => trim(@$lines[1]),
						"icon" => trim(@$lines[2]),
					];
				}
				
				array_push($ray, $info);
				
				if ($d) {
					search("$p/$f");
				}
			}
		}
	}

	// search whole fs and output it
	search("c");

	echo json_encode($ray);

?>