<?php
$lang = "es_ES";

if ( !function_exists("_") ) {
	function _($text) {
		return $text;
	}
}

$lang .= ".utf8";

putenv("LC_ALL=" . $lang);
setlocale(LC_ALL,  $lang);

bindtextdomain("messages", dirname(dirname(__FILE__)) . "/locale");
bind_textdomain_codeset('messages', 'UTF-8');
textdomain("messages");
