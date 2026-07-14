# Task List – Dynamic Variable Preview Refactor

## Overview
We need to update every field component under `src/Components/fieldcompw` so that placeholder values are rendered via the new `getPreviewValue` utility when `previewMode` is true. This removes duplicated mock strings and centralises the mapping.

## Tasks
1. **Add import** `import { getPreviewValue } from '../../../utils/previewHelper';` to each component file that will use it.
2. **BillingAddress (`billingAddress/index.tsx`)
   - Replace every `previewMode ? '<mock>' : '{{placeholder}}'` with `previewMode ? getPreviewValue('{{placeholder}}') : replaceDynamicVariables('{{placeholder}}')`.
   - Update the `placeholder` field definitions accordingly.
3. **ShippingAddress (`shippingAddress/index.tsx`)
   - Same changes as BillingAddress for all placeholders.
4. **TaxBilling (`taxBilling/index.tsx`)
   - Replace all ternary mock values (e.g., `previewMode ? '$169.97' : '{{order_subtotal}}'`) with `previewMode ? getPreviewValue('{{order_subtotal}}') : replaceDynamicVariables('{{order_subtotal}}')`.
   - Update the `fallback` usages for rows that currently embed mock strings.
5. **EmailFooter (`emailFooter/index.tsx`)
   - Add import and replace placeholders (`{{store_name}}`, `{{store_address}}`, etc.) with the helper.
6. **OrderItems (`orderItems/index.tsx`)
   - Introduce a static mock list (2 items) when `previewMode` is true, using `getPreviewValue` for each field (`{{product_name}}`, `{{price}}`, etc.).
7. **PaymentMethod (`paymentMethod/index.tsx`)
   - Replace `{{payment_method}}` placeholder usage with the helper.
8. **CTAButton (`ctaButton/index.tsx`)
   - Replace button label placeholder `{{cta_text}}` with helper.
9. **Contact (`contact/index.tsx`)
   - Replace phone, email, address placeholders with helper.
10. **ShippingMethod (`shippingMethod/index.tsx`)
    - Replace `{{shipping_method}}` placeholder with helper.
11. **OrderTotal (`orderTotal/index.tsx`)
    - Already updated, verify import is present.
12. **Run TypeScript build** (`npm run dev`) to ensure no missing imports or type errors.
13. **Manual verification** – open the WooMailer builder, toggle preview mode for each widget and confirm mock data appears, while the editor panel still shows raw merge tags.

## Acceptance Criteria
- All components compile without TypeScript errors.
- Preview mode displays the mock values defined in `src/utils/previewHelper.ts`.
- Editor mode (previewMode false) continues to render the original placeholders via `replaceDynamicVariables`.
- No existing JSON content data is altered.

## Estimated Effort
Approximately 2‑3 hours of coding and verification.
