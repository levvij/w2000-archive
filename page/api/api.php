<?php

header("Content-Type: application/json");

chdir(__DIR__ . "/../..");
require("page/classes/versions.php");

echo json_encode(call());

?>