import { createSlice, PayloadAction, current, Reducer } from '@reduxjs/toolkit';

function extractHtmlLinkOptions(html: string, linkId: string): any {
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const linkEl = doc.getElementById(linkId);
      if (linkEl) {
        const url = linkEl.getAttribute('href') || '#';
        const text = linkEl.textContent || '';
        const style = linkEl.getAttribute('style') || '';
        
        let color = '#007bff';
        const colorMatch = style.match(/color\s*:\s*([^;]+)/i);
        if (colorMatch && colorMatch[1]) {
          color = colorMatch[1].trim();
        }
        
        const underline = style.toLowerCase().includes('text-decoration: underline') || 
                          style.toLowerCase().includes('text-decoration:underline');
        
        return {
          url,
          text,
          color,
          underline,
        };
      }
    } catch (e) {
      console.error("DOMParser error in extractHtmlLinkOptions:", e);
    }
  }
  return null;
}

function updateHtmlLink(html: string, linkId: string, payload: any): string {
  if (typeof window !== 'undefined' && window.DOMParser) {
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const linkEl = doc.getElementById(linkId);
      if (linkEl) {
        if (payload.url !== undefined) linkEl.setAttribute('href', payload.url);
        if (payload.text !== undefined) linkEl.textContent = payload.text;
        
        // Update style attribute
        let style = linkEl.getAttribute('style') || '';
        if (payload.color !== undefined) {
          style = style.replace(/color\s*:[^;]+;?/gi, '').trim();
          style += ` color: ${payload.color};`;
        }
        if (payload.underline !== undefined) {
          style = style.replace(/text-decoration\s*:[^;]+;?/gi, '').trim();
          style += ` text-decoration: ${payload.underline ? 'underline' : 'none'};`;
        }
        linkEl.setAttribute('style', style.trim());
      }
      return doc.body.innerHTML;
    } catch (e) {
      console.error("DOMParser error in updateHtmlLink:", e);
    }
  }
  return html;
}

interface ColumnStyle {
  bgColor: string;
  borderTopColor: string;
  borderBottomColor: string;
  borderLeftColor: string;
  borderRightColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderTopSize: number;
  borderBottomSize: number;
  borderLeftSize: number;
  borderRightSize: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  height: number | 'auto';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  bgImage?: string;
  bgSize?: string;
  bgPosition?: string;
  bgRepeat?: string;
  bgAttachment?: string;
  borderRadius?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  borderRadiusUnit?: 'px' | '%' | 'em';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  marginUnit?: 'px' | '%' | 'em';
  paddingUnit?: 'px' | '%' | 'em';
}

// Updated WidgetContentType with ALL component types in correct order
export type WidgetContentType = 'text' | 'heading' | 'socialIcons' | 'button' | 'divider' | 'image' |
  // Basic Layout
  'section' | 'spacer' | 'link' | 'icon' | 'table' |
  // Layout Block
  'row' | 'container' | 'group' | 'paragraph-row' |
  // Extra Block
  'socialFollow' | 'video' | 'countdown' | 'progressBar' | 'promoCode' | 'price' | 'testimonial' | 'navbar' | 'card' | 'alert' | 'progress' |
  // Forms
  'form' | 'survey' | 'input' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'label' |
  // WooCommerce Layout
  'billingAddress' | 'shippingAddress' | 'orderItems' | 'taxBilling' | 'emailHeader' | 'emailFooter' | 'ctaButton' | 'relatedProducts' |
  'orderSubtotal' | 'orderTotal' | 'shippingMethod' | 'paymentMethod' | 'customerNote' | 'contact' | 'productDetails' |
  'refundFull' | 'refundPartial' | null;

interface WidgetContent {
  contentType: WidgetContentType;
  contentData: string | null;
}

const deepGetWidgetData = (contentData: string | null, path: Array<{ colIdx: number; childIdx: number }>): any => {
  const data = JSON.parse(contentData || '{}');
  if (!path || path.length === 0) return data;
  const [head, ...tail] = path;
  let targetWidget = null;
  if (head.colIdx === -1) {
    targetWidget = data.children ? data.children[head.childIdx] : null;
  } else {
    targetWidget = data.columnsData && data.columnsData[head.colIdx] && data.columnsData[head.colIdx].children
      ? data.columnsData[head.colIdx].children[head.childIdx]
      : null;
  }
  if (!targetWidget) return {};
  return deepGetWidgetData(targetWidget.contentData, tail);
};

const deepUpdateWidgetData = (contentData: string | null, path: Array<{ colIdx: number; childIdx: number }>, payload: any): string => {
  const data = JSON.parse(contentData || '{}');

  if (!path || path.length === 0) {
    // Top-level update: Safety Check for lost children/columns
    if (data.children && data.children.length > 0 && (!payload.children || payload.children.length === 0)) {
      if (!payload.children) {
        payload.children = data.children;
      }
    }

    if (data.columnsData && data.columnsData.length > 0 && (!payload.columnsData || payload.columnsData.length === 0)) {
      if (!payload.columnsData) {
        payload.columnsData = data.columnsData;
      }
    }

    const merged = { ...data, ...payload };

    // Explicitly preserve if missing in payload
    if (data.children && !payload.children) {
      merged.children = data.children;
    }
    if (data.columnsData && !payload.columnsData) {
      merged.columnsData = data.columnsData;
    }

    return JSON.stringify(merged);
  }

  // Recursive update for nested children
  const [head, ...tail] = path;
  let targetWidget = null;
  if (head.colIdx === -1) {
    // FLAT CHILDREN (e.g. Container)
    if (!data.children) data.children = [];
    if (!data.children[head.childIdx]) data.children[head.childIdx] = { contentType: 'unknown', contentData: '{}' };
    targetWidget = data.children[head.childIdx];
  } else {
    // COLUMN BASED (e.g. Row)
    if (!data.columnsData) data.columnsData = [];
    if (!data.columnsData[head.colIdx]) data.columnsData[head.colIdx] = { id: head.colIdx.toString(), children: [] };
    if (!data.columnsData[head.colIdx].children) data.columnsData[head.colIdx].children = [];
    targetWidget = data.columnsData[head.colIdx].children[head.childIdx];
  }

  if (targetWidget) {
    targetWidget.contentData = deepUpdateWidgetData(targetWidget.contentData, tail, payload);
  }
  return JSON.stringify(data);
};

const deepInsertWidget = (
  contentData: string | null,
  path: Array<{ colIdx: number; childIdx: number }>,
  newWidget: any,
  insertInside?: boolean
): string => {
  const data = JSON.parse(contentData || '{}');

  if (!path || path.length === 0) {
    if (!data.children) data.children = [];
    data.children.push(newWidget);
    return JSON.stringify(data);
  }

  const [head, ...tail] = path;

  if (tail.length === 0 && !insertInside) {
    if (head.colIdx === -1) {
      if (!data.children) data.children = [];
      data.children.splice(head.childIdx + 1, 0, newWidget);
    } else {
      if (!data.columnsData) data.columnsData = [];
      if (!data.columnsData[head.colIdx]) {
        data.columnsData[head.colIdx] = { id: `col_${head.colIdx}`, children: [] };
      }
      if (!data.columnsData[head.colIdx].children) {
        data.columnsData[head.colIdx].children = [];
      }
      data.columnsData[head.colIdx].children.splice(head.childIdx + 1, 0, newWidget);
    }
    return JSON.stringify(data);
  }

  let targetWidget = null;
  if (head.colIdx === -1) {
    if (!data.children) data.children = [];
    targetWidget = data.children[head.childIdx];
  } else {
    if (!data.columnsData) data.columnsData = [];
    if (data.columnsData[head.colIdx] && data.columnsData[head.colIdx].children) {
      targetWidget = data.columnsData[head.colIdx].children[head.childIdx];
    }
  }

  if (targetWidget) {
    if (tail.length === 0 && insertInside) {
      const parsed = JSON.parse(targetWidget.contentData || '{}');
      if (!parsed.children) parsed.children = [];
      parsed.children.push(newWidget);
      targetWidget.contentData = JSON.stringify(parsed);
    } else {
      targetWidget.contentData = deepInsertWidget(targetWidget.contentData, tail, newWidget, insertInside);
    }
  }
  return JSON.stringify(data);
};

const deepDeleteWidgetData = (
  contentData: string | null,
  path: Array<{ colIdx: number; childIdx: number }>
): string => {
  const data = JSON.parse(contentData || '{}');

  if (!path || path.length === 0) {
    return JSON.stringify(data);
  }

  const [head, ...tail] = path;

  if (tail.length === 0) {
    if (head.colIdx === -1) {
      if (Array.isArray(data.children)) {
        data.children.splice(head.childIdx, 1);
      }
    } else if (Array.isArray(data.columnsData?.[head.colIdx]?.children)) {
      data.columnsData[head.colIdx].children.splice(head.childIdx, 1);
    }
    return JSON.stringify(data);
  }

  let targetWidget = null;
  if (head.colIdx === -1) {
    targetWidget = Array.isArray(data.children) ? data.children[head.childIdx] : null;
  } else {
    targetWidget = Array.isArray(data.columnsData?.[head.colIdx]?.children)
      ? data.columnsData[head.colIdx].children[head.childIdx]
      : null;
  }

  if (targetWidget) {
    targetWidget.contentData = deepDeleteWidgetData(targetWidget.contentData, tail);
  }

  return JSON.stringify(data);
};


interface Column {
  id: string;
  style: ColumnStyle;
  contentType: WidgetContentType;
  contentData: string | null;
  widgetContents: WidgetContent[];

  // Basic Layout
  textEditorOptions: TextEditorOptions;
  headingEditorOptions: HeadingEditorOptions;
  socialIconsEditorOptions: SocialIconsEditorOptions;
  dividerEditorOptions: DividerEditorOptions;
  imageEditorOptions: ImageEditorOptions;
  buttonEditorOptions: ButtonEditorOptions;
  sectionEditorOptions: SectionEditorOptions;
  spacerEditorOptions: SpacerEditorOptions;
  tableEditorOptions: TableEditorOptions;
  linkEditorOptions: LinkEditorOptions;

  iconEditorOptions: IconEditorOptions;

  // Layout Block
  rowEditorOptions: RowEditorOptions;
  containerEditorOptions: ContainerEditorOptions;
  groupEditorOptions: GroupEditorOptions;
  paragraphRowEditorOptions: ParagraphRowEditorOptions;

  // Extra Block
  socialFollowEditorOptions: SocialFollowEditorOptions;
  videoEditorOptions: VideoEditorOptions;

  countdownEditorOptions: CountdownEditorOptions;
  progressBarEditorOptions: ProgressBarEditorOptions;
  promoCodeEditorOptions: PromoCodeEditorOptions;
  priceEditorOptions: PriceEditorOptions;
  testimonialEditorOptions: TestimonialEditorOptions;
  navbarEditorOptions: NavbarEditorOptions;
  cardEditorOptions: CardEditorOptions;
  alertEditorOptions: AlertEditorOptions;
  progressEditorOptions: ProgressEditorOptions;

  // Forms
  formEditorOptions: FormEditorOptions;
  surveyEditorOptions: SurveyEditorOptions;
  inputEditorOptions: InputEditorOptions;
  textareaEditorOptions: TextareaEditorOptions;
  selectEditorOptions: SelectEditorOptions;
  checkboxEditorOptions: CheckboxEditorOptions;
  radioEditorOptions: RadioEditorOptions;
  labelEditorOptions: LabelEditorOptions;

  // WooCommerce Layout
  shippingAddressEditorOptions: ShippingAddressEditorOptions;
  billingAddressEditorOptions: BillingAddressEditorOptions;
  orderItemsEditorOptions: OrderItemsEditorOptions;
  taxBillingEditorOptions: TaxBillingEditorOptions;
  emailHeaderEditorOptions: EmailHeaderEditorOptions;
  emailFooterEditorOptions: EmailFooterEditorOptions;
  ctaButtonEditorOptions: CtaButtonEditorOptions;
  relatedProductsEditorOptions: RelatedProductsEditorOptions;
  orderSubtotalEditorOptions: OrderSubtotalEditorOptions;
  orderTotalEditorOptions: OrderTotalEditorOptions;
  shippingMethodEditorOptions: ShippingMethodEditorOptions;
  paymentMethodEditorOptions: PaymentMethodEditorOptions;
  customerNoteEditorOptions: CustomerNoteEditorOptions;
  contactEditorOptions: ContactEditorOptions;
  productDetailsEditorOptions: ProductDetailsEditorOptions;
  refundFullEditorOptions?: RefundFullEditorOptions;
  refundPartialEditorOptions?: RefundPartialEditorOptions;
}

interface BlockStyle {
  bgColor: string;
  borderTopColor: string;
  borderBottomColor: string;
  borderLeftColor: string;
  borderRightColor: string;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  borderTopSize: number;
  borderBottomSize: number;
  borderLeftSize: number;
  borderRightSize: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  height: number | 'auto';
}

interface DroppedBlock {
  id: string;
  name?: string;
  columns: Column[];
  style: BlockStyle;
}

export interface BodyStyle {
  backgroundColor: string;
  primaryColor?: string;
  secondaryColor?: string;
}

// ==================== BASIC LAYOUT INTERFACES ====================

export interface SectionEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  backgroundColor: string;
  backgroundImage: string;
  height: string;
  width: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  border: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted';
    color: string;
    radius: number;
  };
  children: Array<{
    id: string;
    contentType: WidgetContentType;
    contentData: string | null;
  }>;
}

export interface SpacerEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  height: number;
  width: string;
  backgroundColor: string;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface TableEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadius?: number;
  borderRadiusUnit?: 'px' | '%' | 'em';
  boxShadow?: string;
  rows: number;
  headings: { text: string }[];
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: string;
  tableLayout: 'auto' | 'fixed';
  width: string;
  cellPadding: number;
  cellSpacing: number;
  textAlign: 'left' | 'center' | 'right';
  tableAlign?: string;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
  
  headPadding?: { top: number; right: number; bottom: number; left: number };
  headPaddingUnit?: string;
  rowPadding?: { top: number; right: number; bottom: number; left: number };
  rowPaddingUnit?: string;
  headBorderType?: string;
  rowBorderType?: string;
  headBackgroundColor?: string;
  headIconSpacing?: { top: number; right: number; bottom: number; left: number };
  headIconSpacingUnit?: string;
  headIconSize?: number;

  headFontFamily?: string;
  headFontSize?: number;
  headFontWeight?: string;
  headTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  headFontStyle?: string;
  headTextDecoration?: string;
  headLineHeight?: number;
  headLetterSpacing?: number;
  headWordSpacing?: number;
  headColor?: string;
  headIconColor?: string;
  rowBackgroundColorEven?: string;
  rowBackgroundColorOdd?: string;
  rowColorEven?: string;
  rowColorOdd?: string;
  rowLinkColor?: string;
  rowIconColor?: string;

  rowFontFamily?: string;
  rowFontSize?: number;
  rowFontWeight?: string;
  rowTextTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  rowFontStyle?: string;
  rowTextDecoration?: string;
  rowLineHeight?: number;
  rowLetterSpacing?: number;
  rowWordSpacing?: number;
  rowColor?: string;
}


export interface LinkEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  text: string;
  url: string;
  color: string;
  fontFamily: string;
  fontSize: number;
  lineHeight?: number;
  letterSpacing?: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  underline: boolean;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  fontWeight: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  height?: string;
  width?: string;
  fontStyle?: string;
  textDecoration?: string;
  letterSpace?: number;
  wordSpacing?: number;
  textStroke?: string;
  textShadow?: string;
  blendMode?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundImageHover?: string;
  backgroundColorHover?: string;
  borderTopStyle?: string;
  borderRightStyle?: string;
  borderBottomStyle?: string;
  borderLeftStyle?: string;
  borderTopWidth?: number;
  borderRightWidth?: number;
  borderBottomWidth?: number;
  borderLeftWidth?: number;
  borderTopColor?: string;
  borderRightColor?: string;
  borderBottomColor?: string;
  borderLeftColor?: string;
  borderRadius?: number;
  boxShadow?: string;
  borderTypeHover?: string;
  borderTopWidthHover?: number;
  borderRightWidthHover?: number;
  borderBottomWidthHover?: number;
  borderLeftWidthHover?: number;
  borderColorHover?: string;
  borderRadiusHover?: number;
  boxShadowHover?: string;
  transitionDuration?: number;
  customWidth?: string;
}





interface ImageEditorOptions {
  src: string;
  altText: string;
  width: string;
  height: string;
  align: 'left' | 'center' | 'right';
  autoWidth: boolean;
  autoHeight: boolean;
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  borderRadius?: number;
  linkUrl?: string;
  linkTarget?: string;
  objectFit?: 'fill' | 'contain' | 'cover';
  backgroundImage?: string;
  bgImage?: string;
  backgroundSize?: string;
  bgSize?: string;
  backgroundPosition?: string;
  bgPosition?: string;
  backgroundColor?: string;
  bgColor?: string;
  imageResolution?: string;
  caption?: string;
  linkType?: string;
  borderTopWidth?: number;
  borderTopColor?: string;
  borderTopStyle?: string;
  borderRightWidth?: number;
  borderRightColor?: string;
  borderRightStyle?: string;
  borderBottomWidth?: number;
  borderBottomColor?: string;
  borderBottomStyle?: string;
  borderLeftWidth?: number;
  borderLeftColor?: string;
  borderLeftStyle?: string;
  borderRadiusTop?: number;
  borderRadiusRight?: number;
  borderRadiusBottom?: number;
  borderRadiusLeft?: number;
}



export interface IconEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  iconType: string;
  color: string;
  size: number;
  link: string;
  paddingTop: number;
  paddingRight: number;
  paddingBottom: number;
  paddingLeft: number;
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  alignment: 'left' | 'center' | 'right' | 'justify';
  width?: number;
  height?: number;
  padding?: { top: number; right: number; bottom: number; left: number };
  margin?: { top: number; right: number; bottom: number; left: number };
}

export interface TextEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  color: string;
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right' | 'justify';
  lineHeight: number;
  letterSpace: number;
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  content: string;
  backgroundImage?: string;
  bgImage?: string;
  backgroundSize?: string;
  bgSize?: string;
  backgroundPosition?: string;
  bgPosition?: string;
}

export interface ButtonEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  urlDisabled: boolean;
  text: string;
  url: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: string;
  fontStyle: string;
  textAlign: 'left' | 'center' | 'right';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  letterSpace?: number;
  letterSpacing?: number;
  bgColor: string;
  textColor: string;
  widthAuto?: boolean;
  width?: number;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  borderRadius: {
    topLeft: number;
    topRight: number;
    bottomRight: number;
    bottomLeft: number;
  };
  lineHeight?: number;
  height?: string;
  backgroundImage?: string;
  bgImage?: string;
  backgroundSize?: string;
  bgSize?: string;
  backgroundPosition?: string;
  bgPosition?: string;
}

export interface HeadingEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  headingType: 'h1' | 'h2' | 'h3' | 'h4' | 'p';
  fontFamily: string;
  fontWeight: string;
  fontStyle: string;
  fontSize: number;
  color: string;
  hoverColor?: string;
  backgroundColor: string;
  backgroundColorHover?: string;
  backgroundImageHover?: string;
  textAlign: 'left' | 'center' | 'right' | 'justify' | '';
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  textStroke?: string;
  textShadow?: string;
  blendMode?: string;
  transitionDuration?: number;
  lineHeight: number;
  letterSpace: number;
  wordSpacing?: number;
  textDecoration?: string;
  link?: string;
  linkTarget?: string;
  linkNoFollow?: boolean;
  linkCustomAttributes?: string;
  width?: string;
  customWidth?: string;
  height?: string;
  display?: string;
  justifyContent?: string;
  alignItems?: string;
  alignSelf?: string;
  order?: number;
  flexSize?: string;
  position?: string;
  horizontalOrientation?: 'left' | 'right';
  horizontalOffset?: number;
  verticalOrientation?: 'top' | 'bottom';
  verticalOffset?: number;
  zIndex?: number;
  transform?: string;
  transformHover?: string;
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  margin?: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  borderTopWidth?: number;
  borderTopColor?: string;
  borderTopStyle?: string;
  borderRightWidth?: number;
  borderRightColor?: string;
  borderRightStyle?: string;
  borderBottomWidth?: number;
  borderBottomColor?: string;
  borderBottomStyle?: string;
  borderLeftWidth?: number;
  borderLeftColor?: string;
  borderLeftStyle?: string;
  borderRadius?: number | { top: number; right: number; bottom: number; left: number };
  content: string;
  backgroundImage?: string;
  bgImage?: string;
  backgroundSize?: string;
  bgSize?: string;
  backgroundPosition?: string;
  bgPosition?: string;
  boxShadow?: string;
  borderTypeHover?: string;
  borderWidthHoverAll?: number;
  borderTopWidthHover?: number;
  borderRightWidthHover?: number;
  borderBottomWidthHover?: number;
  borderLeftWidthHover?: number;
  borderColorHover?: string;
  borderRadiusHover?: any;
  boxShadowHover?: string;
}

export type SocialIconKey = 'facebook' | 'twitter' | 'linkedin' | 'instagram' | 'pinterest' | 'youtube' | 'whatsapp' | 'reddit' | 'github' | 'telegram' | 'envelope';

export interface SocialIconsEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  iconSize: number;
  iconColor: string;
  iconAlign: 'left' | 'center' | 'right';
  iconSpace: number;
  width?: string;
  height?: string;
  display?: string;
  padding: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  margin: {
    top: number;
    left: number;
    right: number;
    bottom: number;
  };
  isCustomSocial?: boolean;
  customSocialText?: string;
  iconSizes?: Record<string, number>;
  addedIcons: {
    icons: SocialIconKey[];
    url: string[];
  };
}

export interface DividerEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  width: string;
  style: 'solid' | 'dashed' | 'dotted';
  thickness: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ==================== LAYOUT BLOCK INTERFACES ====================

export interface RowEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  columns: number;
  gap: number;
  backgroundColor: string;
  columnsData: Array<{
    id: string;
    children: Array<{
      id: string;
      contentType: WidgetContentType;
      contentData: string | null;
    }>;
  }>;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ContainerEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  maxWidth: string;
  width?: string;
  height?: string;
  backgroundColor: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  border: {
    width: number;
    style: 'solid' | 'dashed' | 'dotted' | 'none';
    color: string;
    radius?: number;
  };
  children: Array<{
    id: string;
    contentType: WidgetContentType;
    contentData: string | null;
  }>;
  display?: 'block' | 'flex' | 'inline-block' | 'inline-flex';
  flexDirection?: 'row' | 'column' | 'row-reverse' | 'column-reverse';
  justifyContent?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around' | 'space-evenly';
  alignItems?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  flexWrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: number;
  columnGap?: number;
  rowGap?: number;
  borderRadius?: number;
  bgImage?: string;
  backgroundImage?: string;
  bgSize?: string;
  backgroundSize?: string;
  bgPosition?: string;
  backgroundPosition?: string;
  bgRepeat?: string;
  backgroundRepeat?: string;
  bgAttachment?: string;
  backgroundAttachment?: string;
}

export interface GroupEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  elements: Array<{ text: string; url: string }>;
  spacing: number;
  alignment: 'left' | 'center' | 'right' | 'space-between';
  direction: 'row' | 'column';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ParagraphRowEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  rowLayout: 'horizontal' | 'vertical';
  gap: number;
  justifyContent: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  labelWidth: number;
  hideIfEmpty: boolean;
  backgroundColor: string;
  padding: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  children?: Array<{
    id: string;
    contentType: string;
    contentData: string | null;
  }>;
}

// ==================== EXTRA BLOCK INTERFACES ====================

export interface SocialFollowEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  platforms: Array<{
    name: string;
    url: string;
    icon: string;
  }>;
  iconSize: number;
  iconColor: string;
  spacing: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface VideoEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  url: string;
  width: string;
  height: string;
  autoplay: boolean;
  controls: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}



export interface CountdownEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  targetDate: string;
  format: string;
  showLabels: boolean;
  backgroundColor: string; // This will now be the Box background
  textColor: string;       // This will now be the Value text color
  title?: string;
  titleColor?: string;
  footer?: string;
  footerColor?: string;
  labelColor?: string;
  endMessage?: string;
  daysLabel?: string;
  hoursLabel?: string;
  minutesLabel?: string;
  secondsLabel?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  containerBgColor?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ProgressBarEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  value: number;
  max: number;
  label: string;
  color: string;
  showPercentage: boolean;
  title?: string;
  progress?: number;
  height?: number;
  backgroundColor?: string;
  barColor?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PromoCodeEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  title: string;
  code: string;
  description: string;
  validUntil: string;
  backgroundColor: string;
  textColor: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface PriceEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  amount: string | number;
  currency: string;
  period: string;
  features: string[];
  buttonText: string;
  buttonUrl: string;
  showDecimals?: boolean;
  decimals?: number;
  showCurrencySymbol?: boolean;
  currencySymbol?: string;
  label?: string;
  showCurrencyCode?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface TestimonialEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  quote: string;
  author: string;
  position: string;
  avatar: string;
  rating: number;
  backgroundColor?: string;
  textColor?: string;
  authorImage?: string;
  authorTitle?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface NavbarEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  links: Array<{
    text: string;
    url: string;
  }>;
  logo: string;
  backgroundColor: string;
  textColor: string;
  height?: number;
  items?: Array<{
    text: string;
    url: string;
  }>;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CardEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  title?: string;
  content?: string;
  image: string;
  backgroundColor: string;
  shadow: boolean;
  border: boolean;
  borderColor?: string;
  borderRadius?: number;
  textColor?: string;
  imageUrl?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface AlertEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  title?: string;
  closable: boolean;
  backgroundColor: string;
  dismissible?: boolean;
  textColor: string;
  icon?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface ProgressEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  value: number;
  min?: number;
  max?: number;
  label?: string;
  color?: string;
  showValue?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ==================== FORMS INTERFACES ====================

export interface FormEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  fields: Array<{
    type: string;
    label: string;
    name: string;
    required: boolean;
  }>;
  submitText: string;
  action: string;
  method: 'get' | 'post';
  title?: string;
  submitUrl?: string;
  successMessage?: string;
  errorMessage?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SurveyEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  questions?: Array<{
    text: string;
    type: string;
    options: string[];
  }>;
  multiple: boolean;
  required: boolean;
  title?: string;
  submitText?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface InputEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  type: 'text' | 'email' | 'password' | 'number';
  label: string;
  placeholder: string;
  required: boolean;
  name: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}
// Contact Widget Options
export interface ContactEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  url: string;
  email: string;
  phone: string;
  showUrl?: boolean;
  showEmail?: boolean;
  showPhone?: boolean;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number | string;
  padding: string;
  margin?: string;
  textAlign: string;
  iconColor: string;
  iconSize: number;
  fontWeight?: string;
  lineHeight?: number;
  contactRowOrder?: string[];
}

// Product Details Widget Options
export interface ProductDetailsEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  productHeader?: string;
  quantityHeader?: string;
  priceHeader?: string;
  productPlaceholder?: string;
  quantityPlaceholder?: string;
  pricePlaceholder?: string;
  padding: string;
  margin?: string;
  backgroundColor: string;
  textColor: string;
  borderColor: string;
  borderWidth?: number;
  borderStyle?: string;
  headerBackgroundColor: string;
  headerTextColor: string;
  fontFamily: string;
  fontSize: number | string;
  textAlign?: string;
  showImage?: boolean; // If they want to toggle images in the table
}

export const defaultContactEditorOptions: ContactEditorOptions = {
  url: '{{site_url}}',
  email: '{{store_email}}',
  phone: '{{store_phone}}',
  showUrl: true,
  showEmail: true,
  showPhone: true,
  backgroundColor: 'transparent',
  textColor: '#333333',
  fontFamily: 'inherit',
  fontSize: '14px',
  padding: '0px',
  margin: '0px',
  textAlign: 'center',
  iconColor: '#333333',
  iconSize: 20,
  fontWeight: 'normal',
  lineHeight: 1.5,
  contactRowOrder: ['url', 'email', 'phone']
};

export const defaultProductDetailsEditorOptions: ProductDetailsEditorOptions = {
  productHeader: 'Product',
  quantityHeader: 'Quantity',
  priceHeader: 'Price',
  productPlaceholder: '{{product_name}}',
  quantityPlaceholder: '{{quantity}}',
  pricePlaceholder: '{{price}}',
  padding: '0px',
  margin: '0px',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#eeeeee',
  borderWidth: 1,
  borderStyle: 'solid',
  headerBackgroundColor: '#f8f9fa',
  headerTextColor: '#333333',
  fontFamily: 'inherit',
  fontSize: 14,
  textAlign: 'left', // Default alignment
  showImage: true
};

export interface RefundFullEditorOptions {
  title?: string;
  amountLabel?: string;
  dateLabel?: string;
  reasonLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  padding?: string;
  margin?: string;
  fontFamily?: string;
  fontSize?: number;
}

export const defaultRefundFullEditorOptions: RefundFullEditorOptions = {
  title: 'Your order has been fully refunded',
  amountLabel: 'Refund Amount',
  dateLabel: 'Refund Date',
  reasonLabel: 'Reason',
  backgroundColor: '#fff8f8',
  textColor: '#333333',
  borderColor: '#ffcccc',
  borderWidth: 1,
  borderStyle: 'solid',
  padding: '0px',
  margin: '0px',
  fontFamily: 'inherit',
  fontSize: 14,
};

export interface RefundPartialEditorOptions {
  title?: string;
  productHeader?: string;
  amountHeader?: string;
  reasonLabel?: string;
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  headerBackgroundColor?: string;
  headerTextColor?: string;
  borderWidth?: number;
  borderStyle?: string;
  padding?: string;
  margin?: string;
  fontFamily?: string;
  fontSize?: number;
}

export const defaultRefundPartialEditorOptions: RefundPartialEditorOptions = {
  title: 'Partial Refund',
  productHeader: 'Item',
  amountHeader: 'Refund Amount',
  reasonLabel: 'Reason',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderColor: '#eeeeee',
  borderWidth: 1,
  borderStyle: 'solid',
  headerBackgroundColor: '#fff8f8',
  headerTextColor: '#333333',
  padding: '0px',
  margin: '0px',
  fontFamily: 'inherit',
  fontSize: 14,
};

export interface TextareaEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  placeholder: string;
  rows: number;
  required: boolean;
  name: string;
  disabled?: boolean;
  cols?: number;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface SelectEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  options: { label: string; value: string }[];
  required: boolean;
  name: string;
  multiple: boolean;
  color?: string;
  backgroundColor?: string;
  fontSize?: number;
  fontWeight?: string;
  borderRadius?: number;
  borderColor?: string;
  borderWidth?: number;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'none';
  width?: string;
  height?: string;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface CheckboxEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  checked: boolean;
  name: string;
  value: string;
  options?: string[];
  required?: boolean;
  inline?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface RadioEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  options: string[];
  name: string;
  selected: string;
  required?: boolean;
  inline?: boolean;
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

export interface LabelEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  text: string;
  for: string;
  fontSize: number;
  fontWeight: string;
  color: string;
  type?: 'required' | 'optional' | 'error' | 'warning' | 'normal';
  margin?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

// ==================== WOOCOMMERCE LAYOUT INTERFACES ====================

export interface ShippingAddressEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  title?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  fontWeight?: string;
  lineHeight?: number;
  letterSpacing?: number;
  nameLabel?: string;
  phoneLabel?: string;
  emailLabel?: string;
  addressLine1Label?: string;
  addressLine2Label?: string;
  cityLabel?: string;
  stateLabel?: string;
  postalCodeLabel?: string;
  countryLabel?: string;
  shippingAddressFieldOrder?: string[];
}

export interface BillingAddressEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  title?: string;
  fullName: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  lineHeight: string;
  letterSpacing: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  nameLabel?: string;
  phoneLabel?: string;
  emailLabel?: string;
  addressLine1Label?: string;
  addressLine2Label?: string;
  cityLabel?: string;
  stateLabel?: string;
  postalCodeLabel?: string;
  countryLabel?: string;
  billingAddressFieldOrder?: string[];
}

export interface TaxBillingEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  invoiceTitle?: string;
  orderDateLabel?: string;
  subtotalLabel?: string;
  shippingLabel?: string;
  discountLabel?: string;
  taxLabel?: string;
  taxRateLabel?: string;
  totalLabel?: string;
  billingAddressTitle?: string;
  billingNameLabel?: string;
  billingAddressLabel?: string;
  billingLocationLabel?: string;
  footerText?: string;
  orderNumber: string;
  orderDate: string;
  orderSubtotal: string;
  orderShipping: string;
  orderDiscount: string;
  orderTax: string;
  orderTotal: string;
  taxRate: string;
  billingFirstName: string;
  billingLastName: string;
  billingAddress1: string;
  billingCity: string;
  billingState: string;
  billingPostcode: string;
  billingCountry: string;
  taxBillingTotalsRowOrder?: string[];
  taxBillingAddressRowOrder?: string[];
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  width: string;
  height: string;
  padding: { top: number; right: number; bottom: number; left: number };
  margin: { top: number; right: number; bottom: number; left: number };
}

export interface OrderSubtotalEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  value: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  spacing?: number;
  columnGap?: number;
  padding?: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  labelAlign?: string;
  valueAlign?: string;
  subtotalLabel?: string;
  discountLabel?: string;
  shippingLabel?: string;
  refundedFullyLabel?: string;
  refundedPartialLabel?: string;
  subtotalValue?: string;
  discountValue?: string;
  shippingValue?: string;
  refundedFullyValue?: string;
  refundedPartialValue?: string;
  lastColumnWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  fontWeight?: string;
  lineHeight?: number;
  width?: string;
  height?: string;
  orderSubtotalRowOrder?: string[];
}

export interface OrderTotalEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  value: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  spacing?: number;
  padding?: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  labelAlign?: string;
  valueAlign?: string;
  lastColumnWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  fontWeight?: string;
  lineHeight?: number;
  width?: string;
  height?: string;
}

export interface ShippingMethodEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  value: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  spacing?: number;
  padding?: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  labelAlign?: string;
  valueAlign?: string;
  lastColumnWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  fontWeight?: string;
  lineHeight?: number;
  width?: string;
  height?: string;
}

export interface PaymentMethodEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  value: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  spacing?: number;
  padding?: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  labelAlign?: string;
  valueAlign?: string;
  lastColumnWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  fontWeight?: string;
  lineHeight?: number;
  width?: string;
  height?: string;
}

export interface CustomerNoteEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  label: string;
  value: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  spacing?: number;
  padding?: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  labelAlign?: string;
  valueAlign?: string;
  lastColumnWidth?: number;
  borderWidth?: number;
  borderColor?: string;
  fontWeight?: string;
  lineHeight?: number;
}

export interface OrderItem {
  product: string;
  quantity: number;
  price: string;
}

export interface OrderItemsEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  orderHeading?: string;
  orderNumber: string;
  orderDate: string;
  productHeader?: string;
  quantityHeader?: string;
  priceHeader?: string;
  productPlaceholder?: string;
  quantityPlaceholder?: string;
  pricePlaceholder?: string;
  items: OrderItem[];
  subtotalLabel?: string;
  subtotal: string;
  discountLabel?: string;
  discount: string;
  paymentLabel?: string;
  paymentMethod: string;
  totalLabel?: string;
  total: string;
  orderItemsSummaryRowOrder?: string[];
  fontFamily: string;
  fontSize: string;
  textColor: string;
  textAlign: string;
  backgroundColor: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
}

export interface EmailHeaderEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  storeName: string;
  showStoreName?: boolean;
  showLogo: boolean;
  logoUrl: string;
  logoWidth: string;
  showTagline: boolean;
  tagline: string;
  title?: string;
  backgroundColor: string;
  textColor: string;
  padding: string;
  height: string;
  width: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  textAlign: string;
  logoAlign?: string;
  taglineFontSize: string;
}

export interface EmailFooterEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  storeName: string;
  showSocialMedia: boolean;
  showAddress: boolean;
  storeAddress: string;
  showContact: boolean;
  contactEmail: string;
  contactPhone: string;
  backgroundColor: string;
  textColor: string;
  linkColor: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  textAlign?: string;
  fontFamily: string;
  fontSize: string;
  copyrightText?: string;
  showCopyright?: boolean; // New toggle
  showLegal?: boolean;
  privacyLinkText?: string;
  privacyLinkUrl?: string;
  termsLinkText?: string;
  termsLinkUrl?: string;
  storeUrl?: string;
  emailLabel?: string;
  phoneLabel?: string;
  footerOrder?: string[];
  socialIcons?: {
    icons: string[];
    urls: string[];
  };
}

export interface CtaButtonEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  buttonText: string;
  buttonUrl: string;
  alignment: string;
  backgroundColor: string;
  textColor: string;
  hoverColor: string;
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  borderRadius: string;
  buttonPadding: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  minWidth: string;
  width?: number;
  widthAuto?: boolean;
}

export interface RelatedProductsEditorOptions {
  paddingUnit?: 'px' | '%' | 'em';
  marginUnit?: 'px' | '%' | 'em';
  borderRadiusUnit?: 'px' | '%' | 'em';
  title: string;
  productsToShow: number;
  showImages: boolean;
  buttonText: string;
  backgroundColor: string;
  titleColor: string;
  titleFontWeight: string;
  priceColor: string;
  buttonColor: string;
  buttonHoverColor: string;
  padding: string;
  margin?: string | { top: number; right: number; bottom: number; left: number };
  showCardShadow: boolean;
  cardShadow: string;
  fontFamily: string;
  fontSize: string;
  useManualData: boolean;
  p1_name: string;
  p1_price: string;
  p1_image: string;
  p1_url: string;
  p2_name: string;
  p2_price: string;
  p2_image: string;
  p2_url: string;
  p3_name: string;
  p3_price: string;
  p3_image: string;
  p3_url: string;
  p4_name: string;
  p4_price: string;
  p4_image: string;
  p4_url: string;
}


export interface WorkspaceState {
  selectionCount: number;
  blocks: DroppedBlock[];
  selectedBlockId: string | null;
  editorOpen: boolean;
  selectedColumnIndex: number | null;
  selectedBlockForEditor: string | null;
  selectedContentType: WidgetContentType | null;
  selectedWidgetIndex: number | null;
  selectedNestedPath: Array<{ colIdx: number; childIdx: number }> | null;
  selectedSubElementId: string | null;

  // Basic Layout
  sectionEditorOptions: SectionEditorOptions;
  spacerEditorOptions: SpacerEditorOptions;
  tableEditorOptions: TableEditorOptions;
  linkEditorOptions: LinkEditorOptions;

  iconEditorOptions: IconEditorOptions;
  textEditorOptions: TextEditorOptions;
  headingEditorOptions: HeadingEditorOptions;
  socialIconsEditorOptions: SocialIconsEditorOptions;
  buttonEditorOptions: ButtonEditorOptions;
  dividerEditorOptions: DividerEditorOptions;
  imageEditorOptions: ImageEditorOptions;

  // Layout Block
  rowEditorOptions: RowEditorOptions;
  containerEditorOptions: ContainerEditorOptions;
  groupEditorOptions: GroupEditorOptions;
  paragraphRowEditorOptions: ParagraphRowEditorOptions;

  // Extra Block
  socialFollowEditorOptions: SocialFollowEditorOptions;
  videoEditorOptions: VideoEditorOptions;

  countdownEditorOptions: CountdownEditorOptions;
  progressBarEditorOptions: ProgressBarEditorOptions;
  promoCodeEditorOptions: PromoCodeEditorOptions;
  priceEditorOptions: PriceEditorOptions;
  testimonialEditorOptions: TestimonialEditorOptions;
  navbarEditorOptions: NavbarEditorOptions;
  cardEditorOptions: CardEditorOptions;
  alertEditorOptions: AlertEditorOptions;
  progressEditorOptions: ProgressEditorOptions;

  // Forms
  formEditorOptions: FormEditorOptions;
  surveyEditorOptions: SurveyEditorOptions;
  inputEditorOptions: InputEditorOptions;
  textareaEditorOptions: TextareaEditorOptions;
  selectEditorOptions: SelectEditorOptions;
  checkboxEditorOptions: CheckboxEditorOptions;
  radioEditorOptions: RadioEditorOptions;
  labelEditorOptions: LabelEditorOptions;

  // WooCommerce Layout
  shippingAddressEditorOptions: ShippingAddressEditorOptions;
  billingAddressEditorOptions: BillingAddressEditorOptions;
  orderItemsEditorOptions: OrderItemsEditorOptions;
  taxBillingEditorOptions: TaxBillingEditorOptions;
  emailHeaderEditorOptions: EmailHeaderEditorOptions;
  emailFooterEditorOptions: EmailFooterEditorOptions;
  ctaButtonEditorOptions: CtaButtonEditorOptions;
  relatedProductsEditorOptions: RelatedProductsEditorOptions;
  orderSubtotalEditorOptions: OrderSubtotalEditorOptions;
  orderTotalEditorOptions: OrderTotalEditorOptions;
  shippingMethodEditorOptions: ShippingMethodEditorOptions;
  paymentMethodEditorOptions: PaymentMethodEditorOptions;
  customerNoteEditorOptions: CustomerNoteEditorOptions;
  contactEditorOptions: ContactEditorOptions;
  productDetailsEditorOptions: ProductDetailsEditorOptions;
  refundFullEditorOptions: RefundFullEditorOptions;
  refundPartialEditorOptions: RefundPartialEditorOptions;

  isMobileView: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  previewMode: boolean;
  past: DroppedBlock[][];
  future: DroppedBlock[][];
  bodyStyle: BodyStyle;
  copiedWidget: { contentType: WidgetContentType; contentData: string } | null;
}

export const defaultColumnStyle: ColumnStyle = {
  bgColor: '#ffffffff',
  borderTopColor: '#a0c4ff',
  borderBottomColor: '#a0c4ff',
  borderLeftColor: '#a0c4ff',
  borderRightColor: '#a0c4ff',
  borderStyle: 'solid',
  borderTopSize: 0,
  borderBottomSize: 0,
  borderLeftSize: 0,
  borderRightSize: 0,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  height: 'auto',
  textAlign: 'left',
  bgImage: '',
  bgSize: 'cover',
  bgPosition: 'center',
  bgRepeat: 'no-repeat',
  bgAttachment: 'scroll',
  borderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

// Basic Layout Defaults


export const defaultBlockStyle: BlockStyle = {
  bgColor: '#e6f0fa',
  borderTopColor: '#a0c4ff',
  borderBottomColor: '#a0c4ff',
  borderLeftColor: '#a0c4ff',
  borderRightColor: '#a0c4ff',
  borderStyle: 'solid',
  borderTopSize: 21,
  borderBottomSize: 0,
  borderLeftSize: 0,
  borderRightSize: 0,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  height: 'auto',
};

export const neutralBlockStyle: BlockStyle = {
  bgColor: 'transparent',
  borderTopColor: 'transparent',
  // ...
  borderBottomColor: 'transparent',
  borderLeftColor: 'transparent',
  borderRightColor: 'transparent',
  borderStyle: 'solid',
  borderTopSize: 0,
  borderBottomSize: 0,
  borderLeftSize: 0,
  borderRightSize: 0,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  height: 'auto',
};

// ==================== DEFAULT VALUES ====================

// Basic Layout Defaults
export const defaultTextEditorOptions: TextEditorOptions = {
  fontFamily: 'global',
  fontSize: 14,
  fontWeight: 'normal',
  fontStyle: 'normal',
  color: '#d32f2f',
  backgroundColor: 'transparent',
  textAlign: 'left',
  lineHeight: 1.5,
  letterSpace: 1,
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
  content: 'Click to edit text',
};

export const defaultButtonEditorOptions: ButtonEditorOptions = {
  text: 'Button',
  url: '#',
  fontFamily: 'global',
  fontSize: 16,
  fontWeight: 'normal',
  fontStyle: 'normal',
  textAlign: 'center',
  textTransform: 'none',
  letterSpace: 0,
  letterSpacing: 0,
  bgColor: '#007bff',
  textColor: '#ffffff',
  widthAuto: true,
  width: undefined,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  borderRadius: { topLeft: 5, topRight: 5, bottomRight: 5, bottomLeft: 5 },
  urlDisabled: false,
  height: 'auto',
  backgroundImage: '',
  bgImage: '',
  backgroundSize: 'cover',
  bgSize: 'cover',
  backgroundPosition: 'center',
  bgPosition: 'center',
};

export const defaultHeadingEditorOptions: HeadingEditorOptions = {
  fontFamily: 'global',
  fontWeight: 'bold',
  fontStyle: 'normal',
  fontSize: 22,
  color: '#000000',
  hoverColor: '',
  backgroundColor: 'transparent',
  backgroundColorHover: '',
  backgroundImageHover: '',
  textAlign: '',
  textTransform: 'none',
  textStroke: '',
  textShadow: '',
  blendMode: 'normal',
  transform: '',
  transformHover: '',
  transitionDuration: 0.3,
  lineHeight: 32,
  letterSpace: 1,
  link: '',
  linkTarget: '_blank',
  linkNoFollow: false,
  linkCustomAttributes: '',
  width: '100%',
  height: 'auto',
  display: 'block',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
  margin: { top: 0, left: 0, right: 0, bottom: 0 },
  borderTopWidth: 0,
  borderTopColor: '#00000000',
  borderTopStyle: 'none',
  borderRightWidth: 0,
  borderRightColor: '#00000000',
  borderRightStyle: 'none',
  borderBottomWidth: 0,
  borderBottomColor: '#00000000',
  borderBottomStyle: 'none',
  borderLeftWidth: 0,
  borderLeftColor: '#00000000',
  borderLeftStyle: 'none',
  borderRadius: { top: 0, right: 0, bottom: 0, left: 0 },
  headingType: 'h1',
  content: 'Type your heading here...',
  backgroundImage: '',
  bgImage: '',
  backgroundSize: 'cover',
  bgSize: 'cover',
  backgroundPosition: 'center',
  bgPosition: 'center',
  textDecoration: 'none',
  wordSpacing: 0,
  boxShadow: 'none',
  borderTypeHover: '',
  borderColorHover: '',
  boxShadowHover: 'none',
};

export const defaultSocialIconsEditorOptions: SocialIconsEditorOptions = {
  padding: { top: 0, left: 0, right: 0, bottom: 0 },
  margin: { top: 0, left: 0, right: 0, bottom: 0 },
  iconSize: 32,
  iconColor: "color",
  iconAlign: 'center',
  iconSpace: 0,
  isCustomSocial: false,
  customSocialText: '',
  addedIcons: {
    icons: [],
    url: []
  }
};

export const defaultDividerEditorOptions: DividerEditorOptions = {
  width: '75',
  style: 'solid',
  thickness: 2,
  color: '#000000',
  alignment: 'center',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
};

export const defaultImageEditorOptions: ImageEditorOptions = {
  src: 'https://cdn.tools.unlayer.com/image/placeholder.png',
  altText: '',
  width: '50%',
  height: '100%',
  align: 'center',
  autoWidth: false,
  autoHeight: false,
  objectFit: 'cover',
  padding: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  margin: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  borderRadius: 0,
  linkUrl: '',
  linkTarget: '_self',
  backgroundImage: '',
  bgImage: '',
  backgroundSize: 'cover',
  bgSize: 'cover',
  backgroundPosition: 'center',
  bgPosition: 'center',
  backgroundColor: 'transparent',
  bgColor: 'transparent',
  imageResolution: 'large',
  caption: 'none',
  linkType: 'none',
  borderTopWidth: 0,
  borderTopColor: 'transparent',
  borderTopStyle: 'none',
  borderRightWidth: 0,
  borderRightColor: 'transparent',
  borderRightStyle: 'none',
  borderBottomWidth: 0,
  borderBottomColor: 'transparent',
  borderBottomStyle: 'none',
  borderLeftWidth: 0,
  borderLeftColor: 'transparent',
  borderLeftStyle: 'none',
  borderRadiusTop: 0,
  borderRadiusRight: 0,
  borderRadiusBottom: 0,
  borderRadiusLeft: 0,
};

export const defaultSectionEditorOptions: SectionEditorOptions = {
  backgroundColor: '#f5f5f5',
  backgroundImage: '',
  height: 'auto',
  width: '100%',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  border: { width: 1, style: 'solid', color: '#dddddd', radius: 4 },
  children: [],
};

export const defaultSpacerEditorOptions: SpacerEditorOptions = {
  height: 20,
  width: '100%',
  backgroundColor: 'transparent',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

export const defaultTableEditorOptions: TableEditorOptions = {
  rows: 2,
  headings: [
    { text: 'Heading 1' },
    { text: 'Heading 2' }
  ],
  backgroundColor: 'transparent',
  borderColor: '#cccccc',
  borderWidth: 1,
  borderStyle: 'solid',
  borderRadius: 0,
  boxShadow: 'none',
  tableLayout: 'auto',
  width: '100%',
  cellPadding: 8,
  cellSpacing: 0,
  textAlign: 'left',
  tableAlign: 'center',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  
  headPadding: { top: 8, right: 8, bottom: 8, left: 8 },
  headPaddingUnit: 'px',
  rowPadding: { top: 8, right: 8, bottom: 8, left: 8 },
  rowPaddingUnit: 'px',
  headBorderType: 'default',
  rowBorderType: 'default',
  headBackgroundColor: '#f5f5f5',
  headIconSpacing: { top: 0, right: 0, bottom: 0, left: 0 },
  headIconSpacingUnit: 'px',
  headIconSize: 100,

  headFontFamily: 'Global',
  headFontSize: 14,
  headFontWeight: '600',
  headTextTransform: 'none',
  headFontStyle: 'normal',
  headTextDecoration: 'none',
  headLineHeight: 0,
  headLetterSpacing: 0,
  headWordSpacing: 0,
  headColor: '#333333',
  headIconColor: 'transparent',
  rowBackgroundColorEven: 'transparent',
  rowBackgroundColorOdd: 'transparent',
  rowColorEven: '#555555',
  rowColorOdd: '#555555',
  rowLinkColor: '#007bff',
  rowIconColor: 'transparent',

  rowFontFamily: 'Global',
  rowFontSize: 13,
  rowFontWeight: '400',
  rowTextTransform: 'none',
  rowFontStyle: 'normal',
  rowTextDecoration: 'none',
  rowLineHeight: 0,
  rowLetterSpacing: 0,
  rowWordSpacing: 0,
  rowColor: '#555555',
};


const defaultLinkEditorOptions: LinkEditorOptions = {
  text: 'Click here',
  url: '#',
  color: '#007bff',
  fontFamily: 'global',
  fontSize: 14,
  lineHeight: 20,
  letterSpacing: 0,
  textTransform: 'none',
  underline: false,
  textAlign: 'left',
  fontWeight: 'normal',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  height: 'auto',
  width: '100%',
};







export const defaultIconEditorOptions: IconEditorOptions = {
  iconType: 'star',
  color: '#000000',
  size: 24,
  link: '',
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  alignment: 'left',
  width: 32,
  height: 32,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

// Layout Block Defaults
const defaultRowEditorOptions: RowEditorOptions = {
  columns: 2,
  gap: 20,
  backgroundColor: 'transparent',
  columnsData: [],
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

const defaultContainerEditorOptions: ContainerEditorOptions = {
  maxWidth: '800px',
  width: '100%',
  height: 'auto',
  backgroundColor: '#ffffff',
  padding: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  margin: {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  border: { width: 1, style: 'solid', color: '#dddddd', radius: 4 },
  children: [],
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'stretch',
  flexWrap: 'nowrap',
  gap: 10,
  columnGap: 0,
  rowGap: 0,
  borderRadius: 4,
  bgImage: '',
  backgroundImage: '',
  bgSize: 'cover',
  backgroundSize: 'cover',
  bgPosition: 'center',
  backgroundPosition: 'center',
  bgRepeat: 'no-repeat',
  backgroundRepeat: 'no-repeat',
  bgAttachment: 'scroll',
  backgroundAttachment: 'scroll'
};

const defaultGroupEditorOptions: GroupEditorOptions = {
  elements: [],
  spacing: 10,
  alignment: 'left',
  direction: 'row',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

const defaultParagraphRowEditorOptions: ParagraphRowEditorOptions = {
  rowLayout: 'horizontal',
  gap: 10,
  justifyContent: 'flex-start',
  labelWidth: 120,
  hideIfEmpty: true,
  backgroundColor: 'transparent',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  children: []
};

// Extra Block Defaults
const defaultSocialFollowEditorOptions: SocialFollowEditorOptions = {
  platforms: [
    { name: 'Facebook', url: '#', icon: 'facebook' },
    { name: 'Twitter', url: '#', icon: 'twitter' }
  ],
  iconSize: 24,
  iconColor: '#000000',
  spacing: 10,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

// ... existing code ...
export const defaultPriceEditorOptions: PriceEditorOptions = {
  label: 'Price',
  amount: 45.99,
  currency: 'INR',
  currencySymbol: '$',
  decimals: 2,
  showDecimals: true,
  showCurrencySymbol: true,
  showCurrencyCode: true,
  period: '',
  features: [],
  buttonText: '',
  buttonUrl: '',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultVideoEditorOptions: VideoEditorOptions = {
  // ... existing code ...
  url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  width: '100%',
  height: '315px',
  autoplay: false,
  controls: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultCountdownEditorOptions: CountdownEditorOptions = {
  targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  format: 'DD:HH:MM:SS',
  showLabels: true,
  backgroundColor: '#d32f2f', // Red boxes
  textColor: '#ffffff',       // White text
  title: 'SALES ENDS IN',
  titleColor: '#000000',
  footer: 'All courses 50% off',
  footerColor: '#000000',
  labelColor: '#333333',
  endMessage: 'The offer has ended!',
  daysLabel: 'Days',
  hoursLabel: 'Hours',
  minutesLabel: 'Minutes',
  secondsLabel: 'Seconds',
  showDays: true,
  showHours: true,
  showMinutes: true,
  showSeconds: true,
  containerBgColor: 'transparent',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultProgressBarEditorOptions: ProgressBarEditorOptions = {
  value: 75,
  max: 100,
  label: 'Progress',
  color: '#007bff',
  showPercentage: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultPromoCodeEditorOptions: PromoCodeEditorOptions = {
  title: 'Special Offer!',
  code: 'SAVE20',
  description: '20% off on all items',
  validUntil: '2024-12-31',
  backgroundColor: '#ffeb3b',
  textColor: '#333333',
  borderColor: '#ffeaa7',
  borderWidth: 1,
  borderStyle: 'solid',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultTestimonialEditorOptions: TestimonialEditorOptions = {
  quote: 'This is an amazing product!',
  author: 'John Doe',
  position: 'CEO, Company Inc',
  avatar: 'https://cdn.tools.unlayer.com/image/placeholder.png',
  rating: 5,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultNavbarEditorOptions: NavbarEditorOptions = {
  links: [
    { text: 'Home', url: '#' },
    { text: 'About', url: '#' },
    { text: 'Contact', url: '#' }
  ],
  logo: '',
  backgroundColor: '#333333',
  textColor: '#ffffff',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultCardEditorOptions: CardEditorOptions = {
  title: 'Card Title',
  content: 'Card content goes here',
  image: 'https://cdn.tools.unlayer.com/image/placeholder.png',
  backgroundColor: '#ffffff',
  shadow: true,
  border: false,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultAlertEditorOptions: AlertEditorOptions = {
  type: 'info',
  message: 'This is an alert message',
  closable: true,
  backgroundColor: '#d9edf7',
  textColor: '#31708f',
  icon: '',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultProgressEditorOptions: ProgressEditorOptions = {
  value: 50,
  min: 0,
  max: 100,
  label: 'Progress',
  color: '#007bff',
  showValue: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

// Forms Defaults
const defaultFormEditorOptions: FormEditorOptions = {
  fields: [
    { type: 'text', label: 'Name', name: 'name', required: true },
    { type: 'email', label: 'Email', name: 'email', required: true },
    { type: 'textarea', label: 'Message', name: 'message', required: true }
  ],
  submitText: 'Submit',
  action: '#',
  method: 'post',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultSurveyEditorOptions: SurveyEditorOptions = {
  questions: [
    { text: 'How would you rate our service?', type: 'radio', options: ['Excellent', 'Good', 'Average', 'Poor'] }
  ],
  multiple: false,
  required: true,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultInputEditorOptions: InputEditorOptions = {
  type: 'text',
  label: 'Input Label',
  placeholder: 'Enter text here',
  required: false,
  name: 'input_field',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultTextareaEditorOptions: TextareaEditorOptions = {
  label: 'Textarea Label',
  placeholder: 'Enter your message here',
  rows: 4,
  required: false,
  name: 'textarea_field',
  disabled: false,
  cols: 50,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

export const defaultSelectEditorOptions: SelectEditorOptions = {
  label: 'Select Label',
  options: [
    { label: 'Option 1', value: 'option1' },
    { label: 'Option 2', value: 'option2' },
    { label: 'Option 3', value: 'option3' }
  ],
  required: false,
  name: 'select_field',
  multiple: false,
  color: '#333333',
  backgroundColor: '#ffffff',
  fontSize: 14,
  fontWeight: 'normal',
  borderRadius: 4,
  borderColor: '#cccccc',
  borderWidth: 1,
  borderStyle: 'solid',
  width: '100%',
  height: 'auto',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultCheckboxEditorOptions: CheckboxEditorOptions = {
  label: 'Checkbox Label',
  checked: false,
  name: 'checkbox_field',
  value: 'checkbox_value',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultRadioEditorOptions: RadioEditorOptions = {
  label: 'Radio Label',
  options: ['Option 1', 'Option 2', 'Option 3'],
  name: 'radio_field',
  selected: 'Option 1',
  required: false,
  inline: false,
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

const defaultLabelEditorOptions: LabelEditorOptions = {
  text: 'Label Text',
  for: 'input_id',
  fontSize: 14,
  fontWeight: 'normal',
  color: '#333333',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 }
};

// WooCommerce Layout Defaults
export const defaultShippingAddressEditorOptions: ShippingAddressEditorOptions = {
  title: "SHIP TO:",
  fullName: "Jane Smith",
  phone: "+1-555-987-6543",
  email: "jane.smith@example.com",
  addressLine1: "456 Oak Avenue",
  addressLine2: "Suite 200",
  city: "Los Angeles",
  state: "CA",
  postalCode: "90001",
  country: "USA",
  fontFamily: "Arial, sans-serif",
  fontSize: "14px",
  textColor: "#333333",
  textAlign: "left",
  backgroundColor: "transparent",
  padding: "0px",
  margin: "0px",
  fontWeight: "normal",
  lineHeight: 1.5,
  letterSpacing: 0,
  nameLabel: "Name:",
  phoneLabel: "Phone:",
  emailLabel: "Email:",
  addressLine1Label: "Address Line 1:",
  addressLine2Label: "Address Line 2:",
  cityLabel: "City:",
  stateLabel: "State:",
  postalCodeLabel: "Postal Code:",
  countryLabel: "Country:",
  shippingAddressFieldOrder: ["name", "email", "phone", "address1", "address2", "city", "state", "postalCode", "country"],
};

export const defaultBillingAddressEditorOptions: BillingAddressEditorOptions = {
  title: "BILL TO:",
  fullName: "John Doe",
  phone: "+1-555-123-4567",
  email: "john.doe@example.com",
  addressLine1: "123 Main Street",
  addressLine2: "Apt 4B",
  city: "New York",
  state: "NY",
  postalCode: "10001",
  country: "USA",
  fontFamily: "Arial, sans-serif",
  fontWeight: "normal",
  fontSize: "14px",
  textColor: "#333333",
  textAlign: "left",
  backgroundColor: "transparent",
  lineHeight: "1.5",
  letterSpacing: "0px",
  padding: "0px",
  margin: "0px",
  nameLabel: "Name:",
  phoneLabel: "Phone:",
  emailLabel: "Email:",
  addressLine1Label: "Address Line 1:",
  addressLine2Label: "Address Line 2:",
  cityLabel: "City:",
  stateLabel: "State:",
  postalCodeLabel: "Postal Code:",
  countryLabel: "Country:",
  billingAddressFieldOrder: ["name", "email", "phone", "address1", "address2", "city", "state", "postalCode", "country"],
};

export const defaultTaxBillingEditorOptions: TaxBillingEditorOptions = {
  invoiceTitle: 'Tax Invoice',
  orderDateLabel: 'Order Date:',
  subtotalLabel: 'Subtotal',
  shippingLabel: 'Shipping',
  discountLabel: 'Discount',
  taxLabel: 'Tax',
  taxRateLabel: 'Tax Rate',
  totalLabel: 'Total',
  billingAddressTitle: 'Billing Address:',
  billingNameLabel: 'Name:',
  billingAddressLabel: 'Address:',
  billingLocationLabel: 'Location:',
  footerText: 'Tax Billing',
  orderNumber: '',
  orderDate: '',
  orderSubtotal: '',
  orderShipping: '',
  orderDiscount: '',
  orderTax: '',
  orderTotal: '',
  taxRate: '8%',
  billingFirstName: '',
  billingLastName: '',
  billingAddress1: '',
  billingCity: '',
  billingState: '',
  billingPostcode: '',
  billingCountry: '',
  taxBillingTotalsRowOrder: ['subtotal', 'shipping', 'discount', 'tax', 'tax_rate', 'total'],
  taxBillingAddressRowOrder: ['billing_name', 'billing_address_line', 'billing_location'],
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'normal',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  width: '100%',
  height: 'auto',
  padding: { top: 0, right: 0, bottom: 0, left: 0 },
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
};

export const defaultOrderItemsEditorOptions: OrderItemsEditorOptions = {
  orderHeading: "",
  orderNumber: "",
  orderDate: "",
  productHeader: "Product",
  quantityHeader: "Quantity",
  priceHeader: "Price",
  productPlaceholder: "{{product_name}}",
  quantityPlaceholder: "{{qty}}",
  pricePlaceholder: "{{price}}",
  items: [],
  subtotalLabel: "Subtotal:",
  subtotal: "",
  discountLabel: "Discount:",
  discount: "",
  paymentLabel: "Payment method:",
  paymentMethod: "",
  totalLabel: "Total:",
  total: "",
  orderItemsSummaryRowOrder: ['subtotal', 'discount', 'payment', 'total'],
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  padding: "0px",
  margin: "0px",
};

export const defaultEmailHeaderEditorOptions: EmailHeaderEditorOptions = {
  storeName: '{{store_name}}',
  showStoreName: true,
  showLogo: true,
  logoUrl: '',
  logoWidth: '150px',
  showTagline: true,
  tagline: '',
  title: 'Email Header',
  backgroundColor: '#25A2D0',
  textColor: '#ffffff',
  padding: '15px',
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
  height: 'auto',
  width: '100%',
  fontSize: '28px',
  fontFamily: 'Arial, sans-serif',
  fontWeight: 'bold',
  textAlign: 'center',
  logoAlign: 'left',
  taglineFontSize: '14px'
};

export const defaultEmailFooterEditorOptions: EmailFooterEditorOptions = {
  storeName: '{{store_name}}',
  showSocialMedia: true,
  showAddress: true,
  storeAddress: '{{store_address}}',
  showContact: true,
  contactEmail: '{{store_email}}',
  contactPhone: '{{store_phone}}',
  backgroundColor: '#333333',
  textColor: '#ffffff',
  linkColor: '#4CAF50',
  padding: '0px',
  margin: '0px',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  copyrightText: '© {{current_year}} {{store_name}}. All rights reserved.',
  showCopyright: true,
  showLegal: true,
  privacyLinkText: 'Privacy Policy',
  privacyLinkUrl: '#',
  termsLinkText: 'Terms & Conditions',
  termsLinkUrl: '#',
  emailLabel: 'Email:',
  phoneLabel: 'Phone:',
  footerOrder: ['social', 'address', 'contact', 'legal', 'copyright'],
  storeUrl: '{{store_url}}',
  socialIcons: {
    icons: ['facebook', 'twitter', 'instagram'],
    urls: ['https://facebook.com', 'https://twitter.com', 'https://instagram.com']
  }
};

export const defaultCtaButtonEditorOptions: CtaButtonEditorOptions = {
  buttonText: '',
  buttonUrl: '',
  alignment: 'center',
  backgroundColor: '#4CAF50',
  textColor: '#ffffff',
  hoverColor: '#45a049',
  fontFamily: 'Arial, sans-serif',
  fontSize: '16px',
  fontWeight: 'bold',
  borderRadius: '5px',
  buttonPadding: '12px 30px',
  padding: '0px',
  margin: '0px',
  minWidth: '200px',
  widthAuto: true,
  width: undefined
};

export const defaultRelatedProductsEditorOptions: RelatedProductsEditorOptions = {
  title: '',
  productsToShow: 3,
  showImages: true,
  buttonText: 'View Product',
  backgroundColor: '#f9f9f9',
  titleColor: '#333333',
  titleFontWeight: 'bold',
  priceColor: '#4CAF50',
  buttonColor: '#4CAF50',
  buttonHoverColor: '#45a049',
  padding: '0px',
  margin: '0px',
  showCardShadow: true,
  cardShadow: '0 2px 4px rgba(0,0,0,0.1)',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  useManualData: false,
  p1_name: '', p1_price: '', p1_image: '', p1_url: '',
  p2_name: '', p2_price: '', p2_image: '', p2_url: '',
  p3_name: '', p3_price: '', p3_image: '', p3_url: '',
  p4_name: '', p4_price: '', p4_image: '', p4_url: '',
};

export const defaultOrderSubtotalEditorOptions: OrderSubtotalEditorOptions = {
  label: 'Subtotal',
  value: '{{order_subtotal}}',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  spacing: 10,
  columnGap: 0,
  padding: '0px',
  margin: '0px',
  labelAlign: 'left',
  valueAlign: 'right',
  subtotalLabel: 'Subtotal',
  discountLabel: 'Discount',
  shippingLabel: 'Shipping',
  refundedFullyLabel: 'Order fully refunded',
  refundedPartialLabel: 'Refund',
  subtotalValue: '{{order_subtotal}}',
  discountValue: '{{order_discount}}',
  shippingValue: '{{order_shipping}}',
  refundedFullyValue: '{{order_total}}',
  refundedPartialValue: '{{refund_amount}}',
  lastColumnWidth: 30,
  borderWidth: 0,
  borderColor: '#eeeeee',
  fontWeight: 'normal',
  lineHeight: 1.5,
  width: '100%',
  height: 'auto',
  orderSubtotalRowOrder: ['subtotal', 'discount', 'shipping', 'refunded_full', 'refunded_partial'],
};

export const defaultOrderTotalEditorOptions: OrderTotalEditorOptions = {
  label: 'Total',
  value: '{{order_total}}',
  fontFamily: 'Arial, sans-serif',
  fontSize: '18px',
  textColor: '#000000',
  textAlign: 'left',
  backgroundColor: 'transparent',
  spacing: 12,
  padding: '0px',
  margin: '0px',
  labelAlign: 'left',
  valueAlign: 'right',
  lastColumnWidth: 30,
  borderWidth: 0,
  borderColor: '#eeeeee',
  fontWeight: 'bold',
  lineHeight: 1.5,
  width: '100%',
  height: 'auto',
};

export const defaultShippingMethodEditorOptions: ShippingMethodEditorOptions = {
  label: 'Shipping Method',
  value: '{{shipping_method}}',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  spacing: 12,
  padding: '0px',
  margin: '0px',
  labelAlign: 'left',
  valueAlign: 'right',
  lastColumnWidth: 30,
  borderWidth: 0,
  borderColor: '#eeeeee',
  fontWeight: 'normal',
  lineHeight: 1.5,
  width: '100%',
  height: 'auto',
};

export const defaultPaymentMethodEditorOptions: PaymentMethodEditorOptions = {
  label: 'Payment Method',
  value: '{{payment_method}}',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  spacing: 12,
  padding: '0px',
  margin: '0px',
  labelAlign: 'left',
  valueAlign: 'right',
  lastColumnWidth: 30,
  borderWidth: 0,
  borderColor: '#eeeeee',
  fontWeight: 'normal',
  lineHeight: 1.5,
  width: '100%',
  height: 'auto',
};

export const defaultCustomerNoteEditorOptions: CustomerNoteEditorOptions = {
  label: 'Customer Note',
  value: '{{customer_note}}',
  fontFamily: 'Arial, sans-serif',
  fontSize: '14px',
  textColor: '#333333',
  textAlign: 'left',
  backgroundColor: 'transparent',
  spacing: 12,
  padding: '0px',
  margin: '0px',
  labelAlign: 'left',
  valueAlign: 'right',
  lastColumnWidth: 30,
  borderWidth: 0,
  borderColor: '#eeeeee',
  fontWeight: 'normal',
  lineHeight: 1.5
};


const initialState: WorkspaceState = {
  selectionCount: 0,
  blocks: [],
  selectedBlockId: null,
  editorOpen: false,
  selectedColumnIndex: null,
  selectedBlockForEditor: null,
  selectedContentType: null,
  selectedWidgetIndex: null,
  selectedNestedPath: null,
  selectedSubElementId: null,
  copiedWidget: null,

  // Basic Layout
  textEditorOptions: defaultTextEditorOptions,
  headingEditorOptions: defaultHeadingEditorOptions,
  socialIconsEditorOptions: defaultSocialIconsEditorOptions,
  buttonEditorOptions: { ...defaultButtonEditorOptions, lineHeight: 24 },
  dividerEditorOptions: defaultDividerEditorOptions,
  imageEditorOptions: defaultImageEditorOptions,
  sectionEditorOptions: defaultSectionEditorOptions,
  spacerEditorOptions: defaultSpacerEditorOptions,
  tableEditorOptions: defaultTableEditorOptions,
  linkEditorOptions: defaultLinkEditorOptions,
  iconEditorOptions: defaultIconEditorOptions,

  // Layout Block
  rowEditorOptions: defaultRowEditorOptions,
  containerEditorOptions: defaultContainerEditorOptions,
  groupEditorOptions: defaultGroupEditorOptions,
  paragraphRowEditorOptions: defaultParagraphRowEditorOptions,

  // Extra Block
  socialFollowEditorOptions: defaultSocialFollowEditorOptions,
  videoEditorOptions: defaultVideoEditorOptions,

  countdownEditorOptions: defaultCountdownEditorOptions,
  progressBarEditorOptions: defaultProgressBarEditorOptions,
  promoCodeEditorOptions: defaultPromoCodeEditorOptions,
  priceEditorOptions: defaultPriceEditorOptions,
  testimonialEditorOptions: defaultTestimonialEditorOptions,
  navbarEditorOptions: defaultNavbarEditorOptions,
  cardEditorOptions: defaultCardEditorOptions,
  alertEditorOptions: defaultAlertEditorOptions,
  progressEditorOptions: defaultProgressEditorOptions,

  // Forms
  formEditorOptions: defaultFormEditorOptions,
  surveyEditorOptions: defaultSurveyEditorOptions,
  inputEditorOptions: defaultInputEditorOptions,
  textareaEditorOptions: defaultTextareaEditorOptions,
  selectEditorOptions: defaultSelectEditorOptions,
  checkboxEditorOptions: defaultCheckboxEditorOptions,
  radioEditorOptions: defaultRadioEditorOptions,
  labelEditorOptions: defaultLabelEditorOptions,

  // WooCommerce Layout
  shippingAddressEditorOptions: defaultShippingAddressEditorOptions,
  billingAddressEditorOptions: defaultBillingAddressEditorOptions,
  orderItemsEditorOptions: defaultOrderItemsEditorOptions,
  taxBillingEditorOptions: defaultTaxBillingEditorOptions,
  emailHeaderEditorOptions: defaultEmailHeaderEditorOptions,
  emailFooterEditorOptions: defaultEmailFooterEditorOptions,
  ctaButtonEditorOptions: defaultCtaButtonEditorOptions,
  relatedProductsEditorOptions: defaultRelatedProductsEditorOptions,
  orderSubtotalEditorOptions: defaultOrderSubtotalEditorOptions,
  orderTotalEditorOptions: defaultOrderTotalEditorOptions,
  shippingMethodEditorOptions: defaultShippingMethodEditorOptions,
  paymentMethodEditorOptions: defaultPaymentMethodEditorOptions,
  customerNoteEditorOptions: defaultCustomerNoteEditorOptions,
  contactEditorOptions: defaultContactEditorOptions,
  productDetailsEditorOptions: defaultProductDetailsEditorOptions,
  refundFullEditorOptions: defaultRefundFullEditorOptions,
  refundPartialEditorOptions: defaultRefundPartialEditorOptions,

  isMobileView: false,
  viewportMode: 'desktop',
  previewMode: false,
  past: [],
  future: [],
  bodyStyle: { backgroundColor: '#f5f7f9', primaryColor: '#93003f', secondaryColor: '#495157' },
} as WorkspaceState;

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState,
  reducers: {
    undo: (state) => {
      if (state.past.length > 0) {
        const previous = state.past[state.past.length - 1];
        const newPast = state.past.slice(0, state.past.length - 1);
        state.future = [current(state.blocks), ...state.future];
        state.blocks = previous;
        state.past = newPast;
      }
    },
    redo: (state) => {
      if (state.future.length > 0) {
        const next = state.future[0];
        const newFuture = state.future.slice(1);
        state.past = [...state.past, current(state.blocks)];
        state.blocks = next;
        state.future = newFuture;
      }
    },
    addBlock: (state, action: PayloadAction<{ columns: number; type?: string; content?: string }>) => {
      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      const blockId = `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;
      const columns = Array.from({ length: action.payload.columns }, () => (
        {
          id: `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`,
          style: { ...defaultColumnStyle },
          contentType: null,
          contentData: null,
          widgetContents: [],

          // Basic Layout
          textEditorOptions: { ...defaultTextEditorOptions },
          headingEditorOptions: { ...defaultHeadingEditorOptions },
          socialIconsEditorOptions: { ...defaultSocialIconsEditorOptions },
          dividerEditorOptions: { ...defaultDividerEditorOptions },
          imageEditorOptions: { ...defaultImageEditorOptions },
          buttonEditorOptions: { ...defaultButtonEditorOptions },
          sectionEditorOptions: { ...defaultSectionEditorOptions },
          spacerEditorOptions: { ...defaultSpacerEditorOptions },
          tableEditorOptions: { ...defaultTableEditorOptions },
          linkEditorOptions: { ...defaultLinkEditorOptions },
          iconEditorOptions: { ...defaultIconEditorOptions },

          // Layout Block
          rowEditorOptions: { ...defaultRowEditorOptions },
          containerEditorOptions: { ...defaultContainerEditorOptions },
          groupEditorOptions: { ...defaultGroupEditorOptions },
          paragraphRowEditorOptions: { ...defaultParagraphRowEditorOptions },

          // Extra Block
          socialFollowEditorOptions: { ...defaultSocialFollowEditorOptions },
          videoEditorOptions: { ...defaultVideoEditorOptions },

          countdownEditorOptions: { ...defaultCountdownEditorOptions },
          progressBarEditorOptions: { ...defaultProgressBarEditorOptions },
          promoCodeEditorOptions: { ...defaultPromoCodeEditorOptions },
          priceEditorOptions: { ...defaultPriceEditorOptions },
          testimonialEditorOptions: { ...defaultTestimonialEditorOptions },
          navbarEditorOptions: { ...defaultNavbarEditorOptions },
          cardEditorOptions: { ...defaultCardEditorOptions },
          alertEditorOptions: { ...defaultAlertEditorOptions },
          progressEditorOptions: { ...defaultProgressEditorOptions },

          // Forms
          formEditorOptions: { ...defaultFormEditorOptions },
          surveyEditorOptions: { ...defaultSurveyEditorOptions },
          inputEditorOptions: { ...defaultInputEditorOptions },
          textareaEditorOptions: { ...defaultTextareaEditorOptions },
          selectEditorOptions: { ...defaultSelectEditorOptions },
          checkboxEditorOptions: { ...defaultCheckboxEditorOptions },
          radioEditorOptions: { ...defaultRadioEditorOptions },
          labelEditorOptions: { ...defaultLabelEditorOptions },

          // WooCommerce Layout
          shippingAddressEditorOptions: { ...defaultShippingAddressEditorOptions },
          billingAddressEditorOptions: { ...defaultBillingAddressEditorOptions },
          orderItemsEditorOptions: { ...defaultOrderItemsEditorOptions },
          taxBillingEditorOptions: { ...defaultTaxBillingEditorOptions },
          emailHeaderEditorOptions: { ...defaultEmailHeaderEditorOptions },
          emailFooterEditorOptions: { ...defaultEmailFooterEditorOptions },
          ctaButtonEditorOptions: { ...defaultCtaButtonEditorOptions },
          relatedProductsEditorOptions: { ...defaultRelatedProductsEditorOptions },
          orderSubtotalEditorOptions: { ...defaultOrderSubtotalEditorOptions },
          orderTotalEditorOptions: { ...defaultOrderTotalEditorOptions },
          shippingMethodEditorOptions: { ...defaultShippingMethodEditorOptions },
          paymentMethodEditorOptions: { ...defaultPaymentMethodEditorOptions },
          customerNoteEditorOptions: { ...defaultCustomerNoteEditorOptions },
          contactEditorOptions: { ...defaultContactEditorOptions },
          productDetailsEditorOptions: { ...defaultProductDetailsEditorOptions },
          refundFullEditorOptions: { ...defaultRefundFullEditorOptions },
          refundPartialEditorOptions: { ...defaultRefundPartialEditorOptions },
        }
      ));
      const newBlock: DroppedBlock = {
        id: blockId,
        columns,
        style: { ...defaultBlockStyle },
      };
      state.blocks.push(newBlock);
      state.selectedBlockId = blockId;
      state.selectedBlockForEditor = blockId;
      state.selectedColumnIndex = null;
      state.selectedContentType = null;
      state.editorOpen = true;
      state.selectionCount += 1;
    },

    copyBlock: (state, action: PayloadAction<string | null>) => {

      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      const blockToCopy = state.blocks.find((block) => block.id === action.payload);
      if (blockToCopy && action.payload) {
        const newBlockId = `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`;


        const newColumns = blockToCopy.columns.map((col) => ({
          id: `${Date.now().toString()}-${Math.random().toString(36).substr(2, 9)}`,
          style: { ...col.style },
          contentType: col.contentType,
          contentData: col.contentData,
          // Fix: Deep copy widgetContents to prevent shared references
          widgetContents: col.widgetContents.map(widget => ({
            ...widget,
          })),

          // Basic Layout
          sectionEditorOptions: { ...col.sectionEditorOptions },
          spacerEditorOptions: { ...col.spacerEditorOptions },
          tableEditorOptions: { ...col.tableEditorOptions },
          linkEditorOptions: { ...col.linkEditorOptions },
          iconEditorOptions: { ...col.iconEditorOptions },
          textEditorOptions: { ...col.textEditorOptions },
          headingEditorOptions: { ...col.headingEditorOptions },
          socialIconsEditorOptions: { ...col.socialIconsEditorOptions },
          dividerEditorOptions: { ...col.dividerEditorOptions },
          imageEditorOptions: { ...col.imageEditorOptions },
          buttonEditorOptions: { ...col.buttonEditorOptions },

          // Layout Block
          rowEditorOptions: { ...col.rowEditorOptions },
          containerEditorOptions: { ...col.containerEditorOptions },
          groupEditorOptions: { ...col.groupEditorOptions },
          paragraphRowEditorOptions: { ...col.paragraphRowEditorOptions },

          // Extra Block
          socialFollowEditorOptions: { ...col.socialFollowEditorOptions },
          videoEditorOptions: { ...col.videoEditorOptions },
          countdownEditorOptions: { ...col.countdownEditorOptions },
          progressBarEditorOptions: { ...col.progressBarEditorOptions },
          promoCodeEditorOptions: { ...col.promoCodeEditorOptions },
          priceEditorOptions: { ...col.priceEditorOptions },
          testimonialEditorOptions: { ...col.testimonialEditorOptions },
          navbarEditorOptions: { ...col.navbarEditorOptions },
          cardEditorOptions: { ...col.cardEditorOptions },
          alertEditorOptions: { ...col.alertEditorOptions },
          progressEditorOptions: { ...col.progressEditorOptions },

          // Forms
          formEditorOptions: { ...col.formEditorOptions },
          surveyEditorOptions: { ...col.surveyEditorOptions },
          inputEditorOptions: { ...col.inputEditorOptions },
          textareaEditorOptions: { ...col.textareaEditorOptions },
          selectEditorOptions: { ...col.selectEditorOptions },
          checkboxEditorOptions: { ...col.checkboxEditorOptions },
          radioEditorOptions: { ...col.radioEditorOptions },
          labelEditorOptions: { ...col.labelEditorOptions },

          // WooCommerce Layout
          shippingAddressEditorOptions: { ...col.shippingAddressEditorOptions },
          billingAddressEditorOptions: { ...col.billingAddressEditorOptions },
          orderItemsEditorOptions: { ...col.orderItemsEditorOptions },
          taxBillingEditorOptions: { ...col.taxBillingEditorOptions },
          emailHeaderEditorOptions: { ...col.emailHeaderEditorOptions },
          emailFooterEditorOptions: { ...col.emailFooterEditorOptions },
          ctaButtonEditorOptions: { ...col.ctaButtonEditorOptions },
          relatedProductsEditorOptions: { ...col.relatedProductsEditorOptions },
          orderSubtotalEditorOptions: { ...col.orderSubtotalEditorOptions },
          orderTotalEditorOptions: { ...col.orderTotalEditorOptions },
          shippingMethodEditorOptions: { ...col.shippingMethodEditorOptions },
          paymentMethodEditorOptions: { ...col.paymentMethodEditorOptions },
          customerNoteEditorOptions: { ...col.customerNoteEditorOptions },
          contactEditorOptions: { ...col.contactEditorOptions },
          productDetailsEditorOptions: { ...col.productDetailsEditorOptions },
          refundFullEditorOptions: col.refundFullEditorOptions ? { ...col.refundFullEditorOptions } : undefined,
          refundPartialEditorOptions: col.refundPartialEditorOptions ? { ...col.refundPartialEditorOptions } : undefined,
        }));
        state.blocks.push({
          id: newBlockId,
          columns: newColumns,
          style: { ...blockToCopy.style },
        });

      }
    },

    renameBlock: (state, action: PayloadAction<{ id: string, name: string }>) => {
      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      const index = state.blocks.findIndex(b => b.id === action.payload.id);
      if (index !== -1) {
        state.blocks[index] = {
          ...state.blocks[index],
          name: action.payload.name
        };
      }
    },

    deleteBlock: (state, action: PayloadAction<string | null>) => {

      if (action.payload) {
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        const originalLength = state.blocks.length;
        state.blocks = state.blocks.filter((block) => block.id !== action.payload);


        if (state.selectedBlockId === action.payload) {
          state.selectedBlockId = null;
        }
        if (state.selectedBlockForEditor === action.payload) {
          state.editorOpen = false;
          state.selectedColumnIndex = null;
          state.selectedBlockForEditor = null;
        }
      }
    },

    deleteColumnContent: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; widgetIndex: number }>) => {

      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      const { blockId, columnIndex, widgetIndex } = action.payload;
      if (blockId) {
        const block = state.blocks.find((b) => b.id === blockId);
        if (block && block.columns[columnIndex] && widgetIndex !== null) {
          const column = block.columns[columnIndex];
          const rootWidget = column.widgetContents[widgetIndex];

          if (
            rootWidget &&
            state.selectedBlockForEditor === blockId &&
            state.selectedColumnIndex === columnIndex &&
            state.selectedWidgetIndex === widgetIndex &&
            state.selectedNestedPath &&
            state.selectedNestedPath.length > 0
          ) {
            rootWidget.contentData = deepDeleteWidgetData(rootWidget.contentData, state.selectedNestedPath);
            state.editorOpen = false;
            state.selectedBlockForEditor = null;
            state.selectedColumnIndex = null;
            state.selectedWidgetIndex = null;
            state.selectedNestedPath = null;
            state.selectedSubElementId = null;
            state.selectedContentType = null;
            return;
          }

          column.widgetContents.splice(widgetIndex, 1);
          if (column.widgetContents.length === 0) {
            column.contentType = null;
            column.contentData = null;
            column.style.height = 'auto';
          }
          if (state.selectedBlockForEditor === blockId && state.selectedColumnIndex === columnIndex && state.selectedWidgetIndex === widgetIndex) {
            state.editorOpen = false;
            state.selectedBlockForEditor = null;
            state.selectedColumnIndex = null;
            state.selectedWidgetIndex = null;
            state.selectedNestedPath = null;
            state.selectedSubElementId = null;
            state.selectedContentType = null;
          }
        } else {
          console.error('REDUCER: Block or column not found for widget deletion');
        }
      }
    },

    reorderBlocks: (state, action: PayloadAction<{ sourceId: string; targetId: string }>) => {
      // Save history before reordering
      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      const { sourceId, targetId } = action.payload;
      const sourceIndex = state.blocks.findIndex((block) => block.id === sourceId);
      const targetIndex = state.blocks.findIndex((block) => block.id === targetId);
      if (sourceIndex !== -1 && targetIndex !== -1) {
        const [movedBlock] = state.blocks.splice(sourceIndex, 1);
        state.blocks.splice(targetIndex, 0, movedBlock);
      }
    },

    reorderColumnContent: (state, action: PayloadAction<{ blockId: string; columnIndex: number; sourceIndex: number; targetIndex: number }>) => {
      const { blockId, columnIndex, sourceIndex, targetIndex } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      if (block && block.columns[columnIndex]) {
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        const widgetContents = block.columns[columnIndex].widgetContents;
        const [movedWidget] = widgetContents.splice(sourceIndex, 1);
        widgetContents.splice(targetIndex, 0, movedWidget);

        // Update selected index if necessary
        if (state.selectedBlockForEditor === blockId && state.selectedColumnIndex === columnIndex) {
          if (state.selectedWidgetIndex === sourceIndex) {
            state.selectedWidgetIndex = targetIndex;
          } else if (sourceIndex < targetIndex && state.selectedWidgetIndex !== null && state.selectedWidgetIndex > sourceIndex && state.selectedWidgetIndex <= targetIndex) {
            state.selectedWidgetIndex--;
          } else if (sourceIndex > targetIndex && state.selectedWidgetIndex !== null && state.selectedWidgetIndex < sourceIndex && state.selectedWidgetIndex >= targetIndex) {
            state.selectedWidgetIndex++;
          }
        }
      }
    },

    moveColumnContent: (state, action: PayloadAction<{
      sourceBlockId: string;
      sourceColumnIndex: number;
      sourceIndex: number;
      targetBlockId: string;
      targetColumnIndex: number;
      targetIndex: number;
    }>) => {
      const { sourceBlockId, sourceColumnIndex, sourceIndex, targetBlockId, targetColumnIndex, targetIndex } = action.payload;
      const sourceBlock = state.blocks.find(b => b.id === sourceBlockId);
      const targetBlock = state.blocks.find(b => b.id === targetBlockId);
      const sourceColumn = sourceBlock?.columns[sourceColumnIndex];
      const targetColumn = targetBlock?.columns[targetColumnIndex];
      if (!sourceColumn || !targetColumn) return;
      if (sourceIndex < 0 || sourceIndex >= sourceColumn.widgetContents.length) return;

      state.past = [...state.past, current(state.blocks)];
      state.future = [];

      const [movedWidget] = sourceColumn.widgetContents.splice(sourceIndex, 1);
      const isSameColumn = sourceBlockId === targetBlockId && sourceColumnIndex === targetColumnIndex;
      const adjustedTargetIndex = isSameColumn && sourceIndex < targetIndex ? targetIndex - 1 : targetIndex;
      const safeTargetIndex = Math.max(0, Math.min(adjustedTargetIndex, targetColumn.widgetContents.length));
      targetColumn.widgetContents.splice(safeTargetIndex, 0, movedWidget);

      if (sourceColumn.widgetContents.length === 0) {
        sourceColumn.contentType = null;
        sourceColumn.contentData = null;
        sourceColumn.style.height = 'auto';
      }

      targetColumn.contentType = movedWidget.contentType;
      targetColumn.style.height = 'auto';
      if (targetBlock) targetBlock.style = { ...neutralBlockStyle };

      if (
        state.selectedBlockForEditor === sourceBlockId &&
        state.selectedColumnIndex === sourceColumnIndex &&
        state.selectedWidgetIndex === sourceIndex
      ) {
        state.selectedBlockForEditor = targetBlockId;
        state.selectedBlockId = targetBlockId;
        state.selectedColumnIndex = targetColumnIndex;
        state.selectedWidgetIndex = safeTargetIndex;
        state.selectedContentType = movedWidget.contentType;
        state.selectedNestedPath = null;
        state.selectedSubElementId = null;
      }
    },

    copyColumnContent: (state, action: PayloadAction<{ blockId: string; columnIndex: number; widgetIndex: number }>) => {
      const { blockId, columnIndex, widgetIndex } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      if (block && block.columns[columnIndex]) {
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        const widgetToCopy = block.columns[columnIndex].widgetContents[widgetIndex];
        if (widgetToCopy) {
          const newWidget = { ...widgetToCopy }; // Shallow copy is enough for now as contentData is string
          block.columns[columnIndex].widgetContents.splice(widgetIndex + 1, 0, newWidget);
        }
      }
    },

    setMobileView: (state, action: PayloadAction<boolean>) => {
      state.isMobileView = action.payload;
      state.viewportMode = action.payload ? 'mobile' : 'desktop';
    },

    setViewportMode: (state, action: PayloadAction<'desktop' | 'tablet' | 'mobile'>) => {
      state.viewportMode = action.payload;
      state.isMobileView = action.payload === 'mobile';
    },

    selectBlock: (state, action: PayloadAction<string | null>) => {
      state.selectedBlockId = action.payload;
    },

    setPreviewMode: (state, action: PayloadAction<boolean>) => {
      state.previewMode = action.payload;
    },

    setSelectedBlockId: (state, action: PayloadAction<string | null>) => {
      state.selectedBlockId = action.payload;
    },

    updateBodyStyle: (state, action: PayloadAction<BodyStyle>) => {
      state.bodyStyle = action.payload;
    },

    updateWidgetData: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.selectedContentType) {
        const optionKey = `${state.selectedContentType}EditorOptions`;
        if (optionKey in state) {
          (state as any)[optionKey] = { ...(state as any)[optionKey], ...action.payload };
        }
      }

      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (widget) {
          if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          } else {
            try {
              const currentData = JSON.parse(widget.contentData || '{}');
              const updatedData = { ...currentData, ...action.payload };
              widget.contentData = JSON.stringify(updatedData);

              if (column && state.selectedContentType) {
                const columnOptionKey = `${state.selectedContentType}EditorOptions`;
                if (columnOptionKey in column) {
                  (column as any)[columnOptionKey] = { ...(column as any)[columnOptionKey], ...action.payload };
                }
              }
            } catch (e) {
              console.error("Error updating widget data in reducer:", e);
            }
          }
        }
      }
    },

    openEditor: (state, action: PayloadAction<{
      blockId: string | null;
      columnIndex: number | null;
      contentType?: WidgetContentType | null;
      widgetIndex?: number | null;
      nestedPath?: Array<{ colIdx: number; childIdx: number }> | null;
      selectedSubElementId?: string | null;
    }>) => {
      state.selectionCount += 1;
      state.editorOpen = true;
      state.selectedBlockId = action.payload.blockId;
      state.selectedBlockForEditor = action.payload.blockId;
      state.selectedColumnIndex = action.payload.columnIndex;
      state.selectedNestedPath = action.payload.nestedPath || null;
      state.selectedSubElementId = action.payload.selectedSubElementId !== undefined ? action.payload.selectedSubElementId : null;

      state.selectedContentType = action.payload.contentType !== undefined
        ? action.payload.contentType
        : (
          action.payload.columnIndex !== null && action.payload.blockId
            ? state.blocks.find((b) => b.id === action.payload.blockId)?.columns[action.payload.columnIndex]?.contentType || null
            : null
        );
      state.selectedWidgetIndex = action.payload.widgetIndex !== undefined ? action.payload.widgetIndex : null;

      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null) {
        const block = state.blocks.find((b) => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];

        if (column) {
          let targetContentData: string | null = null;

          if (state.selectedNestedPath && state.selectedNestedPath.length > 0 && state.selectedWidgetIndex !== null && column.widgetContents[state.selectedWidgetIndex]) {
            let currentContentData = column.widgetContents[state.selectedWidgetIndex].contentData;
            try {
              for (const pathPart of state.selectedNestedPath) {
                const parentData = JSON.parse(currentContentData || '{}');
                let nestedWidget = null;
                if (pathPart.colIdx === -1) {
                  nestedWidget = parentData.children?.[pathPart.childIdx];
                } else {
                  nestedWidget = parentData.columnsData?.[pathPart.colIdx]?.children?.[pathPart.childIdx];
                }
                if (nestedWidget) {
                  currentContentData = nestedWidget.contentData;
                  state.selectedContentType = nestedWidget.contentType;
                } else {
                  break;
                }
              }
              targetContentData = currentContentData;
            } catch (e) {
              console.error("Error parsing nested contentData:", e);
            }
          } else if (state.selectedWidgetIndex !== null && column.widgetContents[state.selectedWidgetIndex]) {
            targetContentData = column.widgetContents[state.selectedWidgetIndex].contentData;
          } else if (column.contentData) {
            targetContentData = column.contentData;
          }

          if (action.payload.selectedSubElementId && action.payload.selectedSubElementId.startsWith('link_') && targetContentData) {
            try {
              const parentObj = JSON.parse(targetContentData);
              const htmlContent = parentObj.content || '';
              const linkOptions = extractHtmlLinkOptions(htmlContent, action.payload.selectedSubElementId);
              if (linkOptions) {
                state.linkEditorOptions = { ...defaultLinkEditorOptions, ...linkOptions };
              }
            } catch (e) {
              console.error("Error parsing parent HTML for link options:", e);
            }
          }

          if (state.selectedContentType) {
            const data = targetContentData;
            const updateOptions = (stateKey: string, defaultOptions: any, columnOptions: any) => {
              if (data) {
                try {
                  const parsed = JSON.parse(data);
                  (state as any)[stateKey] = { ...defaultOptions, ...parsed };
                } catch (e) {
                  (state as any)[stateKey] = columnOptions ? { ...defaultOptions, ...columnOptions } : defaultOptions;
                }
              } else {
                (state as any)[stateKey] = columnOptions ? { ...defaultOptions, ...columnOptions } : defaultOptions;
              }
            };

            switch (state.selectedContentType) {
              case 'text': updateOptions('textEditorOptions', defaultTextEditorOptions, column.textEditorOptions); break;
              case 'heading': updateOptions('headingEditorOptions', defaultHeadingEditorOptions, column.headingEditorOptions); break;
              case 'socialIcons': updateOptions('socialIconsEditorOptions', defaultSocialIconsEditorOptions, column.socialIconsEditorOptions); break;
              case 'divider': updateOptions('dividerEditorOptions', defaultDividerEditorOptions, column.dividerEditorOptions); break;
              case 'image': updateOptions('imageEditorOptions', defaultImageEditorOptions, column.imageEditorOptions); break;
              case 'button': updateOptions('buttonEditorOptions', defaultButtonEditorOptions, column.buttonEditorOptions); break;
              case 'section': updateOptions('sectionEditorOptions', defaultSectionEditorOptions, column.sectionEditorOptions); break;
              case 'spacer': updateOptions('spacerEditorOptions', defaultSpacerEditorOptions, column.spacerEditorOptions); break;
              case 'table': updateOptions('tableEditorOptions', defaultTableEditorOptions, column.tableEditorOptions); break;
              case 'link': 
                if (action.payload.selectedSubElementId && action.payload.selectedSubElementId.startsWith('link_')) {
                  // Do not overwrite linkEditorOptions, we already set it above!
                } else {
                  updateOptions('linkEditorOptions', defaultLinkEditorOptions, column.linkEditorOptions);
                }
                break;
              case 'icon': updateOptions('iconEditorOptions', defaultIconEditorOptions, column.iconEditorOptions); break;
              case 'row': updateOptions('rowEditorOptions', defaultRowEditorOptions, column.rowEditorOptions); break;
              case 'container': updateOptions('containerEditorOptions', defaultContainerEditorOptions, column.containerEditorOptions); break;
              case 'group': updateOptions('groupEditorOptions', defaultGroupEditorOptions, column.groupEditorOptions); break;
              case 'socialFollow': updateOptions('socialFollowEditorOptions', defaultSocialFollowEditorOptions, column.socialFollowEditorOptions); break;
              case 'video': updateOptions('videoEditorOptions', defaultVideoEditorOptions, column.videoEditorOptions); break;
              case 'countdown': updateOptions('countdownEditorOptions', defaultCountdownEditorOptions, column.countdownEditorOptions); break;
              case 'progressBar': updateOptions('progressBarEditorOptions', defaultProgressBarEditorOptions, column.progressBarEditorOptions); break;
              case 'promoCode': updateOptions('promoCodeEditorOptions', defaultPromoCodeEditorOptions, column.promoCodeEditorOptions); break;
              case 'price': updateOptions('priceEditorOptions', defaultPriceEditorOptions, column.priceEditorOptions); break;
              case 'testimonial': updateOptions('testimonialEditorOptions', defaultTestimonialEditorOptions, column.testimonialEditorOptions); break;
              case 'navbar': updateOptions('navbarEditorOptions', defaultNavbarEditorOptions, column.navbarEditorOptions); break;
              case 'card': updateOptions('cardEditorOptions', defaultCardEditorOptions, column.cardEditorOptions); break;
              case 'alert': updateOptions('alertEditorOptions', defaultAlertEditorOptions, column.alertEditorOptions); break;
              case 'progress': updateOptions('progressEditorOptions', defaultProgressEditorOptions, column.progressEditorOptions); break;
              case 'form': updateOptions('formEditorOptions', defaultFormEditorOptions, column.formEditorOptions); break;
              case 'survey': updateOptions('surveyEditorOptions', defaultSurveyEditorOptions, column.surveyEditorOptions); break;
              case 'input': updateOptions('inputEditorOptions', defaultInputEditorOptions, column.inputEditorOptions); break;
              case 'textarea': updateOptions('textareaEditorOptions', defaultTextareaEditorOptions, column.textareaEditorOptions); break;
              case 'select': updateOptions('selectEditorOptions', defaultSelectEditorOptions, column.selectEditorOptions); break;
              case 'checkbox': updateOptions('checkboxEditorOptions', defaultCheckboxEditorOptions, column.checkboxEditorOptions); break;
              case 'radio': updateOptions('radioEditorOptions', defaultRadioEditorOptions, column.radioEditorOptions); break;
              case 'label': updateOptions('labelEditorOptions', defaultLabelEditorOptions, column.labelEditorOptions); break;
              case 'shippingAddress': updateOptions('shippingAddressEditorOptions', defaultShippingAddressEditorOptions, column.shippingAddressEditorOptions); break;
              case 'billingAddress': updateOptions('billingAddressEditorOptions', defaultBillingAddressEditorOptions, column.billingAddressEditorOptions); break;
              case 'orderSubtotal': updateOptions('orderSubtotalEditorOptions', defaultOrderSubtotalEditorOptions, column.orderSubtotalEditorOptions); break;
              case 'orderTotal': updateOptions('orderTotalEditorOptions', defaultOrderTotalEditorOptions, column.orderTotalEditorOptions); break;
              case 'shippingMethod': updateOptions('shippingMethodEditorOptions', defaultShippingMethodEditorOptions, column.shippingMethodEditorOptions); break;
              case 'paymentMethod': updateOptions('paymentMethodEditorOptions', defaultPaymentMethodEditorOptions, column.paymentMethodEditorOptions); break;
              case 'customerNote': updateOptions('customerNoteEditorOptions', defaultCustomerNoteEditorOptions, column.customerNoteEditorOptions); break;
              case 'contact': updateOptions('contactEditorOptions', defaultContactEditorOptions, column.contactEditorOptions); break;
              case 'productDetails': updateOptions('productDetailsEditorOptions', defaultProductDetailsEditorOptions, column.productDetailsEditorOptions); break;
              case 'refundFull': updateOptions('refundFullEditorOptions', defaultRefundFullEditorOptions, column.refundFullEditorOptions); break;
              case 'refundPartial': updateOptions('refundPartialEditorOptions', defaultRefundPartialEditorOptions, column.refundPartialEditorOptions); break;
              case 'emailHeader': updateOptions('emailHeaderEditorOptions', defaultEmailHeaderEditorOptions, column.emailHeaderEditorOptions); break;
              case 'emailFooter': updateOptions('emailFooterEditorOptions', defaultEmailFooterEditorOptions, column.emailFooterEditorOptions); break;
              case 'ctaButton': updateOptions('ctaButtonEditorOptions', defaultCtaButtonEditorOptions, column.ctaButtonEditorOptions); break;
              case 'relatedProducts': updateOptions('relatedProductsEditorOptions', defaultRelatedProductsEditorOptions, column.relatedProductsEditorOptions); break;
              case 'taxBilling': updateOptions('taxBillingEditorOptions', defaultTaxBillingEditorOptions, column.taxBillingEditorOptions); break;
              case 'orderItems': updateOptions('orderItemsEditorOptions', defaultOrderItemsEditorOptions, column.orderItemsEditorOptions); break;
              case 'paragraph-row': updateOptions('paragraphRowEditorOptions', defaultParagraphRowEditorOptions, column.paragraphRowEditorOptions); break;
              default: break;
            }
          }
        }
      }
    },

    closeEditor: (state) => {
      state.editorOpen = false;
      state.selectedColumnIndex = null;
      state.selectedBlockForEditor = null;
      state.selectedContentType = null;
      state.selectedSubElementId = null;
    },

    updateSubElementStyles: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null && state.selectedSubElementId) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (widget) {
          try {
            const currentData = JSON.parse(widget.contentData || '{}');
            if (!currentData.subStyles) {
              currentData.subStyles = {};
            }
            if (!currentData.subStyles[state.selectedSubElementId]) {
              currentData.subStyles[state.selectedSubElementId] = {};
            }
            currentData.subStyles[state.selectedSubElementId] = {
              ...currentData.subStyles[state.selectedSubElementId],
              ...action.payload
            };
            widget.contentData = JSON.stringify(currentData);
          } catch (e) {
            console.error("Error updating sub element styles:", e);
          }
        }
      }
    },

    pasteSubElementStyle: (state, action: PayloadAction<{ blockId: string; columnIndex: number; widgetIndex: number; subElementId: string; styles: Record<string, any> }>) => {
      const { blockId, columnIndex, widgetIndex, subElementId, styles } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      const column = block?.columns[columnIndex];
      const widget = column?.widgetContents[widgetIndex];
      if (widget) {
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        try {
          const currentData = JSON.parse(widget.contentData || '{}');
          if (!currentData.subStyles) currentData.subStyles = {};
          currentData.subStyles[subElementId] = { ...styles };
          widget.contentData = JSON.stringify(currentData);
        } catch (e) {
          console.error("Error pasting sub-element style:", e);
        }
      }
    },

    resetSubElementStyle: (state, action: PayloadAction<{ blockId: string; columnIndex: number; widgetIndex: number; subElementId: string }>) => {
      const { blockId, columnIndex, widgetIndex, subElementId } = action.payload;
      const block = state.blocks.find(b => b.id === blockId);
      const column = block?.columns[columnIndex];
      const widget = column?.widgetContents[widgetIndex];
      if (widget) {
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        try {
          const currentData = JSON.parse(widget.contentData || '{}');
          if (currentData.subStyles) {
            currentData.subStyles[subElementId] = {};
          }
          widget.contentData = JSON.stringify(currentData);
        } catch (e) {
          console.error("Error resetting sub-element style:", e);
        }
      }
    },

    setCopiedWidget: (state, action: PayloadAction<{ contentType: WidgetContentType; contentData: string } | null>) => {
      state.copiedWidget = action.payload;
    },

    copyCopiedWidget: (state) => {
      const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
      const column = block?.columns[state.selectedColumnIndex ?? -1];
      let widget = column?.widgetContents[state.selectedWidgetIndex ?? -1];

      if (!widget) return;

      if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
        const findNestedWidget = (contentData: string, path: Array<{ colIdx: number; childIdx: number }>): any => {
          try {
            const data = JSON.parse(contentData);
            const [head, ...tail] = path;
            let child = null;
            if (head.colIdx === -1) {
              child = data.children?.[head.childIdx];
            } else {
              child = data.columnsData?.[head.colIdx]?.children?.[head.childIdx];
            }
            if (!child) return null;
            if (tail.length === 0) return child;
            return findNestedWidget(child.contentData, tail);
          } catch (e) {
            return null;
          }
        };
        const nestedWidget = findNestedWidget(widget.contentData || '', state.selectedNestedPath);
        if (nestedWidget) {
          widget = nestedWidget;
        }
      }

      if (widget) {
        state.copiedWidget = {
          contentType: widget.contentType,
          contentData: widget.contentData || ''
        };
      }
    },

    copyWidget: (state, action: PayloadAction<{ contentType: WidgetContentType; contentData: string }>) => {
      state.copiedWidget = action.payload;
    },

    pasteCopiedWidget: (
      state,
      action: PayloadAction<{
        blockId: string;
        columnIndex: number;
        widgetIndex: number;
        nestedPath: Array<{ colIdx: number; childIdx: number }> | null;
        insertInside?: boolean;
      }>
    ) => {
      if (!state.copiedWidget) return;
      const { blockId, columnIndex, widgetIndex, nestedPath, insertInside } = action.payload;

      state.past = [...state.past, current(state.blocks)];
      state.future = [];

      const regenerateIdsLocal = (obj: any): any => {
        if (Array.isArray(obj)) {
          return obj.map(regenerateIdsLocal);
        } else if (obj && typeof obj === 'object') {
          const cloned: any = {};
          for (const key in obj) {
            if (key === 'id') {
              cloned[key] = `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            } else {
              cloned[key] = regenerateIdsLocal(obj[key]);
            }
          }
          return cloned;
        }
        return obj;
      };

      const newWidget = {
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contentType: state.copiedWidget.contentType,
        contentData: state.copiedWidget.contentData,
      };

      try {
        const parsed = JSON.parse(newWidget.contentData || '{}');
        const regeneratedData = regenerateIdsLocal(parsed);
        newWidget.contentData = JSON.stringify(regeneratedData);
      } catch (e) {
        console.error("Error parsing contentData for ID regeneration", e);
      }

      if (!nestedPath || nestedPath.length === 0) {
        const block = state.blocks.find((b) => b.id === blockId);
        const column = block?.columns[columnIndex];
        if (column) {
          if (insertInside) {
            const containerWidget = column.widgetContents[widgetIndex];
            if (containerWidget) {
              try {
                const parsed = JSON.parse(containerWidget.contentData || '{}');
                if (!parsed.children) parsed.children = [];
                parsed.children.push(newWidget);
                containerWidget.contentData = JSON.stringify(parsed);
              } catch (e) {
                console.error("Error inserting top-level nested container widget", e);
              }
            }
          } else {
            column.widgetContents.splice(widgetIndex + 1, 0, newWidget);
          }
        }
        return;
      }

      const block = state.blocks.find((b) => b.id === blockId);
      const column = block?.columns[columnIndex];
      const rootWidget = column?.widgetContents[widgetIndex];
      if (rootWidget) {
        rootWidget.contentData = deepInsertWidget(rootWidget.contentData, nestedPath, newWidget, insertInside);
      }
    },

    clearBlocks: (state) => {
      state.past = [...state.past, current(state.blocks)];
      state.future = [];
      state.blocks = [];
      state.selectedBlockId = null;
      state.editorOpen = false;
      state.selectedColumnIndex = null;
      state.selectedBlockForEditor = null;
    },

    updateBlockHeight: (state, action: PayloadAction<{ blockId: string | null; height: number | 'auto' }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block) {
          block.style.height = action.payload.height;
        }
      }
    },

    updateSelectedColumnIndex: (state, action: PayloadAction<number | null>) => {
      state.selectedColumnIndex = action.payload;
    },

    updateColumnBgColor: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgColor = action.payload.color;
        }
      }
    },

    updateColumnBgImage: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; image: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgImage = action.payload.image;
        }
      }
    },

    updateColumnBgSize: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; size: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgSize = action.payload.size;
        }
      }
    },

    updateColumnBgPosition: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; position: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgPosition = action.payload.position;
        }
      }
    },

    updateColumnBgRepeat: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; repeat: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgRepeat = action.payload.repeat;
        }
      }
    },

    updateColumnBgAttachment: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; attachment: string }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.bgAttachment = action.payload.attachment;
        }
      }
    },

    updateColumnBorderColor: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderTopColor = action.payload.color;
          block.columns[action.payload.columnIndex].style.borderBottomColor = action.payload.color;
          block.columns[action.payload.columnIndex].style.borderLeftColor = action.payload.color;
          block.columns[action.payload.columnIndex].style.borderRightColor = action.payload.color;
        }
      }
    },

    updateColumnPadding: (
      state,
      action: PayloadAction<{
        blockId: string | null;
        columnIndex: number;
        side: 'top' | 'right' | 'bottom' | 'left';
        value: number;
      }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.padding[action.payload.side] = action.payload.value;
        }
      }
    },

    updateColumnBorderRadius: (
      state,
      action: PayloadAction<{
        blockId: string | null;
        columnIndex: number;
        side: 'top' | 'right' | 'bottom' | 'left';
        value: number;
      }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          const col = block.columns[action.payload.columnIndex];
          if (!col.style.borderRadius) {
            col.style.borderRadius = { top: 0, right: 0, bottom: 0, left: 0 };
          }
          col.style.borderRadius[action.payload.side] = action.payload.value;
        }
      }
    },

    updateColumnMargin: (
      state,
      action: PayloadAction<{
        blockId: string | null;
        columnIndex: number;
        side: 'top' | 'right' | 'bottom' | 'left';
        value: number;
      }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          const col = block.columns[action.payload.columnIndex];
          if (!col.style.margin) {
            col.style.margin = { top: 0, right: 0, bottom: 0, left: 0 };
          }
          col.style.margin[action.payload.side] = action.payload.value;
        }
      }
    },

    updateColumnPaddingUnit: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; unit: 'px' | '%' | 'em' }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.paddingUnit = action.payload.unit;
        }
      }
    },

    updateColumnMarginUnit: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; unit: 'px' | '%' | 'em' }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.marginUnit = action.payload.unit;
        }
      }
    },

    updateColumnBorderRadiusUnit: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; unit: 'px' | '%' | 'em' }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderRadiusUnit = action.payload.unit;
        }
      }
    },

    updateColumnBorderStyle: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; style: 'solid' | 'dashed' | 'dotted' }>
    ) => {

      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderStyle = action.payload.style;
        }
      }
    },

    updateColumnBorderTopSize: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; size: number }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderTopSize = action.payload.size;
        }
      }
    },

    updateColumnBorderBottomSize: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; size: number }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderBottomSize = action.payload.size;
        }
      }
    },

    updateColumnBorderLeftSize: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; size: number }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderLeftSize = action.payload.size;
        }
      }
    },

    updateColumnBorderRightSize: (state, action: PayloadAction<{ blockId: string | null; columnIndex: number; size: number }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderRightSize = action.payload.size;
        }
      }
    },

    updateColumnHeight: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; height: number | 'auto' }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.height = action.payload.height;
        }
      }
    },


    addColumnContent: (state, action: PayloadAction<{
      blockId: string | null;
      columnIndex: number;
      contentType: WidgetContentType;
      contentData: string | null;
      insertIndex?: number;
    }>) => {
      if (action.payload.blockId) {
        // Save history before adding content
        state.past = [...state.past, current(state.blocks)];
        state.future = [];
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          const column = block.columns[action.payload.columnIndex];
          const requestedIndex = action.payload.insertIndex;
          const newWidgetIndex = typeof requestedIndex === 'number'
            ? Math.max(0, Math.min(requestedIndex, column.widgetContents.length))
            : column.widgetContents.length;
          let actualContentType = action.payload.contentType;
          let actualContentData = action.payload.contentData || null;

          if (!action.payload.contentData) {
            if (action.payload.contentType === 'billingAddress' || action.payload.contentType === 'shippingAddress') {
              actualContentType = 'container';
              const isBilling = action.payload.contentType === 'billingAddress';
              const title = isBilling ? 'BILL TO:' : 'SHIP TO:';
              const prefix = isBilling ? 'billing' : 'shipping';
              
              const headings = [
                { text: title, tag: 'h4', bold: true, mb: 10 },
                { text: `{{${prefix}_first_name}} {{${prefix}_last_name}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_company}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_address_1}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_address_2}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_city}}, {{${prefix}_state}} {{${prefix}_postcode}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_country}}`, tag: 'span', mb: 5 },
                { text: `{{${prefix}_phone}}`, tag: 'span', mb: 5 },
                ...(isBilling ? [{ text: `{{billing_email}}`, tag: 'span', mb: 5 }] : []),
              ];

              const children = headings.map((h, idx) => ({
                id: `child_${Date.now()}_${idx}_${Math.random().toString(36).substr(2, 5)}`,
                contentType: 'heading' as WidgetContentType,
                contentData: JSON.stringify({
                  ...defaultHeadingEditorOptions,
                  content: h.text,
                  headingType: h.tag,
                  fontWeight: h.bold ? 'bold' : 'normal',
                  margin: { top: 0, right: 0, bottom: h.mb, left: 0 },
                  display: 'block',
                  fontSize: h.tag === 'h4' ? 16 : 14
                })
              }));

              actualContentData = JSON.stringify({
                ...defaultContainerEditorOptions,
                maxWidth: '100%',
                backgroundColor: 'transparent',
                padding: { top: 10, right: 10, bottom: 10, left: 10 },
                border: { width: 0, style: 'none', color: 'transparent', radius: 0 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-start',
                alignItems: 'stretch',
                children: children
              });
            }
          }

          column.widgetContents.splice(newWidgetIndex, 0, {
            contentType: actualContentType,
            contentData: actualContentData
          });
          // CRITICAL FIX: Set the column's main content type so usage elsewhere (e.g. reducers, openEditor) works.
          // This assumes a column primarily acts as a container for this type, or we update it to the latest.
          column.contentType = actualContentType;

          column.style.height = 'auto';
          block.style = { ...neutralBlockStyle };

          // Initialize widget-specific options based on content type
          if (!actualContentData) {
            switch (actualContentType) {
              case 'heading':
                column.headingEditorOptions = {
                  ...defaultHeadingEditorOptions,
                  headingType: 'h1',
                  fontSize: 22,
                };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.headingEditorOptions);
                break;
              case 'text':
                column.textEditorOptions = { ...defaultTextEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.textEditorOptions);
                break;
              case 'button':
                column.buttonEditorOptions = { ...defaultButtonEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.buttonEditorOptions);
                break;
              case 'image':
                column.imageEditorOptions = { ...defaultImageEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.imageEditorOptions);
                break;
              case 'divider':
                column.dividerEditorOptions = { ...defaultDividerEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.dividerEditorOptions);
                break;
              case 'socialIcons':
                column.socialIconsEditorOptions = { ...defaultSocialIconsEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.socialIconsEditorOptions);
                break;
              case 'orderItems':
                column.orderItemsEditorOptions = { ...defaultOrderItemsEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.orderItemsEditorOptions);
                break;
              case 'taxBilling':
                column.taxBillingEditorOptions = { ...defaultTaxBillingEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.taxBillingEditorOptions);
                break;
              case 'section':
                column.sectionEditorOptions = { ...defaultSectionEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.sectionEditorOptions);
                break;
              case 'spacer':
                column.spacerEditorOptions = { ...defaultSpacerEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.spacerEditorOptions);
                break;
              case 'table':
                column.tableEditorOptions = { ...defaultTableEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.tableEditorOptions);
                break;
              case 'link':
                column.linkEditorOptions = { ...defaultLinkEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.linkEditorOptions);
                break;

              case 'icon':
                column.iconEditorOptions = { ...defaultIconEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.iconEditorOptions);
                break;
              case 'row':
                column.rowEditorOptions = { ...defaultRowEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.rowEditorOptions);
                break;
              case 'container':
                column.containerEditorOptions = { ...defaultContainerEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.containerEditorOptions);
                break;
              case 'group':
                column.groupEditorOptions = { ...defaultGroupEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.groupEditorOptions);
                break;
              case 'socialFollow':
                column.socialFollowEditorOptions = { ...defaultSocialFollowEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.socialFollowEditorOptions);
                break;
              case 'video':
                column.videoEditorOptions = { ...defaultVideoEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.videoEditorOptions);
                break;

              case 'countdown':
                column.countdownEditorOptions = { ...defaultCountdownEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.countdownEditorOptions);
                break;
              case 'progressBar':
                column.progressBarEditorOptions = { ...defaultProgressBarEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.progressBarEditorOptions);
                break;
              case 'promoCode':
                column.promoCodeEditorOptions = { ...defaultPromoCodeEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.promoCodeEditorOptions);
                break;
              case 'price':
                column.priceEditorOptions = { ...defaultPriceEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.priceEditorOptions);
                break;
              case 'testimonial':
                column.testimonialEditorOptions = { ...defaultTestimonialEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.testimonialEditorOptions);
                break;
              case 'navbar':
                column.navbarEditorOptions = { ...defaultNavbarEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.navbarEditorOptions);
                break;
              case 'card':
                column.cardEditorOptions = { ...defaultCardEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.cardEditorOptions);
                break;
              case 'alert':
                column.alertEditorOptions = { ...defaultAlertEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.alertEditorOptions);
                break;
              case 'progress':
                column.progressEditorOptions = { ...defaultProgressEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.progressEditorOptions);
                break;
              case 'form':
                column.formEditorOptions = { ...defaultFormEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.formEditorOptions);
                break;
              case 'survey':
                column.surveyEditorOptions = { ...defaultSurveyEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.surveyEditorOptions);
                break;
              case 'input':
                column.inputEditorOptions = { ...defaultInputEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.inputEditorOptions);
                break;
              case 'textarea':
                column.textareaEditorOptions = { ...defaultTextareaEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.textareaEditorOptions);
                break;
              case 'select':
                column.selectEditorOptions = { ...defaultSelectEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.selectEditorOptions);
                break;
              case 'checkbox':
                column.checkboxEditorOptions = { ...defaultCheckboxEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.checkboxEditorOptions);
                break;
              case 'relatedProducts':
                column.relatedProductsEditorOptions = { ...defaultRelatedProductsEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.relatedProductsEditorOptions);
                break;
              case 'orderSubtotal':
                column.orderSubtotalEditorOptions = { ...defaultOrderSubtotalEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.orderSubtotalEditorOptions);
                break;
              case 'orderTotal':
                column.orderTotalEditorOptions = { ...defaultOrderTotalEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.orderTotalEditorOptions);
                break;
              case 'shippingMethod':
                column.shippingMethodEditorOptions = { ...defaultShippingMethodEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.shippingMethodEditorOptions);
                break;
              case 'paymentMethod':
                column.paymentMethodEditorOptions = { ...defaultPaymentMethodEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.paymentMethodEditorOptions);
                break;
              case 'customerNote':
                column.customerNoteEditorOptions = { ...defaultCustomerNoteEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.customerNoteEditorOptions);
                break;
              case 'radio':
                column.radioEditorOptions = { ...defaultRadioEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.radioEditorOptions);
                break;
              case 'label':
                column.labelEditorOptions = { ...defaultLabelEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.labelEditorOptions);
                break;
              case 'emailHeader':
                column.emailHeaderEditorOptions = { ...defaultEmailHeaderEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.emailHeaderEditorOptions);
                break;
              case 'emailFooter':
                column.emailFooterEditorOptions = { ...defaultEmailFooterEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.emailFooterEditorOptions);
                state.emailFooterEditorOptions = column.emailFooterEditorOptions;
                break;
              case 'ctaButton':
                column.ctaButtonEditorOptions = { ...defaultCtaButtonEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.ctaButtonEditorOptions);
                break;
              case 'contact':
                column.contactEditorOptions = { ...defaultContactEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.contactEditorOptions);
                break;
              case 'productDetails':
                column.productDetailsEditorOptions = { ...defaultProductDetailsEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.productDetailsEditorOptions);
                break;
              case 'refundFull':
                column.refundFullEditorOptions = { ...defaultRefundFullEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.refundFullEditorOptions);
                break;
              case 'refundPartial':
                column.refundPartialEditorOptions = { ...defaultRefundPartialEditorOptions };
                column.widgetContents[newWidgetIndex].contentData = JSON.stringify(column.refundPartialEditorOptions);
                break;
            }
          }

          state.editorOpen = true;
          state.selectionCount += 1;
          state.selectedBlockId = action.payload.blockId;
          state.selectedBlockForEditor = action.payload.blockId;
          state.selectedColumnIndex = action.payload.columnIndex;
          state.selectedContentType = action.payload.contentType;
          state.selectedWidgetIndex = newWidgetIndex;
        }
      }
    },

    updateWidgetContentData: (state, action: PayloadAction<{
      blockId: string | null;
      columnIndex: number;
      widgetIndex: number;
      data: string;
      nestedPath?: Array<{ colIdx: number; childIdx: number }>;
    }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex] && block.columns[action.payload.columnIndex].widgetContents[action.payload.widgetIndex]) {
          const widget = block.columns[action.payload.columnIndex].widgetContents[action.payload.widgetIndex];

          if (action.payload.nestedPath && action.payload.nestedPath.length > 0) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, action.payload.nestedPath, JSON.parse(action.payload.data));
            // BUT here we want to replace the WHOLE contentData of the target widget?
            // Actually, deepUpdateWidgetData merges payload into the target. 
            // If payload is { contentData: "..." }, it might try to merge keys?
            // unique logic: deepUpdateWidgetData usually takes payload as properties to merge.
            // If we just want to replace contentData string of the child...
            // Let's look at deepUpdateWidgetData again.
            // It does: JSON.stringify({ ...data, ...payload })
            // So if we pass payload as the WHOLE object structure?
            // Wait. The `data` argument here IS the stringified structure.
            // So we want the target widget's `contentData` to become action.payload.data (string).
            // But deepUpdateWidgetData expects payload to be partial OBJECT to merge.
            // We can't use deepUpdateWidgetData as is if we want to replace the string.
            // UNLESS we pass the object version of string?
            // No, `data` in RowFieldComponent is JSON.stringify(updatedRowOptions).
            // So we want targetWidget.contentData = JSON.stringify(updatedRowOptions).
            // Using deepUpdateWidgetData:
            // It parses target contentData. It finds sub-target. 
            // It does: targetWidget.contentData = deepUpdateWidgetData(..., payload).
            // At the leaf: return JSON.stringify({ ...data, ...payload }).
            // If payload is the FULL object of row options?
            // Yes!
          } else {
            widget.contentData = action.payload.data;
          }
        }
      }
    },

    updateColumnContentData: (state, action: PayloadAction<{
      blockId: string | null;
      columnIndex: number;
      data: string;
    }>) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].contentData = action.payload.data;
        }
      }
    },



    // ============ BASIC LAYOUT WIDGET OPTIONS ============
    updateSectionEditorOptions: (state, action: PayloadAction<Partial<SectionEditorOptions>>) => {
      state.sectionEditorOptions = { ...state.sectionEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'section' && column) {
          // Unified logic: Use deepUpdateWidgetData for top-level too
          widget.contentData = deepUpdateWidgetData(widget.contentData, [], action.payload);
          column.sectionEditorOptions = JSON.parse(widget.contentData);
        }
      }
    },

    updateSpacerEditorOptions: (state, action: PayloadAction<Partial<SpacerEditorOptions>>) => {
      state.spacerEditorOptions = { ...state.spacerEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'spacer' && column) {
          column.spacerEditorOptions = state.spacerEditorOptions;
          widget.contentData = JSON.stringify(state.spacerEditorOptions);
        }
      }
    },

    updateTableEditorOptions: (state, action: PayloadAction<Partial<TableEditorOptions>>) => {
      state.tableEditorOptions = { ...state.tableEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (column && widget) {
          // FIX: Use the fully updated state.tableEditorOptions instead of the stale column.tableEditorOptions
          column.tableEditorOptions = state.tableEditorOptions;
          widget.contentData = JSON.stringify(state.tableEditorOptions);
        }
      } else if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex === null) {
         const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
         const column = block?.columns[state.selectedColumnIndex];
         if (column) {
            column.tableEditorOptions = state.tableEditorOptions;
         }
      } else {
         const block = state.blocks[0];
         const column = block?.columns[0];
         if (column) {
            state.tableEditorOptions = { ...state.tableEditorOptions, ...action.payload };
            if (column) column.tableEditorOptions = { ...column.tableEditorOptions, ...action.payload };
         }
      }
    },


    updateLinkEditorOptions: (state, action: PayloadAction<Partial<LinkEditorOptions>>) => {
      state.linkEditorOptions = { ...state.linkEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedSubElementId && state.selectedSubElementId.startsWith('link_') && widget) {
          try {
            const parentObj = JSON.parse(widget.contentData || '{}');
            const updatedHtml = updateHtmlLink(parentObj.content || '', state.selectedSubElementId, action.payload);
            parentObj.content = updatedHtml;
            widget.contentData = JSON.stringify(parentObj);
            
            if (widget.contentType === 'text' && column) {
              column.textEditorOptions = { ...column.textEditorOptions, ...parentObj };
            } else if (widget.contentType === 'heading' && column) {
              column.headingEditorOptions = { ...column.headingEditorOptions, ...parentObj };
            }
          } catch (e) {
            console.error("Error updating inline link options:", e);
          }
        } else if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section' || widget.contentType === 'text' || widget.contentType === 'heading')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'link' && column) {
          column.linkEditorOptions = state.linkEditorOptions;
          widget.contentData = JSON.stringify(state.linkEditorOptions);
        }
      }
    },

    updateIconEditorOptions: (state, action: PayloadAction<Partial<IconEditorOptions>>) => {
      state.iconEditorOptions = { ...state.iconEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'icon') {
          column.iconEditorOptions = state.iconEditorOptions;
          widget.contentData = JSON.stringify(state.iconEditorOptions);
        }
      }
    },

    updateSelectedWidgetStyles: (state, action: PayloadAction<Record<string, any>>) => {
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (widget) {
          if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
            if (state.viewportMode === 'mobile') {
              const currentOptions = JSON.parse(widget.contentData || '{}');
              const currentChildOptions = deepGetWidgetData(currentOptions, state.selectedNestedPath);
              const mobileStyles = { ...(currentChildOptions.mobileStyles || {}), ...action.payload };
              widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, { mobileStyles });
            } else {
              widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
            }
          } else {
            let currentOptions: any = {};
            try {
              currentOptions = JSON.parse(widget.contentData || '{}');
            } catch (e) {
              currentOptions = {};
            }
            if (state.viewportMode === 'mobile') {
              const mobileStyles = { ...(currentOptions.mobileStyles || {}), ...action.payload };
              const updatedOptions = { ...currentOptions, mobileStyles };
              widget.contentData = JSON.stringify(updatedOptions);
            } else {
              const updatedOptions = { ...currentOptions, ...action.payload };
              widget.contentData = JSON.stringify(updatedOptions);
            }
          }

          const type = (state.selectedNestedPath && state.selectedNestedPath.length > 0) ? state.selectedContentType : widget.contentType;
          if (type === 'text') {
            state.textEditorOptions = { ...state.textEditorOptions, ...action.payload };
            if (column) column.textEditorOptions = { ...column.textEditorOptions, ...action.payload };
          } else if (type === 'button') {
            state.buttonEditorOptions = { ...state.buttonEditorOptions, ...action.payload };
            if (column) column.buttonEditorOptions = { ...column.buttonEditorOptions, ...action.payload };
          } else if (type === 'heading') {
            state.headingEditorOptions = { ...state.headingEditorOptions, ...action.payload };
            if (column) column.headingEditorOptions = { ...column.headingEditorOptions, ...action.payload };
          } else if (type === 'socialIcons') {
            state.socialIconsEditorOptions = { ...state.socialIconsEditorOptions, ...action.payload };
            if (column) column.socialIconsEditorOptions = { ...column.socialIconsEditorOptions, ...action.payload };
          } else if (type === 'divider') {
            state.dividerEditorOptions = { ...state.dividerEditorOptions, ...action.payload };
            if (column) column.dividerEditorOptions = { ...column.dividerEditorOptions, ...action.payload };
          } else if (type === 'image') {
            state.imageEditorOptions = { ...state.imageEditorOptions, ...action.payload };
            if (column) column.imageEditorOptions = { ...column.imageEditorOptions, ...action.payload };
          } else if (type === 'spacer') {
            state.spacerEditorOptions = { ...state.spacerEditorOptions, ...action.payload };
            if (column) column.spacerEditorOptions = { ...column.spacerEditorOptions, ...action.payload };
          } else if (type === 'link') {
            state.linkEditorOptions = { ...state.linkEditorOptions, ...action.payload };
            if (column) column.linkEditorOptions = { ...column.linkEditorOptions, ...action.payload };
          } else if (type === 'icon') {
            state.iconEditorOptions = { ...state.iconEditorOptions, ...action.payload };
            if (column) column.iconEditorOptions = { ...column.iconEditorOptions, ...action.payload };
          } else if (type === 'row') {
            state.rowEditorOptions = { ...state.rowEditorOptions, ...action.payload };
            if (column) column.rowEditorOptions = { ...column.rowEditorOptions, ...action.payload };
          } else if (type === 'container') {
            state.containerEditorOptions = { ...state.containerEditorOptions, ...action.payload };
            if (column) column.containerEditorOptions = { ...column.containerEditorOptions, ...action.payload };
          } else if (type === 'group') {
            state.groupEditorOptions = { ...state.groupEditorOptions, ...action.payload };
            if (column) column.groupEditorOptions = { ...column.groupEditorOptions, ...action.payload };
          } else if (type === 'paragraph-row') {
            state.paragraphRowEditorOptions = { ...state.paragraphRowEditorOptions, ...action.payload };
            if (column) column.paragraphRowEditorOptions = { ...column.paragraphRowEditorOptions, ...action.payload };
          } else if (type === 'socialFollow') {
            state.socialFollowEditorOptions = { ...state.socialFollowEditorOptions, ...action.payload };
            if (column) column.socialFollowEditorOptions = { ...column.socialFollowEditorOptions, ...action.payload };
          } else if (type === 'video') {
            state.videoEditorOptions = { ...state.videoEditorOptions, ...action.payload };
            if (column) column.videoEditorOptions = { ...column.videoEditorOptions, ...action.payload };
          } else if (type === 'countdown') {
            state.countdownEditorOptions = { ...state.countdownEditorOptions, ...action.payload };
            if (column) column.countdownEditorOptions = { ...column.countdownEditorOptions, ...action.payload };
          } else if (type === 'promoCode') {
            state.promoCodeEditorOptions = { ...state.promoCodeEditorOptions, ...action.payload };
            if (column) column.promoCodeEditorOptions = { ...column.promoCodeEditorOptions, ...action.payload };
          } else if (type === 'price') {
            state.priceEditorOptions = { ...state.priceEditorOptions, ...action.payload };
            if (column) column.priceEditorOptions = { ...column.priceEditorOptions, ...action.payload };
          }

          const wooTypes = [
            'billingAddress', 'shippingAddress', 'orderItems', 'taxBilling', 'emailHeader',
            'emailFooter', 'ctaButton', 'relatedProducts', 'orderSubtotal', 'orderTotal',
            'shippingMethod', 'paymentMethod', 'customerNote', 'contact', 'productDetails'
          ];
          if (wooTypes.includes(type || '')) {
            const key = `${type}EditorOptions`;
            if (key in state) (state as any)[key] = { ...(state as any)[key], ...action.payload };
            if (column && key in column) (column as any)[key] = { ...(column as any)[key], ...action.payload };
          }
        }
      }
    },

    updateTextEditorOptions: (state, action: PayloadAction<Partial<TextEditorOptions>>) => {
      state.textEditorOptions = { ...state.textEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section' || widget.contentType === 'text' || widget.contentType === 'heading')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'text' && column) {
          column.textEditorOptions = { ...column.textEditorOptions, ...action.payload };
          const existingData = JSON.parse(widget.contentData || '{}');
          widget.contentData = JSON.stringify({ ...existingData, ...action.payload });
        }
      }
    },

    updateHeadingEditorOptions: (state, action: PayloadAction<Partial<HeadingEditorOptions>>) => {
      state.headingEditorOptions = { ...state.headingEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section' || widget.contentType === 'text' || widget.contentType === 'heading')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'heading' && column) {
          column.headingEditorOptions = { ...column.headingEditorOptions, ...action.payload };
          const existingData = JSON.parse(widget.contentData || '{}');
          widget.contentData = JSON.stringify({ ...existingData, ...action.payload });
        }
      }
    },

    updateButtonEditorOptions: (state, action: PayloadAction<Partial<ButtonEditorOptions>>) => {
      state.buttonEditorOptions = { ...state.buttonEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'button' && column) {
          column.buttonEditorOptions = state.buttonEditorOptions;
          widget.contentData = JSON.stringify(state.buttonEditorOptions);
        }
      }
    },

    updateSocialIconsEditorOptions: (state, action: PayloadAction<Partial<SocialIconsEditorOptions>>) => {
      state.socialIconsEditorOptions = { ...state.socialIconsEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'socialIcons' && column) {
          column.socialIconsEditorOptions = state.socialIconsEditorOptions;
          widget.contentData = JSON.stringify(state.socialIconsEditorOptions);
        }
      }
    },

    updateDividerEditorOptions: (state, action: PayloadAction<Partial<DividerEditorOptions>>) => {
      state.dividerEditorOptions = { ...state.dividerEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'divider' && column) {
          column.dividerEditorOptions = state.dividerEditorOptions;
          widget.contentData = JSON.stringify(state.dividerEditorOptions);
        }
      }
    },

    updateImageEditorOptions: (state, action: PayloadAction<Partial<ImageEditorOptions>>) => {
      state.imageEditorOptions = { ...state.imageEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'image' && column) {
          column.imageEditorOptions = state.imageEditorOptions;
          widget.contentData = JSON.stringify(state.imageEditorOptions);
        }
      }
    },

    // ============ LAYOUT BLOCK WIDGET OPTIONS ============
    updateRowEditorOptions: (state, action: PayloadAction<Partial<RowEditorOptions>>) => {
      state.rowEditorOptions = { ...state.rowEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'row' && column) {
          // Unified logic: Use deepUpdateWidgetData for top-level too
          widget.contentData = deepUpdateWidgetData(widget.contentData, [], action.payload);
          column.rowEditorOptions = JSON.parse(widget.contentData);
        }
      }
    },

    updateContainerEditorOptions: (state, action: PayloadAction<Partial<ContainerEditorOptions>>) => {
      state.containerEditorOptions = { ...state.containerEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'container' && column) {
          // Unified logic: Use deepUpdateWidgetData for top-level too
          widget.contentData = deepUpdateWidgetData(widget.contentData, [], action.payload);
          column.containerEditorOptions = JSON.parse(widget.contentData);
        }
      }
    },

    updateGroupEditorOptions: (state, action: PayloadAction<Partial<GroupEditorOptions>>) => {
      state.groupEditorOptions = { ...state.groupEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'group' && column) {
          // Unified logic: Use deepUpdateWidgetData for top-level too
          widget.contentData = deepUpdateWidgetData(widget.contentData, [], action.payload);
          column.groupEditorOptions = JSON.parse(widget.contentData);
        }
      }
    },

    updateParagraphRowEditorOptions: (state, action: PayloadAction<Partial<ParagraphRowEditorOptions>>) => {
      state.paragraphRowEditorOptions = { ...state.paragraphRowEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section' || widget.contentType === 'paragraph-row')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'paragraph-row' && column) {
          widget.contentData = deepUpdateWidgetData(widget.contentData, [], action.payload);
          column.paragraphRowEditorOptions = JSON.parse(widget.contentData);
        }
      }
    },

    // ============ EXTRA BLOCK WIDGET OPTIONS ============
    updateSocialFollowEditorOptions: (state, action: PayloadAction<Partial<SocialFollowEditorOptions>>) => {
      state.socialFollowEditorOptions = { ...state.socialFollowEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'socialFollow') {
          column.socialFollowEditorOptions = state.socialFollowEditorOptions;
          widget.contentData = JSON.stringify(state.socialFollowEditorOptions);
        }
      }
    },

    updateVideoEditorOptions: (state, action: PayloadAction<Partial<VideoEditorOptions>>) => {
      state.videoEditorOptions = { ...state.videoEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'video') {
          column.videoEditorOptions = state.videoEditorOptions;
          widget.contentData = JSON.stringify(state.videoEditorOptions);
        }
      }
    },



    updateCountdownEditorOptions: (state, action: PayloadAction<Partial<CountdownEditorOptions>>) => {
      state.countdownEditorOptions = { ...state.countdownEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'countdown') {
          column.countdownEditorOptions = state.countdownEditorOptions;
          widget.contentData = JSON.stringify(state.countdownEditorOptions);
        }
      }
    },

    updateProgressBarEditorOptions: (state, action: PayloadAction<Partial<ProgressBarEditorOptions>>) => {
      state.progressBarEditorOptions = { ...state.progressBarEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'progressBar') {
          column.progressBarEditorOptions = state.progressBarEditorOptions;
          widget.contentData = JSON.stringify(state.progressBarEditorOptions);
        }
      }
    },

    updatePromoCodeEditorOptions: (state, action: PayloadAction<Partial<PromoCodeEditorOptions>>) => {
      state.promoCodeEditorOptions = { ...state.promoCodeEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'promoCode') {
          column.promoCodeEditorOptions = state.promoCodeEditorOptions;
          widget.contentData = JSON.stringify(state.promoCodeEditorOptions);
        }
      }
    },

    updatePriceEditorOptions: (state, action: PayloadAction<Partial<PriceEditorOptions>>) => {
      state.priceEditorOptions = { ...state.priceEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'price') {
          // Log before saving

          widget.contentData = JSON.stringify(state.priceEditorOptions);
        }
      }
    },

    updateTestimonialEditorOptions: (state, action: PayloadAction<Partial<TestimonialEditorOptions>>) => {
      state.testimonialEditorOptions = { ...state.testimonialEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'testimonial') {
          column.testimonialEditorOptions = { ...column.testimonialEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.testimonialEditorOptions);
        }
      }
    },

    updateNavbarEditorOptions: (state, action: PayloadAction<Partial<NavbarEditorOptions>>) => {
      state.navbarEditorOptions = { ...state.navbarEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'navbar') {
          column.navbarEditorOptions = { ...column.navbarEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.navbarEditorOptions);
        }
      }
    },

    updateCardEditorOptions: (state, action: PayloadAction<Partial<CardEditorOptions>>) => {
      state.cardEditorOptions = { ...state.cardEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'card') {
          column.cardEditorOptions = { ...column.cardEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.cardEditorOptions);
        }
      }
    },

    updateAlertEditorOptions: (state, action: PayloadAction<Partial<AlertEditorOptions>>) => {
      state.alertEditorOptions = { ...state.alertEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'alert') {
          column.alertEditorOptions = { ...column.alertEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.alertEditorOptions);
        }
      }
    },

    updateProgressEditorOptions: (state, action: PayloadAction<Partial<ProgressEditorOptions>>) => {
      state.progressEditorOptions = { ...state.progressEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'progress') {
          column.progressEditorOptions = { ...column.progressEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.progressEditorOptions);
        }
      }
    },

    // ============ FORMS WIDGET OPTIONS ============
    updateFormEditorOptions: (state, action: PayloadAction<Partial<FormEditorOptions>>) => {
      state.formEditorOptions = { ...state.formEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'form') {
          column.formEditorOptions = { ...column.formEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.formEditorOptions);
        }
      }
    },

    updateSurveyEditorOptions: (state, action: PayloadAction<Partial<SurveyEditorOptions>>) => {
      state.surveyEditorOptions = { ...state.surveyEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'survey') {
          column.surveyEditorOptions = { ...column.surveyEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.surveyEditorOptions);
        }
      }
    },

    updateInputEditorOptions: (state, action: PayloadAction<Partial<InputEditorOptions>>) => {
      state.inputEditorOptions = { ...state.inputEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'input') {
          column.inputEditorOptions = { ...column.inputEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.inputEditorOptions);
        }
      }
    },

    updateTextareaEditorOptions: (state, action: PayloadAction<Partial<TextareaEditorOptions>>) => {
      state.textareaEditorOptions = { ...state.textareaEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'textarea') {
          column.textareaEditorOptions = { ...column.textareaEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.textareaEditorOptions);
        }
      }
    },

    updateSelectEditorOptions: (state, action: PayloadAction<Partial<SelectEditorOptions>>) => {
      state.selectEditorOptions = { ...state.selectEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column && column.widgetContents[state.selectedWidgetIndex] && column.widgetContents[state.selectedWidgetIndex].contentType === 'select') {
          column.selectEditorOptions = { ...column.selectEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.selectEditorOptions);
        }
      }
    },

    updateCheckboxEditorOptions: (state, action: PayloadAction<Partial<CheckboxEditorOptions>>) => {
      state.checkboxEditorOptions = { ...state.checkboxEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'checkbox') {
          column.checkboxEditorOptions = { ...column.checkboxEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.checkboxEditorOptions);
        }
      }
    },

    updateRadioEditorOptions: (state, action: PayloadAction<Partial<RadioEditorOptions>>) => {
      state.radioEditorOptions = { ...state.radioEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'radio') {
          column.radioEditorOptions = { ...column.radioEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.radioEditorOptions);
        }
      }
    },

    updateLabelEditorOptions: (state, action: PayloadAction<Partial<LabelEditorOptions>>) => {
      state.labelEditorOptions = { ...state.labelEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (column?.contentType === 'label') {
          column.labelEditorOptions = { ...column.labelEditorOptions, ...action.payload };
          column.widgetContents[state.selectedWidgetIndex].contentData = JSON.stringify(column.labelEditorOptions);
        }
      }
    },

    // ============ WOOCOMMERCE LAYOUT WIDGET OPTIONS ============
    updateShippingAddressEditorOptions: (state, action: PayloadAction<Partial<ShippingAddressEditorOptions>>) => {
      state.shippingAddressEditorOptions = { ...state.shippingAddressEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find((b) => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'shippingAddress') {
          column.shippingAddressEditorOptions = { ...column.shippingAddressEditorOptions, ...action.payload };
          // Preserve subStyles already written into contentData by updateSubElementStyles
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.shippingAddressEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.shippingAddressEditorOptions);
          }
        }
      }
    },

    updateBillingAddressEditorOptions: (
      state,
      action: PayloadAction<Partial<BillingAddressEditorOptions>>
    ) => {
      state.billingAddressEditorOptions = {
        ...state.billingAddressEditorOptions,
        ...action.payload,
      };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(
          (b) => b.id === state.selectedBlockForEditor
        );
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === "billingAddress") {
          column.billingAddressEditorOptions = { ...column.billingAddressEditorOptions, ...action.payload };
          // Preserve subStyles already written into contentData by updateSubElementStyles
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.billingAddressEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.billingAddressEditorOptions);
          }
        }
      }
    },

    updateOrderItemsEditorOptions: (state, action: PayloadAction<Partial<OrderItemsEditorOptions>>) => {
      state.orderItemsEditorOptions = { ...state.orderItemsEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'orderItems') {
          column.orderItemsEditorOptions = { ...column.orderItemsEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.orderItemsEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.orderItemsEditorOptions);
          }
        }
      }
    },

    updateTaxBillingEditorOptions: (state, action: PayloadAction<Partial<TaxBillingEditorOptions>>) => {
      state.taxBillingEditorOptions = { ...state.taxBillingEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'taxBilling') {
          column.taxBillingEditorOptions = { ...column.taxBillingEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.taxBillingEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.taxBillingEditorOptions);
          }
        }
      }
    },
    updateEmailHeaderEditorOptions: (state, action: PayloadAction<Partial<EmailHeaderEditorOptions>>) => {
      state.emailHeaderEditorOptions = { ...state.emailHeaderEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'emailHeader') {
          column.emailHeaderEditorOptions = { ...column.emailHeaderEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.emailHeaderEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.emailHeaderEditorOptions);
          }
        }
      }
    },
    updateEmailFooterEditorOptions: (state, action: PayloadAction<Partial<EmailFooterEditorOptions>>) => {
      state.emailFooterEditorOptions = { ...state.emailFooterEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'emailFooter') {
          column.emailFooterEditorOptions = { ...column.emailFooterEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.emailFooterEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.emailFooterEditorOptions);
          }
        }
      }
    },
    updateCtaButtonEditorOptions: (state, action: PayloadAction<Partial<CtaButtonEditorOptions>>) => {
      state.ctaButtonEditorOptions = { ...state.ctaButtonEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'ctaButton') {
          column.ctaButtonEditorOptions = { ...column.ctaButtonEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.ctaButtonEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.ctaButtonEditorOptions);
          }
        }
      }
    },

    updateContactEditorOptions: (state, action: PayloadAction<Partial<ContactEditorOptions>>) => {
      state.contactEditorOptions = { ...state.contactEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'contact') {
          const currentData = widget.contentData ? JSON.parse(widget.contentData) : defaultContactEditorOptions;
          const newData = { ...currentData, ...action.payload };
          widget.contentData = JSON.stringify(newData);
        }
      }
    },

    updateProductDetailsEditorOptions: (state, action: PayloadAction<Partial<ProductDetailsEditorOptions>>) => {
      state.productDetailsEditorOptions = { ...state.productDetailsEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];

        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'productDetails') {
          const currentData = widget.contentData ? JSON.parse(widget.contentData) : defaultProductDetailsEditorOptions;
          const newData = { ...currentData, ...action.payload };
          widget.contentData = JSON.stringify(newData);
        }
      }
    },


    updateRefundFullEditorOptions: (state, action: PayloadAction<Partial<RefundFullEditorOptions>>) => {
      state.refundFullEditorOptions = { ...state.refundFullEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (widget && widget.contentType === 'refundFull') {
          const currentData = widget.contentData ? JSON.parse(widget.contentData) : defaultRefundFullEditorOptions;
          widget.contentData = JSON.stringify({ ...currentData, ...action.payload });
        }
      }
    },

    updateRefundPartialEditorOptions: (state, action: PayloadAction<Partial<RefundPartialEditorOptions>>) => {
      state.refundPartialEditorOptions = { ...state.refundPartialEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (widget && widget.contentType === 'refundPartial') {
          const currentData = widget.contentData ? JSON.parse(widget.contentData) : defaultRefundPartialEditorOptions;
          widget.contentData = JSON.stringify({ ...currentData, ...action.payload });
        }
      }
    },

    updateOrderSubtotalEditorOptions: (state, action: PayloadAction<Partial<OrderSubtotalEditorOptions>>) => {
      state.orderSubtotalEditorOptions = { ...state.orderSubtotalEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'orderSubtotal') {
          column.orderSubtotalEditorOptions = { ...column.orderSubtotalEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.orderSubtotalEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.orderSubtotalEditorOptions);
          }
        }
      }
    },

    updateOrderTotalEditorOptions: (state, action: PayloadAction<Partial<OrderTotalEditorOptions>>) => {
      state.orderTotalEditorOptions = { ...state.orderTotalEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'orderTotal') {
          column.orderTotalEditorOptions = { ...column.orderTotalEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.orderTotalEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.orderTotalEditorOptions);
          }
        }
      }
    },

    updateShippingMethodEditorOptions: (state, action: PayloadAction<Partial<ShippingMethodEditorOptions>>) => {
      state.shippingMethodEditorOptions = { ...state.shippingMethodEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'shippingMethod') {
          column.shippingMethodEditorOptions = { ...column.shippingMethodEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.shippingMethodEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.shippingMethodEditorOptions);
          }
        }
      }
    },

    updatePaymentMethodEditorOptions: (state, action: PayloadAction<Partial<PaymentMethodEditorOptions>>) => {
      state.paymentMethodEditorOptions = { ...state.paymentMethodEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'paymentMethod') {
          column.paymentMethodEditorOptions = { ...column.paymentMethodEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.paymentMethodEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.paymentMethodEditorOptions);
          }
        }
      }
    },

    updateCustomerNoteEditorOptions: (state, action: PayloadAction<Partial<CustomerNoteEditorOptions>>) => {
      state.customerNoteEditorOptions = { ...state.customerNoteEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'customerNote') {
          column.customerNoteEditorOptions = { ...column.customerNoteEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.customerNoteEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.customerNoteEditorOptions);
          }
        }
      }
    },
    updateRelatedProductsEditorOptions: (state, action: PayloadAction<Partial<RelatedProductsEditorOptions>>) => {
      state.relatedProductsEditorOptions = { ...state.relatedProductsEditorOptions, ...action.payload };
      if (state.selectedBlockForEditor && state.selectedColumnIndex !== null && state.selectedWidgetIndex !== null) {
        const block = state.blocks.find(b => b.id === state.selectedBlockForEditor);
        const column = block?.columns[state.selectedColumnIndex];
        const widget = column?.widgetContents[state.selectedWidgetIndex];
        if (state.selectedNestedPath && state.selectedNestedPath.length > 0) {
          if (widget && (widget.contentType === 'row' || widget.contentType === 'container' || widget.contentType === 'section')) {
            widget.contentData = deepUpdateWidgetData(widget.contentData, state.selectedNestedPath, action.payload);
          }
        } else if (widget && widget.contentType === 'relatedProducts') {
          column.relatedProductsEditorOptions = { ...column.relatedProductsEditorOptions, ...action.payload };
          try {
            const existingData = JSON.parse(widget.contentData || '{}');
            const subStyles = existingData.subStyles || {};
            widget.contentData = JSON.stringify({ ...column.relatedProductsEditorOptions, subStyles });
          } catch {
            widget.contentData = JSON.stringify(column.relatedProductsEditorOptions);
          }
        }
      }
    },


    updateColumnBorderTopColor: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderTopColor = action.payload.color;
        }
      }
    },

    updateColumnBorderBottomColor: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderBottomColor = action.payload.color;
        }
      }
    },

    updateColumnBorderLeftColor: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderLeftColor = action.payload.color;
        }
      }
    },

    updateColumnBorderRightColor: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; color: string }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.borderRightColor = action.payload.color;
        }
      }
    },

    updateColumnTextAlign: (
      state,
      action: PayloadAction<{ blockId: string | null; columnIndex: number; textAlign: 'left' | 'center' | 'right' | 'justify' }>
    ) => {
      if (action.payload.blockId) {
        const block = state.blocks.find((b) => b.id === action.payload.blockId);
        if (block && block.columns[action.payload.columnIndex]) {
          block.columns[action.payload.columnIndex].style.textAlign = action.payload.textAlign;
        }
      }
    },

    setBlocks: (state, action: PayloadAction<DroppedBlock[]>) => {
      state.blocks = action.payload;
    },
  },
});

export const {
  // Block Management
  addBlock, copyBlock, renameBlock, deleteBlock, clearBlocks, reorderBlocks, setBlocks,

  // Block selection and Editor
  setSelectedBlockId, openEditor, closeEditor, updateSubElementStyles,
  pasteSubElementStyle, resetSubElementStyle,
  setCopiedWidget, copyCopiedWidget, copyWidget, pasteCopiedWidget,
  updateSelectedWidgetStyles,

  // Block & Column styling
  updateBlockHeight,
  updateSelectedColumnIndex, updateColumnBgColor, updateColumnBgImage, updateColumnBgSize, updateColumnBgPosition, updateColumnBgRepeat, updateColumnBgAttachment,
  updateColumnBorderColor, updateColumnPadding, updateColumnBorderRadius, updateColumnMargin,
  updateColumnPaddingUnit, updateColumnMarginUnit, updateColumnBorderRadiusUnit,
  updateColumnBorderStyle, updateColumnBorderTopSize,
  updateColumnBorderBottomSize, updateColumnBorderLeftSize,
  updateColumnBorderRightSize, updateColumnHeight,
  updateColumnBorderTopColor, updateColumnBorderBottomColor,
  updateColumnBorderLeftColor, updateColumnBorderRightColor,
  updateColumnTextAlign,

  // Content Management
  updateWidgetContentData, updateColumnContentData,
  addColumnContent, deleteColumnContent, reorderColumnContent, moveColumnContent, copyColumnContent,

  // Basic Layout Editor Options
  updateTextEditorOptions,
  updateSectionEditorOptions,
  updateSpacerEditorOptions,
  updateTableEditorOptions,
  updateLinkEditorOptions,

  updateIconEditorOptions,
  updateButtonEditorOptions,
  updateSocialIconsEditorOptions,
  updateHeadingEditorOptions,
  updateDividerEditorOptions,
  updateImageEditorOptions,

  // Layout Block Editor Options
  updateRowEditorOptions,
  updateContainerEditorOptions,
  updateGroupEditorOptions,
  updateParagraphRowEditorOptions,

  // Extra Block Editor Options
  updateSocialFollowEditorOptions,
  updateVideoEditorOptions,

  updateCountdownEditorOptions,
  updateProgressBarEditorOptions,
  updatePromoCodeEditorOptions,
  updatePriceEditorOptions,
  updateTestimonialEditorOptions,
  updateNavbarEditorOptions,
  updateCardEditorOptions,
  updateAlertEditorOptions,
  updateProgressEditorOptions,

  // Forms Editor Options
  updateFormEditorOptions,
  updateSurveyEditorOptions,
  updateInputEditorOptions,
  updateTextareaEditorOptions,
  updateSelectEditorOptions,
  updateCheckboxEditorOptions,
  updateRadioEditorOptions,
  updateLabelEditorOptions,

  // WooCommerce Layout
  updateBillingAddressEditorOptions,
  updateShippingAddressEditorOptions,
  updateTaxBillingEditorOptions,
  updateOrderItemsEditorOptions,
  updateEmailHeaderEditorOptions,
  updateEmailFooterEditorOptions,
  updateCtaButtonEditorOptions,
  updateRelatedProductsEditorOptions,
  updateOrderSubtotalEditorOptions,
  updateOrderTotalEditorOptions,
  updateShippingMethodEditorOptions,
  updatePaymentMethodEditorOptions,
  updateCustomerNoteEditorOptions,

  // View Mode
  setMobileView, setViewportMode, setPreviewMode,
  undo, redo,
  updateContactEditorOptions, updateProductDetailsEditorOptions,
  updateRefundFullEditorOptions, updateRefundPartialEditorOptions,
  updateBodyStyle,
  updateWidgetData,
} = workspaceSlice.actions;

export type { Column, DroppedBlock, WidgetContent };
export default workspaceSlice.reducer as Reducer<WorkspaceState>;
