<?php

function title() {
	return "Todo";
}

function render() {
	global $todos;
	
	?>
		
	<section>
		<a button href="?todo-item-new">
			<i class="la la-plus"></i> New Task
		</a>
	</section>

	<h1>
		Todo
	</h1>
			
	<row>
		<col-2>
			<h2>
				Due
			</h2>
					
					<?php
	foreach ($todos as $t) {
		if ($t->state == 0) {
			render_todo($t);
		}
	}
?>
		</col-2>

		<col-2>
			<h2>
				In Progress
			</h2>
					
					<?php
	foreach ($todos as $t) {
		if ($t->state == 1) {
			render_todo($t);
		}
	}
?>
					
			<h2>
				Ready for Release
			</h2>
					
					<?php
	foreach ($todos as $t) {
		if ($t->state == 2) {
			render_todo($t);
		}
	}
?>
		</col-2>

		<col-2>
			<h2>
				Done
			</h2>
					
					<?php
	foreach ($todos as $t) {
		if ($t->state == 3) {
			render_todo($t);
		}
	}
?>
		</col-2>
	</row>
			
<?php
}

?>