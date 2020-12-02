<?php

foreach (scandir(".") as $f) {
	?>

<a href="<?= $f ?>">
	<?= $f ?>
</a>

<?php
}

?>