<?php

function nogap_server() {
	return "https://nogap.dotcdn.us";
}

function nogap_stats() {
	return file_get_contents(nogap_stats_url());
}

function nogap_stats_url() {
	return nogap_server() . "/stats";
}

?>