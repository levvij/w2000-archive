<?php

	$id = md5(uniqid());
	
	$title = htmlspecialchars($_POST["title"]);
	$text = htmlspecialchars($_POST["text"]);
	$area = htmlspecialchars($_POST["area"]);
	$from = htmlspecialchars($_POST["from"]);
	$after = htmlspecialchars($_POST["after"]);
	$version = htmlspecialchars($_POST["version"]);
	$priority = htmlspecialchars($_POST["priority"]);

	$todos = json_decode(file_get_contents("todo.json"));

	array_push($todos, [
		"id" => $id,
		"title" => $title,
		"text" => $text,
		"area" => $area,
		"from" => $from,
		"after" => $after,
		"version" => $version,
		"state" => 0,
		"priority" => $priority
	]);
	
	file_put_contents("todo.json", json_encode($todos));
	
	header("Location: ./?todo-item=$id");

?>