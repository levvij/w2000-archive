<?php

function title() {
	return "Updating...";
}

function render() {
	$id = $_GET["issue-set-state"];
	
	issue_update_state($id);

	redirect("?issue=$id");
}

?>