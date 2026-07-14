
import React from 'react';

// Basics Field Components
import TextFieldComponent from "../fieldcompw/textField/index";
import ButtonFieldComponent from "../fieldcompw/button";
import HeadingFieldComponent from "../fieldcompw/heading";
import SocialIconsFieldComponent from "../fieldcompw/socialIcons";
import DividerFieldComponent from "../fieldcompw/divider";
import ImageFieldComponent from "../fieldcompw/Image";
import IconFieldComponent from "../fieldcompw/icon";
import LinkFieldComponent from "../fieldcompw/link";
import SectionFieldComponent from "../fieldcompw/section";
import SpacerFieldComponent from "../fieldcompw/spacer";
import TableFieldComponent from "../fieldcompw/table";

// Layout Block Field Components
import RowFieldComponent from "../fieldcompw/row";
import ContainerFieldComponent from "../fieldcompw/container";
import GroupFieldComponent from "../fieldcompw/group";
import ParagraphRowFieldComponent from "../fieldcompw/paragraphRow";

// Extra Block Field Components
import SocialFollowFieldComponent from "../fieldcompw/socialFollow";
import VideoFieldComponent from "../fieldcompw/video";
import CountdownFieldComponent from "../fieldcompw/countdown";
import PromoCodeFieldComponent from "../fieldcompw/promoCode";
import PriceFieldComponent from "../fieldcompw/price";

// Woocommerce Field Components
import ShippingAddressFieldComponent from "../fieldcompw/shippingAddress/index";
import BillingAddressFieldComponent from "../fieldcompw/billingAddress";
import OrderItemsFieldComponent from "../fieldcompw/orderItems";
import TaxBillingFieldComponent from "../fieldcompw/taxBilling";
import EmailHeaderFieldComponent from "../fieldcompw/emailHeader";
import EmailFooterFieldComponent from "../fieldcompw/emailFooter";
import CtaButtonFieldComponent from "../fieldcompw/ctaButton";
import RelatedProductsFieldComponent from "../fieldcompw/relatedProducts";
import OrderSubtotalFieldComponent from "../fieldcompw/orderSubtotal";
import OrderTotalFieldComponent from "../fieldcompw/orderTotal";
import ShippingMethodFieldComponent from "../fieldcompw/shippingMethod";
import PaymentMethodFieldComponent from "../fieldcompw/paymentMethod";
import CustomerNoteFieldComponent from "../fieldcompw/customerNote";
import ContactFieldComponent from "../fieldcompw/contact";
import ProductDetailsFieldComponent from "../fieldcompw/productDetails";
import RefundFullFieldComponent from "../fieldcompw/refundFull";
import RefundPartialFieldComponent from "../fieldcompw/refundPartial";

export const getWidgetComponent = (widgetType: string) => {
    switch (widgetType) {
        // Basics Layout Widgets
        case "text": return TextFieldComponent;
        case "heading": return HeadingFieldComponent;
        case "socialIcons": return SocialIconsFieldComponent;
        case "divider": return DividerFieldComponent;
        case "image": return ImageFieldComponent;
        case "button": return ButtonFieldComponent;
        case "section": return SectionFieldComponent;
        case "spacer": return SpacerFieldComponent;
        case 'table': return TableFieldComponent;
        case 'link': return LinkFieldComponent;
        case 'icon': return IconFieldComponent;

        // Layout Block Widgets 
        case "row": return RowFieldComponent;
        case "container": return ContainerFieldComponent;
        case "group": return GroupFieldComponent;
        case "paragraph-row": return ParagraphRowFieldComponent;

        // Extra Block Widgets
        case "socialFollow": return SocialFollowFieldComponent;
        case "video": return VideoFieldComponent;
        case "countdown": return CountdownFieldComponent;
        case "promoCode": return PromoCodeFieldComponent;
        case "price": return PriceFieldComponent;

        // WooCommerce Widgets
        case "shippingAddress": return ShippingAddressFieldComponent;
        case "billingAddress": return BillingAddressFieldComponent;
        case "orderItems": return OrderItemsFieldComponent;
        case "taxBilling": return TaxBillingFieldComponent;
        case "emailHeader": return EmailHeaderFieldComponent;
        case "emailFooter": return EmailFooterFieldComponent;
        case "ctaButton": return CtaButtonFieldComponent;
        case "relatedProducts": return RelatedProductsFieldComponent;
        case "orderSubtotal": return OrderSubtotalFieldComponent;
        case "orderTotal": return OrderTotalFieldComponent;
        case "shippingMethod": return ShippingMethodFieldComponent;
        case "paymentMethod": return PaymentMethodFieldComponent;
        case "customerNote": return CustomerNoteFieldComponent;
        case "contact": return ContactFieldComponent;
        case "productDetails": return ProductDetailsFieldComponent;
        case "refundFull": return RefundFullFieldComponent;
        case "refundPartial": return RefundPartialFieldComponent;

        default: return null;
    }
};

export const regenerateIds = (obj: any): any => {
  if (Array.isArray(obj)) {
    return obj.map(regenerateIds);
  } else if (obj && typeof obj === 'object') {
    const cloned: any = {};
    for (const key in obj) {
      if (key === 'id') {
        cloned[key] = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      } else {
        cloned[key] = regenerateIds(obj[key]);
      }
    }
    return cloned;
  }
  return obj;
};
