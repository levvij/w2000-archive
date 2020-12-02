<?php

function title() {
	return "New Task";
}

function render() {
	global $issues;
	global $todos;
	global $last_version;
	global $todo_states;
	
	$issuer = isset($_GET["todo-item-new-issue"]) ? $_GET["todo-item-new-issue"] : "";
	
	?>
	
		<form action="todo.php" method="post">
			<label>Title</label>
			<input name="title">
			
			<label>Description</label>
			<textarea name="text"></textarea>
			
			<label>Area (ui, ...)</label>
			<input name="area">
			
			<label>Priority</label>
			<select name="priority" placeholder="Priority">
				<?php
	for ($i = 0; $i < 10; $i++) {
	?>
				<option value="<?= $i ?>"><?= str_repeat("!", $i) ?></option>
				<?php
	}
	?>
			</select>
			
			<label>Issue</label>
			<select name="from">
				<option value="">None</option>
				
				<?php
	foreach ($issues as $issue) {
?>
				<option <?= $issuer == $issue->id ? "selected" : "" ?> value="<?= $issue->id ?>"><?= $issue->name ?></option>
				<?php
	}
?>
			</select>
			
			<label>Requires Completion of</label>
			<select name="after">
				<option value="">None</option>
				
				<?php
	
	foreach ($todos as $todo) {
		if (isset($todo->release) ? !$todo->release : true) {
?>
				<option value="<?= $todo->id ?>"><?= $todo->title ?> (<?= $todo_states[$todo->state] ?>, <?= isset($todo->version) && $todo->version ? version_format($todo->version) : "No version planned" ?>)</option>
				<?php
		}
	}
?>
			</select>
			
			<label>Planned release (Current version: <?= version_format($last_version) ?>)</label>
			<input name="version" placeholder="">
			
			<input button type="submit" value="Create" />
		</form>
		
		<?php
}

?>