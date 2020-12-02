<?php

function title() {
	return "Source";
}

function render() {
	global $versions;
	global $last_version;
	
	$version = isset($_GET["source-version"]) ? $_GET["source-version"] : $last_version;
	$file = $_GET["source"];
	$path = "v$version/boot/$file";
	
	if (!$file) {
		$file = "/";
	}
	
	while (strpos($file, "//") !== false) {
		$file = str_replace("//", "/", $file);
	}
	
	if (strpos($file, "..") === false && file_exists($path)) {
		$parent = join("/", array_slice(explode("/", $file), 0, -1));
		
		?>
		
		<box>
			<?php
			
			if ($file != "/") {
			
			?>
		<a href="?source=<?= $parent ?>&source-version=<?= $version ?>">
				<i class="la la-reply"></i> Go to <path-component><?= join("/</path-component><path-component>", explode("/", htmlentities($parent ? $parent : "/"))) ?></path-component>
			</a>
		
		<?php
			}
		
		if (is_file($path)) {
			?>
			
			
			<a href="<?= $path ?>">
				<i class="la la-download"></i> Download
			</a>
			
			<a href="?diff-file=boot/<?= $file ?>&diff-file-from=<?= $version ?>&diff-file-to=<?= end($versions) ?>">
				<i class="la la-clone"></i> Compare
			</a>
		
		<?php
		}
		
				?>
		</box>
		
		<h1>
			<path-component><?= join("/</path-component><path-component>", explode("/", htmlentities($file == "/" ? "Source" : $file))) ?></path-component>
		</h1>
		
		<form method="get" action=".">
			<input type="hidden" name="source" value="<?= $file ?>" />
					
			<select name="source-version" onchange="document.forms[0].submit()">
				<?php
				foreach ($versions as $v) {
					if (version_successful($v)) {
				?>
				<option <?= $v == $version ? "selected" : "" ?> value="<?= $v ?>">v<?= $v ?></option>
			<?php 
					}
				}
			?>
			</select>
		</form>

		<?php
			
		if (is_dir($path)) {
			if (file_exists("$path/.meta")) {
				?>
		<alert>
			<?php
				$meta = json_decode(file_get_contents("$path/.meta"));
				
				foreach ([
					"name" => "Name",
					"icon" => "Icon",
					"description" => "Description",
					"systemDirectory" => "Is System Directory"
				] as $key => $value) {
					if (isset($meta->$key)) {
				?>
			<key-value>
				<key><?= $value ?></key>
				<value><?= htmlentities($meta->$key) ?></value>
			</key-value>
		<?php
					}
				}
				
				?>
		</alert>
		<?php
			}
			
			if (file_exists("$path/meta.json") && file_exists("$path/main.js")) {
				?>
		<alert>
			<?php
				$meta = json_decode(file_get_contents("$path/meta.json"));
				
				foreach ([
					"name" => "Name",
					"version" => "Version",
					"icon" => "Icon",
					"author" => "Author"
				] as $key => $value) {
					if (isset($meta->$key)) {
				?>
			<key-value>
				<key><?= $value ?></key>
				<value>
					<?= $key == "icon" ? '<img pixelated src="' . icon($meta->icon, 16, "shell32/0x0003") . '" />' : "" ?>
					<?= htmlentities($meta->$key) ?>
				</value>
			</key-value>
		<?php
					}
				}
				
				if (pathinfo("$file", PATHINFO_EXTENSION) == "exe") {
				
				?>
			
			<a button href="<?= "v$version/boot/?+*" . urlencode("[\"" . join("/", array_slice(explode("/", $file), 2)) . "\"]") ?>">
				<i class="la la-power-off"></i> Open in v<?= $version ?>
			</a>
			
			<a button thin href="<?= "../win-beta/?+*" . urlencode("[\"" . join("/", array_slice(explode("/", $file), 2)) . "\"]") ?>">
				<i class="la la-power-off"></i> Open in Beta
			</a>
		<?php
				} else if (pathinfo("$file", PATHINFO_EXTENSION) == "dll") {
					?>
		
			<a button href="<?= "v$version/boot/?+!/win-roots/dev&*" . urlencode("[\"x/dllexp.exe\",\"" . join("/", array_slice(explode("/", $file), 2)) . "\"]") ?>">
				<i class="la la-power-off"></i> Inspect in v<?= $version ?>
			</a>
			
			<a button thin href="<?= "../win-beta/?+!/win-roots/dev&*" . urlencode("[\"x/dllexp.exe\",\"" . join("/", array_slice(explode("/", $file), 2)) . "\"]") ?>">
				<i class="la la-power-off"></i> Inspect in Beta
			</a>
		
		<?php
				}
				?>
			
						
		</alert>
			
			<?php
			}
			
			?>
		
		<tree>
		
		<?php
			foreach (scandir($path) as $p) {
				if ($p != "." && $p != "..") {
					if (is_dir("$path/$p")) {
						$img = "";
						
						if (file_exists("$path/$p/main.js") && file_exists("$path/$p/meta.json") && (pathinfo("$p", PATHINFO_EXTENSION) == "exe" || pathinfo("$p", PATHINFO_EXTENSION) == "dll")) {
							$info = json_decode(file_get_contents("$path/$p/meta.json"));
							
							if (isset($info->icon) && $info->icon) {
								$img = icon($info->icon, 16, "shell32/0x0003");
							}
						}
					?>
			
			<tree-item>
				<a href="?source=<?= "$file/$p" ?>&source-version=<?= $version ?>">
					<dir>
						<?php
						
						if ($img) {
						?>
						
						<img pixelated src="<?= $img ?>" />
						
						<?php
						}
						
						?>
						
						<?= $p ?>
					</dir>
				</a>
			</tree-item>
			
		<?php
					} else {
						?>
			
			<tree-item>
				<a href="?source=<?= "$file/$p" ?>&source-version=<?= $version ?>">
					<?= $p ?>
				</a>
			</tree-item>
			
			<?php
					}
				}
			}
			?>
			
			</tree>
		
		<?php
		} else {
			switch (pathinfo($path, PATHINFO_EXTENSION)) {
				case "png":
				case "gif":
				case "apng":
				case "jpg":
				case "jpeg": {
					list($width, $height) = getimagesize($path);
					
					?>
		
		<img src="<?= $path ?>" />
		<caption><?= pathinfo($path, PATHINFO_EXTENSION) ?>-File, <?= $width ?>px x <?= $height ?>px</caption>
		
		<?php
						
						
					
					break;
				}
				case "zip":
				case "ttf": {
					?>
		
		<p>
			Binary file
			
			<box>
				<a href="<?= $path ?>">
					<i class="la la-download"></i> Download File
				</a>
			</box>
		</p>
		
		<?php
					
					break;
				}
				default: {
					?>
		
		<code>
		<?php
					$i = 0;
					
					foreach (explode("\n", file_get_contents($path)) as $line) {
						$i++;
						
					?>
			<a name="line-<?= $i ?>"></a>
			<line-pair id="line-<?= $i ?>"><line-number><?= $i ?></line-number><line><?= htmlentities($line) ?></line></line-pair>
			<?php
					}
?>
		</code>
		
		<?php
				}
			}
		}
	} else {
		?>
		
		<p>
			File not found
		</p>
		
		<?php
	}
}

?>