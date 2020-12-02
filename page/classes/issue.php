<?php

$issues = json_decode(file_get_contents("issues.json"));

function issue_get($id) {
	global $issues;
	
	foreach ($issues as $issue) {
		if ($issue->id == $id) {
			return $issue;
		}
	}
}

function issue_update_state($id) {
	$issue = issue_get($id);
	
	if ($issue) {
		if ($issue->done) {
			$issue->done = false;
		} else {
			$issue->done = true;
		}
		
		issue_save();
	}
}

function issue_save() {
	global $issues;
	
	file_put_contents("issue/history/issues-" . uniqid() . ".json", json_encode($issues));
	file_put_contents("issues.json", json_encode($issues));
}

?>