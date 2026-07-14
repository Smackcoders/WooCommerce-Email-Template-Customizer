
declare global {
  interface Window {
    emailCustomizerAjax: {
      ajax_url: string;
      nonce: string;
    };

    emailTemplateAjax: {
      ajax_url: string;
      nonce: string;
      admin_email: string;
    };

  }
}

export { };