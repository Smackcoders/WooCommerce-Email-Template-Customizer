// src/constants.ts
export const ajaxUrl = window.emailCustomizerAjax?.ajax_url ?? "/wp-admin/admin-ajax.php";
export const nonce = window.emailCustomizerAjax?.nonce ?? "get_template_json_nonce"

export const ajax = window.emailTemplateAjax?.ajax_url ?? "/wp-admin/admin-ajax.php";
export const templateNonce = window.emailTemplateAjax?.nonce ?? "get_email_template_names_nonce"