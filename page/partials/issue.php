<?php

function render_issue($issue) {
	?>
		
		<col-2>
			<card>
				<card-body>
					<card-text>
						<?= format_date($issue->date * 1000) ?> / <?= $issue->area ?>
					</card-text>
					<card-title>
						<?= $issue->name ?>
					</card-title>
					<card-text>
						<p><?= $issue->text ?></p>
						
						<i>Steps to reproduce</i>
						<p><?= $issue->steps ?></p>
						
						<i>Expected</i>
						<p><?= $issue->expected ?></p>
						
						<i>Result</i>
						<p><?= $issue->result ?></p>
					</card-text>
				</card-body>
				
				<card-list>
					<a href="?issue=<?= $issue->id ?>">
						<i class="la la-ellipsis-h"></i> View Issue
					</a>
				</card-list>
			</card>
		</col-2>
		
	<?php
}

?>