<?php

$todos = [];
$todo_states = ["Todo", "In Progress", "Ready for Release", "Done"];

foreach (json_decode(file_get_contents("todo.json")) as $todo) {
	if ($todo->title) {
		array_push($todos, $todo);
	}
}

usort($todos, function ($a, $b) { 
	return $a->priority < $b->priority;
});

function todo_get($id) {
	global $todos;
	
	foreach ($todos as $todo) {
		if ($todo->id == $id && $todo->title) {
			return $todo;
		}
	}
}

function todo_save() {
	global $todos;
	
	file_put_contents("todo-history/todo" . uniqid() . ".json", json_encode($todos));
	file_put_contents("todo.json", json_encode($todos));
}

function todo_update($id) {
	global $last_version;
	
	$todo = todo_get($id);
	
	if ($todo) {
		if (isset($_GET["todo-item-set-state"])) {
			$todo->state = $_GET["todo-item-set-state"];

			if ($todo->state == 3) {
				$todo->release = $last_version;
			} else {
				$todo->release = null;
			}
		}

		if (isset($_GET["todo-item-set-version"]))
		{
			$todo->version = $_GET["todo-item-set-version"];
		}

		if (isset($_GET["todo-item-set-priority"]))
		{
			$todo->priority = $_GET["todo-item-set-priority"];
		}
		
		todo_save();
	}
}

?>