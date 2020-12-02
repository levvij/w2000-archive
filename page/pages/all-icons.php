<?php

function title() {
	return "All Icons";
}

function render() {
	?>
			<div>
			
			<?php
	foreach (array_slice(scandir("icons"), 2) as $module) {
		foreach (array_slice(scandir("icons/$module"), 2) as $icon) {
			foreach (array_slice(scandir("icons/$module/$icon"), 2) as $size) {
		?>
				<div style="width: 64px; height: 64px; float: left" class="m-2">
					<a href="?icon=<?="$module/$icon"?>">
						<img style="image-rendering: pixelated; max-width: 64px; max-height: 64px" src="<?="icons/$module/$icon/$size/0.png"?>" />
					</a>
				</div>
		<?php
			}
		}
	}
	?>
			</div>
				
				<?php
}

?>