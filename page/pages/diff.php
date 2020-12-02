<?php

function title() {
	return "Diff";
}

function render() {
	global $last_version;
	global $versions;
	
	$from = $_GET["diff"];
	
	if (isset($_GET["diff-to"]) && $_GET["diff-to"] != $from) {
		$to = $_GET["diff-to"];
	} else {
		$to = $last_version;
	}
	
	if ($to > $from) {
		$t = $to;
		$to = $from;
		$from = $t;
	}
	
	if (version_exists($from) && array_search($to, $versions)) {

	?>
		
		<h1>
			Diff
		</h1>
		
		<form>
			<row>
				<col-1>
					<select name="diff">
				<?php
		foreach ($versions as $version) {
			if (version_successful($version)) {
		?>
						<option <?= $version == $from ? "selected" : "" ?> value="<?= $version ?>"><?= version_format($version) ?></option>
			<?php
			}
		}
		?>
						</select>
					</col-1>
			
					<col-1>
						<select name="diff-to">
				<?php
		foreach ($versions as $version) {
			if (version_successful($version)) {
		?>
							<option <?= $version == $to ? "selected" : "" ?> value="<?= $version ?>"><?= version_format($version) ?></option>
			<?php
			}
		}
		?>
						</select>
					</col-1>
					<col-1>
						<input button type="submit" value="Compare" />
					</col-1>
			</row>
		</form>
		
		<?php
		
		function search($from, $to, $p) {
			?>
		
		<tree>
		<?php
			
			foreach (scandir("v$from/$p") as $f) {
				if ($f[0] != ".") {
					if (is_file("v$from/$p/$f")) {
						if (file_exists("v$to/$p/$f")) {
							$hashTo = hash_file("md5", "v$to/$p/$f");
							$hashFrom = hash_file("md5", "v$from/$p/$f");
							
							?>
			
			<tree-item>
				<?= $f ?>
				
				<a href="<?= "v$from/$p/$f" ?>">
					<i class="la la-download"></i> Download
				</a>
				
			
			<?php
							
							if ($hashTo == $hashFrom) {
								
								
								?>
				
				<a href="?source=<?= substr("$p/$f", 4) ?>&source-version=<?= $from ?>">
					<i class="la la-file"></i> View
				</a>
				
				<?php
								
							} else {
								?>
				
				<a href="?source=<?= substr("$p/$f", 4) ?>&source-version=<?= $from ?>">
					<i class="la la-file"></i> View <?= version_format($from) ?>
				</a>
				
				<a href="?source=<?= substr("$p/$f", 4) ?>&source-version=<?= $to ?>">
					<i class="la la-file"></i> View <?= version_format($to) ?>
				</a>
				
				<a href="?diff-file=<?= "$p/$f" ?>&diff-file-from=<?= $from ?>&diff-file-to=<?= $to ?>">
					<i class="la la-clone"></i> Compare
				</a>
				
				<badge>
					Changed
				</badge>
				
				<?php
							}
							
							?>
					
			</tree-item>
					
					<?php
						} else {
							?>
			
			<tree-item>
				<?= $f ?>
				
				<a href="<?= "v$from/$p/$f" ?>">
					<i class="la la-download"></i> Download
				</a>
				
				<a href="?source=<?= substr("$p/$f", 4) ?>&source-version=<?= $from ?>">
					<i class="la la-file"></i> View <?= version_format($from) ?>
				</a>
					
				<badge>
					New
				</badge>
			</tree-item>
					
					<?php
						}
					} else {
						?> 
		<tree-item>
				<dir><?= $f ?></dir>
		<?php
						
						search($from, $to, "$p/$f");
						
						?>
		</tree-item>
		<?php
					}
				}
			}
			?>
			
			</tree>
			
			<?php
		}
		
		search($from, $to, "boot");
	} else {
		?> 
		
		<p>
			Versions not found
		</p>
		
		<?php
	}
}

?>