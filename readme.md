# WooCommerce Email Template Customizer

A drag and drop WooCommerce email builder for designing branded, responsive transactional emails — with AI-assisted copywriting and built-in open/click analytics.

## Overview

WooCommerce Email Template Customizer is a **WordPress plugin** that replaces WooCommerce's plain default order emails with a full **drag and drop email builder**. Instead of hand-editing PHP templates, store owners and agencies use a visual, **React MUI email editor** to design order confirmations, invoices, password resets, and other transactional emails directly from the WordPress admin — no code required.

The plugin was built for WooCommerce store owners, freelancers, and agencies who want a **no code woocommerce email builder** to brand every customer touchpoint, plus developers who need a reliable way to override WooCommerce's transactional email markup without hacking theme files. It functions as a complete **woocommerce email design tool**: build once with the visual editor, map the design to any WooCommerce email event, and track how customers engage with it.

## Key Features

- **Drag and drop visual email builder** — A **react-dnd widget system** on top of a React/MUI canvas lets you compose emails from a **woocommerce email widget library**: text, image, button, divider, heading, table, countdown, pricing, promo code, social icon, video, and spacer widgets.
- **WooCommerce-aware content blocks** — Drop in live order items, order subtotal/total, billing address, shipping address, payment method, shipping method, full/partial refund details, related products, and product details blocks that pull directly from the order.
- **Merge tag / placeholder system** — A merge tag plugin layer resolves order, customer, and site placeholders at send time for true personalization.
- **AI content generation** — Generate, rewrite, summarize, expand, or grammar-correct email copy in place using WordPress's AI client, so you can write a professional **woocommerce branded email plugin** message without a copywriter.
- **AI image generation** — Produce on-brand imagery for email blocks directly inside the builder.
- **Live preview and test email send** — Preview a template with real order data, then fire a **woocommerce test email plugin** style test send before it goes live.
- **Template management** — Publish, draft, trash, restore, and duplicate templates; assign a **template priority ordering** so multiple templates mapped to the same email type resolve deterministically.
- **JSON template import/export** — Every template is stored as portable JSON, so you can back up, move, or reuse a **woocommerce email template library** across sites.
- **Email log analytics** — A dedicated email log tracks delivery, an **open tracking pixel** records opens, and **click redirect tracking** records link clicks per order and template — the foundation of a lightweight **woocommerce email analytics plugin**.
- **Covers every core transactional email** — New order (admin), processing, completed, on-hold, cancelled (customer + admin), failed (customer + admin), refunded (full/partial), customer invoice (paid/pending), customer note, new account/registration, and password reset.
- **Developer-friendly architecture** — Namespaced PHP classes, WordPress hooks/filters (`woocommerce_email_enabled_*`, order status hooks), and a REST endpoint for tracker verification.

## Use Cases

- **Custom WooCommerce order emails** — Redesign order confirmation, processing, and completed emails to match your store's branding instead of the default WooCommerce look.
- **WooCommerce order confirmation email plugin** for agencies — Build and hand off branded email templates for client stores without touching theme code.
- **WooCommerce password reset email plugin** use case — Restyle the password reset and new-account emails so every customer touchpoint feels on-brand.
- **WooCommerce invoice email plugin** workflow — Design paid/pending customer invoice emails with order totals, billing details, and payment method blocks.
- **WooCommerce refund email plugin** scenario — Communicate full and partial refunds clearly with a dedicated refund details block.
- **WooCommerce email marketing plugin** style use — Add promo code, countdown, and related-products widgets to transactional emails to recover abandoned interest and drive repeat purchases.
- **Measuring engagement** — Use the built-in open and click tracking to see which redesigned emails actually get opened and clicked, and iterate.

## Requirements

- **WordPress:** 6.0 or higher (tested up to 6.8)
- **PHP:** 7.2 or higher
- **WooCommerce:** required — the plugin will not activate without it
- **WP Mail SMTP:** required — the plugin checks for and depends on WP Mail SMTP for reliable transactional email delivery
- AI content/image generation requires a site with WordPress's AI client available and a configured AI provider

## Installation

### Install from WordPress

1. Download the plugin ZIP file.
2. Go to **WordPress Admin → Plugins → Add New**.
3. Upload, install, and activate the plugin.
4. On activation, the plugin verifies that **WooCommerce** and **WP Mail SMTP** are installed and active. If either is missing, activation is blocked and you're given direct links to install/activate them.

### Manual Installation

1. Download or clone the repository.
2. Upload the plugin folder to `/wp-content/plugins/`.
3. Activate the plugin from **WordPress Admin → Plugins**. WooCommerce and WP Mail SMTP must already be active for activation to succeed.

## Configuration / Setup

1. After activation, go to **WooCommerce → Email Customizer** in the WordPress admin.
2. Click **Add New** to open the drag and drop email builder.
3. Drag widgets (text, image, button, table, countdown, promo code, etc.) and WooCommerce blocks (order items, billing address, payment method, refund details, etc.) onto the canvas.
4. Use the AI content/image tools in the sidebar to generate, rewrite, summarize, or expand copy and imagery for any block.
5. Set the **content type** (which WooCommerce email event the template maps to), a **priority**, and a **status** (draft or publish).
6. Use **Send Test Email** to verify the design with live order data before publishing.
7. Publish the template — it now overrides the matching default WooCommerce transactional email.
8. Review delivery, open, and click performance under the **Email Log** screen.

## Usage

A typical workflow: build a template for "Completed Order — Customer" using the visual editor, add the order items and order totals blocks, generate a short thank-you message with the AI content tool, send yourself a test email, then publish it with a priority higher than any other template mapped to the same event. From that point on, every completed-order email sent by WooCommerce uses your custom design, and each send is logged with open/click tracking.

## Supported Integrations

- **WooCommerce** — core order, customer, and email hooks
- **WP Mail SMTP** — required for reliable transactional email delivery
- **WordPress AI client** — powers in-builder AI content and image generation (provider-dependent)

## Screenshots / Demo

1. Email builder UI with live preview
2. WooCommerce block and widget library in the drag and drop canvas
3. Customized order receipt / order confirmation email
4. Email log with open and click analytics
5. Template list with priority, status, and duplication controls

*(Add screenshots or a short demo GIF of the builder, e.g. `![Plugin Dashboard](assets/plugin-dashboard.png)`)*

## Documentation

For setup help and feature documentation, see the plugin's page at [smackcoders.com](https://www.smackcoders.com) or contact [Smackcoders support](https://www.smackcoders.com/contact-us.html).

## Frequently Asked Questions

### Does it replace all WooCommerce emails?

It can replace any WooCommerce transactional email you build a template for — new order, processing, completed, on-hold, cancelled, failed, refunded, customer invoice, customer note, new account, and password reset. Emails without a published custom template continue to use WooCommerce's default output.

### Can I preview an email before publishing?

Yes. The builder offers a live preview using real order data, and you can send yourself a test email before making a template live.

### Does it support AI-generated content?

Yes. You can generate, rewrite, summarize, expand, or grammar-correct block copy, and generate AI images, directly from the builder using WordPress's AI client.

### Can I track opens and clicks?

Yes. Every send is logged, opens are recorded via a tracking pixel, and link clicks are recorded via click redirect tracking, visible in the Email Log screen.

### Does it require WooCommerce and WP Mail SMTP?

Yes. Both are required dependencies — the plugin checks for them on activation and will not activate without both installed and active.

### Can I export and import templates?

Yes. Templates are stored as JSON, so designs can be exported, backed up, or moved between sites.

### Will this work with other WooCommerce plugins and themes?

It hooks into standard WooCommerce order and email actions/filters, so it's designed to be compatible with most WooCommerce extensions and themes.

## Roadmap

- Expanded AI tone and personalization controls
- Additional pre-built email templates and layout presets
- Deeper per-template analytics and reporting

## Changelog

### 1.0.0

- Initial release
- Drag and drop WooCommerce email builder with widget and WooCommerce block library
- AI content generation (prompt, tone rewrite, summarize, expand, grammar correction) and AI image generation
- Template management: publish/draft/trash, duplication, and priority ordering
- JSON template import/export
- Email log with open tracking pixel and click redirect tracking
- Live preview and test email send
- Coverage for all core WooCommerce transactional email events

## Security

If you discover a security vulnerability in this plugin, please do not disclose it publicly. Report it privately to the Smackcoders team via [https://www.smackcoders.com/contact-us.html](https://www.smackcoders.com/contact-us.html) with reproduction steps, and allow time for a fix before any public disclosure.

## Contributing

Bug reports, feature suggestions, and pull requests are welcome. Please open an issue describing the problem or enhancement, including your WordPress, WooCommerce, and PHP versions, before submitting a pull request.

## Support

For support, please use the GitHub Issues tab on this repository, or reach out through [Smackcoders' official support page](https://www.smackcoders.com/contact-us.html).

## License

This plugin is licensed under the **GPL-2.0-or-later**. See [https://www.gnu.org/licenses/gpl-2.0.html](https://www.gnu.org/licenses/gpl-2.0.html) for the full license text.

## Disclaimer

WooCommerce is a trademark of Automattic Inc. / WooCommerce Inc. This plugin is not affiliated with, endorsed by, or sponsored by Automattic or the WooCommerce project. WP Mail SMTP is a separate, independently maintained plugin; this plugin depends on it but does not develop or maintain it.

## Author / Maintainer

Developed and maintained by [Smackcoders](https://www.smackcoders.com/wordpress.html).
