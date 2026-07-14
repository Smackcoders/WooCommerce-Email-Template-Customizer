/**
 * previewHelper.ts
 *
 * Central helper that maps dynamic merge tag placeholders to mock preview values.
 * Used by email component renderers to show sample data in layout preview while
 * keeping the original placeholders in the editor panel.
 */

/**
 * Returns a mock preview value for a given placeholder.
 *
 * @param placeholder - The variable placeholder string (e.g. "{{billing_name}}").
 * @returns A user‑friendly sample value when in preview mode, otherwise the original placeholder.
 */
export function getPreviewValue(placeholder: string): string {
  // Trim surrounding braces for easier matching.
  const key = placeholder.replace(/^{{\s*|\s*}}$/g, '');

  // Map of placeholder to sample data.
  const mockMap: Record<string, string> = {
    // Billing address placeholders
    billing_name: 'John Doe',
    billing_address: '123 Main Street',
    billing_address_1: '123 Main Street',
    billing_address_2: 'Apt 4B',
    billing_city: 'New York',
    billing_state: 'NY',
    billing_postcode: '10001',
    billing_country: 'USA',
    billing_email: 'john.doe@example.com',
    billing_phone: '+1‑555‑123‑4567',
    // Shipping address placeholders
    shipping_name: 'John Doe',
    shipping_address: '456 Park Road',
    shipping_address_1: '456 Park Road',
    shipping_address_2: 'Suite 200',
    shipping_city: 'Los Angeles',
    shipping_state: 'CA',
    shipping_postcode: '90001',
    shipping_country: 'USA',
    shipping_email: 'john.doe@example.com',
    shipping_phone: '+1‑555‑987‑6543',
    // Order totals
    order_subtotal: '$100.00',
    order_total: '$120.00',
    order_discount: '$5.00',
    order_shipping: '$10.00',
    // Order items – will be handled by component, but provide a fallback.
    order_items: 'Product A - $50\nProduct B - $50',
    // Payment & shipping methods
    payment_method: 'Credit Card',
    shipping_method: 'Standard Shipping',
    // Email footer
    store_name: 'My Store',
    store_address: '123 Business Rd, City, Country',
    store_phone: '+1‑555‑000‑1111',
    store_email: 'support@example.com',
    // CTA button
    cta_text: 'Track Order',
    // Contact info (generic)
    contact_phone: '+1‑555‑999‑8888',
    contact_email: 'info@example.com',
    contact_address: '789 Contact St, City',
    // Fallback for any unknown placeholder – return the original.
  };

  // If the placeholder exists in the map, return the mock value.
  if (key in mockMap) {
    return mockMap[key];
  }

  // Return original placeholder if no mock defined.
  return placeholder;
}
