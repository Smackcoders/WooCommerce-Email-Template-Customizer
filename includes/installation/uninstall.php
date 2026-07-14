<?php

if (!defined('ABSPATH')) {
    exit;
}


// deactivate

function wetc_deactivate(){

    if (function_exists('unregister_post_type')) {
        unregister_post_type('sm-mail-customizer'); // slug
    }
    flush_rewrite_rules();

}