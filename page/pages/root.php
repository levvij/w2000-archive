<?php

require("page/classes/root.php");

function title() {
	return "Root";
}

function render() {
	global $last_version;
	
	$info = root_get($_GET["root"]);
	
	function recursive($path) {
			?>
	<tree>
	<?php
			foreach (scandir("$path") as $file) {
				if ($file[0] != ".") {
					if (is_dir("$path/$file")) {
						?>

		<tree-item>
			<dir><?=$file?></dir>

			<?php 

						recursive("$path/$file");

			?>
		</tree-item>

		<?php
					} else {
						?>

		<tree-item>
			<a href="<?= "$path/$file" ?>" target='_blank'>
				<?=$file?>
			</a>
		</tree-item>

			<?php 
					}
				}
			}
	?>
	</tree>
		<?php
		}
?>
			<h1>
				<?=$info->name?>
			</h1>
			
			<p>
				<?=$info->description?>
			</p>
			
			<box>
				<a href="/win?<?= urlencode($info->root) ?>" button>
					<i class="la la-power-off"></i> Boot Productive
				</a>

				<a href="/win-beta?<?= urlencode($info->root) ?>" button thin>
					<i class="la la-power-off"></i> Boot Beta
				</a>

				<a href="v<?= $last_version ?>/boot?<?= urlencode($info->root) ?>" button thin>
					<i class="la la-power-off"></i> Boot Latest (<?= version_format($last_version) ?> )
				</a>
			</box>
			
			<box>
				<?= recursive("../win-roots/" . $info->id) ?>
			</box>
	<?php
}

?>