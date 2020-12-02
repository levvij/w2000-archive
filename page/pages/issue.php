<?php

function title() {
	return "Issue";
}

function render() {
	global $issues;
	
	$issue = issue_get($_GET["issue"]);
	?>

	<small>
		Issue <?= $issue->id ?>

		<a right href="?issue-set-state=<?= $issue->id ?>">
			<?= isset($issue->done) && $issue->done ? "Reopen this issue" : "Complete this issue" ?>
		</a>
	</small>

	<h1>
		<?= $issue->name ?>

		<badge <?= isset($issue->done) && $issue->done ? "" : "danger" ?>><?= isset($issue->done) && $issue->done ? "Done" : "Open" ?></badge>
	</h1>
	
	<?php
	
	if (isset($issue->version) && $issue->version) {
		if (version_exists($issue->version)) {
	?>
	<p>
		Reported to be in <a href="?version=<?= $issue->version ?>"><?= version_format($issue->version) ?></a>.
	</p>
	<?php
		} else {
			?>
	<p>
		Reported to be in <?= version_format($issue->version) ?>.
	</p>
	<?php
		}
	}
	
	?>

	<p><?= $issue->text ?></p>

	<h3>Steps to reproduce</h3>
	<p><?= $issue->steps ?></p>

	<h3>Expected</h3>
	<p><?= $issue->expected ?></p>

	<h3>Result</h3>
	<p><?= $issue->result ?></p>

	<?php
}

?>