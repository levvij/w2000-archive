<?php

require("page/classes/bundles.php");

function title() {
	return "Bundles";
}

function render() {
	global $bundles;
	
	?>
		<h1>
			Bundles
		</h1>
		
		<p>
			Bundles are standalone versions of W2000, rendered and stripped. They do not contain any php files, deploy scripts or anything else that is not needed to boot windows. The bundles contain custom root configs (injected query params). Bundles are codenamed.
		</p>
		
		<row>
		
		<?php
	foreach ($bundles as $bundle) {
		$iquery = bundle_iquery($bundle);
		$version = bundle_version($bundle);
		
		?>
		
		<col-2>
			<card>
				<card-body>
					<card-title><?= $bundle ?></card-title>
					
					<card-text>
						<iquery><?= $iquery ? $iquery : "null" ?></iquery>, version <?= version_format($version) ?>, <?= format_size(bundle_size($bundle)) ?> total size
					</card-text>
				</card-body>
				
				<card-list>
					<a href="<?= "../win-bundles/$bundle/release.zip" ?>">
						<i class="la la-download"></i> Download
					</a>

					<a href="<?= "../win-bundles/$bundle/boot" ?>">
						<i class="la la-power-off"></i> Boot
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