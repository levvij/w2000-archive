<?php

require("page/classes/cloud.php");

function title() {
	return "Explore Container";
}

function render() {
	sleep(1);
	
	$key = $_GET["cloud-explore"];
	
	if (stzr_exists($key)) {
		$meta = stzr_container_info($key);
		
		?>
		
		<h1>
			Container
		</h1>
		
		<p>
			This container was created on <?= format_date($meta->start * 1000) ?> and has a size of <?= format_size(stzr_container_size($key)) ?>.
		</p>
		
		<tree>
		
			<?php
			
			usort($meta->files, function ($a, $b) {
				return $a->name <=> $b->name;
			});
			
			foreach ($meta->files as $file) {
				?>
			
			<tree-item>
				
				
				<?php
					
				if ($file->type == "d") {
					
					?>
				
				<dir><path-component><?= join("/</path-component><path-component>", explode("/", htmlentities($file->name))) ?></path-component></dir>
				
				<?php
					
				} else {
					
					?>
				
				<path-component><?= join("/</path-component><path-component>", explode("/", htmlentities($file->name))) ?></path-component>
				
				<a href="<?= stzr_file_download($key, $file) ?>" download="<?= htmlentities($file->name) ?>">
					<i class="la la-download"></i> Download (<?= format_size(stzr_file_size($file)) ?>)
				</a>
				
				<?php
					
				}
					
					?>
			</tree-item>
			
			<?php
			}
			
			?>
		
		</tree>
		
		<?php
	} else {
		?>
			
			<box>Invalid Key</box>
			
			<?php
	}
}

?>