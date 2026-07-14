function injectDisplayStyle(html: string, display: string): string {
  if (!html || !display) return html;
  const trimmed = html.trim();
  const tagRegex = /^<([a-z0-9-]+)([^>]*)/i;
  const match = trimmed.match(tagRegex);
  if (!match) return html;

  const tagName = match[1];
  const attrs = match[2];

  const styleRegex = /style\s*=\s*(['"])(.*?)\1/i;
  const styleMatch = attrs.match(styleRegex);

  let newHtml = '';
  if (styleMatch) {
    const quote = styleMatch[1];
    const existingStyle = styleMatch[2];
    let newStyle = existingStyle;
    if (!existingStyle.includes('display:')) {
      newStyle = existingStyle.trim().endsWith(';') ? `${existingStyle} display: ${display};` : `${existingStyle}; display: ${display};`;
    } else {
      newStyle = existingStyle.replace(/display\s*:\s*[^;]+/i, `display: ${display}`);
    }
    const newAttrs = attrs.replace(styleRegex, `style=${quote}${newStyle}${quote}`);
    newHtml = `<${tagName}${newAttrs}${trimmed.substring(match[0].length)}`;
  } else {
    const newAttrs = ` style="display: ${display};"${attrs}`;
    newHtml = `<${tagName}${newAttrs}${trimmed.substring(match[0].length)}`;
  }

  const leadingWhitespace = html.substring(0, html.indexOf('<'));
  return leadingWhitespace + newHtml;
}

function injectClass(html: string, className: string): string {
  if (!html || !className) return html;
  const trimmed = html.trim();
  const tagRegex = /^<([a-z0-9-]+)([^>]*)/i;
  const match = trimmed.match(tagRegex);
  if (!match) return html;

  const tagName = match[1];
  const attrs = match[2];

  const classRegex = /class\s*=\s*(['"])(.*?)\1/i;
  const classMatch = attrs.match(classRegex);

  let newHtml = '';
  if (classMatch) {
    const quote = classMatch[1];
    const existingClass = classMatch[2];
    const newClass = `${existingClass} ${className}`;
    const newAttrs = attrs.replace(classRegex, `class=${quote}${newClass}${quote}`);
    newHtml = `<${tagName}${newAttrs}${trimmed.substring(match[0].length)}`;
  } else {
    const newAttrs = ` class="${className}"${attrs}`;
    newHtml = `<${tagName}${newAttrs}${trimmed.substring(match[0].length)}`;
  }

  const leadingWhitespace = html.substring(0, html.indexOf('<'));
  return leadingWhitespace + newHtml;
}

export function buildCssFromStyles(styles: any): string {
  if (!styles) return '';
  const rules = [
    styles.fontFamily && `font-family: ${styles.fontFamily} !important`,
    styles.fontSize && `font-size: ${typeof styles.fontSize === 'number' ? styles.fontSize + 'px' : styles.fontSize} !important`,
    styles.color && `color: ${styles.color} !important`,
    styles.backgroundColor && styles.backgroundColor !== 'transparent' ? `background-color: ${styles.backgroundColor} !important` : '',
    styles.textAlign && `text-align: ${styles.textAlign} !important`,
    styles.fontWeight && `font-weight: ${styles.fontWeight} !important`,
    styles.lineHeight && `line-height: ${styles.lineHeight}px !important`,
    styles.letterSpace && `letter-spacing: ${styles.letterSpace}px !important`,
    styles.padding?.top !== undefined ? `padding: ${styles.padding.top}px ${styles.padding.right || 0}px ${styles.padding.bottom || 0}px ${styles.padding.left || 0}px !important` : '',
    styles.margin?.top !== undefined ? `margin: ${styles.margin.top}px ${styles.margin.right || 0}px ${styles.margin.bottom || 0}px ${styles.margin.left || 0}px !important` : ''
  ].filter(Boolean).join('; ');
  return rules;
}

export function widgetToHTML(widget: any, onMobileCss?: (css: string) => void): string {
  if (!widget) return '';
  const type = widget.type || widget.contentType;

  if (!type) {
    // If no type, it's effectively an empty slot or null widget
    return '';
  }

  const data = widget.data || parseContentData(widget.contentData);
  const widgetId = widget.widgetId || `wetc-w-${Math.random().toString(36).substr(2, 7)}`;

  if (data && data.mobileStyles && onMobileCss) {
    const cssRules = buildCssFromStyles(data.mobileStyles);
    if (cssRules) {
      onMobileCss(`.${widgetId} { ${cssRules} }`);
    }
  }

  // Get renderer from mapping
  const renderer = widgetRenderers[type] || widgetRenderers.unknown;

  let content = renderer(data);

  if (data && data.display) {
    content = injectDisplayStyle(content, data.display);
  }

  if (data && data.mobileStyles && buildCssFromStyles(data.mobileStyles)) {
    content = injectClass(content, widgetId);
  }

  // Return content directly without extra wrapper for cleaner output
  return content;
}

// ========== WIDGET RENDERERS FOR ALL 10 COMPONENTS ==========
const widgetRenderers: Record<string, (data: any) => string> = {
  // ========== 1. TEXT WIDGET ==========
  'text': (d) => {
    const data = d || {};
    let content = data.content || '';


    const bgImage = data.backgroundImage || data.bgImage;
    const bgSize = data.backgroundSize || data.bgSize || 'cover';
    const bgPos = data.backgroundPosition || data.bgPosition || 'center';

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.color && `color: ${data.color}`,
      data.textAlign && `text-align: ${data.textAlign}`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : '',
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.letterSpace && `letter-spacing: ${data.letterSpace}px`,
      data.padding?.top !== undefined ? `padding: ${data.padding.top}px ${data.padding.right || 0}px ${data.padding.bottom || 0}px ${data.padding.left || 0}px` : ''
    ].filter(Boolean).join('; ');

    return `<div${styles ? ` style="${styles}"` : ''}>${content}</div>`;
  },

  // ========== 2. HEADING WIDGET ==========
  'heading': (d) => {
    const data = d || {};
    const content = data.content || '';
    const headingType = data.headingType || 'h2';
    const bgImage = data.backgroundImage || data.bgImage;
    const bgSize = data.backgroundSize || data.bgSize || 'cover';
    const bgPos = data.backgroundPosition || data.bgPosition || 'center';

    let finalWidth = data.width;
    if (finalWidth === 'custom' && data.customWidth) {
      finalWidth = data.customWidth;
    } else if (finalWidth === 'Default' || !finalWidth) {
      finalWidth = ''; // Fallback for email is usually no width specified unless needed
    }

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.color && `color: ${data.color}`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : '',
      data.textAlign && `text-align: ${data.textAlign}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.letterSpace && `letter-spacing: ${data.letterSpace}px`,
      finalWidth && `width: ${typeof finalWidth === 'number' ? finalWidth + 'px' : finalWidth}`,
      data.height && `height: ${typeof data.height === 'number' ? data.height + 'px' : data.height}`,
      data.justifyContent && `justify-content: ${data.justifyContent}`,
      data.alignItems && `align-items: ${data.alignItems}`,
      data.padding?.top !== undefined ? `padding: ${data.padding.top}px ${data.padding.right || 0}px ${data.padding.bottom || 0}px ${data.padding.left || 0}px` : '',
      data.margin?.top !== undefined ? `margin: ${data.margin.top}px ${data.margin.right || 0}px ${data.margin.bottom || 0}px ${data.margin.left || 0}px` : 'margin: 0',
      'word-break: break-word',
      'white-space: pre-wrap'
    ].filter(Boolean).join('; ');

    return `<${headingType}${styles ? ` style="${styles}"` : ''}>${content}</${headingType}>`;
  },

  // ========== 3. BUTTON WIDGET ==========
  'button': (d) => {
    const btnData = d || {};
    const containerAlign = btnData.textAlign || 'center';

    const formatLength = (val: string | number | undefined) => {
      if (val === undefined || val === '') return undefined;
      if (typeof val === 'number') return `${val}px`;
      if (/^\d+$/.test(String(val))) return `${val}px`;
      return String(val);
    };

    let finalWidth = '';
    const rawWidth = btnData.width;
    if (rawWidth !== undefined && rawWidth !== '') {
      if (typeof rawWidth === 'string') {
        finalWidth = `width: ${formatLength(rawWidth)}`;
      } else if (btnData.widthAuto === false) {
        finalWidth = `width: ${rawWidth}%`;
      }
    }

    const finalHeight = formatLength(btnData.height);
    const bgImage = btnData.backgroundImage || btnData.bgImage;
    const bgSize = btnData.backgroundSize || btnData.bgSize || 'cover';
    const bgPos = btnData.backgroundPosition || btnData.bgPosition || 'center';

    const buttonStyles = [
      `display: inline-block`,
      `padding: ${btnData.padding?.top || 10}px ${btnData.padding?.right || 20}px ${btnData.padding?.bottom || 10}px ${btnData.padding?.left || 20}px`,
      `background-color: ${btnData.bgColor || '#007bff'}`,
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : '',
      `color: ${btnData.textColor || '#ffffff'}`,
      `text-decoration: none`,
      `font-family: Arial, sans-serif`,
      btnData.borderRadius ? `border-radius: ${btnData.borderRadius.topLeft || 4}px ${btnData.borderRadius.topRight || 4}px ${btnData.borderRadius.bottomRight || 4}px ${btnData.borderRadius.bottomLeft || 4}px` : `border-radius: 4px`,
      btnData.fontSize && `font-size: ${btnData.fontSize}px`,
      btnData.fontWeight && `font-weight: ${btnData.fontWeight}`,
      btnData.lineHeight && `line-height: ${btnData.lineHeight}px`,
      btnData.fontStyle && `font-style: ${btnData.fontStyle}`,
      finalWidth,
      finalHeight ? `height: ${finalHeight}` : '',
      `border: none`,
      `cursor: pointer`,
      `text-align: center` // Ensure text inside button is centered
    ].filter(Boolean).join('; ');

    const href = btnData.url && !btnData.urlDisabled ? btnData.url : '#';

    return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 10px 0; width: 100%;">
      <tr>
        <td align="${containerAlign}" style="text-align: ${containerAlign};">
          <a href="${escapeHtml(href)}" style="${buttonStyles}" target="_blank" rel="noopener">${escapeHtml(btnData.text || 'Button')}</a>
        </td>
      </tr>
    </table>`;
  },

  // ========== 4. TAX BILLING WIDGET ==========
  'taxBilling': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    // During export, we ALWAYS want placeholders for these fields
    const orderNumber = '{{order_id}}';
    const orderDate = '{{order_date}}';
    const subtotal = '{{order_subtotal}}';
    const shipping = '{{order_shipping}}';
    const tax = '{{tax_amount}}';
    const total = '{{order_total}}';

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.textAlign && `text-align: ${data.textAlign}`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : 'background-color: #ffffff',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
      `border: 1px solid #dddddd`,
      `border-collapse: collapse`
    ].filter(Boolean).join('; ');

    const innerTableStyles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
    ].filter(Boolean).join('; ');

    const label = (value: string | undefined, fallback: string) => escapeHtml(value || fallback);
    const invoiceTitle = label(data.invoiceTitle, 'Tax Invoice');
    const orderDateLabel = label(data.orderDateLabel, 'Order Date:');
    const subtotalLabel = label(data.subtotalLabel, 'Subtotal');
    const shippingLabel = label(data.shippingLabel, 'Shipping');
    const discountLabel = label(data.discountLabel, 'Discount');
    const taxLabel = label(data.taxLabel, 'Tax');
    const taxRateLabel = label(data.taxRateLabel, 'Tax Rate');
    const totalLabel = label(data.totalLabel, 'Total');
    const billingAddressTitle = label(data.billingAddressTitle, 'Billing Address:');
    const billingNameLabel = label(data.billingNameLabel, 'Name:');
    const billingAddressLabel = label(data.billingAddressLabel, 'Address:');
    const billingLocationLabel = label(data.billingLocationLabel, 'Location:');

    const rowStyle = (id: string) => toCssString(sub[`${id}_container`] || {});
    const labelStyle = (id: string, extra = '') => [extra, toCssString(sub[`${id}_label`] || {})].filter(Boolean).join('; ');
    const valueStyle = (id: string, extra = '') => [extra, toCssString(sub[`${id}_value`] || {})].filter(Boolean).join('; ');
    const defaultTotalsRowOrder = ['subtotal', 'shipping', 'discount', 'coupon_discount', 'sale_discount', 'tax', 'tax_rate', 'total'];
    const savedTotalsRowOrder = Array.isArray(data.taxBillingTotalsRowOrder) ? data.taxBillingTotalsRowOrder : [];
    const totalsRowOrder = [
      ...savedTotalsRowOrder.filter((rowId: string) => defaultTotalsRowOrder.includes(rowId)),
      ...defaultTotalsRowOrder.filter(rowId => !savedTotalsRowOrder.includes(rowId)),
    ];
    const totalsRows = [
      {
        id: 'subtotal',
        label: subtotalLabel,
        value: subtotal,
        labelStyle: labelStyle('subtotal', 'padding: 8px; border-bottom: 1px solid #eee'),
        valueStyle: valueStyle('subtotal', 'padding: 8px; border-bottom: 1px solid #eee'),
      },
      {
        id: 'shipping',
        label: shippingLabel,
        value: shipping,
        labelStyle: labelStyle('shipping', 'padding: 8px; border-bottom: 1px solid #eee'),
        valueStyle: valueStyle('shipping', 'padding: 8px; border-bottom: 1px solid #eee'),
      },
      {
        id: 'discount',
        label: discountLabel,
        value: '-{{order_discount}}',
        labelStyle: labelStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
        valueStyle: valueStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
      },
      {
        id: 'coupon_discount',
        label: escapeHtml(data.couponDiscountLabel || 'Coupon savings'),
        value: '-{{coupon_discount}}',
        labelStyle: labelStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
        valueStyle: valueStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
      },
      {
        id: 'sale_discount',
        label: escapeHtml(data.saleDiscountLabel || 'Sale discount'),
        value: '-{{sale_discount}}',
        labelStyle: labelStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
        valueStyle: valueStyle('discount', 'padding: 8px; border-bottom: 1px solid #eee; color: #e53e3e'),
      },
      {
        id: 'tax',
        label: taxLabel,
        value: tax,
        labelStyle: labelStyle('tax', 'padding: 8px; border-bottom: 1px solid #eee'),
        valueStyle: valueStyle('tax', 'padding: 8px; border-bottom: 1px solid #eee'),
      },
      {
        id: 'tax_rate',
        label: taxRateLabel,
        value: '{{tax_rate}}',
        labelStyle: labelStyle('tax_rate', 'padding: 10px 8px; border-bottom: 1px solid #eee'),
        valueStyle: valueStyle('tax_rate', 'padding: 10px 8px; border-bottom: 1px solid #eee'),
      },
      {
        id: 'total',
        label: totalLabel,
        value: total,
        labelStyle: labelStyle('total', 'padding: 8px; font-weight: bold'),
        valueStyle: valueStyle('total', 'padding: 8px; font-weight: bold'),
      },
    ];
    const totalsRowsHtml = totalsRowOrder
      .map(rowId => totalsRows.find(row => row.id === rowId))
      .filter(Boolean)
      .map(row => `
            <tr style="${rowStyle(row!.id)}">
              <td style="${row!.labelStyle}">${row!.label}</td>
              <td align="right" style="${row!.valueStyle}">${row!.value}</td>
            </tr>`)
      .join('');
    const defaultBillingRowOrder = ['billing_name', 'billing_address_line', 'billing_location'];
    const savedBillingRowOrder = Array.isArray(data.taxBillingAddressRowOrder) ? data.taxBillingAddressRowOrder : [];
    const billingRowOrder = [
      ...savedBillingRowOrder.filter((rowId: string) => defaultBillingRowOrder.includes(rowId)),
      ...defaultBillingRowOrder.filter(rowId => !savedBillingRowOrder.includes(rowId)),
    ];
    const billingRows = [
      {
        id: 'billing_name',
        containerId: 'billing_name_container',
        labelStyleId: 'billing_name_label',
        valueStyleId: 'billing_name_value',
        label: billingNameLabel,
        value: '{{billing_first_name}} {{billing_last_name}}',
      },
      {
        id: 'billing_address_line',
        containerId: 'billing_address_line_container',
        labelStyleId: 'billing_address_label',
        valueStyleId: 'billing_address_value',
        label: billingAddressLabel,
        value: '{{billing_address_1}}',
      },
      {
        id: 'billing_location',
        containerId: 'billing_location_container',
        labelStyleId: 'billing_location_label',
        valueStyleId: 'billing_location_value',
        label: billingLocationLabel,
        value: '{{billing_city}}, {{billing_state}} {{billing_postcode}}, {{billing_country}}',
      },
    ];
    const billingRowsHtml = billingRowOrder
      .map(rowId => billingRows.find(row => row.id === rowId))
      .filter(Boolean)
      .map(row => `<div style="color: inherit; ${toCssString(sub[row!.containerId] || {})}"><strong style="${toCssString(sub[row!.labelStyleId] || {})}">${row!.label}</strong> <span style="${toCssString(sub[row!.valueStyleId] || {})}">${row!.value}</span></div>`)
      .join('');

    return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${styles}; ${toCssString(sub.outer_container || {})}">
      <tr>
        <td style="padding: ${getPaddingStyle(data.padding, '15px')};">
          <table width="100%" cellpadding="12" cellspacing="0" style="border-collapse: collapse; ${innerTableStyles}; ${toCssString(sub.totals_container || {})}">
            <tr style="background-color: #f8f9fa; ${toCssString(sub.invoice_header_container || {})}">
              <td colspan="2" style="padding: 12px; font-weight: bold; font-size: 1.2em; border-bottom: 2px solid #dee2e6; ${toCssString(sub.invoice_title || {})}">${invoiceTitle} #${orderNumber}</td>
            </tr>
            <tr style="${toCssString(sub.order_date_container || {})}">
              <td colspan="2" style="padding: 10px 12px; border-bottom: 1px solid #eeeeee;">
                <strong style="${toCssString(sub.order_date_label || {})}">${orderDateLabel}</strong> <span style="${toCssString(sub.order_date_value || {})}">${orderDate}</span>
              </td>
            </tr>
            ${totalsRowsHtml}
            <tr style="${toCssString(sub.billing_address_container || {})}">
              <td colspan="2" style="padding: 15px; background-color: #f9f9f9; border-top: 1px solid #ddd; ${innerTableStyles}">
                <div style="font-weight: bold; margin-bottom: 8px; ${toCssString(sub.billing_address_title || {})}">${billingAddressTitle}</div>
                ${billingRowsHtml}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  },

  'billingAddress': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};

    const outerStyle = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.textAlign && `text-align: ${data.textAlign}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : 'background-color: #ffffff',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
      `width: 100%`,
      `box-sizing: border-box`,
      `word-break: break-word`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const headerContainerStyle = toCssString(sub.header_container || {});
    const headerTitleStyle = [
      `margin: 0 0 12px 0`,
      data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      `font-weight: bold`,
      toCssString(sub.header_title || {}),
    ].filter(Boolean).join('; ');

    const fieldsContainerStyle = toCssString(sub.fields_container || {});

    let fieldsHtml = '';
    const fields = [
      { id: 'name', labelKey: 'nameLabel', valueKey: 'fullName', defaultLabel: 'Name', placeholder: '{{billing_first_name}} {{billing_last_name}}', defaultText: 'John Doe' },
      { id: 'email', labelKey: 'emailLabel', valueKey: 'email', defaultLabel: 'Email', placeholder: '{{billing_email}}', defaultText: 'john.doe@example.com' },
      { id: 'phone', labelKey: 'phoneLabel', valueKey: 'phone', defaultLabel: 'Phone', placeholder: '{{billing_phone}}', defaultText: '+1-555-123-4567' },
      { id: 'address1', labelKey: 'addressLine1Label', valueKey: 'addressLine1', defaultLabel: 'Address Line 1', placeholder: '{{billing_address_1}}', defaultText: '123 Main Street' },
      { id: 'address2', labelKey: 'addressLine2Label', valueKey: 'addressLine2', defaultLabel: 'Address Line 2', placeholder: '{{billing_address_2}}', defaultText: 'Apt 4B' },
      { id: 'city', labelKey: 'cityLabel', valueKey: 'city', defaultLabel: 'City', placeholder: '{{billing_city}}', defaultText: 'New York' },
      { id: 'state', labelKey: 'stateLabel', valueKey: 'state', defaultLabel: 'State', placeholder: '{{billing_state}}', defaultText: 'NY' },
      { id: 'postalCode', labelKey: 'postalCodeLabel', valueKey: 'postalCode', defaultLabel: 'Postal Code', placeholder: '{{billing_postcode}}', defaultText: '10001' },
      { id: 'country', labelKey: 'countryLabel', valueKey: 'country', defaultLabel: 'Country', placeholder: '{{billing_country}}', defaultText: 'USA' },
    ];

    const defaultBillingAddressFieldOrder = ['name', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];
    const billingAddressFieldOrder = Array.isArray(data.billingAddressFieldOrder)
      ? [
        ...data.billingAddressFieldOrder.filter((fieldId: string) => defaultBillingAddressFieldOrder.includes(fieldId)),
        ...defaultBillingAddressFieldOrder.filter(fieldId => !data.billingAddressFieldOrder.includes(fieldId)),
      ]
      : defaultBillingAddressFieldOrder;
    const orderedFields = billingAddressFieldOrder
      .map((fieldId: string) => fields.find(field => field.id === fieldId))
      .filter(Boolean) as typeof fields;

    orderedFields.forEach(({ id, labelKey, valueKey, defaultLabel, placeholder, defaultText }) => {
      const labelSub = sub[`${id}_label`] || {};
      const valueSub = sub[`${id}_value`] || {};
      const containerSub = sub[`${id}_container`] || {};
      const labelText = data[labelKey] !== undefined ? data[labelKey] : defaultLabel;

      const rawVal = data[valueKey];
      const valueText = (!rawVal || rawVal.trim() === '' || rawVal === defaultText) ? placeholder : rawVal;

      const containerStyle = [
        `display: flex`,
        `flex-direction: row`,
        `align-items: baseline`,
        `flex-wrap: wrap`,
        `margin-bottom: 6px`,
        toCssString(containerSub),
      ].filter(Boolean).join('; ');

      const labelTag = labelSub.htmlTag || 'p';
      const labelStyle = [
        `margin: 0`,
        `margin-right: 6px`,
        data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
        data.fontSize && `font-size: ${data.fontSize}`,
        data.textColor && `color: ${data.textColor}`,
        `font-weight: bold`,
        data.lineHeight && `line-height: ${data.lineHeight}`,
        toCssString(labelSub),
      ].filter(Boolean).join('; ');

      const linkHref = valueSub.linkHref || '';
      const linkTarget = valueSub.linkTarget || '_self';

      let valueHtml = '';
      if (linkHref) {
        const valueStyle = [
          `margin: 0`,
          data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
          data.fontSize && `font-size: ${data.fontSize}`,
          data.textColor && `color: ${data.textColor}`,
          `font-weight: ${data.fontWeight || 'normal'}`,
          data.lineHeight && `line-height: ${data.lineHeight}`,
          `text-decoration: none`,
          toCssString(valueSub),
        ].filter(Boolean).join('; ');
        valueHtml = `<a href="${linkHref}" target="${linkTarget}" style="${valueStyle}">${valueText}</a>`;
      } else {
        const valueStyle = [
          `margin: 0`,
          data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
          data.fontSize && `font-size: ${data.fontSize}`,
          data.textColor && `color: ${data.textColor}`,
          `font-weight: ${data.fontWeight || 'normal'}`,
          data.lineHeight && `line-height: ${data.lineHeight}`,
          toCssString(valueSub),
        ].filter(Boolean).join('; ');
        valueHtml = `<p style="${valueStyle}">${valueText}</p>`;
      }

      fieldsHtml += `
      <div style="${containerStyle}">
        <${labelTag} style="${labelStyle}">${labelText}</${labelTag}>
        ${valueHtml}
      </div>`;
    });

    return `
    <div id="billing_address" style="${outerStyle}">
      <div style="${headerContainerStyle}">
        <h4 style="${headerTitleStyle}">${data.title || 'BILL TO'}</h4>
      </div>
      <div style="${fieldsContainerStyle}">
        ${fieldsHtml}
      </div>
    </div>`;
  },

  'shippingAddress': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};

    const outerStyle = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.textAlign && `text-align: ${data.textAlign}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : 'background-color: #ffffff',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
      `width: 100%`,
      `box-sizing: border-box`,
      `word-break: break-word`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const headerContainerStyle = toCssString(sub.header_container || {});
    const headerTitleStyle = [
      `margin: 0 0 12px 0`,
      data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      `font-weight: bold`,
      toCssString(sub.header_title || {}),
    ].filter(Boolean).join('; ');

    const fieldsContainerStyle = toCssString(sub.fields_container || {});

    let fieldsHtml = '';
    const fields = [
      { id: 'name', labelKey: 'nameLabel', valueKey: 'fullName', defaultLabel: 'Name', placeholder: '{{shipping_first_name}} {{shipping_last_name}}', defaultText: 'Jane Smith' },
      { id: 'email', labelKey: 'emailLabel', valueKey: 'email', defaultLabel: 'Email', placeholder: '{{shipping_email}}', defaultText: 'jane.smith@example.com' },
      { id: 'phone', labelKey: 'phoneLabel', valueKey: 'phone', defaultLabel: 'Phone', placeholder: '{{shipping_phone}}', defaultText: '+1-555-987-6543' },
      { id: 'address1', labelKey: 'addressLine1Label', valueKey: 'addressLine1', defaultLabel: 'Address Line 1', placeholder: '{{shipping_address_1}}', defaultText: '456 Oak Avenue' },
      { id: 'address2', labelKey: 'addressLine2Label', valueKey: 'addressLine2', defaultLabel: 'Address Line 2', placeholder: '{{shipping_address_2}}', defaultText: 'Suite 200' },
      { id: 'city', labelKey: 'cityLabel', valueKey: 'city', defaultLabel: 'City', placeholder: '{{shipping_city}}', defaultText: 'Los Angeles' },
      { id: 'state', labelKey: 'stateLabel', valueKey: 'state', defaultLabel: 'State', placeholder: '{{shipping_state}}', defaultText: 'CA' },
      { id: 'postalCode', labelKey: 'postalCodeLabel', valueKey: 'postalCode', defaultLabel: 'Postal Code', placeholder: '{{shipping_postcode}}', defaultText: '90001' },
      { id: 'country', labelKey: 'countryLabel', valueKey: 'country', defaultLabel: 'Country', placeholder: '{{shipping_country}}', defaultText: 'USA' },
    ];

    const defaultShippingAddressFieldOrder = ['name', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];
    const shippingAddressFieldOrder = Array.isArray(data.shippingAddressFieldOrder)
      ? [
        ...data.shippingAddressFieldOrder.filter((fieldId: string) => defaultShippingAddressFieldOrder.includes(fieldId)),
        ...defaultShippingAddressFieldOrder.filter(fieldId => !data.shippingAddressFieldOrder.includes(fieldId)),
      ]
      : defaultShippingAddressFieldOrder;
    const orderedFields = shippingAddressFieldOrder
      .map((fieldId: string) => fields.find(field => field.id === fieldId))
      .filter(Boolean) as typeof fields;

    orderedFields.forEach(({ id, labelKey, valueKey, defaultLabel, placeholder, defaultText }) => {
      const labelSub = sub[`${id}_label`] || {};
      const valueSub = sub[`${id}_value`] || {};
      const containerSub = sub[`${id}_container`] || {};
      const labelText = data[labelKey] !== undefined ? data[labelKey] : defaultLabel;

      const rawVal = data[valueKey];
      const valueText = (!rawVal || rawVal.trim() === '' || rawVal === defaultText) ? placeholder : rawVal;

      const containerStyle = [
        `display: flex`,
        `flex-direction: row`,
        `align-items: baseline`,
        `flex-wrap: wrap`,
        `margin-bottom: 6px`,
        toCssString(containerSub),
      ].filter(Boolean).join('; ');

      const labelTag = labelSub.htmlTag || 'p';
      const labelStyle = [
        `margin: 0`,
        `margin-right: 6px`,
        data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
        data.fontSize && `font-size: ${data.fontSize}`,
        data.textColor && `color: ${data.textColor}`,
        `font-weight: bold`,
        data.lineHeight && `line-height: ${data.lineHeight}`,
        toCssString(labelSub),
      ].filter(Boolean).join('; ');

      const linkHref = valueSub.linkHref || '';
      const linkTarget = valueSub.linkTarget || '_self';

      let valueHtml = '';
      if (linkHref) {
        const valueStyle = [
          `margin: 0`,
          data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
          data.fontSize && `font-size: ${data.fontSize}`,
          data.textColor && `color: ${data.textColor}`,
          `font-weight: ${data.fontWeight || 'normal'}`,
          data.lineHeight && `line-height: ${data.lineHeight}`,
          `text-decoration: none`,
          toCssString(valueSub),
        ].filter(Boolean).join('; ');
        valueHtml = `<a href="${linkHref}" target="${linkTarget}" style="${valueStyle}">${valueText}</a>`;
      } else {
        const valueStyle = [
          `margin: 0`,
          data.fontFamily && data.fontFamily !== 'inherit' && `font-family: ${data.fontFamily}`,
          data.fontSize && `font-size: ${data.fontSize}`,
          data.textColor && `color: ${data.textColor}`,
          `font-weight: ${data.fontWeight || 'normal'}`,
          data.lineHeight && `line-height: ${data.lineHeight}`,
          toCssString(valueSub),
        ].filter(Boolean).join('; ');
        valueHtml = `<p style="${valueStyle}">${valueText}</p>`;
      }

      fieldsHtml += `
      <div style="${containerStyle}">
        <${labelTag} style="${labelStyle}">${labelText}</${labelTag}>
        ${valueHtml}
      </div>`;
    });

    return `
    <div id="shipping_address" style="${outerStyle}">
      <div style="${headerContainerStyle}">
        <h4 style="${headerTitleStyle}">${data.title || 'SHIP TO'}</h4>
      </div>
      <div style="${fieldsContainerStyle}">
        ${fieldsHtml}
      </div>
    </div>`;
  },

  'orderItems': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const orderNumber = '{{order_id}}';
    const orderDate = '{{order_date}}';
    const orderHeading = escapeHtml(data.orderHeading || `[Order #${orderNumber}] (${orderDate})`);
    const productHeader = escapeHtml(data.productHeader || 'Product');
    const quantityHeader = escapeHtml(data.quantityHeader || 'Quantity');
    const priceHeader = escapeHtml(data.priceHeader || 'Price');
    const subtotalLabel = escapeHtml(data.subtotalLabel || 'Subtotal:');
    const subtotalValue = escapeHtml(data.subtotal || '{{order_subtotal}}');
    const discountLabel = escapeHtml(data.discountLabel || 'Discount:');
    const discountValue = escapeHtml(data.discount || '{{order_discount}}');
    const paymentLabel = escapeHtml(data.paymentLabel || 'Payment method:');
    const paymentValue = escapeHtml(data.paymentMethod || '{{payment_method}}');
    const totalLabel = escapeHtml(data.totalLabel || 'Total:');
    const totalValue = escapeHtml(data.total || '{{order_total}}');

    const textStyle = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
    ].filter(Boolean).join('; ');

    const alignmentStyle = `text-align: ${data.textAlign || 'left'}`;
    const backgroundStyle = data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '';

    const outerStyle = [
      textStyle,
      backgroundStyle,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const tableStyle = [
      `border: 1px solid #dee2e6`,
      `border-collapse: collapse`,
      `background-color: #ffffff`,
      textStyle,
      toCssString(sub.table_container || {}),
    ].filter(Boolean).join('; ');

    const headerRowStyle = toCssString(sub.header_row || {});
    const headerProductStyle = [
      `padding: 12px`,
      `text-align: left`,
      `border-bottom: 2px solid #dee2e6`,
      `font-weight: bold`,
      `word-break: break-word`,
      `white-space: normal`,
      `overflow: visible`,
      `text-overflow: clip`,
      toCssString(sub.header_product || {}),
    ].filter(Boolean).join('; ');

    const headerQuantityStyle = [
      `padding: 12px`,
      `text-align: center`,
      `border-bottom: 2px solid #dee2e6`,
      `font-weight: bold`,
      `word-break: break-word`,
      `white-space: nowrap`,
      `overflow: visible`,
      `text-overflow: clip`,
      toCssString(sub.header_quantity || {}),
    ].filter(Boolean).join('; ');

    const headerPriceStyle = [
      `padding: 12px`,
      `text-align: right`,
      `border-bottom: 2px solid #dee2e6`,
      `font-weight: bold`,
      `word-break: break-word`,
      `white-space: nowrap`,
      `overflow: visible`,
      `text-overflow: clip`,
      toCssString(sub.header_price || {}),
    ].filter(Boolean).join('; ');

    const summaryStyle = (id: string, base: string[]) => [
      ...base,
      `word-break: break-word`,
      `white-space: normal`,
      `overflow: visible`,
      `text-overflow: clip`,
      toCssString(sub[id] || {}),
    ].filter(Boolean).join('; ');

    const subtotalContainerStyle = toCssString(sub.subtotal_container || sub.subtotal_row || {});
    const subtotalLabelStyle = summaryStyle('subtotal_label', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `font-weight: bold`]);
    const subtotalValueStyle = summaryStyle('subtotal_value', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `text-align: right`]);

    const discountContainerStyle = toCssString(sub.discount_container || sub.discount_row || {});
    const discountLabelStyle = summaryStyle('discount_label', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `font-weight: bold`, `color: #e53e3e`]);
    const discountValueStyle = summaryStyle('discount_value', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `text-align: right`, `color: #e53e3e`]);

    const paymentContainerStyle = toCssString(sub.payment_container || sub.payment_row || {});
    const paymentLabelStyle = summaryStyle('payment_label', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `font-weight: bold`]);
    const paymentValueStyle = summaryStyle('payment_value', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `text-align: right`]);

    const shippingContainerStyle = toCssString(sub.shipping_container || sub.shipping_row || {});
    const shippingLabelStyle = summaryStyle('shipping_label', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `font-weight: bold`]);
    const shippingValueStyle = summaryStyle('shipping_value', [`padding: 12px`, `border-bottom: 1px solid #e9ecef`, `text-align: right`]);
    const shippingLabel = escapeHtml(data.shippingLabel || 'Shipping:');
    const shippingValue = escapeHtml(data.shipping || '{{order_shipping}}');

    const totalContainerStyle = [
      `background-color: #f8f9fa`,
      toCssString(sub.total_container || sub.total_row || {}),
    ].filter(Boolean).join('; ');
    const totalLabelStyle = summaryStyle('total_label', [`padding: 12px`, `font-weight: bold`, `border-top: 2px solid #dee2e6`]);
    const totalValueStyle = summaryStyle('total_value', [`padding: 12px`, `text-align: right`, `font-weight: bold`, `border-top: 2px solid #dee2e6`]);
    const defaultSummaryRowOrder = ['subtotal', 'discount', 'coupon_discount', 'sale_discount', 'shipping', 'payment', 'total'];
    const savedSummaryRowOrder = Array.isArray(data.orderItemsSummaryRowOrder) ? data.orderItemsSummaryRowOrder : [];
    const summaryRowOrder = [
      ...savedSummaryRowOrder.filter((rowId: string) => defaultSummaryRowOrder.includes(rowId)),
      ...defaultSummaryRowOrder.filter(rowId => !savedSummaryRowOrder.includes(rowId)),
    ];
    const summaryRows = [
      {
        id: 'subtotal',
        containerStyle: subtotalContainerStyle,
        labelStyle: subtotalLabelStyle,
        valueStyle: subtotalValueStyle,
        label: subtotalLabel,
        value: subtotalValue,
      },
      {
        id: 'discount',
        containerStyle: discountContainerStyle,
        labelStyle: discountLabelStyle,
        valueStyle: discountValueStyle,
        label: discountLabel,
        value: `-${discountValue}`,
      },
      {
        id: 'coupon_discount',
        containerStyle: discountContainerStyle,
        labelStyle: discountLabelStyle,
        valueStyle: discountValueStyle,
        label: escapeHtml(data.couponDiscountLabel || 'Coupon savings:'),
        value: `-{{coupon_discount}}`,
      },
      {
        id: 'sale_discount',
        containerStyle: discountContainerStyle,
        labelStyle: discountLabelStyle,
        valueStyle: discountValueStyle,
        label: escapeHtml(data.saleDiscountLabel || 'Sale discount:'),
        value: `-{{sale_discount}}`,
      },
      {
        id: 'shipping',
        containerStyle: shippingContainerStyle,
        labelStyle: shippingLabelStyle,
        valueStyle: shippingValueStyle,
        label: shippingLabel,
        value: shippingValue,
      },
      {
        id: 'payment',
        containerStyle: paymentContainerStyle,
        labelStyle: paymentLabelStyle,
        valueStyle: paymentValueStyle,
        label: paymentLabel,
        value: paymentValue,
      },
      {
        id: 'total',
        containerStyle: totalContainerStyle,
        labelStyle: totalLabelStyle,
        valueStyle: totalValueStyle,
        label: totalLabel,
        value: totalValue,
      },
    ];
    const summaryRowsHtml = (data.showSummaryRows === false) ? '' : summaryRowOrder
      .map(rowId => summaryRows.find(row => row.id === rowId))
      .filter(Boolean)
      .map(row => `
              <tr style="${row!.containerStyle}">
                <td colspan="2" style="${row!.labelStyle}">${row!.label}</td>
                <td style="${row!.valueStyle}">${row!.value}</td>
              </tr>`)
      .join('');

    return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin-bottom: 20px; ${outerStyle}">
      <tr>
        <td style="padding: ${getPaddingStyle(data.padding, '0px')};">
          <div style="font-weight: bold; font-size: 18px; margin-bottom: 16px; ${alignmentStyle}; ${textStyle}; ${toCssString(sub.order_heading || {})}">${orderHeading}</div>
          <table width="100%" cellpadding="0" cellspacing="0" style="${tableStyle}">
            <thead>
              <tr style="background-color: #f8f9fa; ${headerRowStyle}">
                <th style="${headerProductStyle}">${productHeader}</th>
                <th style="${headerQuantityStyle}">${quantityHeader}</th>
                <th style="${headerPriceStyle}">${priceHeader}</th>
              </tr>
            </thead>
            <tbody>
              {{order_items_rows}}
              ${summaryRowsHtml}
            </tbody>
          </table>
        </td>
      </tr>
    </table>`;
  },

  // ========== 8. IMAGE WIDGET ==========
  'image': (d) => {
    const data = d || {};

    const bgImage = data.backgroundImage || data.bgImage;
    const bgSize = data.backgroundSize || data.bgSize || 'cover';
    const bgPos = data.backgroundPosition || data.bgPosition || 'center';
    const bgColor = data.backgroundColor || data.bgColor || 'transparent';

    // Wrapper styles for alignment and padding (matching ImageFieldComponent)
    const containerStyles = [
      `text-align: ${data.align || 'left'}`,
      data.padding ? `padding: ${data.padding.top || 0}px ${data.padding.right || 0}px ${data.padding.bottom || 0}px ${data.padding.left || 0}px` : '',
      'width: 100%',
      `background-color: ${bgColor}`,
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : ''
    ].filter(Boolean).join('; ');

    const formatLength = (val: string | number | undefined) => {
      if (val === undefined || val === '') return undefined;
      if (typeof val === 'number') return `${val}px`;
      if (/^\d+$/.test(String(val))) return `${val}px`;
      return String(val);
    };

    const formattedWidth = formatLength(data.width);
    const formattedHeight = formatLength(data.height);

    const finalWidth = (data.autoWidth && formattedWidth === '100%') ? '100%' : (formattedWidth || '100%');
    const finalHeight = ((data.autoHeight ?? true) && formattedHeight === 'auto') ? 'auto' : (formattedHeight || 'auto');

    // Image styles
    const imgStyles = [
      `width: ${finalWidth}`,
      `max-width: 100%`,
      `height: ${finalHeight}`,
      data.borderRadius ? `border-radius: ${String(data.borderRadius).endsWith('px') || String(data.borderRadius).endsWith('%') ? data.borderRadius : data.borderRadius + 'px'}` : '',
      `object-fit: ${data.objectFit || 'contain'}`,
      'display: inline-block'
    ].filter(Boolean).join('; ');

    const altText = data.altText || 'Image';
    const src = data.src || 'https://via.placeholder.com/600x400?text=Image+Placeholder';

    const imgTag = `<img src="${escapeHtml(src)}" alt="${escapeHtml(altText)}"${imgStyles ? ` style="${imgStyles}"` : ''} />`;
    const finalContent = data.linkUrl
      ? `<a href="${escapeHtml(data.linkUrl)}"${data.linkTarget ? ` target="${data.linkTarget}"` : ''} style="display: inline-block; text-decoration: none;">${imgTag}</a>`
      : imgTag;

    return `
      <div style="${containerStyles}">
        ${finalContent}
      </div>
    `;
  },

  // ========== 9. DIVIDER WIDGET ==========
  'divider': (d) => {
    const data = d || {};
    const width = data.width || '100';
    const thickness = data.thickness || 1;
    const style = data.style || 'solid';
    const color = data.color || '#cccccc';
    const alignment = data.alignment || 'center';

    const paddingTop = data.padding?.top || 10;
    const paddingBottom = data.padding?.bottom || 10;
    // We don't use left/right padding since we use margin for alignment

    const marginStyles = alignment === 'center' ? 'margin-left: auto; margin-right: auto' :
      alignment === 'right' ? 'margin-left: auto; margin-right: 0' :
        'margin-left: 0; margin-right: auto';

    const dividerStyles = [
      `width: ${width}%`,
      `border-top: ${thickness}px ${style} ${color}`,
      `height: 0`,
      `line-height: 0`,
      `font-size: 0`,
      marginStyles,
      `display: block`
    ].join('; ');

    return `
    <div style="padding: ${paddingTop}px 0 ${paddingBottom}px 0; width: 100%;">
      <div style="${dividerStyles}">&nbsp;</div>
    </div>`;
  },

  // ========== 10. SOCIAL ICONS WIDGET ==========
  'socialIcons': (d) => {
    const data = d || {};
    const icons = data.addedIcons?.icons || [];
    const urls = data.addedIcons?.url || [];
    const iconSize = data.iconSize || 32;
    const iconSpace = data.iconSpace || 8;

    // Use high-quality official icon assets (CDNs) for better look
    // const pluginUrl = (window as any).emailTemplateAjax?.plugin_url || '';
    // const localIconBase = `${pluginUrl}assets/img/social/`;

    const socialIconImages: Record<string, string> = {
      // facebook: `${localIconBase}facebook.png`, 
      facebook: 'https://img.icons8.com/color/48/facebook-new.png',
      twitter: 'https://img.icons8.com/color/48/twitter--v1.png',
      linkedin: 'https://img.icons8.com/color/48/linkedin.png',
      instagram: 'https://img.icons8.com/color/48/instagram-new.png',
      pinterest: 'https://img.icons8.com/color/48/pinterest--v1.png',
      youtube: 'https://img.icons8.com/color/48/youtube-play.png',
      whatsapp: 'https://img.icons8.com/color/48/whatsapp--v1.png',
      reddit: 'https://img.icons8.com/color/48/reddit.png',
      github: 'https://img.icons8.com/ios-filled/50/000000/github.png', // Black filled for visibility
      telegram: 'https://img.icons8.com/color/48/telegram-app.png',
      envelope: 'https://img.icons8.com/color/48/email.png',
    };

    // Helper to generate icon HTML
    const getSocialIconHtml = (icon: string, size: number): string => {
      const src = socialIconImages[icon] || 'https://via.placeholder.com/32';
      return `<img src="${src}" alt="${icon}" width="${size}" height="${size}" style="display: block; border: 0;" />`;
    };

    if (icons.length === 0) return '';

    // Use table for better email client support
    const iconsHtml = icons.map((icon: string, index: number) => {
      const iconImg = getSocialIconHtml(icon, iconSize);
      const url = urls[index] || '#';

      return `
        <td style="padding: 0 ${iconSpace / 2}px;">
          <a href="${escapeHtml(url)}" style="text-decoration: none; display: block;" target="_blank" rel="noopener">${iconImg}</a>
        </td>`;
    }).join('');

    const formatLength = (val: any) => {
      if (val === undefined || val === null || val === '') return '';
      if (typeof val === 'number') return `${val}px`;
      if (/^\d+$/.test(val)) return `${val}px`;
      return val;
    };

    const containerStyle = [
      `text-align: ${data.iconAlign || 'center'}`, // Support alignment
      data.padding ? `padding: ${data.padding.top || 10}px ${data.padding.right || 10}px ${data.padding.bottom || 10}px ${data.padding.left || 10}px` : 'padding: 10px',
      `width: ${formatLength(data.width) || '100%'}`,
      data.height ? `height: ${formatLength(data.height)}` : '',
    ].filter(Boolean).join('; ');

    // Use a wrapper div/table for alignment and padding
    return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="${containerStyle};">
      <tr>
        <td align="${data.iconAlign || 'center'}">
          <table role="presentation" cellpadding="0" cellspacing="0" style="display: inline-table;">
            <tr>
              ${iconsHtml}
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
  },


  // ========== 12. SPACER WIDGET ==========
  'spacer': (d) => {
    const data = d || {};
    // Ensure height is parsed correctly (removing 'px' if present in string)
    const heightVal = parseInt(String(data.height || 20), 10);
    const height = isNaN(heightVal) ? 20 : heightVal;
    const bgColor = data.backgroundColor || 'transparent';

    // Must trigger layout with &nbsp; and line-height/font-size
    // Added min-height, clear:both to ensure it consumes space in all clients
    return `<div style="height: ${height}px; line-height: ${height}px; font-size: 0px; background-color: ${bgColor}; width: 100%; min-height: ${height}px; clear: both; display: block;">&nbsp;</div>`;
  },

  'table': (d) => {
    const data = d || {};
    const rows = parseInt(String(data.rows || 2), 10);
    const headings = data.headings || [{ text: 'Heading 1' }, { text: 'Heading 2' }];
    const cols = headings.length;
    const cellPadding = data.cellPadding ?? 8;
    const cellSpacing = data.cellSpacing ?? 0;
    const bgColor = data.backgroundColor || 'transparent';
    const borderColor = data.borderColor || '#cccccc';
    const borderWidth = data.borderWidth ?? 1;
    const textAlign = data.textAlign || 'left';

    const tWidth = data.width || '100%';
    const tAlign = data.tableAlign || 'center';
    let tableHtml = `<table width="${tWidth}" align="${tAlign}" cellpadding="${cellPadding}" cellspacing="${cellSpacing}" style="width: ${tWidth}; background-color: ${bgColor}; border-collapse: collapse; border: ${borderWidth}px ${data.borderStyle || 'solid'} ${borderColor}; ${data.borderRadius ? `border-radius: ${data.borderRadius}${data.borderRadiusUnit || 'px'};` : ''} ${data.boxShadow && data.boxShadow !== 'none' ? `box-shadow: ${data.boxShadow};` : ''}">`;

    tableHtml += `<thead><tr>`;
    for (let h = 0; h < headings.length; h++) {
      const hBorder = data.headBorderType && data.headBorderType !== 'default' ? (data.headBorderType === 'none' ? 'none' : `${borderWidth}px ${data.headBorderType} ${borderColor}`) : `${borderWidth}px solid ${borderColor}`;
      const hPad = data.headPadding ? `${data.headPadding.top}${data.headPaddingUnit || 'px'} ${data.headPadding.right}${data.headPaddingUnit || 'px'} ${data.headPadding.bottom}${data.headPaddingUnit || 'px'} ${data.headPadding.left}${data.headPaddingUnit || 'px'}` : `${cellPadding}px`;
      const hBgColor = data.headBackgroundColor || '#f5f5f5';
      const imgStyle = `display: block; max-width: 100%; max-height: ${data.headIconSize ? data.headIconSize + 'px' : '60px'}; object-fit: contain; margin: ${data.headIconSpacing ? `${data.headIconSpacing.top}${data.headIconSpacingUnit || 'px'} ${data.headIconSpacing.right}${data.headIconSpacingUnit || 'px'} ${data.headIconSpacing.bottom}${data.headIconSpacingUnit || 'px'} ${data.headIconSpacing.left}${data.headIconSpacingUnit || 'px'}` : (headings[h].text ? '0 0 4px 0' : '0')};`;
      const imgHtml = headings[h].imageUrl ? `<img src="${headings[h].imageUrl}" alt="${headings[h].text}" style="${imgStyle}" />` : '';
      tableHtml += `<th style="border: ${hBorder}; padding: ${hPad}; text-align: ${textAlign}; background-color: ${hBgColor}; color: ${data.headColor || '#333333'}; font-family: ${data.headFontFamily && data.headFontFamily !== 'Global' ? data.headFontFamily : 'inherit'}; font-size: ${data.headFontSize ? data.headFontSize + 'px' : 'inherit'}; font-weight: ${data.headFontWeight || 'bold'}; text-transform: ${data.headTextTransform && data.headTextTransform !== 'none' ? data.headTextTransform : 'none'}; font-style: ${data.headFontStyle && data.headFontStyle !== 'normal' ? data.headFontStyle : 'normal'}; text-decoration: ${data.headTextDecoration && data.headTextDecoration !== 'none' ? data.headTextDecoration : 'none'}; line-height: ${data.headLineHeight ? data.headLineHeight + 'px' : 'normal'}; letter-spacing: ${data.headLetterSpacing ? data.headLetterSpacing + 'px' : 'normal'}; word-spacing: ${data.headWordSpacing ? data.headWordSpacing + 'px' : 'normal'};">${imgHtml}${headings[h].text || ''}</th>`;
    }
    tableHtml += `</tr></thead>`;

    tableHtml += `<tbody>`;
    for (let r = 0; r < rows; r++) {
      tableHtml += `<tr>`;
      for (let c = 0; c < cols; c++) {
        const isEven = r % 2 === 0;
        const bgColor = isEven ? (data.rowBackgroundColorEven || 'transparent') : (data.rowBackgroundColorOdd || 'transparent');
        const color = isEven ? (data.rowColorEven || '#555555') : (data.rowColorOdd || '#555555');
        const fontFamily = data.rowFontFamily && data.rowFontFamily !== 'Global' ? data.rowFontFamily : 'inherit';
        const fontSize = data.rowFontSize ? data.rowFontSize + 'px' : 'inherit';
        const fontWeight = data.rowFontWeight || 'normal';
        const textTransform = data.rowTextTransform && data.rowTextTransform !== 'none' ? data.rowTextTransform : 'none';
        const fontStyle = data.rowFontStyle && data.rowFontStyle !== 'normal' ? data.rowFontStyle : 'normal';
        const textDecoration = data.rowTextDecoration && data.rowTextDecoration !== 'none' ? data.rowTextDecoration : 'none';
        const lineHeight = data.rowLineHeight ? data.rowLineHeight + 'px' : 'normal';
        const letterSpacing = data.rowLetterSpacing ? data.rowLetterSpacing + 'px' : 'normal';
        const wordSpacing = data.rowWordSpacing ? data.rowWordSpacing + 'px' : 'normal';
        const rBorder = data.rowBorderType && data.rowBorderType !== 'default' ? (data.rowBorderType === 'none' ? 'none' : `${borderWidth}px ${data.rowBorderType} ${borderColor}`) : `${borderWidth}px solid ${borderColor}`;
        const rPad = data.rowPadding ? `${data.rowPadding.top}${data.rowPaddingUnit || 'px'} ${data.rowPadding.right}${data.rowPaddingUnit || 'px'} ${data.rowPadding.bottom}${data.rowPaddingUnit || 'px'} ${data.rowPadding.left}${data.rowPaddingUnit || 'px'}` : `${cellPadding}px`;
        tableHtml += `<td style="border: ${rBorder}; padding: ${rPad}; text-align: ${textAlign}; background-color: ${bgColor}; color: ${color}; font-family: ${fontFamily}; font-size: ${fontSize}; font-weight: ${fontWeight}; text-transform: ${textTransform}; font-style: ${fontStyle}; text-decoration: ${textDecoration}; line-height: ${lineHeight}; letter-spacing: ${letterSpacing}; word-spacing: ${wordSpacing};">Row ${r + 1} Col ${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table>`;
    return tableHtml;
  },

  // ========== 13. LINK WIDGET ==========
  'link': (d) => {
    const data = d || {};
    const formatLength = (val: string | number | undefined) => {
      if (val === undefined || val === '') return undefined;
      if (typeof val === 'number') return `${val}px`;
      if (/^\d+$/.test(String(val))) return `${val}px`;
      return String(val);
    };

    const finalWidth = formatLength(data.width) || '100%';
    const finalHeight = formatLength(data.height) || 'auto';

    // Inner link styles
    const linkStyles = [
      `color: ${data.color || '#007bff'}`,
      `font-size: ${data.fontSize || 14}px`,
      data.underline !== false ? 'text-decoration: underline' : 'text-decoration: none',
      data.padding ? `padding: ${data.padding.top || 0}px ${data.padding.right || 0}px ${data.padding.bottom || 0}px ${data.padding.left || 0}px` : '',
      'display: inline-block',
      `width: ${finalWidth}`,
      `height: ${finalHeight}`,
    ].filter(Boolean).join('; ');

    const bgImage = data.backgroundImage || data.bgImage;
    const bgSize = data.backgroundSize || data.bgSize || 'cover';
    const bgPos = data.backgroundPosition || data.bgPosition || 'center';
    const bgColor = data.backgroundColor || data.bgColor || 'transparent';

    // Container styles for alignment
    const containerStyles = [
      `text-align: ${data.textAlign || 'left'}`,
      `width: ${finalWidth}`,
      `height: ${finalHeight}`,
      `background-color: ${bgColor}`,
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : ''
    ].filter(Boolean).join('; ');

    return `
      <div style="${containerStyles}">
        <a href="${escapeHtml(data.url || '#')}" style="${linkStyles}" target="_blank" rel="noopener">${escapeHtml(data.text || 'Link')}</a>
      </div>
    `;
  },





  // ========== 16. MAP WIDGET ==========


  // ========== 17. ICON WIDGET ==========
  'icon': (d) => {
    const data = d || {};
    const iconTypes: Record<string, string> = {
      'star': '★',
      'heart': '♥',
      'check': '✓',
      'warning': '⚠',
      'info': 'ℹ',
      'home': '⌂',
      'email': '✉',
      'phone': '☎',
      'calendar': '📅',
      'location': '📍'
    };

    const iconChar = iconTypes[data.iconType || 'star'] || '★';

    const width = data.width ?? data.size ?? 32;
    const height = data.height ?? data.size ?? 32;

    const iconStyles = [
      `color: ${data.color || '#000000'}`,
      `font-size: ${data.size || 24}px`,
      `width: ${width}px`,
      `height: ${height}px`,
      'display: inline-block',
      'line-height: 1',
      data.paddingTop !== undefined ? `padding: ${data.paddingTop}px ${data.paddingRight || 0}px ${data.paddingBottom || 0}px ${data.paddingLeft || 0}px` : ''
    ].filter(Boolean).join('; ');

    const bgImage = data.backgroundImage || data.bgImage;
    const bgSize = data.backgroundSize || data.bgSize || 'cover';
    const bgPos = data.backgroundPosition || data.bgPosition || 'center';
    const bgColor = data.backgroundColor || data.bgColor || 'transparent';

    const containerStyles = [
      `text-align: ${data.alignment || 'left'}`,
      'width: 100%',
      `background-color: ${bgColor}`,
      bgImage ? `background-image: url("${bgImage}")` : '',
      bgImage ? `background-size: ${bgSize}` : '',
      bgImage ? `background-position: ${bgPos}` : '',
      bgImage ? `background-repeat: no-repeat` : '',
      data.marginTop !== undefined ? `margin: ${data.marginTop}px ${data.marginRight || 0}px ${data.marginBottom || 0}px ${data.marginLeft || 0}px` : ''
    ].filter(Boolean).join('; ');

    let content = `<span style="${iconStyles}">${iconChar}</span>`;

    if (data.link) {
      content = `<a href="${escapeHtml(data.link)}" style="text-decoration: none;" target="_blank" rel="noopener">${content}</a>`;
    }

    return `<div style="${containerStyles}">${content}</div>`;
  },



  // ========== 19. CONTAINER WIDGET ==========
  'container': (d) => {
    const data = d || {};
    const display = data.display || 'flex';
    const borderRadius = data.borderRadius !== undefined ? data.borderRadius : (data.border?.radius !== undefined ? data.border.radius : 4);
    const normalize = (val: any) => {
      if (val === undefined || val === null || val === '') return '';
      const str = String(val).trim();
      if (str === 'auto' || str.endsWith('%') || str.endsWith('px') || str.endsWith('em') || str.endsWith('rem') || str.endsWith('vh') || str.endsWith('vw')) {
        return str;
      }
      if (!isNaN(Number(str))) return `${str}px`;
      return str;
    };

    const widthStyle = data.width ? `width: ${normalize(data.width)}` : '';
    const heightStyle = data.height ? `height: ${normalize(data.height)}` : '';

    const styles = [
      widthStyle,
      heightStyle,
      `max-width: ${normalize(data.maxWidth) || '800px'}`,
      `background-color: ${data.backgroundColor || '#ffffff'}`,

      typeof data.padding === 'object'
        ? `padding: ${data.padding.top || 0}px ${data.padding.right || 0}px ${data.padding.bottom || 0}px ${data.padding.left || 0}px`
        : `padding: ${getPaddingStyle(data.padding, '20px')}`,
      data.borderTopWidth !== undefined || data.border?.width ? `border-top: ${data.borderTopWidth ?? data.border?.width ?? 0}px ${data.borderTopStyle || data.border?.style || 'solid'} ${data.borderTopColor || data.border?.color || '#dddddd'}; border-right: ${data.borderRightWidth ?? data.border?.width ?? 0}px ${data.borderRightStyle || data.border?.style || 'solid'} ${data.borderRightColor || data.border?.color || '#dddddd'}; border-bottom: ${data.borderBottomWidth ?? data.border?.width ?? 0}px ${data.borderBottomStyle || data.border?.style || 'solid'} ${data.borderBottomColor || data.border?.color || '#dddddd'}; border-left: ${data.borderLeftWidth ?? data.border?.width ?? 0}px ${data.borderLeftStyle || data.border?.style || 'solid'} ${data.borderLeftColor || data.border?.color || '#dddddd'};` : '',
      `border-radius: ${borderRadius}px`,
      `display: block`,
      'margin: 0 auto',
      'box-sizing: border-box'
    ].filter(Boolean).join('; ');

    const children = data.children || [];
    let contentHtml = '';

    if (children.length > 0) {
      contentHtml = children.map((child: any) => widgetToHTML(child)).join('');
    } else {
      contentHtml = data.content || '';
    }

    return `<div style="${styles}">${contentHtml}</div>`;
  },

  // ========== 20. GROUP WIDGET ==========
  'group': (d) => {
    const data = d || {};
    const styles = [
      `text-align: ${data.alignment || 'left'}`,
      'display: flex',
      `flex-direction: ${data.direction || 'row'}`,
      `gap: ${data.spacing || 10}px`,
      'flex-wrap: wrap',
      data.alignment === 'space-between' ? 'justify-content: space-between' :
        data.alignment === 'center' ? 'justify-content: center' :
          data.alignment === 'right' ? 'justify-content: flex-end' : 'justify-content: flex-start',
      data.direction === 'column' ? 'align-items: stretch' : 'align-items: center'
    ].filter(Boolean).join('; ');

    const elements = data.elements || [];
    const elementsHtml = elements.map((element: any, index: number) => {
      const text = typeof element === 'string' ? element : element.text;
      const url = typeof element === 'string' ? '#' : element.url;

      return `
      <a href="${url}" style="text-decoration: none; color: inherit; display: block;" target="_blank" rel="noopener">
        <div style="background-color: #fff; border: 1px solid #e0e0e0; padding: 8px 16px; border-radius: 4px; color: #333; font-size: 14px; min-width: 80px; text-align: center;">
          ${escapeHtml(text)}
        </div>
      </a>
    `;
    }).join('');

    return `<div style="${styles}">${elementsHtml || '<div style="text-align: center; color: #6c757d; padding: 20px; width: 100%;">No elements in group</div>'}</div>`;
  },

  // ========== 21. SECTION WIDGET ==========
  'section': (d) => {
    const data = d || {};
    const styles = [
      `background-color: ${data.backgroundColor || '#f5f5f5'}`,
      data.backgroundImage ? `background-image: url('${data.backgroundImage}')` : '',
      data.backgroundImage ? `background-size: cover` : '',
      data.backgroundImage ? `background-position: center` : '',
      data.backgroundImage ? `background-repeat: no-repeat` : '',
      data.height && data.height !== 'auto' ? `height: ${data.height}` : '',
      data.width ? `width: ${data.width}` : 'width: 100%',
      data.padding ? `padding: ${data.padding.top ?? 20}px ${data.padding.right ?? 20}px ${data.padding.bottom ?? 20}px ${data.padding.left ?? 20}px` : 'padding: 20px',
      data.margin ? `margin: ${data.margin.top ?? 0}px ${data.margin.right ?? 0}px ${data.margin.bottom ?? 0}px ${data.margin.left ?? 0}px` : '',
      data.border ? `border: ${data.border.width ?? 1}px ${data.border.style || 'solid'} ${data.border.color || '#dddddd'}` : 'border: 1px solid #dddddd',
      data.border?.radius ? `border-radius: ${data.border.radius}px` : '',
      'box-sizing: border-box'
    ].filter(Boolean).join('; ');

    const children = data.children || [];
    const contentHtml = children.length > 0
      ? children.map((child: any) => widgetToHTML(child)).join('')
      : (data.content || '');

    return `
      <div style="${styles}">
        ${contentHtml}
      </div>`;
  },

  // ========== 22. ROW WIDGET ==========
  // ========== 22. ROW WIDGET ==========
  'row': (d) => {
    const data = d || {};
    const colCount = data.columns || 2;
    const gap = data.gap || 20;
    const backgroundColor = data.backgroundColor || 'transparent';
    const columnsData = data.columnsData || [];

    // Calculate column width percentages
    const colWidth = Math.floor(100 / colCount);

    const containerStyles = [
      `background-color: ${backgroundColor}`,
      'width: 100%',
      'border-collapse: collapse'
    ].filter(Boolean).join('; ');

    let colsHtml = '';

    for (let i = 0; i < colCount; i++) {
      const colData = columnsData[i];
      let childrenHtml = '';

      if (colData && colData.children && colData.children.length > 0) {
        childrenHtml = colData.children.map((child: any) => {
          return widgetToHTML(child);
        }).join('');
      }

      // Apply gap as padding
      const padding = gap / 2;

      // Use a wrapper div for padding inside TD to ensure gap logic works visually similar to grid
      colsHtml += `
          <td width="${colWidth}%" style="width: ${colWidth}%; padding: ${padding}px; vertical-align: top;">
            ${childrenHtml}
          </td>`;
    }

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${containerStyles}">
        <tr>
          ${colsHtml}
        </tr>
      </table>`;
  },

  // ========== 23. SOCIAL FOLLOW WIDGET ==========
  'socialFollow': (d) => {
    const data = d || {};
    const platforms = data.platforms || [];

    const containerStyles = [
      `text-align: center`,
      `padding: 16px 0`
    ].filter(Boolean).join('; ');

    const iconsHtml = platforms.map((platform: any, index: number) => {
      const iconHtml = getSocialIconHtml(platform.icon || 'link', data.iconSize || 24, data.iconColor || '#666666');
      return `
        <a href="${escapeHtml(platform.url || '#')}" 
           style="display: inline-block; margin: 0 ${data.spacing || 12}px; text-decoration: none;"
           target="_blank" rel="noopener"
           title="${escapeHtml(platform.name || 'Social Media')}">
          ${iconHtml}
        </a>
      `;
    }).join('');

    return `<div style="${containerStyles}">${iconsHtml || '<span style="color: #6c757d;">No social platforms added</span>'}</div>`;
  },

  // ========== 22. VIDEO WIDGET ==========
  'video': (d) => {
    const data = d || {};
    const videoUrl = data.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

    // Extract YouTube video ID
    const videoId = videoUrl.includes('youtube.com')
      ? videoUrl.split('v=')[1]?.split('&')[0]
      : videoUrl.includes('youtu.be')
        ? videoUrl.split('/').pop()?.split('?')[0]
        : null;

    const styles = [
      `width: ${data.width || '100%'}`,
      `height: ${data.height || '315px'}`,
      'border: none'
    ].filter(Boolean).join('; ');

    if (videoId) {
      const autoplay = data.autoplay ? '?autoplay=1' : '';
      const controls = data.controls !== false ? '&controls=1' : '&controls=0';
      const videoThumbnail = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const playIcon = 'https://cdn.tools.unlayer.com/image/play-button.png'; // Or generic play icon

      return `
        <div style="position: relative; width: 100%; max-width: ${data.width || '100%'}; margin: 0 auto;">
          <a href="${escapeHtml(videoUrl)}" target="_blank" rel="noopener" style="display: block; position: relative;">
            <img src="${videoThumbnail}" alt="Play Video" style="width: 100%; height: auto; display: block;" />
            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 64px; height: 64px; background-color: rgba(0,0,0,0.6); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
               <div style="width: 0; height: 0; border-left: 20px solid white; border-top: 12px solid transparent; border-bottom: 12px solid transparent; margin-left: 4px;"></div>
            </div>
          </a>
        </div>
      `;
    }

    return `<div style="background-color: #f8f9fa; border: 2px dashed #dee2e6; padding: 40px; text-align: center; color: #6c757d;">
      <div style="font-weight: bold; margin-bottom: 8px;">Video Player</div>
      <div style="font-size: 13px;">Unsupported video URL</div>
    </div>`;
  },

  // ========== 24. COUNTDOWN WIDGET ==========
  'countdown': (d) => {
    const data = d || {};
    const title = data.title || '';
    const footer = data.footer || '';
    const titleColor = data.titleColor || '#000000';
    const footerColor = data.footerColor || '#000000';
    const labelColor = data.labelColor || '#333333';
    const boxBgColor = data.backgroundColor || '#d32f2f';
    const valColor = data.textColor || '#ffffff';
    const containerBg = data.containerBgColor && data.containerBgColor !== 'transparent' ? `background-color: ${data.containerBgColor}` : '';

    const units = [
      { label: data.daysLabel || 'Days', value: '07', show: data.showDays !== false },
      { label: data.hoursLabel || 'Hours', value: '02', show: data.showHours !== false },
      { label: data.minutesLabel || 'Minutes', value: '01', show: data.showMinutes !== false },
      { label: data.secondsLabel || 'Seconds', value: '03', show: data.showSeconds !== false }
    ].filter(unit => unit.show);

    const unitsHtml = units.map(unit => `
      <td align="center" style="padding: 0 10px;">
        <div style="color: ${labelColor}; font-size: 14px; font-weight: 500; margin-bottom: 8px; font-family: sans-serif;">${escapeHtml(unit.label)}</div>
        <table role="presentation" cellpadding="0" cellspacing="0" style="background-color: ${boxBgColor}; border-radius: 12px; width: 80px; height: 80px;">
          <tr>
            <td align="center" valign="middle" style="color: ${valColor}; font-size: 32px; font-weight: bold; font-family: sans-serif;">
              ${unit.value}
            </td>
          </tr>
        </table>
      </td>
    `).join('');

    return `
      <div style="padding: 30px 20px; text-align: center; ${containerBg}">
        ${title ? `<div style="color: ${titleColor}; font-size: 32px; font-weight: 900; text-transform: uppercase; margin-bottom: 25px; font-family: sans-serif;">${escapeHtml(title)}</div>` : ''}
        <table role="presentation" cellpadding="0" cellspacing="0" align="center">
          <tr>
            ${unitsHtml}
          </tr>
        </table>
        ${footer ? `<div style="color: ${footerColor}; font-size: 24px; font-weight: bold; margin-top: 25px; font-family: sans-serif;">${escapeHtml(footer)}</div>` : ''}
      </div>
    `;
  },

  // ========== 27. PROMO CODE WIDGET ==========
  'promoCode': (d) => {
    const data = d || {};
    const styles = [
      `background-color: ${data.backgroundColor || '#ffeb3b'}`,
      `color: ${data.textColor || '#333333'}`,
      'border: 2px dashed #ffc107',
      'border-radius: 8px',
      'padding: 20px',
      'text-align: center',
      'font-family: monospace'
    ].filter(Boolean).join('; ');

    return `
      <div style="${styles}">
        <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${escapeHtml(data.title || 'SPECIAL OFFER!')}</div>
        <div style="font-size: 28px; font-weight: bold; letter-spacing: 2px; margin-bottom: 8px;">${escapeHtml(data.code || 'SAVE20')}</div>
        <div style="font-size: 14px; margin-bottom: 8px;">${escapeHtml(data.description || 'Use this code to get 20% off your purchase!')}</div>
        ${data.validUntil ? `<div style="font-size: 12px; opacity: 0.8;">Valid until: ${escapeHtml(data.validUntil)}</div>` : ''}
      </div>
    `;
  },

  // ========== 28. PRICE WIDGET ==========
  // ========== 28. PRICE WIDGET ==========
  'price': (d) => {
    const data = d || {};
    const features = data.features || [];

    // Format amount based on decimals and showDecimals settings
    let formattedAmount = data.amount || '0';
    if (!data.amount) {
      formattedAmount = '0';
    } else {
      const amountNum = parseFloat((data.amount || "").toString().replace(/[^0-9.-]+/g, ""));
      if (!isNaN(amountNum)) {
        let decimalPlaces = 2; // Default
        if (data.showDecimals === false) {
          decimalPlaces = 0;
        } else if (data.decimals !== undefined) {
          decimalPlaces = parseInt(data.decimals, 10);
        }
        formattedAmount = amountNum.toFixed(decimalPlaces);
      }
    }

    const currencySymbol = data.showCurrencySymbol !== false ? (data.currencySymbol || '$') : '';
    const currencyCode = data.showCurrencyCode !== false ? (data.currency || 'USD') : '';

    const styles = [
      'border: 2px solid #dee2e6',
      'border-radius: 12px',
      'overflow: hidden',
      'background-color: #ffffff',
      'text-align: center'
    ].filter(Boolean).join('; ');

    const featuresHtml = features.map((feature: string) => `
      <div style="padding: 8px 0; border-bottom: 1px solid #f1f3f5;">
        <span style="color: #28a745; margin-right: 8px;">✓</span>
        ${escapeHtml(feature)}
      </div>
    `).join('');

    return `
      <div style="${styles}">
        <div style="background-color: #f8f9fa; padding: 24px; border-bottom: 2px solid #dee2e6;">
          <div style="font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">${escapeHtml(data.label || 'Price')}</div>
          <div style="font-size: 48px; font-weight: bold; color: #2d3748; margin-bottom: 4px;">
            <span style="font-size: 24px; vertical-align: super;">${escapeHtml(currencySymbol)}</span>
            ${escapeHtml(formattedAmount)}
            <span style="font-size: 0.5em; color: #666; vertical-align: middle;">${escapeHtml(currencyCode)}</span>
          </div>
          <div style="font-size: 16px; color: #6c757d;">${escapeHtml(data.period || '')}</div>
        </div>
        <div style="padding: 24px;">
          <div style="margin-bottom: 16px;">
            ${featuresHtml || '<div style="color: #6c757d; font-style: italic;">No features listed</div>'}
          </div>
          <a href="${escapeHtml(data.buttonUrl || '#')}" 
             style="display: inline-block; background-color: #007bff; color: white; padding: 12px 32px; border-radius: 6px; text-decoration: none; font-weight: bold; font-size: 16px; width: 100%; box-sizing: border-box;">
            ${escapeHtml(data.buttonText || 'Get Started')}
          </a>
        </div>
      </div>
    `;
  },





  'emailHeader': (d) => {
    const data = d || {};
    const bgColor = data.backgroundColor || '#25A2D0';
    const textColor = data.textColor || '#ffffff';
    const logoAlign = data.logoAlign || 'left';
    const textAlign = data.textAlign || 'center';

    const styles = [
      `background-color: ${bgColor}`,
      `color: ${textColor}`,
      data.fontFamily && `font-family: ${data.fontFamily}`
    ].filter(Boolean).join('; ');

    const logoMargin = logoAlign === 'left' ? '0 auto 0 0' : logoAlign === 'right' ? '0 0 0 auto' : '0 auto';

    const logoHtml = (data.showLogo !== false && data.logoUrl) ? `
      <div style="text-align: ${logoAlign}; width: 100%;">
        <img src="${escapeHtml(data.logoUrl)}" width="${escapeHtml(data.logoWidth || '150')}" style="max-width: 100%; height: auto; display: inline-block; margin: ${logoMargin};" alt="Store Logo">
      </div>
    ` : '';

    const titleHtml = data.title ? `
      <div style="margin-top: 8px; text-align: ${textAlign}; color: ${textColor}; font-size: ${data.fontSize || '28px'}; font-weight: ${data.fontWeight || 'bold'}; font-family: ${data.fontFamily || 'Arial, sans-serif'}; line-height: 1.3;">
        ${escapeHtml(data.title)}
      </div>
    ` : '';

    return `
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${styles}">
      <tr>
        <td style="padding: ${getPaddingStyle(data.padding, '15px')};">
          ${logoHtml}
          ${titleHtml}
        </td>
      </tr>
    </table>`;
  },

  // ========== 43. EMAIL FOOTER WIDGET ==========
  'emailFooter': (d) => {
    const data = d || {};
    const textAlign = data.textAlign || 'center';

    const styles = [
      `background-color: ${data.backgroundColor || '#333333'}`,
      `color: ${data.textColor || '#ffffff'}`,
      `text-align: ${textAlign}`,
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`
    ].filter(Boolean).join('; ');

    const linkColor = data.linkColor || '#4CAF50';

    // Social icons with proper links
    const icons = data.socialIcons?.icons || [];
    const urls = data.socialIcons?.urls || [];

    // Determine alignment for flex-like behavior in tables
    const socialMargin = textAlign === 'left' ? '0 auto 15px 0' : textAlign === 'right' ? '0 0 15px auto' : '0 auto 15px';

    const socialIconsHtml = (data.showSocialMedia !== false && icons.length > 0) ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin: ${socialMargin}; border-collapse: collapse;">
        <tr>
          ${icons.map((icon: string, index: number) => {
      const url = urls[index] || '#';
      const iconImg = getSocialIconHtml(icon, 32);
      return `
               <td style="padding: 0 5px;">
                 <a href="${escapeHtml(url)}" style="text-decoration: none;" target="_blank" rel="noopener">
                   ${iconImg}
                 </a>
               </td>`;
    }).join('')}
        </tr>
      </table>
    ` : '';

    const addressHtml = data.showAddress !== false ? `
      <div style="margin-bottom: 10px; font-size: inherit; color: inherit;">
        ${escapeHtml(data.storeAddress || '{{store_address}}')}
      </div>
    ` : '';

    const contactHtml = data.showContact !== false ? `
      <div style="margin-bottom: 10px; font-size: inherit; color: inherit;">
        ${data.emailLabel || 'Email:'} ${escapeHtml(data.contactEmail || '{{store_email}}')} | ${data.phoneLabel || 'Phone:'} ${escapeHtml(data.contactPhone || '{{store_phone}}')}
      </div>
    ` : '';

    const legalLinksHtml = data.showLegal !== false ? `
      <div style="margin-bottom: 15px; font-size: inherit;">
        ${data.privacyLinkUrl ? `<a href="${escapeHtml(data.privacyLinkUrl)}" style="color: ${linkColor}; margin: 0 10px; text-decoration: none;" target="_blank" rel="noopener">${escapeHtml(data.privacyLinkText || 'Privacy Policy')}</a>` : ''}
        ${data.termsLinkUrl ? `<a href="${escapeHtml(data.termsLinkUrl)}" style="color: ${linkColor}; margin: 0 10px; text-decoration: none;" target="_blank" rel="noopener">${escapeHtml(data.termsLinkText || 'Terms & Conditions')}</a>` : ''}
      </div>
    ` : '';

    const currentYear = String(new Date().getFullYear());
    const copyrightContent = data.copyrightText
      ? data.copyrightText.replace('{{year}}', currentYear).replace('{{current_year}}', currentYear)
      : `&copy; ${currentYear} ${escapeHtml(data.storeName || '{{site_title}}')}. All rights reserved.`;

    const copyrightHtml = data.showCopyright !== false ? `
      <div style="font-size: inherit; opacity: 0.8; color: inherit;">
          ${copyrightContent}
      </div>
    ` : '';

    const defaultFooterOrder = ['social', 'address', 'contact', 'legal', 'copyright'];
    const footerOrder = Array.isArray(data.footerOrder)
      ? [
        ...data.footerOrder.filter((section: string) => defaultFooterOrder.includes(section)),
        ...defaultFooterOrder.filter(section => !data.footerOrder.includes(section)),
      ]
      : defaultFooterOrder;
    const footerSections: Record<string, string> = {
      social: socialIconsHtml,
      address: addressHtml,
      contact: contactHtml,
      legal: legalLinksHtml,
      copyright: copyrightHtml,
    };

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${styles}">
        <tr>
          <td style="padding: ${getPaddingStyle(data.padding, '30px 20px')};">
            ${footerOrder.map(section => footerSections[section] || '').join('')}
          </td>
        </tr>
      </table>
    `;
  },

  // ========== 44. CTA BUTTON WIDGET ==========
  'ctaButton': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};

    const containerStyles = [
      `text-align: ${data.alignment || 'center'}`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const cellStyles = [
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
      toCssString(sub.button_container || {}),
    ].filter(Boolean).join('; ');

    const buttonStyles = [
      `background-color: ${data.backgroundColor || '#4CAF50'}`,
      `color: ${data.textColor || '#ffffff'}`,
      data.fontFamily && `font-family: ${data.fontFamily}`,
      `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize || '16px'}`,
      `padding: 12px 24px`,
      `text-decoration: none`,
      `border-radius: 4px`,
      `display: inline-block`,
      `font-weight: bold`,
      data.widthAuto === false && data.width !== undefined ? `width: ${data.width}%` : '',
      data.widthAuto === false && data.width !== undefined ? `box-sizing: border-box` : '',
      toCssString(sub.button_elem || {}),
    ].filter(Boolean).join('; ');

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${containerStyles}">
        <tr>
          <td style="${cellStyles}">
            <a href="${escapeHtml(data.buttonUrl || '#')}" style="${buttonStyles}" target="_blank" rel="noopener">
              ${escapeHtml(data.buttonText || 'Click Here')}
            </a>
          </td>
        </tr>
      </table>`;
  },

  // ========== 45. RELATED PRODUCTS WIDGET ==========
  'relatedProducts': (d) => {
    const data = d || {};
    const styles = [
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
      `background-color: ${data.backgroundColor || '#f9f9f9'}`,
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`
    ].filter(Boolean).join('; ');

    const titleStyles = [
      `text-align: center`,
      `margin-bottom: 20px`,
      `font-weight: ${data.titleFontWeight || 'bold'}`,
      `color: ${data.titleColor || '#333333'}`,
      `font-size: 24px` // Approx h5
    ].filter(Boolean).join('; ');

    const cardStyles = [
      `background-color: #fff`,
      `height: 100%`,
      `display: flex`,
      `flex-direction: column`,
      data.showCardShadow !== false ? (data.cardShadow ? `box-shadow: ${data.cardShadow}` : `box-shadow: 0 2px 4px rgba(0,0,0,0.1)`) : '',
      `border-radius: 4px`,
      `overflow: hidden`
    ].filter(Boolean).join('; ');

    // Generate strict placeholders for products
    // We'll generate the requested number of product slots (productsToShow)
    // using placeholders {{product_name_1}}, {{product_price_1}} etc.
    const count = data.productsToShow || 3;
    let productsHtml = '';

    for (let i = 1; i <= count; i++) {
      const name = data.useManualData ? (data[`p${i}_name`] || `{{product_name_${i}}}`) : `{{product_name_${i}}}`;
      const price = data.useManualData ? (data[`p${i}_price`] || `{{product_price_${i}}}`) : `{{product_price_${i}}}`;
      const image = data.useManualData ? (data[`p${i}_image`] || `{{product_image_${i}}}`) : `{{product_image_${i}}}`;
      const url = data.useManualData ? (data[`p${i}_url`] || `{{product_url_${i}}}`) : `{{product_url_${i}}}`;

      const imgHtml = data.showImages !== false ? `
          <img src="${escapeHtml(image)}" alt="${escapeHtml(name)}" style="width: 100%; height: 200px; object-fit: cover; display: block;" />
        ` : '';

      productsHtml += `
          <div style="width: 30%; min-width: 200px; flex-grow: 1; margin: 10px;">
            <div style="${cardStyles}">
              ${imgHtml}
              <div style="padding: 16px; text-align: center; flex-grow: 1;">
                 <div style="font-size: 16px; margin-bottom: 8px; font-weight: bold;">${escapeHtml(name)}</div>
                 <div style="color: ${data.priceColor || '#4CAF50'}; font-weight: bold; margin-bottom: 10px; font-size: 16px;">${escapeHtml(price)}</div>
                 <a href="${escapeHtml(url)}" style="
                    display: inline-block;
                    background-color: ${data.buttonColor || '#4CAF50'};
                    color: #fff;
                    padding: 6px 16px;
                    border-radius: 4px;
                    text-decoration: none;
                    font-size: 14px;
                 ">${data.buttonText || 'View Product'}</a>
              </div>
            </div>
          </div>
        `;
    }

    return `
      <div style="${styles}">
        <div style="${titleStyles}">
          ${data.title || '{{related_products_title}}'}
        </div>
        <div style="display: flex; flex-wrap: wrap; justify-content: center;">
          ${productsHtml}
        </div>
      </div>
    `;
  },

  'orderSubtotal': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const spacing = data.spacing || 0;
    const padding = getPaddingStyle(data.padding, '10px');
    const labelAlign = data.labelAlign || 'left';
    const valueAlign = data.valueAlign || 'right';
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || '#eeeeee';
    const lastColumnWidth = data.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    // Outer Styles
    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      `padding: ${borderWidth > 0 ? '0' : padding}`, // Remove outer padding if grid is active
      borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor}` : '',
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const tableStyles = `width: 100%; border-collapse: collapse; font-family: inherit; font-size: inherit; color: inherit;`;

    // Cell styling logic
    const getCellPadding = () => borderWidth > 0 ? (padding === '0px' ? '10px' : padding) : `${spacing}px 0`;
    const commonCellStyles = [
      borderWidth > 0 ? `padding: ${getCellPadding()}` : `padding: ${getCellPadding()}`,
      `word-break: break-word`,
      `white-space: normal`,
      `overflow: visible`,
      `text-overflow: clip`,
    ].join('; ');

    const rowContainerStyle = toCssString(sub.row_container || {});
    const labelPStyle = toCssString(sub.label_p || {});
    const valuePStyle = toCssString(sub.value_p || {});
    const totalsRowStyle = (id: string) => toCssString(sub[`${id}_container`] || sub.row_container || {});
    const totalsLabelStyle = (id: string) => toCssString(sub[`${id}_label`] || sub.label_p || {});
    const totalsValueStyle = (id: string) => toCssString(sub[`${id}_value`] || sub.value_p || {});

    const rows = [
      { id: 'subtotal', label: escapeHtml(data.subtotalLabel || 'Subtotal'), value: escapeHtml(data.subtotalValue || '{{order_subtotal}}') },
      { id: 'discount', label: escapeHtml(data.discountLabel || 'Discount'), value: `-${escapeHtml(data.discountValue || '{{order_discount}}')}`, color: '#e53e3e' },
      { id: 'coupon_discount', label: escapeHtml(data.couponDiscountLabel || 'Coupon savings'), value: `-${escapeHtml(data.couponDiscountValue || '{{coupon_discount}}')}`, color: '#e53e3e' },
      { id: 'sale_discount', label: escapeHtml(data.saleDiscountLabel || 'Sale discount'), value: `-${escapeHtml(data.saleDiscountValue || '{{sale_discount}}')}`, color: '#e53e3e' },
      { id: 'shipping', label: escapeHtml(data.shippingLabel || 'Shipping'), value: escapeHtml(data.shippingValue || '{{order_shipping}}') },
      { id: 'refunded_full', label: escapeHtml(data.refundedFullyLabel || 'Order fully refunded'), value: `-${escapeHtml(data.refundedFullyValue || '{{order_total}}')}`, weight: 'bold', border: true }, // Logic handled below
      { id: 'refunded_partial', label: escapeHtml(data.refundedPartialLabel || 'Refund'), value: `-${escapeHtml(data.refundedPartialValue || '{{refund_amount}}')}` },
    ];
    const defaultOrderSubtotalRowOrder = ['subtotal', 'discount', 'coupon_discount', 'sale_discount', 'shipping', 'refunded_full', 'refunded_partial'];
    const orderSubtotalRowOrder = Array.isArray(data.orderSubtotalRowOrder)
      ? [
        ...data.orderSubtotalRowOrder.filter((rowId: string) => defaultOrderSubtotalRowOrder.includes(rowId)),
        ...defaultOrderSubtotalRowOrder.filter(rowId => !data.orderSubtotalRowOrder.includes(rowId)),
      ]
      : defaultOrderSubtotalRowOrder;
    const orderedRows = orderSubtotalRowOrder
      .map((rowId: string) => rows.find(row => row.id === rowId))
      .filter(Boolean) as typeof rows;

    const innerContent = (data.value === '{{order_totals_table}}' || data.value === '{{order_subtotal}}' || !data.value) ? `
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${tableStyles}">
          ${orderedRows.map((row, index) => {
      // Border Logic matches React
      const borderBottom = (index < 4 && borderWidth > 0) ? `border-bottom: ${borderWidth}px solid ${borderColor};` : '';
      const borderTop = (row.border && !borderWidth) ? 'border-top: 1px solid #eee;' : '';
      const borderRight = borderWidth > 0 ? `border-right: ${borderWidth}px solid ${borderColor};` : '';
      const verticalAlign = borderWidth > 0 ? 'middle' : 'top'; // Stretch effect simulation

      return `
            <tr style="${totalsRowStyle(row.id)}">
              <td align="${labelAlign === 'center' ? 'center' : (labelAlign === 'right' ? 'right' : 'left')}" width="${labelColumnWidth}%" style="${commonCellStyles}; ${borderBottom} ${borderRight} ${borderTop} font-weight: ${row.weight || data.fontWeight || 'bold'}; ${row.color ? `color: ${row.color};` : ''} vertical-align: ${verticalAlign}; ${totalsLabelStyle(row.id)}">
                ${row.label}:
              </td>
              <td align="${valueAlign === 'center' ? 'center' : (valueAlign === 'left' ? 'left' : 'right')}" width="${lastColumnWidth}%" style="${commonCellStyles}; ${borderBottom} ${borderTop} ${row.weight ? `font-weight: ${row.weight};` : ''} ${row.color ? `color: ${row.color};` : ''} vertical-align: ${verticalAlign}; ${totalsValueStyle(row.id)}">
                ${row.value}
              </td>
            </tr>
          `;
    }).join('')}
        </table>` : `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${tableStyles}">
        <tr style="${rowContainerStyle}">
          <td align="${labelAlign}" width="${labelColumnWidth}%" style="font-weight: ${data.fontWeight || 'bold'}; ${commonCellStyles} ${borderWidth > 0 ? `border-right: ${borderWidth}px solid ${borderColor};` : ''}; ${labelPStyle}">${escapeHtml(data.label || 'Subtotal')}:</td>
          <td align="${valueAlign}" width="${lastColumnWidth}%" style="${commonCellStyles}; ${valuePStyle}">${escapeHtml(data.value)}</td>
        </tr>
      </table>`;

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${styles}">
        <tr>
          <td style="padding: ${borderWidth > 0 ? '0' : padding};">
            ${innerContent}
          </td>
        </tr>
      </table>
    `;
  },

  // ========== 47. ORDER TOTAL WIDGET ==========
  'orderTotal': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const padding = getPaddingStyle(data.padding, '10px');
    const labelAlign = data.labelAlign || 'left';
    const valueAlign = data.valueAlign || 'right';
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || '#eeeeee';
    const lastColumnWidth = data.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${borderWidth > 0 ? '0' : padding}`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    // Only apply border to the outer table if width > 0
    const outerTableStyles = `width: 100%; border-collapse: collapse; ${styles}; ${borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''}`;

    // Cell Padding: If border exists, move padding inside cells.
    const cellPadding = borderWidth > 0 ? (padding === '0px' ? '10px' : padding) : '5px 0';
    const verticalAlign = borderWidth > 0 ? 'middle' : 'top';

    const rowContainerStyle = toCssString(sub.row_container || {});
    const labelPStyle = toCssString(sub.label_p || {});
    const valuePStyle = toCssString(sub.value_p || {});

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${outerTableStyles}">
        <tr>
          <td style="padding: ${borderWidth > 0 ? '0' : padding};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; color: inherit; font-family: inherit; font-size: inherit;">
              <tr style="${rowContainerStyle}">
                <td align="${labelAlign === 'center' ? 'center' : (labelAlign === 'right' ? 'right' : 'left')}" width="${labelColumnWidth}%" style="font-size: 1.2em; padding: ${cellPadding}; ${borderWidth > 0 ? `border-right: ${borderWidth}px solid ${borderColor};` : ''} vertical-align: ${verticalAlign}; ${labelPStyle}">${escapeHtml(data.label || 'Total')}:</td>
                <td align="${valueAlign === 'center' ? 'center' : (valueAlign === 'left' ? 'left' : 'right')}" width="${lastColumnWidth}%" style="font-size: 1.2em; padding: ${cellPadding}; vertical-align: ${verticalAlign}; ${valuePStyle}">${escapeHtml(data.value || '{{order_total}}')}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  },

  // ========== 48. SHIPPING METHOD WIDGET ==========
  'shippingMethod': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const padding = getPaddingStyle(data.padding, '10px');
    const labelAlign = data.labelAlign || 'left';
    const valueAlign = data.valueAlign || 'right';
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || '#eeeeee';
    const lastColumnWidth = data.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${borderWidth > 0 ? '0' : padding}`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const outerTableStyles = `width: 100%; border-collapse: collapse; ${styles}; ${borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''}`;
    const cellPadding = borderWidth > 0 ? (padding === '0px' ? '10px' : padding) : '5px 0';
    const verticalAlign = borderWidth > 0 ? 'middle' : 'top';

    const rowContainerStyle = toCssString(sub.row_container || {});
    const labelPStyle = toCssString(sub.label_p || {});
    const valuePStyle = toCssString(sub.value_p || {});

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${outerTableStyles}">
        <tr>
          <td style="padding: ${borderWidth > 0 ? '0' : padding};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; color: inherit; font-family: inherit; font-size: inherit;">
              <tr style="${rowContainerStyle}">
                <td align="${labelAlign === 'center' ? 'center' : (labelAlign === 'right' ? 'right' : 'left')}" width="${labelColumnWidth}%" style="padding: ${cellPadding}; ${borderWidth > 0 ? `border-right: ${borderWidth}px solid ${borderColor};` : ''} vertical-align: ${verticalAlign}; ${labelPStyle}">${escapeHtml(data.label || 'Shipping Method')}:</td>
                <td align="${valueAlign === 'center' ? 'center' : (valueAlign === 'left' ? 'left' : 'right')}" width="${lastColumnWidth}%" style="padding: ${cellPadding}; vertical-align: ${verticalAlign}; ${valuePStyle}">${escapeHtml(data.value || '{{shipping_method}}')}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  },

  // ========== 49. PAYMENT METHOD WIDGET ==========
  'paymentMethod': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const padding = getPaddingStyle(data.padding, '10px');
    const labelAlign = data.labelAlign || 'left';
    const valueAlign = data.valueAlign || 'right';
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || '#eeeeee';
    const lastColumnWidth = data.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${borderWidth > 0 ? '0' : padding}`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const outerTableStyles = `width: ${data.width || '100%'}; border-collapse: collapse; ${styles}; ${borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''}`;
    const cellPadding = borderWidth > 0 ? (padding === '0px' ? '10px' : padding) : '5px 0';
    const verticalAlign = borderWidth > 0 ? 'middle' : 'top';

    const rowContainerStyle = toCssString(sub.row_container || {});
    const labelPStyle = toCssString(sub.label_p || {});
    const valuePStyle = toCssString(sub.value_p || {});

    return `
      <table width="${data.width || '100%'}" cellpadding="0" cellspacing="0" role="presentation" style="${outerTableStyles}">
        <tr>
          <td style="padding: ${borderWidth > 0 ? '0' : padding};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; color: inherit; font-family: inherit; font-size: inherit;">
              <tr style="${rowContainerStyle}">
                <td align="${labelAlign === 'center' ? 'center' : (labelAlign === 'right' ? 'right' : 'left')}" width="${labelColumnWidth}%" style="padding: ${cellPadding}; ${borderWidth > 0 ? `border-right: ${borderWidth}px solid ${borderColor};` : ''} vertical-align: ${verticalAlign}; ${labelPStyle}">${escapeHtml(data.label || 'Payment Method')}:</td>
                <td align="${valueAlign === 'center' ? 'center' : (valueAlign === 'left' ? 'left' : 'right')}" width="${lastColumnWidth}%" style="padding: ${cellPadding}; vertical-align: ${verticalAlign}; ${valuePStyle}">${escapeHtml(data.value || '{{payment_method}}')}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  },

  // ========== 50. CUSTOMER NOTE WIDGET ==========
  'customerNote': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const padding = getPaddingStyle(data.padding, '10px');
    const labelAlign = data.labelAlign || 'left';
    const valueAlign = data.valueAlign || 'right';
    const borderWidth = data.borderWidth || 0;
    const borderColor = data.borderColor || '#eeeeee';
    const lastColumnWidth = data.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    const styles = [
      data.fontFamily && `font-family: ${data.fontFamily}`,
      data.fontSize && `font-size: ${typeof data.fontSize === 'number' ? data.fontSize + 'px' : data.fontSize}`,
      data.textColor && `color: ${data.textColor}`,
      data.fontWeight && `font-weight: ${data.fontWeight}`,
      data.lineHeight && `line-height: ${data.lineHeight}px`,
      data.backgroundColor && data.backgroundColor !== 'transparent' ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${borderWidth > 0 ? '0' : padding}`,
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    const outerTableStyles = `width: 100%; border-collapse: collapse; ${styles}; ${borderWidth > 0 ? `border: ${borderWidth}px solid ${borderColor};` : ''}`;
    const cellPadding = borderWidth > 0 ? (padding === '0px' ? '10px' : padding) : '5px 0';
    const verticalAlign = borderWidth > 0 ? 'middle' : 'top';
    const label = data.label === 'Customer Note' || !data.label ? 'Note' : data.label;

    const noteContainerStyle = toCssString(sub.note_container || {});
    const noteLabelStyle = [
      `padding: ${cellPadding}`,
      borderWidth > 0 && `border-right: ${borderWidth}px solid ${borderColor}`,
      `vertical-align: ${verticalAlign}`,
      toCssString(sub.note_label || {}),
    ].filter(Boolean).join('; ');

    const noteValueStyle = [
      `padding: ${cellPadding}`,
      `vertical-align: ${verticalAlign}`,
      toCssString(sub.note_value || {}),
    ].filter(Boolean).join('; ');

    return `
      <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="${outerTableStyles}">
        <tr style="${noteContainerStyle}">
          <td style="padding: ${borderWidth > 0 ? '0' : padding};">
            <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border-collapse: collapse; color: inherit; font-family: inherit; font-size: inherit;">
              <tr>
                <td align="${labelAlign === 'center' ? 'center' : (labelAlign === 'right' ? 'right' : 'left')}" width="${labelColumnWidth}%" style="${noteLabelStyle}">${escapeHtml(label)}:</td>
                <td align="${valueAlign === 'center' ? 'center' : (valueAlign === 'left' ? 'left' : 'right')}" width="${lastColumnWidth}%" style="${noteValueStyle}">${escapeHtml(data.value || '{{customer_note}}')}</td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    `;
  },


  // ========== 51. CONTACT WIDGET ==========
  'contact': (d) => {
    const data = d || {};
    const sub = data.subStyles || {};
    const padding = getPaddingStyle(data.padding, '10px');
    const align = data.textAlign || 'center';

    const styles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      data.textColor ? `color: ${data.textColor}` : '',
      data.fontFamily ? `font-family: ${data.fontFamily}` : '',
      data.fontWeight ? `font-weight: ${data.fontWeight}` : '',
      data.lineHeight ? `line-height: ${data.lineHeight}px` : '',
      `padding: ${padding}`,
      `text-align: ${align}`
    ].filter(Boolean).join('; ');

    const iconSize = data.iconSize || 20;
    const items: Array<{ icon: string; type: string; text: string }> = [];

    if (data.showUrl !== false) {
      items.push({ icon: 'home', type: 'url', text: data.url || '{{site_url}}' });
    }
    if (data.showEmail !== false) {
      items.push({ icon: 'email', type: 'email', text: data.email || '{{admin_email}}' });
    }
    if (data.showPhone !== false) {
      items.push({ icon: 'phone', type: 'phone', text: data.phone || '' });
    }
    const defaultContactRowOrder = ['url', 'email', 'phone'];
    const savedContactRowOrder = Array.isArray(data.contactRowOrder) ? data.contactRowOrder : [];
    const contactRowOrder = [
      ...savedContactRowOrder.filter((rowId: string) => defaultContactRowOrder.includes(rowId)),
      ...defaultContactRowOrder.filter(rowId => !savedContactRowOrder.includes(rowId)),
    ];
    const orderedItems = contactRowOrder
      .map(rowId => items.find(item => item.type === rowId))
      .filter((item): item is { icon: string; type: string; text: string } => Boolean(item));

    const itemRows = orderedItems.map(item => {
      const itemSub = sub[`${item.type}_p`] || {};
      const subStyleStr = toCssString(itemSub);
      return `
      <tr style="${subStyleStr}">
        <td style="padding: 5px 5px 5px 0; width: ${iconSize}px; vertical-align: middle;">
           <img src="https://img.icons8.com/ios-filled/50/${data.iconColor ? data.iconColor.replace('#', '') : '333333'}/${item.icon}.png" width="${iconSize}" height="${iconSize}" style="display: block;" alt="${item.icon}" />
        </td>
        <td style="padding: 5px; text-align: left; vertical-align: middle;">
           <span style="font-size: ${data.fontSize || '14px'};">${escapeHtml(item.text)}</span>
        </td>
      </tr>
    `;
    }).join('');

    // Determine table alignment props
    const tableAlign = align === 'center' ? 'center' : (align === 'right' ? 'right' : 'left');
    const tableStyle = [
      'width: auto',
      data.fontFamily ? `font-family: ${data.fontFamily}` : '',
      data.textColor ? `color: ${data.textColor}` : '',
      (align === 'center' ? 'margin: 0 auto' : ''),
      (align === 'right' ? 'margin-left: auto' : ''),
    ].filter(Boolean).join('; ');

    const wrapperStyles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${padding}`,
      `text-align: ${align}`, // Aligns the table within the wrapper
      toCssString(sub.outer_container || {}),
    ].filter(Boolean).join('; ');

    return `
      <div style="${wrapperStyles}">
        <table align="${tableAlign}" cellpadding="0" cellspacing="0" role="presentation" style="${tableStyle}">
            ${itemRows}
        </table>
      </div>
    `;
  },

  // ========== 52. PRODUCT DETAILS WIDGET ==========
  'productDetails': (d) => {
    const data = d || {};
    // Product details typically rendered by WooCommerce placeholder {{email_order_items_table}}.
    // We wrap it to apply styles where possible, although WooCommerce styles might override.

    const styles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
    ].filter(Boolean).join('; ');

    const placeholder = (data.showImage) ? '{{order_details_table_with_images}}' : '{{order_details_table_basic}}';

    return `
      <div style="${styles}">
          ${placeholder}
      </div>
    `;
  },

  // ========== 21. PARAGRAPH ROW WIDGET ==========
  'paragraph-row': (d) => {
    const data = d || {};
    const children = data.children || [];

    if (data.hideIfEmpty && children.length === 0) {
      return '';
    }

    const paddingStr = getPaddingStyle(data.padding, '0px');
    const marginStr = getMarginStyle(data.margin, '0px 0px 8px 0px');
    const bgColor = data.backgroundColor || 'transparent';

    const rowStyles = [
      bgColor !== 'transparent' && `background-color: ${bgColor}`,
      `padding: ${paddingStr}`,
      `margin: ${marginStr}`,
      `width: 100%`,
      `border-collapse: collapse`
    ].filter(Boolean).join('; ');

    const layout = data.rowLayout || 'horizontal';
    const gap = data.gap || 10;
    const labelWidth = data.labelWidth || 120;

    if (layout === 'vertical') {
      const rowsHtml = children.map((child: any, idx: number) => {
        const childHtml = widgetToHTML(child);
        const paddingBottom = idx < children.length - 1 ? `padding-bottom: ${gap}px;` : '';
        return `<tr><td style="${paddingBottom}">${childHtml}</td></tr>`;
      }).join('');

      return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${rowStyles}">
        ${rowsHtml}
      </table>`;
    } else {
      const cellsHtml = children.map((child: any, idx: number) => {
        const childHtml = widgetToHTML(child);
        const isLabel = idx === 0;
        const widthAttr = isLabel ? ` width="${labelWidth}"` : '';
        const widthStyle = isLabel ? `width: ${labelWidth}px;` : '';
        const paddingRight = idx < children.length - 1 ? `padding-right: ${gap}px;` : '';

        return `<td valign="top"${widthAttr} style="${widthStyle}${paddingRight}">${childHtml}</td>`;
      }).join('');

      return `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${rowStyles}">
        <tr>
          ${cellsHtml}
        </tr>
      </table>`;
    }
  },

  // ========== 53. REFUND FULL WIDGET ==========
  'refundFull': (d) => {
    const data = d || {};
    const styles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
    ].filter(Boolean).join('; ');

    const innerStyles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `border: 1px solid ${data.borderColor || '#ffcccc'}`,
      `padding: 16px`,
      `font-family: ${data.fontFamily || 'inherit'}`,
      `font-size: ${data.fontSize || 14}px`,
      `color: ${data.textColor || '#333333'}`,
      data.fontWeight ? `font-weight: ${data.fontWeight}` : '',
      data.lineHeight ? `line-height: ${data.lineHeight}px` : '',
      data.letterSpace ? `letter-spacing: ${data.letterSpace}px` : '',
      data.textTransform ? `text-transform: ${data.textTransform}` : '',
      data.textDecoration ? `text-decoration: ${data.textDecoration}` : '',
      data.fontStyle ? `font-style: ${data.fontStyle}` : '',
      data.wordSpacing ? `word-spacing: ${data.wordSpacing}px` : '',
      `max-width: 500px`,
      `margin: 0 auto`,
    ].filter(Boolean).join('; ');

    const title = escapeHtml(data.title || 'Your order has been fully refunded');
    const amountLabel = escapeHtml(data.amountLabel || 'Refund Amount');
    const dateLabel = escapeHtml(data.dateLabel || 'Refund Date');
    const reasonLabel = escapeHtml(data.reasonLabel || 'Reason');

    return `
      <div class="wetc-refund-full-widget" style="${styles}">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${innerStyles}">
          <tr>
            <td style="padding-bottom: 16px;">
              <span style="display: block; font-weight: 700; font-size: 1.1em; color: ${data.textColor || '#333333'};">${title}</span>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: inherit; font-family: inherit;">
                <tr>
                  <td style="padding: 6px 8px; font-weight: 600; width: 40%; border-bottom: 1px solid ${data.borderColor || '#ffcccc'};">${amountLabel}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid ${data.borderColor || '#ffcccc'};">{{refund_amount}}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 8px; font-weight: 600; border-bottom: 1px solid ${data.borderColor || '#ffcccc'};">${dateLabel}</td>
                  <td style="padding: 6px 8px; border-bottom: 1px solid ${data.borderColor || '#ffcccc'};">{{refund_date}}</td>
                </tr>
                <tr>
                  <td style="padding: 6px 8px; font-weight: 600;">${reasonLabel}</td>
                  <td style="padding: 6px 8px;">{{refund_reason}}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  },

  // ========== 54. REFUND PARTIAL WIDGET ==========
  'refundPartial': (d) => {
    const data = d || {};
    const styles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `padding: ${getPaddingStyle(data.padding, '0px')}`,
      `margin: ${getMarginStyle(data.margin, '0px')}`,
    ].filter(Boolean).join('; ');

    const innerStyles = [
      data.backgroundColor ? `background-color: ${data.backgroundColor}` : '',
      `border: 1px solid ${data.borderColor || '#eeeeee'}`,
      `padding: 16px`,
      `font-family: ${data.fontFamily || 'inherit'}`,
      `font-size: ${data.fontSize || 14}px`,
      `color: ${data.textColor || '#333333'}`,
      data.fontWeight ? `font-weight: ${data.fontWeight}` : '',
      data.lineHeight ? `line-height: ${data.lineHeight}px` : '',
      data.letterSpace ? `letter-spacing: ${data.letterSpace}px` : '',
      data.textTransform ? `text-transform: ${data.textTransform}` : '',
      data.textDecoration ? `text-decoration: ${data.textDecoration}` : '',
      data.fontStyle ? `font-style: ${data.fontStyle}` : '',
      data.wordSpacing ? `word-spacing: ${data.wordSpacing}px` : '',
      `max-width: 500px`,
      `margin: 0 auto`,
    ].filter(Boolean).join('; ');

    const title = escapeHtml(data.title || 'Partial Refund');
    const headerBg = data.headerBackgroundColor || '#fff8f8';
    const headerColor = data.headerTextColor || '#333333';
    const borderColor = data.borderColor || '#eeeeee';
    const productHeader = escapeHtml(data.productHeader || 'Item');
    const amountHeader = escapeHtml(data.amountHeader || 'Refund Amount');
    const reasonLabel = escapeHtml(data.reasonLabel || 'Reason');

    return `
      <div class="wetc-refund-partial-widget" style="${styles}">
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="${innerStyles}">
          <tr>
            <td style="padding-bottom: 16px;">
              <span style="display: block; font-weight: 700; font-size: 1.1em; color: ${data.textColor || '#333333'};">${title}</span>
            </td>
          </tr>
          <tr>
            <td>
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size: inherit; font-family: inherit; border-collapse: collapse;">
                <thead>
                  <tr style="background-color: ${headerBg}; color: ${headerColor};">
                    <th style="padding: 8px; border: 1px solid ${borderColor}; text-align: left; width: 60%;">${productHeader}</th>
                    <th style="padding: 8px; border: 1px solid ${borderColor}; text-align: right; width: 40%;">${amountHeader}</th>
                  </tr>
                </thead>
                <tbody>
                  {{refunded_items_table}}
                  <tr>
                    <td style="padding: 8px; border: 1px solid ${borderColor}; font-weight: 600;">${reasonLabel}</td>
                    <td style="padding: 8px; border: 1px solid ${borderColor}; text-align: right;">{{refund_reason}}</td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </table>
      </div>
    `;
  },

  // ========== UNKNOWN WIDGET FALLBACK ==========
  'unknown': (d) => {
    return `<div style="padding: 20px; background-color: #f8f9fa; border: 2px dashed #dee2e6; text-align: center; color: #6c757d; font-family: Arial, sans-serif;">
      <div style="font-weight: bold; margin-bottom: 8px;">Unsupported Widget</div>
      <div style="font-size: 13px;">This widget type is not supported in HTML export.</div>
    </div>`;
  }

};

// ========== HELPER FUNCTIONS ==========
function parseContentData(contentData: string | null): any {
  if (!contentData) return null;
  try {
    return JSON.parse(contentData);
  } catch {
    return contentData;
  }
}


function escapeHtml(text: any): string {
  if (text == null) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getSocialIconHtml(platform: string, size: number = 24, color: string = '#666666'): string {
  const socialIconImages: Record<string, string> = {
    facebook: 'https://img.icons8.com/color/48/facebook-new.png',
    twitter: 'https://img.icons8.com/color/48/twitter--v1.png',
    linkedin: 'https://img.icons8.com/color/48/linkedin.png',
    instagram: 'https://img.icons8.com/color/48/instagram-new.png',
    pinterest: 'https://img.icons8.com/color/48/pinterest--v1.png',
    youtube: 'https://img.icons8.com/color/48/youtube-play.png',
    whatsapp: 'https://img.icons8.com/color/48/whatsapp--v1.png',
    reddit: 'https://img.icons8.com/color/48/reddit.png',
    github: 'https://img.icons8.com/ios-filled/50/000000/github.png',
    telegram: 'https://img.icons8.com/color/48/telegram-app.png',
    envelope: 'https://img.icons8.com/color/48/email.png',
  };

  const src = socialIconImages[platform] || 'https://via.placeholder.com/24';
  return `<img src="${src}" alt="${platform}" width="${size}" height="${size}" style="display: block; border: 0;" />`;
}

function toCssString(sx: Record<string, any>): string {
  if (!sx) return '';
  const result: Record<string, string> = {};

  if (sx.padding && typeof sx.padding === 'object') {
    const p = sx.padding;
    if (p.top != null) result['padding-top'] = `${p.top}px`;
    if (p.right != null) result['padding-right'] = `${p.right}px`;
    if (p.bottom != null) result['padding-bottom'] = `${p.bottom}px`;
    if (p.left != null) result['padding-left'] = `${p.left}px`;
  } else if (sx.padding != null) {
    result['padding'] = typeof sx.padding === 'number' ? `${sx.padding}px` : sx.padding;
  }

  if (sx.margin && typeof sx.margin === 'object') {
    const m = sx.margin;
    if (m.top != null) result['margin-top'] = `${m.top}px`;
    if (m.right != null) result['margin-right'] = `${m.right}px`;
    if (m.bottom != null) result['margin-bottom'] = `${m.bottom}px`;
    if (m.left != null) result['margin-left'] = `${m.left}px`;
  } else if (sx.margin != null) {
    result['margin'] = typeof sx.margin === 'number' ? `${sx.margin}px` : sx.margin;
  }

  if (sx.borderRadius && typeof sx.borderRadius === 'object') {
    const r = sx.borderRadius;
    result['border-radius'] = `${r.top ?? 0}px ${r.right ?? 0}px ${r.bottom ?? 0}px ${r.left ?? 0}px`;
  } else if (sx.borderRadius != null) {
    result['border-radius'] = typeof sx.borderRadius === 'number' ? `${sx.borderRadius}px` : sx.borderRadius;
  }

  for (const side of ['Top', 'Right', 'Bottom', 'Left']) {
    const key = `border${side}`;
    const sideLower = side.toLowerCase();
    const w = sx[`${key}Width`];
    const s = sx[`${key}Style`];
    const c = sx[`${key}Color`];
    if (w !== undefined || s !== undefined || c !== undefined) {
      result[`border-${sideLower}`] = `${w ?? 0}px ${s ?? 'solid'} ${c ?? '#0000'}`;
    }
  }

  const directProps = [
    'fontFamily', 'fontWeight', 'fontSize', 'color', 'backgroundColor', 'textAlign', 'lineHeight', 'letterSpacing',
    'display', 'flexDirection', 'justifyContent', 'alignItems', 'flexWrap', 'columnGap', 'rowGap', 'width', 'height',
    'textDecoration'
  ];
  for (const prop of directProps) {
    if (sx[prop] !== undefined) {
      const cssProp = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
      let val = sx[prop];
      if (typeof val === 'number' && (prop === 'fontSize' || (prop === 'lineHeight' && val > 3) || prop === 'letterSpacing' || prop === 'width' || prop === 'height')) {
        val = `${val}px`;
      }
      result[cssProp] = val;
    }
  }

  return Object.entries(result)
    .map(([k, v]) => `${k}: ${v}`)
    .join('; ');
}

export function getPaddingStyle(padding: any, defaultVal: string = '0px'): string {
  if (!padding) return defaultVal;
  if (typeof padding === 'string') return padding;
  return `${padding.top || 0}px ${padding.right || 0}px ${padding.bottom || 0}px ${padding.left || 0}px`;
}

export function getMarginStyle(margin: any, defaultVal: string = '0px'): string {
  if (!margin) return defaultVal;
  if (typeof margin === 'string') return margin;
  return `${margin.top || 0}px ${margin.right || 0}px ${margin.bottom || 0}px ${margin.left || 0}px`;
}
