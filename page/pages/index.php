<?php

function title() {
	return "";
}

function render() {
	global $versions;
	global $instances;
	
	?>
		<box>
			<label>
				<i class="la la-power-off"></i> Boot instance
			</label>
			
			<select onchange="location.href = this.value; this.value = ''" autocomplete="off">
				<option value="" disabled selected>
					Select instance to boot it...
				</option>
				
				<?php 
	
	foreach ($instances as $instance) {
	
	?>
			
				<option value="<?= strpos($instance->bootpath, "?") === false ? "$instance->bootpath?utm=win-versions" : "$instance->bootpath&utm=win-versions" ?>">
					<?= htmlentities($instance->name) ?> (<?= htmlentities($instance->branch) ?>/<?= htmlentities($instance->version) ?>)
				</option>
			
			<?php
		
	}
	
	?>
			</select>
		</box>
		
		<row>
		<?php
	foreach (array_reverse($versions) as $version) {
		if (version_successful($version)) {
?>
			<col-2>
				<card>
					<img card-img src="v<?=$version?>/screenshot-cover.png" />
					
					<card-body>
						<card-text>
							<?= version_builddate($version) ?> / <?= format_size(version_size($version)) ?>
						</card-text>
						<card-title>
							<?= version_format($version) ?>
						</card-title>
						<card-text>
							<?= version_changes($version, "div", 3, "mb-1") ?>
						</card-text>
					</card-body>

					<card-list>
						<a href='v<?=$version?>/boot/index.html'>
							<i class="la la-power-off"></i> Boot
						</a>
						<a href="?version=<?=$version?>">
							<i class="la la-ellipsis-h"></i> View Details
						</a>
					</card-list>
				</card>
			</col-2>
			
			<?php
		} else {
			?>
			
			<col-2>
				<card>
					<img card-img src="page/assets/broken-cover.png" />
					
					<card-body>
						<card-text>
							<?= version_builddate($version) ?>
						</card-text>
						<card-title>
							<?= version_format($version) ?> <badge>Failed Build</badge>
						</card-title>
						<card-text>
							<?= version_changes($version, "div", 3, "mb-1") ?>
						</card-text>
					</card-body>

					<card-list>
						<a href="?version=<?=$version?>">
							<i class="la la-ellipsis-h"></i> View Details
						</a>
					</card-list>
				</card>
			</col-2>
			
			<?php
		} 
	}
	?>
		</row>

<?php
}

?>