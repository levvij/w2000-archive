<?php

function render_todo($td, $showboot = true) {
	?>
	<card>
		<card-body>
			<card-text>
				<small>
					<?=$td->area?>

					<span right style="font-weight:<?= $td->priority ?>00"><?= str_repeat("!", $td->priority) ?></span>
				</small>
			</card-text>
			<card-title>
				<?= $td->title ?>
			</card-title>
			<card-text>
				<todo-text><?= $td->text ?></todo-text>
				
				<small-dim>
					 <?= isset($td->version) ? version_format($td->version) : "" ?>
				</small-dim>
			</card-text>
		</card-body>

		<card-list>
			<a href="?todo-item=<?= $td->id ?>">
				<i class="la la-ellipsis-h"></i> View Task
			</a>
		</card-list>
			
			
			<?php
			
	if (isset($td->release) && $showboot) {
		
			?>
		<card-list>
			<a href="v<?=$td->release?>/boot">
				<i class="la la-power-off"></i> Boot Release (<?= version_format($td->release) ?>)
			</a>
		</card-list>
				<?php
				
	}
	
			?>
				
	</card>
		
	<?php
}

?>