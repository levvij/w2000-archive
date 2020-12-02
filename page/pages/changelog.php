<?php

function title() {
	return "Changelog";
}

function render() {
	global $versions;
	
	$text = file_get_contents("../win-beta/changes");

	foreach ($versions as $version) {
		$text = str_replace("version $version\n", "<changelog-item>Version <a href='?version=$version'>" . version_format($version) . "</a> (" . version_builddate($version) . ")</changelog-item>", $text);
	}
?>
		
		<changelog><?=$text?></changelog>
		
	<?php
}

?>