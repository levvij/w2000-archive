<?php

function title() {
	return "Diff File";
}

function render() {
	$file = $_GET["diff-file"];
	$from = $_GET["diff-file-from"];
	$to = $_GET["diff-file-to"];
	
	$contextsize = 10;
	
	if (strpos($file, "..") === false && file_exists("v$from/$file") && file_exists("v$to/$file")) {
		if (version_exists($from) && version_exists($to)) {
			$lines = array_slice(explode("\n", `diff -U $contextsize -u "v$to/$file" "v$from/$file"`), 2);
			
			?>
		
		<h1>
			Diff <path-component><?= join("/</path-component><path-component>", explode("/", $file)) ?></path-component>
		</h1>
		
		<p>
			View File differences
		</p>
		
		<code>
		<?php
			
				$li = 0;
				foreach ($lines as $line) {
					if ($line) {
						if ($line[0] == "+") {
							echo "<line add>";
						} else if ($line[0] == "-") {
							echo "<line remove>";
						} else if ($line[0] == " ") {
							echo "<line>";
						} else if ($line[0] == "@") {
							$no = intval(explode(",", explode("-", $line)[1])[0]) - 1;

							for ($l = $li; $lines[$l][0] != "+" && $l < count($lines); $l++) {
								$no++;
							}

						?>

				<hr />

				<box>
					<a href="?source=<?= join("/", array_slice(explode("/", $file), 1)) ?>&source-version=<?= $from ?>#line-<?= $no ?>">
						View in <?= version_format($from) ?>
					</a>

					<a href="?source=<?= join("/", array_slice(explode("/", $file), 1)) ?>&source-version=<?= $to ?>#line-<?= $no ?>">
						View in <?= version_format($to) ?>
					</a>
				</box>

				<?php
						}

						if ($line[0] != "\\" && $line[0] != "@") {
							echo htmlentities(substr($line, 1)) . "\n</line>";
						}

						$li++;
					}
				}
			
			?>
		</code>
		
		<?php
		} else {
			?>
		
		<p>
			Illegal version
		</p>
		
		<?php
		}
	} else {
		?>
		
		<p>
			Illegal path
		</p>
		
		<?php
	}
}

?>