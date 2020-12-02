<?php

require("page/classes/vars.php");
require("page/classes/versions.php");
require("page/classes/router.php");
require("page/classes/library.php");
require("page/classes/program.php");
require("page/classes/icon.php");
require("page/classes/todo.php");
require("page/classes/issue.php");
require("page/classes/instances.php");

require("page/partials/todo.php");
require("page/partials/issue.php");

$title = title();

$PRODUCT_NAME = "W2000";
$prefix = "?v=" . uniqid();

function redirect($url) {
	ob_clean();
	
	header("Location: $url");
	
	die();
}

?>

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">

	<link rel="stylesheet" href="page/assets/main.css<?= $prefix ?>" />
	<link rel="stylesheet" href="https://cdn.dotcdn.us/line-awesome/css/line-awesome.css" />
	<link rel="icon" type="image/png" href="icons/shell32/0x0087/16/0.png" />

	<title><?= $title ? "$title - $PRODUCT_NAME" : "$PRODUCT_NAME" ?></title>
	
	<script src="page/assets/main.js<?= $prefix ?>"></script>
</head>

<body>
	<nav>
		<nav-logo>
			<a href="?">
				<img pixelated src="page/assets/logo.png" />
				<?= $PRODUCT_NAME ?>
			</a>
		</nav-logo>
		
		<nav-items>
			<nav-item>
				<a href="?">
					<i class="la la-history"></i> Versions
				</a>
			</nav-item>
			<nav-item>
				<a href="?changelog">
					<i class="la la-bars"></i> Changelog
				</a>
			</nav-item>
			<nav-item>
				<a href="?config">
					<i class="la la-cog"></i> Config
				</a>
			</nav-item>
			<nav-item>
				<a href="?icons">
					<i class="la la-windows"></i> Icons
				</a>
			</nav-item>
			<nav-item>
				<a href="?todo">
					<i class="la la-list-alt"></i> Todo
				</a>
			</nav-item>
			<nav-item>
				<a href="?issues">
					<i class="la la-warning"></i> Issues
				</a>
			</nav-item>
			<nav-item>
				<a href="?source">
					<i class="la la-folder-open"></i> Source
				</a>
			</nav-item>
			<nav-item>
				<a href="?docs">
					<i class="la la-book"></i> Documentation
				</a>
			</nav-item>
			<nav-item>
				<a href="?bundles">
					<i class="la la-archive"></i> Bundles
				</a>
			</nav-item>
			<nav-item>
				<a href="?nogap">
					<i class="la la-exchange"></i> NoGAP
				</a>
			</nav-item>
			<nav-item>
				<a href="?cloud">
					<i class="la la-cloud"></i> Cloud
				</a>
			</nav-item>
			<nav-item>
				<a href="?programs">
					<i class="la la-cube"></i> Programs
				</a>
			</nav-item>
		</nav-items>
		
		<messages></messages>
	</nav>
	
	<content>
		<?php

	render();
	
	?>
	</content>
</body>