<?php

function title() {
	return "Updating...";
}

function render() {
	$id = $_GET["todo-item-update"];
	
	todo_update($id);
	
	redirect("?todo-item=$id");
}

?>