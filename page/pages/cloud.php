<?php

require("page/classes/cloud.php");

function title() {
	return "Cloud";
}

function render() {
	$stores = stzr_containers();
	
	?>
		
		<h1>
			STZR Cloud
		</h1>
		
		<section>
			<a id="create" hidden button href="../win-beta?<?= urlencode('+*["c/windows/system32/shutdown.exe"]') ?>">
				<i class="la la-plus"></i> Create new Container (Will Boot)
			</a>
			
			<button id="delete" hidden button onclick="confirm('Deleting your STZR-Key will disable you from accessing files created in your container. Do you want to proceed') && localStorage.removeItem('stzr_key') && location.reload()">
				<i class="la la-trash"></i> Delete my STZR Key
			</button>
		</section>
		
		<p>
			The STZR Cloud contains the currently <?= count($stores) ?> containers created by users. These containers are identified by localStorage.stzr_key. 
			Container keys are secret and therefore will not be listed here.
		</p>
		
		<p>
			You can insert a container key below to explore its content
		</p>
		
		<form>
			<input name="cloud-explore" placeholder="STZR Key" />
			<input button type="submit" value="Explore Container" />
			
			<script>
				
				if (localStorage.stzr_key) {
					const keyElement = document.getElementsByName("cloud-explore")[0];
					keyElement.value = localStorage.stzr_key;
					
					const alert = document.createElement("input-message");
					alert.textContent = "Your SRZR Key has been automatically inserted from localStorage";
					keyElement.parentElement.insertBefore(alert, keyElement.nextSibling);
					
					document.getElementById("delete").removeAttribute("hidden");
				} else {
					document.getElementById("create").removeAttribute("hidden");
				}
				
			</script>
		</form>
		
		<?php
}

?>