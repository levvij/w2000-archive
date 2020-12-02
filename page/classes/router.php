<?php

$route_params = array_keys($_GET);
array_push($route_params, "index");
$route_found = false;

$routes = scandir("page/pages");

foreach ($route_params as $get) {
	if (!$route_found && in_array("$get.php", $routes)) {
		require("page/pages/$get.php");
		
		$route_found = true;
	}
}

?>