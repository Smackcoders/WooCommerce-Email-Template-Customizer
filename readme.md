# WooCommerce Email Template Customizer

Design branded, responsive WooCommerce transactional emails in a drag-and-drop visual builder, with AI copy and image generation and built-in open/click tracking.

![License](https://img.shields.io/badge/license-GPLv2-blue.svg)
![WordPress](https://img.shields.io/badge/WordPress-6.0%2B-21759b.svg)
![PHP](https://img.shields.io/badge/PHP-7.2%2B-777bb4.svg)

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Use Cases](#use-cases)
- [Requirements](#requirements)
- [Installation](#installation)
- [Configuration & Setup](#configuration--setup)
- [Usage](#usage)
- [Supported Integrations](#supported-integrations)
- [Screenshots](#screenshots)
- [Documentation](#documentation)
- [FAQ](#faq)
- [Roadmap](#roadmap)
- [Changelog](#changelog)
- [Security](#security)
- [Contributing](#contributing)
- [Support](#support)
- [License](#license)
- [Disclaimer](#disclaimer)
- [Author](#author)

## Overview

WooCommerce ships its transactional emails as plain HTML generated from PHP templates, and restyling them usually means overriding theme files by hand. WooCommerce Email Template Customizer replaces that workflow with a visual editor: a React and MUI canvas where you drag widgets and live WooCommerce data blocks onto a template, publish it, and have it take over the matching order email immediately, with no template file editing required.

Store owners use it to give order confirmations, invoices, and password reset emails their own branding. Agencies use it to build a template once and repeat the process across client stores. Developers get a namespaced, hook-driven email builder they can extend without touching WooCommerce's default `emails/` templates. Every send is logged, and every template can be measured with open and click tracking, so a redesign is never a guess.

## Key Features

- **Drag-and-drop visual builder** — A React DnD canvas built on React and MUI lets you compose emails from a widget library: text, image, button, divider, heading, table, countdown, pricing, promo code, social icon, video, and spacer blocks.
- **Live WooCommerce data blocks** — Drop in order items, order subtotal/total, billing address, shipping address, payment method, shipping method, full or partial refund details, related products, and product detail blocks that pull straight from the order object.
- **Merge tag personalization** — `{{order_number}}`, `{{customer_name}}`, `{{store_name}}`, and dozens of other order, customer, and store placeholders resolve at send time.
- **AI content generation** — Generate, rewrite by tone, summarize, expand, or grammar-correct any text block in place. Requests go through the site's configured AI client (the `wp_ai_client_prompt()` function, provider selectable per request); if that function isn't available, the plugin reports the error instead of failing silently.
- **AI placeholder cleanup** — Generic bracket placeholders an AI model tends to leave behind, such as `[Customer Name]` or `[Order Total]`, are automatically rewritten into the plugin's real merge tags, so generated copy is send-ready without manual find-and-replace.
- **AI image generation** — Generate on-brand imagery for any image block via Hugging Face (Stable Diffusion XL) or Pollinations.ai, using an API key you configure for the chosen provider.
- **Live preview and test send** — Preview a template against real order data, then send yourself a test email before it goes live.
- **Template management** — Publish, draft, trash, restore, and duplicate templates, and set a priority so that when several templates map to the same email event, the highest-priority one wins.
- **JSON template portability** — Every template is stored as JSON, so designs can be backed up, versioned, or moved between sites.
- **Open and click tracking** — A tracking pixel records opens per send, and the order-view link in each email is wrapped with a redirect that records clicks, both logged per template and order in the Email Log.
- **Full transactional email coverage** — New order (admin), processing, completed, on-hold, cancelled (customer and admin), failed (customer and admin), refunded (full and partial), customer invoice (paid and pending), customer note, new account registration, and password reset.
- **Developer-friendly architecture** — Namespaced PHP classes, standard WooCommerce hooks (`woocommerce_email_enabled_*` filters, order-status actions), and a REST endpoint for signed tracking-pixel verification.

## Use Cases

- **Custom order emails** — Redesign order confirmation, processing, and completed emails to match store branding instead of WooCommerce's default look.
- **Agency template delivery** — Build a branded template once and hand it off across client stores without editing theme code.
- **Password reset and account emails** — Restyle password reset and new-account emails so every touchpoint feels on-brand, not just the order emails.
- **Invoice design** — Design paid and pending customer invoice emails with order totals, billing details, and payment method blocks.
- **Refund communication** — Use the dedicated refund block to clearly explain full and partial refunds.
- **Post-purchase upsell** — Add promo code, countdown, and related-products widgets to transactional emails to prompt a repeat purchase.
- **Measuring redesigns** — Compare open and click rates before and after a redesign using the Email Log.

## Requirements

| Requirement | Version |
| --- | --- |
| WordPress | 6.0 or higher |
| PHP | 7.2 or higher |
| WooCommerce | Latest stable release; required for activation |
| WP Mail SMTP | Latest stable release; required for activation |
| AI content generation | A site with the `wp_ai_client_prompt()` function available and a provider configured |
| AI image generation | A Hugging Face or Pollinations.ai API key configured in the plugin |

## Installation

### Install from WordPress

1. Download the plugin ZIP file.
2. Go to **WordPress Admin → Plugins → Add New**.
3. Upload, install, and activate the plugin.
4. On activation, the plugin checks that **WooCommerce** and **WP Mail SMTP** are installed and active. If either is missing, activation is blocked and you're given direct links to install or activate them.

### Manual Installation

1. Download or clone the repository.
2. Upload the plugin folder to `/wp-content/plugins/`.
3. Activate the plugin from **WordPress Admin → Plugins**. WooCommerce and WP Mail SMTP must already be active for activation to succeed.

## Configuration & Setup

1. After activation, open **WooMailer** in the WordPress admin sidebar.
2. Click **Add New** to open the drag-and-drop email builder.
3. Drag widgets (text, image, button, table, countdown, promo code, and more) and WooCommerce data blocks (order items, billing address, payment method, refund details, and more) onto the canvas.
4. Use the AI content and image tools in the sidebar to generate or edit copy and imagery for any block.
5. Set the template's **content type** (which WooCommerce email event it maps to), a **priority**, and a **status** (draft or publish).
6. Use **Send Test Email** to check the design against live order data before publishing.
7. Publish the template — it now overrides the matching default WooCommerce transactional email.
8. Open the **Email Log** submenu to review delivery, open, and click activity.

## Usage

A typical workflow: build a template for the "Completed Order — Customer" event, add the order items and order total blocks, generate a short thank-you message with the AI content tool, send yourself a test email, then publish it with a priority higher than any other template mapped to that event. From that point on, every completed-order email WooCommerce sends uses the custom design, and each send is logged with open and click tracking.

## Supported Integrations

- **WooCommerce** — order, customer, and email hooks that the builder overrides.
- **WP Mail SMTP** — required dependency for reliable transactional email delivery.
- **AI client (`wp_ai_client_prompt`)** — powers in-builder AI text generation; provider is configurable per request.
- **Hugging Face** — Stable Diffusion XL image generation, used by the AI image tool when configured.
- **Pollinations.ai** — alternate AI image generation provider, used by the AI image tool when configured.

## Screenshots

This repository does not currently bundle screenshot images. Visual examples of the builder, the widget library, and the Email Log are available from Smackcoders on request.

## Documentation

For setup help and feature documentation, see the plugin's page at [smackcoders.com](https://www.smackcoders.com) or contact [Smackcoders support](https://www.smackcoders.com/contact-us.html).

## FAQ

### Does it replace all WooCommerce emails?

It replaces any WooCommerce transactional email you build and publish a template for — new order, processing, completed, on-hold, cancelled, failed, refunded, customer invoice, customer note, new account, and password reset. Email events without a published custom template continue to use WooCommerce's default output.

### Can I preview an email before publishing?

Yes. The builder renders a live preview using real order data, and you can send yourself a test email before making a template live.

### Does it support AI-generated content?

Yes. You can generate, rewrite by tone, summarize, expand, or grammar-correct block copy through the site's configured AI client, and generate images through Hugging Face or Pollinations.ai, all from inside the builder.

### Can I track opens and clicks?

Yes. Every send is logged, opens are recorded with a tracking pixel, and clicks on the order-view link are recorded through a redirect, all visible in the Email Log.

### Does it require WooCommerce and WP Mail SMTP?

Yes. Both are required dependencies — the plugin checks for them on activation and will not activate without both installed and active.

### Can I export and import templates?

Yes. Templates are stored as JSON, so designs can be exported, backed up, or moved between sites.

### Will this work with other WooCommerce plugins and themes?

It hooks into standard WooCommerce order and email actions and filters rather than replacing WooCommerce core files, so it's designed to coexist with most WooCommerce extensions and themes.

## Roadmap

- Expanded AI tone and personalization controls
- Additional pre-built email templates and layout presets
- Deeper per-template analytics and reporting

## Changelog

### 1.0.0

- Initial release
- Drag-and-drop WooCommerce email builder with widget and data-block library
- AI content generation (prompt, tone rewrite, summarize, expand, grammar correction) with automatic merge-tag placeholder cleanup
- AI image generation via Hugging Face and Pollinations.ai
- Template management: publish, draft, trash, duplication, and priority ordering
- JSON template import and export
- Email log with open tracking pixel and click redirect tracking
- Live preview and test email send
- Coverage for all core WooCommerce transactional email events

## Security

If you discover a security vulnerability in this plugin, please do not disclose it publicly. Report it privately to the Smackcoders team via [smackcoders.com/contact-us.html](https://www.smackcoders.com/contact-us.html) with reproduction steps, and allow time for a fix before any public disclosure.

## Contributing

Bug reports, feature suggestions, and pull requests are welcome. Please open an issue describing the problem or enhancement, including your WordPress, WooCommerce, and PHP versions, before submitting a pull request.

## Support

For support, use the GitHub Issues tab on this repository, or reach out through [Smackcoders' support page](https://www.smackcoders.com/contact-us.html).

## License

This plugin is licensed under the **GPLv2**. See [gnu.org/licenses/gpl-2.0.html](https://www.gnu.org/licenses/gpl-2.0.html) for the full license text.

## Disclaimer

WooCommerce is a trademark of Automattic Inc. / WooCommerce Inc. This plugin is not affiliated with, endorsed by, or sponsored by Automattic or the WooCommerce project. WP Mail SMTP is a separate, independently maintained plugin; this plugin depends on it but does not develop or maintain it.

## Author

Developed and maintained by [Smackcoders](https://www.smackcoders.com/wordpress.html).
