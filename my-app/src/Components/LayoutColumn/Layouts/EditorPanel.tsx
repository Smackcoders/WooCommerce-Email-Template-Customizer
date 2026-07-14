import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Typography } from '@mui/material';
import { RootState } from '../../../Store/store';

// Import Global Editor
import GlobalBodyEditor from '../GlobalBodyEditor';

// Import Editor Widgets
import LayoutEditorWidget from './GeneralLayout/WidgetOption/layoutWidgetEditor';

// Basics Layout Editors
import TextWidgetEditor from './basicsLayout/WidgetsEditor/textWidgetEditor';
import ButtonWidgetEditor from './basicsLayout/WidgetsEditor/buttonWidgetEditor';
import HeadingWidgetEditor from './basicsLayout/WidgetsEditor/headingWidgetEditor';
import SocialIconsWidgetEditor from './basicsLayout/WidgetsEditor/socialIconsWidgetEditor';
import DividerWidgetEditor from './basicsLayout/WidgetsEditor/dividerWidgetEditor';
import ImageWidgetEditor from './basicsLayout/WidgetsEditor/imageWidgetEditor';
import SectionWidgetEditor from './basicsLayout/WidgetsEditor/sectionWidgetEditor';
import SpacerWidgetEditor from './basicsLayout/WidgetsEditor/spacerWidgetEditor';
import LinkWidgetEditor from './basicsLayout/WidgetsEditor/linkWidgetEditor';
import TableWidgetEditor from './basicsLayout/WidgetsEditor/tableWidgetEditor';
import IconWidgetEditor from './basicsLayout/WidgetsEditor/iconWidgetEditor';
import ParagraphRowWidgetEditor from './basicsLayout/WidgetsEditor/paragraphRowWidgetEditor';

// Layout Block Editors 
import RowWidgetEditor from './BlockLayout/WidgetsEditor/rowWidgetEditor';
import ContainerWidgetEditor from './BlockLayout/WidgetsEditor/containerWidgetEditor';
import GroupWidgetEditor from './BlockLayout/WidgetsEditor/groupWidgetEditor';

// Extra Block Editors 
import SocialFollowWidgetEditor from './ExtraLayout/WidgetsEditor/socialFollowWidgetEditor';
import VideoWidgetEditor from './ExtraLayout/WidgetsEditor/videoWidgetEditor';
import CountdownWidgetEditor from './ExtraLayout/WidgetsEditor/countdownWidgetEditor';
import PromoCodeWidgetEditor from './ExtraLayout/WidgetsEditor/promoCodeWidgetEditor';
import PriceWidgetEditor from './ExtraLayout/WidgetsEditor/priceWidgetEditor';

// Woocommerce Editors
import ShippingAddressWidgetEditor from './WooCommerceLayout/WidgetsEditor/shippingAddressWidgetEditor';
import BillingAddressWidgetEditor from './WooCommerceLayout/WidgetsEditor/billingAddressWidgetEditor';
import OrderItemsWidgetEditor from './WooCommerceLayout/WidgetsEditor/orderItemWidgetEditor';
import TaxBillingWidgetEditor from './WooCommerceLayout/WidgetsEditor/taxBillingWidgetEditor';
import EmailHeaderWidgetEditor from './WooCommerceLayout/WidgetsEditor/emailHeaderWidgetEditor';
import EmailFooterWidgetEditor from './WooCommerceLayout/WidgetsEditor/emailFooterWidgetEditor';
import CtaButtonWidgetEditor from './WooCommerceLayout/WidgetsEditor/ctaButtonWidgetEditor';
import RelatedProductsWidgetEditor from './WooCommerceLayout/WidgetsEditor/relatedProductsWidgetEditor';
import OrderSubtotalWidgetEditor from './WooCommerceLayout/WidgetsEditor/orderSubtotalWidgetEditor';
import OrderTotalWidgetEditor from './WooCommerceLayout/WidgetsEditor/orderTotalWidgetEditor';
import ShippingMethodWidgetEditor from './WooCommerceLayout/WidgetsEditor/shippingMethodWidgetEditor';
import PaymentMethodWidgetEditor from './WooCommerceLayout/WidgetsEditor/paymentMethodWidgetEditor';
import CustomerNoteWidgetEditor from './WooCommerceLayout/WidgetsEditor/customerNoteWidgetEditor';
import ContactWidgetEditor from './WooCommerceLayout/WidgetsEditor/contactWidgetEditor';
import ProductDetailsWidgetEditor from './WooCommerceLayout/WidgetsEditor/productDetailsWidgetEditor';
import RefundFullWidgetEditor from './WooCommerceLayout/WidgetsEditor/refundFullWidgetEditor';
import RefundPartialWidgetEditor from './WooCommerceLayout/WidgetsEditor/refundPartialWidgetEditor';
import SubElementWidgetEditor from './WooCommerceLayout/WidgetsEditor/SubElementWidgetEditor';

const EditorPanel = () => {
    const {
        selectedContentType,
        selectedBlockForEditor,
        selectedColumnIndex,
        selectedSubElementId
    } = useSelector((state: RootState) => state.workspace);

    // If a specific sub-element is selected in the outline, show the sub-element styles editor
    if (selectedSubElementId && selectedContentType !== 'emailHeader') {
        return <SubElementWidgetEditor />;
    }

    // If no block is selected, show Global Settings
    if (!selectedBlockForEditor) {
        return <GlobalBodyEditor />;
    }

    // Otherwise, switch on content type
    switch (selectedContentType) {
        // Basics Layout Editors
        case 'text': return <TextWidgetEditor />;
        case 'button': return <ButtonWidgetEditor />;
        case 'heading': return <HeadingWidgetEditor />;
        case 'socialIcons': return <SocialIconsWidgetEditor />;
        case 'divider': return <DividerWidgetEditor />;
        case 'image':
            return selectedBlockForEditor && selectedColumnIndex !== null ? (
                <ImageWidgetEditor blockId={selectedBlockForEditor} columnIndex={selectedColumnIndex} />
            ) : null;
        case 'section': return <SectionWidgetEditor />;
        case 'spacer': return <SpacerWidgetEditor />;
        case 'link': return <LinkWidgetEditor />;
        case 'icon': return <IconWidgetEditor />;
        case 'table': return <TableWidgetEditor />;
        case 'paragraph-row': return <ParagraphRowWidgetEditor />;

        // Layout Block Editors
        case 'row': return <RowWidgetEditor />;
        case 'container': return <ContainerWidgetEditor />;
        case 'group': return <GroupWidgetEditor />;

        // Extra Block Editors 
        case 'socialFollow': return <SocialFollowWidgetEditor />;
        case 'video': return <VideoWidgetEditor />;
        case 'countdown': return <CountdownWidgetEditor />;
        case 'promoCode': return <PromoCodeWidgetEditor />;
        case 'price': return <PriceWidgetEditor />;

        // Woocommerce Editors
        case 'shippingAddress': return <ShippingAddressWidgetEditor />;
        case 'billingAddress': return <BillingAddressWidgetEditor />;
        case 'orderItems': return <OrderItemsWidgetEditor />;
        case 'taxBilling': return <TaxBillingWidgetEditor />;
        case 'emailHeader': return <EmailHeaderWidgetEditor />;
        case 'emailFooter': return <EmailFooterWidgetEditor />;
        case 'ctaButton': return <CtaButtonWidgetEditor />;
        case 'relatedProducts': return <RelatedProductsWidgetEditor />;
        case 'orderSubtotal': return <OrderSubtotalWidgetEditor />;
        case 'orderTotal': return <OrderTotalWidgetEditor />;
        case 'shippingMethod': return <ShippingMethodWidgetEditor />;
        case 'paymentMethod': return <PaymentMethodWidgetEditor />;
        case 'customerNote': return <CustomerNoteWidgetEditor />;
        case 'contact': return <ContactWidgetEditor />;
        case 'productDetails': return <ProductDetailsWidgetEditor />;
        case 'refundFull': return <RefundFullWidgetEditor />;
        case 'refundPartial': return <RefundPartialWidgetEditor />;

        default:
            return <LayoutEditorWidget />;
    }
};

export default EditorPanel;
