<?php

require("../api.php");

function call() {
	return file_get_contents("../../../../win-beta/fs/c/windows/ime/gen/version.prop");
}

?>