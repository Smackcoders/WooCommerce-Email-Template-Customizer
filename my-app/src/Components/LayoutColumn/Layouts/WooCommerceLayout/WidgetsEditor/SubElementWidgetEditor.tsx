import React, { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import {
  Box, Typography, Stack, TextField, FormControl, Select, MenuItem,
  ToggleButtonGroup, ToggleButton, Divider, Collapse, IconButton, Tooltip,
} from '@mui/material';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import RedditIcon from "@mui/icons-material/Reddit";
import MailIcon from "@mui/icons-material/Mail";
import GitHubIcon from "@mui/icons-material/GitHub";
import TelegramIcon from "@mui/icons-material/Telegram";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  updateSubElementStyles, closeEditor,
  deleteColumnContent,
  updateTaxBillingEditorOptions,
  updateBillingAddressEditorOptions, updateShippingAddressEditorOptions, updateOrderItemsEditorOptions,
  updateCtaButtonEditorOptions, updateContactEditorOptions, updateRelatedProductsEditorOptions,
  updateEmailHeaderEditorOptions, updateEmailFooterEditorOptions, updateOrderSubtotalEditorOptions,
  updateOrderTotalEditorOptions, updateShippingMethodEditorOptions, updatePaymentMethodEditorOptions,
  updateCustomerNoteEditorOptions, updateProductDetailsEditorOptions,
  defaultBillingAddressEditorOptions, defaultShippingAddressEditorOptions,
  defaultTaxBillingEditorOptions, defaultOrderItemsEditorOptions, defaultCtaButtonEditorOptions, defaultContactEditorOptions, defaultRelatedProductsEditorOptions,
  defaultEmailHeaderEditorOptions, defaultEmailFooterEditorOptions, defaultOrderSubtotalEditorOptions,
  defaultOrderTotalEditorOptions, defaultShippingMethodEditorOptions, defaultPaymentMethodEditorOptions,
  defaultCustomerNoteEditorOptions, defaultProductDetailsEditorOptions,
} from '../../../../../Store/Slice/workspaceSlice';
import ColorPicker from '../../../../utils/ColorPicker';
import { FONT_FAMILIES } from '../../../../../Constants/StyleConstants';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { StyleTabContent, AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const socialIconsMap: any = {
  facebook: { icon: <FacebookIcon />, fallback: "f", color: "#3b5998" },
  twitter: { icon: <TwitterIcon />, fallback: "x", color: "#1DA1F2" },
  linkedin: { icon: <LinkedInIcon />, fallback: "l", color: "#0077B5" },
  instagram: { icon: <InstagramIcon />, fallback: "i", color: "#E1306C" },
  pinterest: { icon: <PinterestIcon />, fallback: "p", color: "#Bd081C" },
  youtube: { icon: <YouTubeIcon />, fallback: "y", color: "#FF0000" },
  whatsapp: { icon: <WhatsAppIcon />, fallback: "w", color: "#25D366" },
  reddit: { icon: <RedditIcon />, fallback: "r", color: "#FF4500" },
  github: { icon: <GitHubIcon />, fallback: "g", color: "#181717" },
  telegram: { icon: <TelegramIcon />, fallback: "t", color: "#0088CC" },
  envelope: { icon: <MailIcon />, fallback: "e", color: "#0072C6" },
};

/* ─── tiny section header ─── */
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
  const [open, setOpen] = useState(true);
  return (
    <Box sx={{ mb: 1 }}>
      <Box
        onClick={() => setOpen(o => !o)}
        sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', py: 0.5, px: 1, bgcolor: '#f4f4f4', borderRadius: 1, mb: 0.5 }}
      >
        <IconButton size="small" sx={{ p: 0, mr: 0.5 }}>
          {open ? <KeyboardArrowDownIcon sx={{ fontSize: 16 }} /> : <KeyboardArrowRightIcon sx={{ fontSize: 16 }} />}
        </IconButton>
        <Typography sx={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#444', letterSpacing: '0.5px' }}>{title}</Typography>
      </Box>
      <Collapse in={open}>
        <Box sx={{ px: 1, pb: 1 }}>{children}</Box>
      </Collapse>
    </Box>
  );
};

/* ─── labelled row ─── */
const Row: React.FC<{ label: string; children: React.ReactNode; cols?: string }> = ({ label, children, cols = '100px 1fr' }) => (
  <Box display="grid" gridTemplateColumns={cols} alignItems="center" gap={1} mb={0.75}>
    <Typography sx={{ fontSize: '11px', color: '#666' }}>{label}</Typography>
    {children}
  </Box>
);

const getDefaultSubElementStyles = (contentType?: string | null, subElementId?: string | null): Record<string, any> => {
  if (!contentType || !subElementId) return {};

  const isAddressFieldContainer =
    (contentType === 'billingAddress' || contentType === 'shippingAddress') &&
    subElementId.endsWith('_container') &&
    !['outer_container', 'header_container', 'fields_container'].includes(subElementId);

  if (isAddressFieldContainer) {
    return {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'baseline',
      flexWrap: 'wrap',
    };
  }

  const flexDefaults: Record<string, Set<string>> = {
    contact: new Set(['url_p', 'email_p', 'phone_p']),
    customerNote: new Set(['outer_container', 'note_container', 'note_label', 'note_value']),
    emailFooter: new Set(['footer_container', 'footer_social']),
    emailHeader: new Set(['header_container']),
    orderSubtotal: new Set([
      'row_container', 'label_p', 'value_p',
      'subtotal_container', 'subtotal_label', 'subtotal_value',
      'discount_container', 'discount_label', 'discount_value',
      'shipping_container', 'shipping_label', 'shipping_value',
      'refunded_full_container', 'refunded_full_label', 'refunded_full_value',
      'refunded_partial_container', 'refunded_partial_label', 'refunded_partial_value',
    ]),
    orderTotal: new Set(['outer_container', 'row_container', 'label_p', 'value_p']),
    paymentMethod: new Set(['outer_container', 'row_container', 'label_p', 'value_p']),
    shippingMethod: new Set(['outer_container', 'row_container', 'label_p', 'value_p']),
  };

  if (flexDefaults[contentType]?.has(subElementId)) {
    const extraDefaults =
      contentType === 'emailFooter' && subElementId === 'footer_container'
        ? { flexDirection: 'column' }
        : {};
    return { display: 'flex', ...extraDefaults };
  }

  if (contentType === 'ctaButton' && ['button_container', 'button_elem'].includes(subElementId)) {
    return { display: 'inline-block' };
  }

  const taxBillingGridIds = new Set([
    'subtotal_container', 'discount_container', 'shipping_container', 'tax_container', 'total_container',
    'billing_name_container', 'billing_address_line_container', 'billing_location_container',
  ]);

  if (contentType === 'taxBilling' && taxBillingGridIds.has(subElementId)) {
    return { display: 'grid' };
  }

  return {};
};


/* ─── border per-side ─── */
const BorderSection: React.FC<{ subStyles: any; onUpdate: (s: Record<string, any>) => void }> = ({ subStyles, onUpdate }) => {
  const sides = ['Top', 'Right', 'Bottom', 'Left'];
  const rawRadius = subStyles.borderRadius;
  const radiusObj: Record<string, string> = (rawRadius && typeof rawRadius === 'object')
    ? rawRadius
    : { top: rawRadius ?? '', right: rawRadius ?? '', bottom: rawRadius ?? '', left: rawRadius ?? '' };

  return (
    <Stack spacing={0}>
      {/* Header row */}
      <Box display="grid" gridTemplateColumns="48px 44px 1fr 30px" gap={0.5} alignItems="center" px={0.5} mb={0.5}>
        <Box />
        <Typography sx={{ fontSize: '9px', color: '#aaa', textAlign: 'center' }}>Width</Typography>
        <Typography sx={{ fontSize: '9px', color: '#aaa', pl: '4px' }}>Style</Typography>
        <Typography sx={{ fontSize: '9px', color: '#aaa', textAlign: 'center' }}>Color</Typography>
      </Box>

      {sides.map(side => {
        const key = `border${side}`;
        const val = subStyles[`${key}Width`] ?? 0;
        const col = subStyles[`${key}Color`] ?? '#0000';
        const sty = subStyles[`${key}Style`] ?? 'solid';
        return (
          <Box key={side} display="grid" gridTemplateColumns="48px 44px 1fr 30px" gap={0.5} alignItems="center" px={0.5} mb={0.5}>
            <Typography sx={{ fontSize: '11px', color: '#555', fontWeight: 500 }}>{side}</Typography>
            <TextField type="number" size="small" value={val}
              onChange={e => onUpdate({ [`${key}Width`]: Number(e.target.value) })}
              InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff', '& input': { p: '5px 4px', textAlign: 'center' } } }}
            />
            <Select size="small" value={sty}
              onChange={e => onUpdate({ [`${key}Style`]: e.target.value })}
              sx={{ fontSize: '11px', bgcolor: '#fff' }}
              MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
            >
              {['none', 'solid', 'dashed', 'dotted', 'double', 'groove', 'ridge'].map(s => (
                <MenuItem key={s} value={s} sx={{ fontSize: '11px' }}>{s}</MenuItem>
              ))}
            </Select>
            <ColorPicker label="" value={col} onChange={c => onUpdate({ [`${key}Color`]: c })} />
          </Box>
        );
      })}

      {/* Border Radius — 4 corners */}
      <Box mt={1} px={0.5}>
        <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#555', mb: 0.5 }}>Border Radius</Typography>
        <Box display="grid" gridTemplateColumns="repeat(4,1fr)" gap={0.5}>
          {(['top', 'right', 'bottom', 'left'] as const).map(corner => (
            <Box key={corner}>
              <Typography sx={{ fontSize: '9px', color: '#888', textAlign: 'center', mb: 0.25, textTransform: 'capitalize' }}>{corner}</Typography>
              <TextField size="small" fullWidth
                value={radiusObj[corner] ?? ''}
                placeholder="0"
                onChange={e => onUpdate({ borderRadius: { ...radiusObj, [corner]: e.target.value } })}
                InputProps={{ sx: { fontSize: '10px', '& input': { p: '4px 2px', textAlign: 'center' } } }}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

/* ═══════════════════════════════════════════════ MAIN ═══ */
const SubElementWidgetEditor = () => {
  const dispatch = useDispatch();
  const [gapsLinked, setGapsLinked] = useState(false);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, selectedSubElementId, selectedContentType } =
    useSelector((state: RootState) => state.workspace);

  const selectedWidget = useSelector((state: RootState) => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      const block = state.workspace.blocks.find(b => b.id === selectedBlockForEditor);
      return block?.columns[selectedColumnIndex]?.widgetContents[selectedWidgetIndex];
    }
    return null;
  });

  const handleDeleteContent = useCallback(() => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      dispatch(deleteColumnContent({
        blockId: selectedBlockForEditor,
        columnIndex: selectedColumnIndex,
        widgetIndex: selectedWidgetIndex,
      }));
    }
  }, [dispatch, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex]);

  const widgetOptions = useMemo(() => {
    let parsed = {};
    if (selectedWidget?.contentData) {
      try { parsed = JSON.parse(selectedWidget.contentData); } catch { }
    }
    const defaultsMap: Record<string, any> = {
      billingAddress: defaultBillingAddressEditorOptions,
      shippingAddress: defaultShippingAddressEditorOptions,
      taxBilling: defaultTaxBillingEditorOptions,
      orderItems: defaultOrderItemsEditorOptions,
      emailHeader: defaultEmailHeaderEditorOptions,
      emailFooter: defaultEmailFooterEditorOptions,
      orderSubtotal: defaultOrderSubtotalEditorOptions,
      orderTotal: defaultOrderTotalEditorOptions,
      shippingMethod: defaultShippingMethodEditorOptions,
      paymentMethod: defaultPaymentMethodEditorOptions,
      customerNote: defaultCustomerNoteEditorOptions,
      productDetails: defaultProductDetailsEditorOptions,
      ctaButton: defaultCtaButtonEditorOptions,
      contact: defaultContactEditorOptions,
      relatedProducts: defaultRelatedProductsEditorOptions,
    };
    const defaultData = selectedContentType ? defaultsMap[selectedContentType] : {};
    return { ...defaultData, ...parsed };
  }, [selectedWidget, selectedContentType]);

  const addedIcons = useMemo(() => {
    if (selectedContentType === 'emailFooter') {
      const socialIcons = (widgetOptions as any)?.socialIcons;
      return {
        icons: Array.isArray(socialIcons?.icons) ? socialIcons.icons : [],
        urls: Array.isArray(socialIcons?.urls) ? socialIcons.urls : [],
      };
    }
    return { icons: [], urls: [] };
  }, [widgetOptions, selectedContentType]);

  const handleUpdateSocialIcons = useCallback((newSocialIcons: { icons: string[]; urls: string[] }) => {
    dispatch(updateEmailFooterEditorOptions({ socialIcons: newSocialIcons }));
  }, [dispatch]);

  const handleAddIcon = useCallback((key: string) => {
    if (!addedIcons.icons.includes(key)) {
      const newIcons = [...addedIcons.icons, key];
      const newUrls = [...addedIcons.urls, `https://${key}.com`];
      handleUpdateSocialIcons({ icons: newIcons, urls: newUrls });
    }
  }, [addedIcons, handleUpdateSocialIcons]);

  const handleDeleteIcon = useCallback((key: string) => {
    const index = addedIcons.icons.indexOf(key);
    if (index > -1) {
      const newIcons = addedIcons.icons.filter((_: string, i: number) => i !== index);
      const newUrls = addedIcons.urls.filter((_: string, i: number) => i !== index);
      handleUpdateSocialIcons({ icons: newIcons, urls: newUrls });
    }
  }, [addedIcons, handleUpdateSocialIcons]);

  const handleUrlChange = useCallback((key: string, value: string) => {
    const index = addedIcons.icons.indexOf(key);
    if (index > -1) {
      const newUrls = [...addedIcons.urls];
      newUrls[index] = value;
      handleUpdateSocialIcons({ icons: addedIcons.icons, urls: newUrls });
    }
  }, [addedIcons, handleUpdateSocialIcons]);


  const defaultTag = useMemo(() => {
    const isContainer = selectedSubElementId?.endsWith('_container') || selectedSubElementId === 'outer_container';
    if (isContainer) return 'div';
    if (selectedSubElementId === 'header_title') return 'h4';
    
    // Default to span for address labels and values to support email-safe inline layout
    const isAddressField = selectedContentType === 'billingAddress' || selectedContentType === 'shippingAddress' || selectedContentType === 'taxBilling';
    if (isAddressField) return 'span';
    
    return 'p';
  }, [selectedSubElementId, selectedContentType]);

  const subStyles = useMemo(() => {
    const savedStyles = widgetOptions.subStyles?.[selectedSubElementId!] ?? {};
    return {
      ...getDefaultSubElementStyles(selectedContentType, selectedSubElementId),
      ...savedStyles,
    };
  }, [widgetOptions, selectedContentType, selectedSubElementId]);

  /* ── content field mapping ── */
  const contentFieldInfo = useMemo(() => {
    if (!selectedSubElementId || !selectedContentType) return null;
    const map: Record<string, { key: string; label: string }> = {
      header_title: { key: 'title', label: 'Header Title' },
      name_label: { key: 'nameLabel', label: 'Name Label' },
      name_value: { key: 'fullName', label: 'Name Value' },
      phone_label: { key: 'phoneLabel', label: 'Phone Label' },
      phone_value: { key: 'phone', label: 'Phone Value' },
      email_label: { key: 'emailLabel', label: 'Email Label' },
      email_value: { key: 'email', label: 'Email Value' },
      address1_label: { key: 'addressLine1Label', label: 'Address 1 Label' },
      address1_value: { key: 'addressLine1', label: 'Address 1 Value' },
      address2_label: { key: 'addressLine2Label', label: 'Address 2 Label' },
      address2_value: { key: 'addressLine2', label: 'Address 2 Value' },
      city_label: { key: 'cityLabel', label: 'City Label' },
      city_value: { key: 'city', label: 'City Value' },
      state_label: { key: 'stateLabel', label: 'State Label' },
      state_value: { key: 'state', label: 'State Value' },
      postalCode_label: { key: 'postalCodeLabel', label: 'Postal Code Label' },
      postalCode_value: { key: 'postalCode', label: 'Postal Code Value' },
      country_label: { key: 'countryLabel', label: 'Country Label' },
      country_value: { key: 'country', label: 'Country Value' },
      order_heading: { key: 'orderHeading', label: 'Order Heading' },
      header_product: { key: 'productHeader', label: 'Product Header' },
      header_quantity: { key: 'quantityHeader', label: 'Quantity Header' },
      header_price: { key: 'priceHeader', label: 'Price Header' },
      item_product: { key: 'productPlaceholder', label: 'Product Value' },
      item_quantity: { key: 'quantityPlaceholder', label: 'Quantity Value' },
      item_price: { key: 'pricePlaceholder', label: 'Price Value' },
      subtotal_label: { key: 'subtotalLabel', label: 'Subtotal Label' },
      subtotal_value: { key: 'subtotal', label: 'Subtotal Value' },
      discount_label: { key: 'discountLabel', label: 'Discount Label' },
      discount_value: { key: 'discount', label: 'Discount Value' },
      payment_label: { key: 'paymentLabel', label: 'Payment Label' },
      payment_value: { key: 'paymentMethod', label: 'Payment Value' },
      total_label: { key: 'totalLabel', label: 'Total Label' },
      total_value: { key: 'total', label: 'Total Value' },
      button_element: { key: 'text', label: 'Button Text' },
      section_title: { key: 'title', label: 'Section Title' },
    };
    const orderItemsContentIds = new Set([
      'order_heading',
      'header_product',
      'header_quantity',
      'header_price',
      'item_product',
      'item_quantity',
      'item_price',
      'subtotal_label',
      'subtotal_value',
      'discount_label',
      'discount_value',
      'payment_label',
      'payment_value',
      'total_label',
      'total_value',
    ]);
    if (selectedContentType === 'taxBilling') {
      const taxBillingMap: Record<string, { key: string; label: string; fallback?: string }> = {
        invoice_title: { key: 'invoiceTitle', label: 'Invoice Title', fallback: 'Tax Invoice' },
        order_date_label: { key: 'orderDateLabel', label: 'Order Date Label', fallback: 'Order Date:' },
        order_date_value: { key: 'orderDate', label: 'Order Date Value', fallback: '{{order_date}}' },
        subtotal_label: { key: 'subtotalLabel', label: 'Subtotal Label', fallback: 'Subtotal' },
        subtotal_value: { key: 'orderSubtotal', label: 'Subtotal Value', fallback: '{{order_subtotal}}' },
        shipping_label: { key: 'shippingLabel', label: 'Shipping Label', fallback: 'Shipping' },
        shipping_value: { key: 'orderShipping', label: 'Shipping Value', fallback: '{{shipping_cost}}' },
        discount_label: { key: 'discountLabel', label: 'Discount Label', fallback: 'Discount' },
        discount_value: { key: 'orderDiscount', label: 'Discount Value', fallback: '{{order_discount}}' },
        tax_label: { key: 'taxLabel', label: 'Tax Label', fallback: 'Tax' },
        tax_value: { key: 'orderTax', label: 'Tax Value', fallback: '{{tax_amount}}' },
        tax_rate_label: { key: 'taxRateLabel', label: 'Tax Rate Label', fallback: 'Tax Rate' },
        tax_rate_value: { key: 'taxRate', label: 'Tax Rate Value', fallback: '{{tax_rate}}' },
        total_label: { key: 'totalLabel', label: 'Total Label', fallback: 'Total' },
        total_value: { key: 'orderTotal', label: 'Total Value', fallback: '{{order_total}}' },
        billing_address_title: { key: 'billingAddressTitle', label: 'Billing Address Title', fallback: 'Billing Address:' },
        billing_name_label: { key: 'billingNameLabel', label: 'Billing Name Label', fallback: 'Name:' },
        billing_name_value: { key: 'billingFirstName', label: 'Billing Name Value', fallback: '{{billing_first_name}} {{billing_last_name}}' },
        billing_name_container: { key: 'billingFirstName', label: 'Billing Name Value', fallback: '{{billing_first_name}} {{billing_last_name}}' },
        billing_address_label: { key: 'billingAddressLabel', label: 'Billing Address Label', fallback: 'Address:' },
        billing_address_value: { key: 'billingAddress1', label: 'Billing Address Value', fallback: '{{billing_address_1}}' },
        billing_address_line_container: { key: 'billingAddress1', label: 'Billing Address Value', fallback: '{{billing_address_1}}' },
        billing_location_label: { key: 'billingLocationLabel', label: 'Billing Location Label', fallback: 'Location:' },
        billing_location_value: { key: 'billingCity', label: 'Billing Location Value', fallback: '{{billing_city}}, {{billing_state}} {{billing_postcode}}, {{billing_country}}' },
        billing_location_container: { key: 'billingCity', label: 'Billing Location Value', fallback: '{{billing_city}}, {{billing_state}} {{billing_postcode}}, {{billing_country}}' },
        footer_text: { key: 'footerText', label: 'Footer Text', fallback: 'Tax Billing' },
      };
      const taxEntry = taxBillingMap[selectedSubElementId];
      if (!taxEntry) return null;
      return { ...taxEntry, value: widgetOptions[taxEntry.key] || taxEntry.fallback || '' };
    }
    const widgetSpecificMaps: Record<string, Record<string, { key: string; label: string }>> = {
      emailHeader: {
        header_title: { key: 'logoUrl', label: 'Logo URL' },
      },
      emailFooter: {
        footer_address: { key: 'storeAddress', label: 'Store Address' },
        footer_email_label: { key: 'emailLabel', label: 'Email Label' },
        footer_email_value: { key: 'contactEmail', label: 'Email Value' },
        footer_phone_label: { key: 'phoneLabel', label: 'Phone Label' },
        footer_phone_value: { key: 'contactPhone', label: 'Phone Value' },
        footer_privacy_link: { key: 'privacyLinkText', label: 'Privacy Link Text' },
        footer_terms_link: { key: 'termsLinkText', label: 'Terms Link Text' },
        footer_copyright: { key: 'copyrightText', label: 'Copyright Text' },
      },
      orderSubtotal: {
        subtotal_label: { key: 'subtotalLabel', label: 'Subtotal Label' },
        subtotal_value: { key: 'subtotalValue', label: 'Subtotal Value' },
        discount_label: { key: 'discountLabel', label: 'Discount Label' },
        discount_value: { key: 'discountValue', label: 'Discount Value' },
        shipping_label: { key: 'shippingLabel', label: 'Shipping Label' },
        shipping_value: { key: 'shippingValue', label: 'Shipping Value' },
        refunded_full_label: { key: 'refundedFullyLabel', label: 'Fully Refunded Label' },
        refunded_full_value: { key: 'refundedFullyValue', label: 'Fully Refunded Value' },
        refunded_partial_label: { key: 'refundedPartialLabel', label: 'Refund Label' },
        refunded_partial_value: { key: 'refundedPartialValue', label: 'Refund Value' },
        label_p: { key: 'label', label: 'Label' },
        value_p: { key: 'value', label: 'Value' },
      },
      orderTotal: {
        label_p: { key: 'label', label: 'Label' },
        value_p: { key: 'value', label: 'Value' },
      },
      shippingMethod: {
        label_p: { key: 'label', label: 'Label' },
        value_p: { key: 'value', label: 'Value' },
      },
      paymentMethod: {
        label_p: { key: 'label', label: 'Label' },
        value_p: { key: 'value', label: 'Value' },
      },
      customerNote: {
        note_label: { key: 'label', label: 'Note Label' },
        note_value: { key: 'value', label: 'Note Value' },
      },
      ctaButton: {
        button_elem: { key: 'buttonText', label: 'Button Text' },
      },
      contact: {
        url_p: { key: 'url', label: 'URL Text' },
        email_p: { key: 'email', label: 'Email Text' },
        phone_p: { key: 'phone', label: 'Phone Text' },
      },
      productDetails: {
        header_product: { key: 'productHeader', label: 'Product Header' },
        header_quantity: { key: 'quantityHeader', label: 'Quantity Header' },
        header_price: { key: 'priceHeader', label: 'Price Header' },
        item_product: { key: 'productPlaceholder', label: 'Product Value' },
        item_quantity: { key: 'quantityPlaceholder', label: 'Quantity Value' },
        item_price: { key: 'pricePlaceholder', label: 'Price Value' },
      },
    };
    const widgetMap = widgetSpecificMaps[selectedContentType];
    const widgetEntry = widgetMap?.[selectedSubElementId];
    if (widgetEntry) {
      return { ...widgetEntry, value: widgetOptions[widgetEntry.key] ?? '' };
    }
    if (orderItemsContentIds.has(selectedSubElementId) && selectedContentType !== 'orderItems') return null;
    const entry = map[selectedSubElementId];
    if (!entry) return null;
    return { ...entry, value: widgetOptions[entry.key] ?? '' };
  }, [selectedSubElementId, selectedContentType, widgetOptions]);

  const handleContentChange = useCallback((newValue: string) => {
    if (!contentFieldInfo || !selectedContentType) return;
    const payload = { [contentFieldInfo.key]: newValue };
    switch (selectedContentType) {
      case 'billingAddress': dispatch(updateBillingAddressEditorOptions(payload)); break;
      case 'shippingAddress': dispatch(updateShippingAddressEditorOptions(payload)); break;
      case 'taxBilling': dispatch(updateTaxBillingEditorOptions(payload)); break;
      case 'orderItems': dispatch(updateOrderItemsEditorOptions(payload)); break;
      case 'emailHeader': dispatch(updateEmailHeaderEditorOptions(payload)); break;
      case 'emailFooter': dispatch(updateEmailFooterEditorOptions(payload)); break;
      case 'orderSubtotal': dispatch(updateOrderSubtotalEditorOptions(payload)); break;
      case 'orderTotal': dispatch(updateOrderTotalEditorOptions(payload)); break;
      case 'shippingMethod': dispatch(updateShippingMethodEditorOptions(payload)); break;
      case 'paymentMethod': dispatch(updatePaymentMethodEditorOptions(payload)); break;
      case 'customerNote': dispatch(updateCustomerNoteEditorOptions(payload)); break;
      case 'productDetails': dispatch(updateProductDetailsEditorOptions(payload)); break;
      case 'ctaButton': dispatch(updateCtaButtonEditorOptions(payload)); break;
      case 'contact': dispatch(updateContactEditorOptions(payload)); break;
      case 'relatedProducts': dispatch(updateRelatedProductsEditorOptions(payload)); break;
    }
  }, [contentFieldInfo, selectedContentType, dispatch]);

  const upd = useCallback((s: Record<string, any>) => dispatch(updateSubElementStyles(s)), [dispatch]);

  const handleColumnGapChange = useCallback((val: string) => {
    if (gapsLinked) {
      upd({ columnGap: val, rowGap: val });
    } else {
      upd({ columnGap: val });
    }
  }, [gapsLinked, upd]);

  const handleRowGapChange = useCallback((val: string) => {
    if (gapsLinked) {
      upd({ columnGap: val, rowGap: val });
    } else {
      upd({ rowGap: val });
    }
  }, [gapsLinked, upd]);

  const isAddressWidget = selectedContentType === 'billingAddress' || selectedContentType === 'shippingAddress';
  
  const isWooCommerceWidget = [
    'billingAddress', 'shippingAddress', 'orderItems', 'taxBilling', 'emailHeader',
    'emailFooter', 'ctaButton', 'relatedProducts', 'orderSubtotal', 'orderTotal',
    'shippingMethod', 'paymentMethod', 'customerNote', 'contact', 'productDetails'
  ].includes(selectedContentType as string);
  
  // Determine the default padding based on widget type and element
  const defaultPadding = useMemo(() => {
    if (isAddressWidget && selectedSubElementId === 'outer_container') {
      return { top: 16, right: 16, bottom: 16, left: 16 };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }, [selectedSubElementId, isAddressWidget]);

  /* ── destructure current sub-styles ── */
  const {
    fontFamily = 'Global', fontWeight = '400', fontSize = '',
    color = '', backgroundColor = '',
    textAlign = 'left', lineHeight = '',
    width = '', height = '',
    display: displayProp = 'block',
    flexDirection = 'row', justifyContent = 'flex-start',
    alignItems = 'stretch', flexWrap = 'nowrap',
    columnGap = '', rowGap = '',
    padding = defaultPadding,
    margin = { top: 0, right: 0, bottom: 0, left: 0 },
    // link / tag
    htmlTag = '', linkHref = '', linkTarget = '_self',
  } = subStyles;

  const isFlex = displayProp === 'flex' || displayProp === 'inline-flex';

  const displayName = useMemo(() => {
    if (!selectedSubElementId) return 'Element';
    // When the whole widget is selected (auto-selected outer_container), show the widget name
    if (selectedSubElementId === 'outer_container' && selectedContentType) {
      const wooLabels: Record<string, string> = {
        billingAddress: 'Billing Address',
        shippingAddress: 'Shipping Address',
        orderItems: 'Order Items',
        taxBilling: 'Tax & Billing',
        emailHeader: 'Email Header',
        emailFooter: 'Email Footer',
        ctaButton: 'CTA Button',
        relatedProducts: 'Related Products',
        orderSubtotal: 'Order Subtotal',
        orderTotal: 'Order Total',
        shippingMethod: 'Shipping Method',
        paymentMethod: 'Payment Method',
        customerNote: 'Customer Note',
        contact: 'Contact',
        productDetails: 'Product Details',
      };
      return wooLabels[selectedContentType] || selectedContentType.toUpperCase();
    }
    return selectedSubElementId.replace(/_/g, ' ').toUpperCase();
  }, [selectedSubElementId, selectedContentType]);

  const isContainer = selectedSubElementId?.endsWith('_container') || selectedSubElementId === 'outer_container';

  const isBillingNameField =
    (selectedContentType === 'billingAddress' || selectedContentType === 'shippingAddress' || selectedContentType === 'taxBilling') &&
    (
      selectedSubElementId === 'name_label' || selectedSubElementId === 'name_value' || selectedSubElementId === 'name_container' ||
      selectedSubElementId === 'billing_name_label' || selectedSubElementId === 'billing_name_value' || selectedSubElementId === 'billing_name_container' ||
      selectedSubElementId === 'phone_label' || selectedSubElementId === 'phone_value' || selectedSubElementId === 'phone_container'
    );

  const tabs: any[] = [];

  /* ══════ CONTENT TAB — always shown for all elements ══════ */
  {
    // Is this a text/leaf element (has editable text content)?
    const hasTextContent = !!contentFieldInfo;

    // HTML tag options
    const tagOptions = isContainer
      ? ['', 'div', 'section']
      : ['', 'p', 'span', 'h1', 'h2', 'h3', 'h4', 'a', 'strong', 'em'];

    const elementLabel = hasTextContent ? contentFieldInfo!.label : displayName;

    tabs.push({
      label: 'Content',
      content: (
        <Box sx={{ p: 0, bgcolor: '#fff' }}>
          {selectedSubElementId === 'footer_social' && selectedContentType === 'emailFooter' ? (
            <Box sx={{ px: 1.5, pt: 1.5, pb: 1.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#555', mr: 0.5 }} />
                <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                  Social Icons
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                  {Object.keys(socialIconsMap)
                    .filter((key) => !addedIcons.icons.includes(key))
                    .map((key) => (
                      <Tooltip title={`Add ${key}`} key={key}>
                        <Box
                          onClick={() => handleAddIcon(key)}
                          sx={{
                            width: 28, height: 28,
                            borderRadius: "4px",
                            border: '1px solid #e0e0e0',
                            display: "flex", justifyContent: "center", alignItems: "center",
                            cursor: "pointer", bgcolor: '#f9f9f9',
                            "&:hover": { bgcolor: '#fff', borderColor: socialIconsMap[key].color }
                          }}
                        >
                          {React.cloneElement(socialIconsMap[key].icon, { sx: { width: 16, height: 16, color: socialIconsMap[key].color } })}
                        </Box>
                      </Tooltip>
                    ))}
                </Box>

                <Stack spacing={1}>
                  {addedIcons.icons.map((key: string, index: number) => (
                    <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #e7e9eb', p: '4px 8px', borderRadius: '4px' }}>
                      {socialIconsMap[key]?.icon ? React.cloneElement(socialIconsMap[key].icon, { sx: { width: 18, height: 18, color: socialIconsMap[key].color } }) : null}
                      <TextField
                        size="small"
                        fullWidth
                        variant="standard"
                        value={addedIcons.urls[index] || ''}
                        onChange={(e) => handleUrlChange(key, e.target.value)}
                        InputProps={{ disableUnderline: true, sx: { fontSize: '11px' } }}
                      />
                      <IconButton size="small" onClick={() => handleDeleteIcon(key)} sx={{ p: 0.2 }}>
                        <DeleteIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                      </IconButton>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : (
            <>
              {/* ── Section: Title (only for text elements) ── */}
              {hasTextContent && (
                <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
                  {/* Section header */}
                  <Box
                    sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer', mb: 1 }}
                  >
                    <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#555', mr: 0.5 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                      {elementLabel}
                    </Typography>
                  </Box>
                  {/* Title field */}
                  <Box mb={1}>
                    <Typography sx={{ fontSize: '11px', color: '#777', mb: 0.5 }}>{contentFieldInfo!.label}</Typography>
                    <TextField
                      multiline
                      minRows={3}
                      fullWidth
                      size="small"
                      value={contentFieldInfo!.value}
                      placeholder={contentFieldInfo!.fallback || ''}
                      onChange={e => handleContentChange(e.target.value)}
                      InputProps={{
                        sx: {
                          fontSize: '13px',
                          bgcolor: '#fff',
                          border: '1px solid #d5dadf',
                          borderRadius: '4px',
                          '& fieldset': { border: 'none' },
                          '& .MuiInputBase-input': {
                            color: '#23282d !important',
                            WebkitTextFillColor: '#23282d !important',
                          }
                        }
                      }}
                    />
                  </Box>

                  {/* Additional URL field for specific links */}
                  {(selectedSubElementId === 'footer_privacy_link' || selectedSubElementId === 'footer_terms_link') && (
                    <Box mb={1} mt={1.5}>
                      <Typography sx={{ fontSize: '11px', color: '#777', mb: 0.5 }}>URL</Typography>
                      <TextField
                        fullWidth
                        size="small"
                        value={selectedSubElementId === 'footer_privacy_link' ? (widgetOptions?.privacyLinkUrl || '') : (widgetOptions?.termsLinkUrl || '')}
                        placeholder="https://example.com"
                        onChange={e => {
                          const payload = selectedSubElementId === 'footer_privacy_link'
                            ? { privacyLinkUrl: e.target.value }
                            : { termsLinkUrl: e.target.value };
                          dispatch(updateEmailFooterEditorOptions(payload));
                        }}
                        InputProps={{
                          sx: {
                            fontSize: '13px',
                            bgcolor: '#fff',
                            border: '1px solid #d5dadf',
                            borderRadius: '4px',
                            '& fieldset': { border: 'none' },
                            '& .MuiInputBase-input': {
                              color: '#23282d !important',
                              WebkitTextFillColor: '#23282d !important',
                            }
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              )}

              {!hasTextContent && (
                <Box sx={{ px: 1.5, pt: 1.5, pb: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#555', mr: 0.5 }} />
                    <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#333' }}>
                      {elementLabel}
                    </Typography>
                  </Box>
                </Box>
              )}

              {false && (
                <>
                  <Divider />
                  {/* ── Link field ── */}
                  <Box sx={{ px: 1.5, py: 1.25 }}>
                    <Typography sx={{ fontSize: '11px', color: '#777', mb: 0.5 }}>Link</Typography>
                    <Box display="flex" alignItems="center" gap={0.5}>
                      <TextField
                        size="small"
                        fullWidth
                        value={linkHref}
                        placeholder="Type or paste your URL"
                        onChange={e => upd({ linkHref: e.target.value })}
                        InputProps={{
                          sx: {
                            fontSize: '12px',
                            bgcolor: '#fff',
                            border: '1px solid #d5dadf',
                            borderRadius: '4px',
                            '& fieldset': { border: 'none' },
                            '& input': { py: '7px' },
                            '& .MuiInputBase-input': {
                              color: '#23282d !important',
                              WebkitTextFillColor: '#23282d !important',
                            }
                          }
                        }}
                      />
                      {/* Clear button */}
                      {linkHref && (
                        <IconButton
                          size="small"
                          onClick={() => upd({ linkHref: '' })}
                          sx={{ color: '#aaa', p: '4px', '&:hover': { color: '#e53935' } }}
                          title="Clear link"
                        >
                          <Typography sx={{ fontSize: '14px', lineHeight: 1 }}>✕</Typography>
                        </IconButton>
                      )}
                    </Box>
                    {/* Open In toggle — only when link is set */}
                    {linkHref && (
                      <Box display="flex" gap={0.5} mt={0.75}>
                        {[{ v: '_self', l: 'Same Tab' }, { v: '_blank', l: 'New Tab' }].map(({ v, l }) => (
                          <Box
                            key={v}
                            onClick={() => upd({ linkTarget: v })}
                            sx={{
                              flex: 1, textAlign: 'center',
                              py: 0.6, border: '1px solid',
                              borderColor: linkTarget === v ? '#1976d2' : '#d5dadf',
                              borderRadius: '4px', cursor: 'pointer',
                              bgcolor: linkTarget === v ? '#e3f2fd' : '#fafafa',
                              color: linkTarget === v ? '#1976d2' : '#666',
                              fontSize: '11px', fontWeight: linkTarget === v ? 700 : 400,
                              transition: 'all 0.15s',
                            }}
                          >
                            {l}
                          </Box>
                        ))}
                      </Box>
                    )}
                  </Box>
                </>
              )}

              <Divider />

              {/* ── HTML Tag dropdown ── */}
              <Box sx={{ px: 1.5, py: 1.25 }}>
                <Typography sx={{ fontSize: '11px', color: '#777', mb: 0.5 }}>HTML Tag</Typography>
                <Select
                  size="small"
                  fullWidth
                  value={htmlTag || defaultTag}
                  onChange={e => upd({ htmlTag: e.target.value })}
                  sx={{
                    fontSize: '12px',
                    bgcolor: '#fff',
                    border: '1px solid #d5dadf',
                    borderRadius: '4px',
                    '& fieldset': { border: 'none' },
                  }}
                  MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                >
                  {tagOptions.map(t => (
                    <MenuItem key={t} value={t} sx={{ fontSize: '12px' }}>
                      {t || `${defaultTag} (default)`}
                    </MenuItem>
                  ))}
                </Select>
              </Box>
            </>
          )}
        </Box>
      ),
    });
  }

  /* ══════ STYLE TAB ══════ */
  tabs.push({
    label: 'Style',
    content: (
      <Box sx={{ p: 1, bgcolor: '#fff' }}>
        {!isWooCommerceWidget && (
          <>
            <Section title="Layout">
              <Row label="Display">
                <ToggleButtonGroup exclusive size="small" value={displayProp}
                  onChange={(_, v) => v && upd({ display: v })} sx={{ flexWrap: 'wrap' }}>
                  {[
                    { v: 'block', l: 'Block' },
                    { v: 'flex', l: 'Flex' },
                    { v: 'grid', l: 'Grid' },
                    { v: 'inline-block', l: 'In-blk' },
                    { v: 'inline-flex', l: 'In-flx' },
                  ].map(({ v, l }) => (
                    <ToggleButton key={v} value={v} sx={{ fontSize: '9px', px: '6px', py: '3px', textTransform: 'none' }}>{l}</ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Row>
            </Section>

            {isFlex && (
              <Section title="Flex">
                <Row label="Direction">
                  <ToggleButtonGroup exclusive size="small" value={flexDirection}
                    onChange={(_, v) => v && upd({ flexDirection: v })}>
                    {[
                      { v: 'row', l: '→' },
                      { v: 'column', l: '↓' },
                      { v: 'row-reverse', l: '←' },
                      { v: 'column-reverse', l: '↑' },
                    ].map(({ v, l }) => (
                      <ToggleButton key={v} value={v} sx={{ fontSize: '13px', px: '8px', py: '3px' }}>{l}</ToggleButton>
                    ))}
                  </ToggleButtonGroup>
                </Row>
                <Row label="Justify">
                  <ToggleButtonGroup exclusive size="small" value={justifyContent || 'flex-start'}
                    onChange={(_, v) => v && upd({ justifyContent: v })}>
                    {[
                      {
                        v: 'flex-start', tooltip: 'Start', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <rect x="3" y="6" width="3" height="12" rx="0.5" />
                            <rect x="8" y="6" width="3" height="12" rx="0.5" />
                            <path d="M20 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </Box>
                        )
                      },
                      {
                        v: 'center', tooltip: 'Center', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <rect x="7" y="6" width="3" height="12" rx="0.5" />
                            <rect x="14" y="6" width="3" height="12" rx="0.5" />
                            <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                          </Box>
                        )
                      },
                      {
                        v: 'flex-end', tooltip: 'End', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <path d="M4 4v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            <rect x="13" y="6" width="3" height="12" rx="0.5" />
                            <rect x="18" y="6" width="3" height="12" rx="0.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'space-between', tooltip: 'Space Between', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <rect x="3" y="6" width="3" height="12" rx="0.5" />
                            <rect x="18" y="6" width="3" height="12" rx="0.5" />
                            <path d="M8 12h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
                          </Box>
                        )
                      },
                      {
                        v: 'space-around', tooltip: 'Space Around', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <rect x="5" y="6" width="3" height="12" rx="0.5" />
                            <rect x="16" y="6" width="3" height="12" rx="0.5" />
                            <path d="M2 12h2M10 12h4M20 12h2" stroke="currentColor" strokeWidth="1.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'space-evenly', tooltip: 'Space Evenly', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <rect x="6" y="6" width="3" height="12" rx="0.5" />
                            <rect x="15" y="6" width="3" height="12" rx="0.5" />
                            <path d="M2 12h3M11 12h2M20 12h2" stroke="currentColor" strokeWidth="1.5" />
                          </Box>
                        )
                      },
                    ].map(({ v, tooltip, icon }) => (
                      <Tooltip key={v} title={tooltip} arrow>
                        <ToggleButton value={v} sx={{ px: '6px', py: '3px' }}>{icon}</ToggleButton>
                      </Tooltip>
                    ))}
                  </ToggleButtonGroup>
                </Row>
                <Row label="Align">
                  <ToggleButtonGroup exclusive size="small" value={alignItems || 'stretch'}
                    onChange={(_, v) => v && upd({ alignItems: v })}>
                    {[
                      {
                        v: 'stretch', tooltip: 'Stretch', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <path d="M3 3h18M3 21h18" stroke="currentColor" strokeWidth="1.5" />
                            <rect x="5" y="5" width="4" height="14" rx="0.5" />
                            <rect x="15" y="5" width="4" height="14" rx="0.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'flex-start', tooltip: 'Start', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <path d="M3 3h18" stroke="currentColor" strokeWidth="2" />
                            <rect x="5" y="6" width="4" height="6" rx="0.5" />
                            <rect x="15" y="6" width="4" height="10" rx="0.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'center', tooltip: 'Center', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <path d="M2 12h20" stroke="currentColor" strokeWidth="1.5" strokeDasharray="3 3" />
                            <rect x="5" y="9" width="4" height="6" rx="0.5" />
                            <rect x="15" y="7" width="4" height="10" rx="0.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'flex-end', tooltip: 'End', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'currentColor', display: 'flex' }}>
                            <path d="M3 21h18" stroke="currentColor" strokeWidth="2" />
                            <rect x="5" y="12" width="4" height="6" rx="0.5" />
                            <rect x="15" y="8" width="4" height="10" rx="0.5" />
                          </Box>
                        )
                      },
                      {
                        v: 'baseline', tooltip: 'Baseline', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <path d="M2 18h20" stroke="currentColor" strokeWidth="1.5" />
                            <text x="4" y="15" fontSize="10" fontFamily="sans-serif" fontWeight="bold" fill="currentColor" stroke="none">A</text>
                            <text x="13" y="15" fontSize="7" fontFamily="sans-serif" fontWeight="bold" fill="currentColor" stroke="none">a</text>
                          </Box>
                        )
                      },
                    ].map(({ v, tooltip, icon }) => (
                      <Tooltip key={v} title={tooltip} arrow>
                        <ToggleButton value={v} sx={{ px: '8px', py: '3px' }}>{icon}</ToggleButton>
                      </Tooltip>
                    ))}
                  </ToggleButtonGroup>
                </Row>
                <Row label="Wrap">
                  <ToggleButtonGroup exclusive size="small" value={flexWrap || 'nowrap'}
                    onChange={(_, v) => v && upd({ flexWrap: v })}>
                    {[
                      {
                        v: 'nowrap', tooltip: 'No Wrap', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'flex' }}>
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <polyline points="15 6 21 12 15 18"></polyline>
                          </Box>
                        )
                      },
                      {
                        v: 'wrap', tooltip: 'Wrap', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'flex' }}>
                            <path d="M3 8h12a5 5 0 0 1 0 10H6"></path>
                            <polyline points="10 14 6 18 10 22"></polyline>
                          </Box>
                        )
                      },
                      {
                        v: 'wrap-reverse', tooltip: 'Wrap Reverse', icon: (
                          <Box component="svg" viewBox="0 0 24 24" sx={{ width: 14, height: 14, fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'flex' }}>
                            <path d="M3 16h12a5 5 0 0 0 0-10H6"></path>
                            <polyline points="10 10 6 6 10 2"></polyline>
                          </Box>
                        )
                      },
                    ].map(({ v, tooltip, icon }) => (
                      <Tooltip key={v} title={tooltip} arrow>
                        <ToggleButton value={v} sx={{ px: '12px', py: '3px' }}>{icon}</ToggleButton>
                      </Tooltip>
                    ))}
                  </ToggleButtonGroup>
                </Row>
                <Box sx={{ mt: 1.5 }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 500, color: '#666' }}>Gaps</Typography>
                    <IconButton size="small" onClick={() => setGapsLinked(!gapsLinked)} sx={{ p: 0.25, color: gapsLinked ? '#9c27b0' : '#888' }}>
                      {gapsLinked ? <LinkIcon sx={{ fontSize: 16 }} /> : <LinkOffIcon sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Stack>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1}>
                    <Box>
                      <Typography sx={{ fontSize: '9px', fontWeight: 600, color: '#888', mb: 0.25, textTransform: 'uppercase' }}>Column</Typography>
                      <TextField size="small" value={columnGap} placeholder="px" onChange={e => handleColumnGapChange(e.target.value)}
                        InputProps={{ sx: { fontSize: '11px', py: '2px', px: '6px' } }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '9px', fontWeight: 600, color: '#888', mb: 0.25, textTransform: 'uppercase' }}>Row</Typography>
                      <TextField size="small" value={rowGap} placeholder="px" onChange={e => handleRowGapChange(e.target.value)}
                        InputProps={{ sx: { fontSize: '11px', py: '2px', px: '6px' } }} />
                    </Box>
                  </Box>
                </Box>
              </Section>
            )}
          </>
        )}

        <StyleTabContent subStyles={subStyles} onUpdate={upd} showTypography={!isContainer} showDimensions={true} />
      </Box>
    ),
  });

  tabs.push({
    label: 'Advanced',
    content: (
      <Box sx={{ p: 1.5, bgcolor: '#fff' }}>
        <AdvancedTabContent subStyles={subStyles} onUpdate={upd} />
      </Box>
    ),
  });

  return (
    <WidgetEditorWrapper
      title={displayName}
      description={selectedSubElementId === 'outer_container' ? `Container styles for ${displayName}` : `Styling for ${displayName}`}
      onClose={() => dispatch(closeEditor())}
      onDelete={handleDeleteContent}
      tabs={tabs}
      disableStyleInterception={[
        'billingAddress',
        'shippingAddress',
        'orderItems',
        'taxBilling',
        'emailHeader',
        'emailFooter',
        'ctaButton',
        'relatedProducts',
        'orderSubtotal',
        'orderTotal',
        'shippingMethod',
        'paymentMethod',
        'customerNote',
        'contact',
        'productDetails'
      ].includes(selectedContentType || '')}
    />
  );
};

export default SubElementWidgetEditor;
