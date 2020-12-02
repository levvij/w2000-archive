<?php

function title() {
	return "Issues";
}

function render() {
	global $issues;
	
	?>
	
	<section>
		<a button href="?new-issue">
			<i class="la la-plus"></i> New Issue
		</a>
	</section>

	<h2>
		Open
	</h2>

	<row>
	<?php
	
	foreach ($issues as $issue) {
		if (isset($issue->done) ? $issue->done : true) {
			render_issue($issue);
		}
	}
	
	?>
	</row>

	<h2>
		Done
	</h2>

	<row>
		<?php
	
	foreach ($issues as $issue) {
		if (isset($issue->done) && $issue->done) {
			render_issue($issue);
		}
	}
	
	?>
	
	</row>
	
	<?php
}

?>