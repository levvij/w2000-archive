<?php

function title() {
	return "Task";
}

function render() {
	global $todo_states;
	global $todos;
	
	$todo = todo_get($_GET["todo-item"]);
	
	if ($todo) {
?>
<small>
	<?=$todo->area?>
	<span right style="font-weight:<?=$todo->priority?>00"><?= str_repeat("!", $todo->priority) ?></span>

	<box>
		<b><?= $todo_states[$todo->state] ?></b>
	<?php

		if ($todo->state) {

	?>

	<a href="?todo-item-update=<?= $todo->id ?>&todo-item-set-state=<?= $todo->state - 1 ?>">
		Mark as <?= $todo_states[$todo->state - 1] ?>
	</a>

	<?php

		}

		if ($todo->state != count($todo_states) - 1) {

	?>

	<a href="?todo-item-update=<?= $todo->id ?>&todo-item-set-state=<?= $todo->state + 1 ?>">
		Mark as <?= $todo_states[$todo->state + 1] ?>
	</a>

	<?php

		}

	?>

		<a href="?todo-edit=<?= $todo->id ?>">Edit</a>

	</box>
</small>

<h1>
	<?= $todo->title ?>
</h1>

<p>
	<?= $todo->text ?>
</p>

<?php
		if (isset($todo->release) && $todo->release) {
?>

<h3>
	Release <a href="?version=<?= $todo->release ?>"><?= version_format($todo->release) ?></a>
</h3>
<box>
	<p>
		The todo was planned for 
		<a href="?version=<?= $todo->version ?>">
			<?= version_format($todo->version) ?>
		</a> and included in the <a href="?version=<?= $todo->release ?>">
			<?= version_format($todo->release) ?>
		</a> release
	</p>

	<a button href="v<?= $todo->release ?>/boot">
		<i class="la la-power-off"></i> Boot
	</a>
	<a button href="?diff=<?= $todo->release ?>">
		<i class="la la-clone"></i> Compare
	</a>
</box>

<?php
		} else {
?>

<h3>
	Planned Release
</h3>

<p>
	This feature is planned to release in <?= version_format($todo->version) ?>
</p>

<?php
}

		if (isset($todo->from) && $todo->from) {
			$issue = issue_get($todo->from);

			if ($issue) {
		?>

<h3>
	Issue
</h3>

<p>
	This feature originated from <a href="?issue=<?= $issue->id ?>"><?= $issue->name ?></a>.
</p>

<?php
			}
		}

		if (isset($todo->after) && $todo->after) {
			$t = todo_get($todo->after);

			if ($t) {
		?>

<h3>
	Todo Requirement
</h3>

<p>
	Requires <a href="?todo-item=<?= $t->id ?>"><?= $t->title ?></a> to be done
</p>

<?php
			}
		}
	
		
		$afters = [];

		foreach ($todos as $t) {
			if (isset($t->after) && $t->after == $todo->id) {
				array_push($afters, $t);
			}
		}

		if (count($afters)) {
		?>

<h3>
	Dependent Tasks
</h3>

<p>
	<?php
		
			foreach ($afters as $a) {
			?>
	
	<a href="?todo-item=<?= $a->id ?>">
		<?= $a->title ?>
	</a>
	
	<?php
				
				if (end($afters) != $a) {
					echo ",";
				}
			}
		
			if (count($afters) == 1) {
				echo "requires";
			} else {
				echo "all require";
			}
			
		?> this task to be completed. 
	
	
</p>
	<?php
		}
	}
}

?>