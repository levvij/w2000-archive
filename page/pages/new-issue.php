<?php

function title() {
	return "New Issue";
}

function render() {
	global $roots;
	global $versions;
	global $last_version;
	
	?>
	
	<form method="post" action="track.php">
		<label>Title</label>
		<input name="name">
		
		<label>Description</label>
		<textarea name="text"></textarea>
		
		<label>Version</label>
		<select name="version">
			<option value="">
				All versions / General
			</option>
			
			<option value="<?= $last_version ?>-beta">
				Current Beta (<?= version_format($last_version) ?>)
			</option>
			
		<?php
		
		foreach (array_reverse($versions) as $v) {
		?>
			<option value="<?= $v ?>">
				<?= version_format($v) ?>
			</option>
		<?php
		}
		
		?>
		</select>
		
		<label>Area</label>
		<select name="area">
			<option>Boot</option>
			<option>Desktop</option>
			<option>Taskbar</option>
			<option>Tray Icons</option>
			
			<optgroup label="Program">
				<?php
	
	foreach (version_beta_programs() as $program) {
	
	?>
				<option>
					<?= $program->name ?> (<?= $program->file ?>/<?= version_format($program->version) ?>)
				</option>
	<?php
	
	}
	
	?>
			</optgroup>
			
			<optgroup label="Library">
				<?php
	
	foreach (version_beta_libraries() as $lib) {
	
	?>
				<option>
					<?= $lib->name ?> (<?= $lib->file ?>/<?= version_format($lib->version) ?>)
				</option>
	<?php
	
	}
	
	?>
			</optgroup>
			
			<?php
			
	foreach ($roots as $root) {
		$ps = root_programs("../win-roots/$root/");
		$libs = root_libraries("../win-roots/$root/");
			
		if (count($ps) + count($libs)) {
		?>
			
			<optgroup label="Program (<?= $root->id ?> root)">
			
		<?php
			
			foreach ($ps as $program) {
	
	?>
				<option>
					<?= $program->name ?> (<?= $program->file ?>/<?= version_format($program->version) ?>)
				</option>
	<?php
	
			}
			
			?>
			
			</optgroup>
			
			<optgroup label="Library (<?= $root ?> root)">
			
		<?php
			
			foreach ($libs as $lib) {
	
	?>
				<option>
					<?= $lib->name ?> (<?= $lib->file ?>/<?= version_format($lib->version) ?>)
				</option>
	<?php
	
			}
			
		?>
			
			</optgroup>
			
			<?php
		}
	}
	
	?>
		</select>
		
		<label>Steps to reproduce</label>
		<textarea name="steps"></textarea>
		
		<label>Expected Result</label>
		<textarea name="expected"></textarea>
		
		<label>Actual Result</label>
		<textarea name="result"></textarea>
		
		<input type="submit" button value="Submit" />
	</form>

	<?php
}

?>