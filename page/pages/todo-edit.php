<?php

function title() {
	return "Edit Task";
}

function render() {
	$todo = todo_get($_GET["todo-edit"]);
	
	if ($todo) {
	?>

	<form action="." method="get">
			<input type="hidden" name="todo-item-update" value="<?= $todo->id ?>" />
			
			<label>Planned release version</label>
			<input name="todo-item-set-version" value="<?= $todo->version ?>" placeholder="Version">
			
			<select name="todo-item-set-priority" placeholder="Priority">
				<?php
		for ($i = 0; $i < 10; $i++) {
	?>
				<option <?= $todo->priority == $i ? "selected" : "" ?> value="<?= $i ?>"><?= str_repeat("!", $i) ?></option>
				<?php
		}
	?>
			</select>
			
			<input button type="submit" value="Save" />
		</form>
<?php
	} else {
		?>

	<box>
		Issue not found
	</box>

<?php
		
	}
}

?>