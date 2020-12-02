<?php

require("page/classes/root.php");

function title() {
	return "Configuration";
}

function render() {
	global $roots;
	global $last_version;
	
	?>
	<h1>
		Configuration
	</h1>

	<p>
		Windows is configureable with URL-query-parameters.
		You can set one or multiple configuration attributes, which will be read and applied to the config
	</p>

	<h2>
		FS Roots
	</h2>

	<p>
		You can add additional roots to extend your windows version with additional files. It is possible to add multiple roots
	</p>

	<row>
<?php
	foreach ($roots as $info) {
?>
		<col-2>
			<card>
				<card-body>
					<small>
						<?= $info->root ?>
					</small>
					<card-title>
						<?= $info->name ?>
					</card-title>
					<card-text>
						<?= $info->description ?>
					</card-text>

					<card-subtitle>Programs</card-subtitle>
					<card-text>
					<?php
		foreach (version_programs("../win-roots/$info->id/") as $program) {
		?>
						<key-value>
							<key><?= $program->version ?> / <?= $program->file ?> / <?= $program->author ?></key>
							<value>
								<img src="<?= icon($program->icon, 16, "shell32/0x0003") ?>" />

								<?= $program->name ?>
							</value>
						</key-value>
					<?php
		}
		?>
					</card-text>

					<card-subtitle>Libraries</card-subtitle>
					<card-text>
					<?php
		foreach (version_libraries("../win-roots/$info->id/") as $lib) {
		?>
						<key-value>
							<key><?= $lib->version ?> / <?= $lib->file ?> / <?= $lib->author ?></key>
							<value><?= $lib->name ?></value>
						</key-value>
					<?php
		}
		?>
					</card-text>
				</card-body>

				<card-list>
					<a href="/win?<?= urlencode($info->root) ?>">
						<i class="la la-power-off"></i> Boot Productive
					</a>
					<a href="/win-beta?<?= urlencode($info->root) ?>">
						<i class="la la-power-off"></i> Boot Beta
					</a>
					<a href="v<?= $last_version ?>/boot?<?= urlencode($info->root) ?>">
						<i class="la la-power-off"></i> Boot Latest (<?= version_format($last_version) ?>)
					</a>
					<a href="?root=<?= $info->id ?>">
						<i class="la la-ellipsis-h"></i> View Details
					</a>
				</card-list>
			</card>
		</col-2>
	<?php
		}
?>
	</row>
<?php
}

?>