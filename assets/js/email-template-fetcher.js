jQuery(document).ready(function($) {
    function fetchEmailTemplateNames() {
        $.ajax({
            url: emailTemplateAjax.ajax_url,
            method: 'POST',
            dataType: 'json',
            data: {
                action: 'get_email_template_names',
                _ajax_nonce: emailTemplateAjax.nonce
            },
            success: function(response) {
                if (response.success) {
                   // console.log("Templates in the database :", response.data.templates);

                    // Example: Append template names to a list
                    let list = $("#email-template-list");
                    list.empty();
                    response.data.templates.forEach(function(template) {
                        list.append(`<li data-id="${template.id}">${template.email_template_name}${template.json_data}</li>`);
                    });
                } else {
                    console.error(response.data.message);
                }
            },
            error: function(xhr, status, error) {
                console.error("AJAX Error:", error);
            }
        });
    }

    // Call it on page load
    fetchEmailTemplateNames();
});
