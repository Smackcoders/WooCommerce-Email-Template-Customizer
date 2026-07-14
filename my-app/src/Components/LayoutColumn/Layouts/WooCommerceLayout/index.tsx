import React from 'react'
import BillingAddressWidget from './Widgets/billingAddressWidget'
import ShippingAddressWidget from './Widgets/shippingAddressWidget'
import OrderItemWidget from './Widgets/orderItemWidgets'
import TaxBillingWidget from './Widgets/taxBillingWidget'

import EmailFooterWidget from './Widgets/emailFooterWidget'
import CtaButtonWidget from './Widgets/ctaButtonWidget'
import OrderSubtotalWidget from './Widgets/orderSubtotalWidget'
import OrderTotalWidget from './Widgets/orderTotalWidget'
import ShippingMethodWidget from './Widgets/shippingMethodWidget'
import PaymentMethodWidget from './Widgets/paymentMethodWidget'
import CustomerNoteWidget from './Widgets/customerNoteWidget'
import ContactWidget from './Widgets/contactWidget'
import ProductDetailsWidget from './Widgets/productDetailsWidget'
import RefundFullWidget from './Widgets/refundFullWidget'
import RefundPartialWidget from './Widgets/refundPartialWidget'
import { Box } from '@mui/material';

export const wooCommerceWidgets = [

  { Component: BillingAddressWidget, name: 'Billing Address' },
  { Component: ShippingAddressWidget, name: 'Shipping Address' },
  { Component: OrderItemWidget, name: 'Order Items' },
  { Component: TaxBillingWidget, name: 'Tax & Billing' },
  { Component: OrderSubtotalWidget, name: 'Order Subtotal' },
  { Component: OrderTotalWidget, name: 'Order Total' },
  { Component: ShippingMethodWidget, name: 'Shipping Method' },
  { Component: PaymentMethodWidget, name: 'Payment Method' },
  { Component: CustomerNoteWidget, name: 'Customer Note' },
  { Component: CtaButtonWidget, name: 'CTA Button' },
  { Component: EmailFooterWidget, name: 'Email Footer' },
  { Component: ContactWidget, name: 'Contact' },
  { Component: ProductDetailsWidget, name: 'Product Details' },
  { Component: RefundFullWidget, name: 'Full Refund' },
  { Component: RefundPartialWidget, name: 'Partial Refund' },
];

const WooCommerceLayout = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const filteredWidgets = wooCommerceWidgets.filter(widget =>
    !searchTerm || widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
      }}
    >
      {filteredWidgets.map(({ Component, name }) => (
        <Component key={name} />
      ))}
      {filteredWidgets.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1', p: 1, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
          No WooCommerce blocks found
        </Box>
      )}
    </Box>
  );
};


export default WooCommerceLayout