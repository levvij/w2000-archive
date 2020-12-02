<?php

$instances = json_decode(json_encode([
	[
		"name" => "Productive",
		"bootpath" => "https://dotcdn.us/win/",
		"copyright" => "CC SA NP",
		"branch" => "master",
		"version" => "0.0.0"
	],
	[
		"name" => "Beta",
		"bootpath" => "https://dotcdn.us/win-beta/",
		"copyright" => "CC SA NP",
		"branch" => "master",
		"version" => version_beta_version()
	],[
		"name" => "Beta (Dev)",
		"bootpath" => "https://dotcdn.us/win-beta/?!/win-roots/dev",
		"copyright" => "CC SA NP",
		"branch" => "master",
		"version" => version_beta_version()
	],
	[
		"name" => "theOFFICE Webshop",
		"bootpath" => "https://theoffice2000.com/",
		"copyright" => "2019 theOFFICE",
		"branch" => "m152",
		"version" => "0.0.9.8"
	],
	[
		"name" => "theOFFICE Webshop (Next Version)",
		"bootpath" => "https://next.theoffice2000.com/",
		"copyright" => "2019 theOFFICE",
		"branch" => "m152",
		"version" => "0.0.9.8"
	],
	[
		"name" => "theOFFICE Webshop",
		"bootpath" => "https://dotcdn.us/win-to-m152",
		"copyright" => "2019 theOFFICE",
		"branch" => "m152",
		"version" => "0.0.9.8"
	],
	[
		"name" => "M152 Adaptation",
		"bootpath" => "http://m152.gibz-informatik.ch/sj18_19/infa3a/team06/",
		"copyright" => "2019 Levi Hechenberger, Grégoire Gedlek, Lars Attasi & GIBZ Zug",
		"branch" => "m152",
		"version" => "0.0.9.8"
	]
]));

?>