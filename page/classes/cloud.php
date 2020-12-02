<?php

function stzr_containers() {
	return array_slice(scandir(stzr_root() . "/container"), 2);
}

function stzr_root() {
	return "../stzr/";
}

function stzr_exists($key) {
	return strpos($key, "..") === false && strpos($key, "/") === false && file_exists(stzr_root() . "/container/$key") && file_exists(stzr_root() . "/container/$key/meta/info.json");
}

function stzr_container_info($key) {
	return json_decode(file_get_contents(stzr_root() . "/container/$key/meta/info.json"));
}

function stzr_container_size($key) {
	return stzr_container_info($key)->size;
}

function stzr_file_size($file) {
	return $file->size;
}

function stzr_file_download($key, $file) {
	return stzr_root() . "/container/$key/$file->path";
}

?>