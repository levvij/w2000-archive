<?php

function title() {
	return "Programs";
}

function render() {
	global $versions;
	global $PROGRAM_FORMAT_VERSION;
	
	$beta = isset($_GET["programs-version"]) ? ! $_GET["programs-version"] : true;
	$version = $beta ? "../win-beta/" : "v" . $_GET["programs-version"] . "/boot/";
	
	?>
	
	<h1>Programs</h1>
	
	<p>
		These programs are included in <?= $beta ? "the current beta" : version_format($_GET["programs-version"]) ?>. 
		Every directory with a .exe ending, meta.json and a main.js are considered a program.
		This directory based system was introduced in <?= version_format($PROGRAM_FORMAT_VERSION) ?>. Older versions are not supported on this page.
	</p>
	
<form action="." method="get">
	<input type="hidden" value="" name="programs" />
	<select name="programs-version" onchange="document.forms[0].submit()">
		<option value="" <?= $beta ? "selected" : "" ?>>
			Beta
		</option>
	<?php
	
	foreach (array_reverse($versions) as $v) {
		if (version_successful($v)) {
			$supported = version_programs_supported($v);
			
	?>
		<option <?= isset($_GET["programs-version"]) && $v == $_GET["programs-version"] ? "selected" : "" ?> <?= $supported ? "" : "disabled" ?> value="<?= $v ?>">
			<?= version_format($v) ?> <?= $supported ? "" : " (Not Supported)" ?>
		</option>
	<?php
	
		}
	}
	
	?>
	</select>
</from>

<row>

<?php
	
	foreach (version_programs($version) as $program) {
		?>
	<col-2>
		<card>
			<card-body>
				<small>
					<?= join("/", @array_slice(explode("/", $program->path), 2)) . "/$program->file" ?>
				</small>
				
				<card-title>
					<?= $program->name ?>
				</card-title>
				
				<key-value>
					<key>Version</key>
					<value><?= version_format($program->version) ?></value>
				</key-value>
				
				<key-value>
					<key>Author</key>
					<value><?= $program->author ?></value>
				</key-value>
				
				<key-value>
					<key>Icon</key>
					<value>
						<img pixelated src="<?= icon($program->icon, 16, "shell32/") ?>" />
						<?= $program->icon ?>
					</value>
				</key-value>
			</card-body>
			
			<card-list>
				<a href="<?= $beta ? "../win-beta?" . urlencode("+*[\"". join("/", @array_splice(explode("/", $program->path), 2)) . "/$program->file\"]") : "$version?" . urlencode("+*[\"" . join("/", @array_splice(explode("/", $program->path), 2)) . "/$program->file\"]") ?>">
					<i class="la la-power-off"></i> Open
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