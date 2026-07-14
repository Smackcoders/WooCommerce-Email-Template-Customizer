import { DroppedBlock } from '../../../Store/Slice/workspaceSlice';
import { validateExportSchema } from './validation';

export interface JsonExportOptions {
  generateIds?: boolean;
  includeMeta?: boolean;
  templateName?: string;
  templateDescription?: string;
  emailType?: string;
  priority?: number;
  validate?: boolean;
}

export interface ExportSchema {
  version: string;
  schema: string;
  generated: string;
  template: {
    name: string;
    description: string;
    emailType?: string;
    priority?: number;
    created: string;
  };
  blocks: any[];
  metadata: {
    totalBlocks: number;
    totalColumns: number;
    totalWidgets: number;
    widgetTypes: Record<string, number>;
    generated: string;
  };
  validation?: {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  };
}

export function exportToJSON(blocks: DroppedBlock[], options: JsonExportOptions = {}): string {
  const opts = {
    generateIds: true,
    includeMeta: true,
    templateName: 'Email Template',
    templateDescription: '',
    emailType: '',
    priority: 0,
    validate: true,
    ...options
  };

  // Process blocks for export
  const processedBlocks = blocks.map(block => processBlockForJson(block, opts));

  // Build export schema
  const schema: ExportSchema = {
    version: '1.0.0',
    schema: 'woocommerce-email-v1',
    generated: new Date().toISOString(),
    template: {
      name: opts.templateName || 'Email Template',
      description: opts.templateDescription || '',
      emailType: opts.emailType,
      priority: opts.priority,
      created: new Date().toISOString()
    },
    blocks: processedBlocks,
    metadata: generateMetadata(processedBlocks)
  };

  // Add validation if requested
  if (opts.validate) {
    const validation = validateExportSchema(schema);
    schema.validation = validation;
  }

  return JSON.stringify(schema, null, 2);
}


// ========== PROCESSING ==========
function processBlockForJson(block: DroppedBlock, options: JsonExportOptions): any {
  const processedBlock: any = {
    id: options.generateIds && !block.id ? generateId('block') : block.id,
    type: 'email-block',
    style: cleanStyleObject(block.style),
    columns: block.columns.map(column => ({
      id: options.generateIds && !column.id ? generateId('col') : column.id,
      type: 'email-column',
      style: cleanStyleObject(column.style),
      widgetContents: column.widgetContents.map(widget => ({
        id: options.generateIds ? generateId('widget') : undefined,
        type: widget.contentType || 'unknown',
        data: sanitizeWidgetData(widget.contentType || 'unknown', parseContentData(widget.contentData)),
        metadata: {
          createdAt: new Date().toISOString()
        }
      }))
    })),
    metadata: {
      createdAt: new Date().toISOString(),
      columnCount: block.columns.length,
      widgetCount: block.columns.reduce((sum, col) => sum + col.widgetContents.length, 0)
    }
  };

  return processedBlock;
}

// ========== DATA SANITIZATION ==========
function sanitizeWidgetData(type: string, data: any): any {
  if (!data) return data;
  const cleanData = { ...data }; // Clone to avoid mutation

  switch (type) {
    case 'billingAddress':
      cleanData.fullName = '{{billing_name}}';
      cleanData.addressLine1 = '{{billing_address_1}}';
      cleanData.addressLine2 = '{{billing_address_2}}';
      cleanData.city = '{{billing_city}}';
      cleanData.state = '{{billing_state}}';
      cleanData.postalCode = '{{billing_postcode}}';
      cleanData.country = '{{billing_country}}';
      cleanData.phone = '{{billing_phone}}';
      cleanData.email = '{{billing_email}}';
      break;

    case 'shippingAddress':
      cleanData.fullName = '{{shipping_name}}';
      cleanData.addressLine1 = '{{shipping_address_1}}';
      cleanData.addressLine2 = '{{shipping_address_2}}';
      cleanData.city = '{{shipping_city}}';
      cleanData.state = '{{shipping_state}}';
      cleanData.postalCode = '{{shipping_postcode}}';
      cleanData.country = '{{shipping_country}}';
      cleanData.phone = '{{shipping_phone}}';
      cleanData.email = '{{shipping_email}}';
      break;

    case 'orderItems':
      // Replace entire items array with a single placeholder item structure
      cleanData.items = [{
        product: cleanData.productPlaceholder || '{{product_name}}',
        quantity: cleanData.quantityPlaceholder || '{{qty}}',
        price: cleanData.pricePlaceholder || '{{price}}'
      }];
      cleanData.subtotal = '{{order_subtotal}}';
      cleanData.total = '{{order_total}}';
      cleanData.paymentMethod = '{{payment_method}}';
      cleanData.orderNumber = '{{order_id}}';
      cleanData.orderDate = '{{order_date}}';
      break;

    case 'orderSummary':
    case 'taxBilling': // Assuming this shares similar fields
      cleanData.orderNumber = '{{order_id}}';
      cleanData.orderDate = '{{order_date}}';
      cleanData.orderTotal = '{{order_total}}';
      cleanData.orderSubtotal = '{{order_subtotal}}';
      cleanData.orderShipping = '{{order_shipping}}';
      cleanData.orderTax = '{{tax_amount}}';
      cleanData.taxRate = '{{tax_rate}}';
      break;



    case 'orderSubtotal':
      cleanData.label = cleanData.label || 'Subtotal';
      cleanData.value = '{{order_subtotal}}';
      break;

    case 'orderTotal':
      cleanData.label = cleanData.label || 'Total';
      cleanData.value = '{{order_total}}';
      break;

    case 'shippingMethod':
      cleanData.label = cleanData.label || 'Shipping Method';
      cleanData.value = '{{shipping_method}}';
      break;

    case 'paymentMethod':
      cleanData.label = cleanData.label || 'Payment Method';
      cleanData.value = '{{payment_method}}';
      break;

    case 'customerNote':
      cleanData.label = cleanData.label || 'Customer Note';
      cleanData.value = '{{customer_note}}';
      break;

    case 'emailFooter':
      cleanData.storeName = '{{store_name}}';
      cleanData.storeAddress = '{{store_address}}';
      cleanData.storeEmail = '{{store_email}}';
      cleanData.storePhone = '{{store_phone}}';
      break;
  }

  return cleanData;
}

// ========== METADATA GENERATION ==========
function generateMetadata(blocks: any[]): any {
  const widgetTypes: Record<string, number> = {};
  let totalWidgets = 0;

  blocks.forEach(block => {
    block.columns.forEach((column: any) => {
      column.widgetContents.forEach((widget: any) => {
        totalWidgets++;
        const type = widget.type || 'unknown';
        widgetTypes[type] = (widgetTypes[type] || 0) + 1;
      });
    });
  });

  return {
    totalBlocks: blocks.length,
    totalColumns: blocks.reduce((sum, block) => sum + block.columns.length, 0),
    totalWidgets,
    widgetTypes,
    generated: new Date().toISOString(),
    schemaVersion: '1.0.0'
  };
}

// ========== CLEANING FUNCTIONS ==========
function cleanStyleObject(style: any): any {
  if (!style) return {};

  const cleaned: any = {
    // Background
    backgroundColor: style.bgColor || 'transparent',

    // Borders
    borderStyle: style.borderStyle,

    // Padding
    paddingTop: style.padding?.top || 0,
    paddingRight: style.padding?.right || 0,
    paddingBottom: style.padding?.bottom || 0,
    paddingLeft: style.padding?.left || 0,

    // Dimensions
    height: style.height || 'auto'
  };

  // Add background image properties only if they exist
  if (style.bgImage !== undefined) {
    cleaned.bgImage = style.bgImage;
  }
  if (style.bgSize !== undefined) {
    cleaned.bgSize = style.bgSize;
  }
  if (style.bgPosition !== undefined) {
    cleaned.bgPosition = style.bgPosition;
  }
  if (style.bgRepeat !== undefined) {
    cleaned.bgRepeat = style.bgRepeat;
  }
  if (style.bgAttachment !== undefined) {
    cleaned.bgAttachment = style.bgAttachment;
  }
  if (style.textAlign !== undefined) {
    cleaned.textAlign = style.textAlign;
  }

  // Add border properties only if they exist
  if (style.borderTopSize > 0) {
    cleaned.borderTop = `${style.borderTopSize}px ${style.borderStyle || 'solid'} ${style.borderTopColor || 'transparent'}`;
  }

  if (style.borderBottomSize > 0) {
    cleaned.borderBottom = `${style.borderBottomSize}px ${style.borderStyle || 'solid'} ${style.borderBottomColor || 'transparent'}`;
  }

  if (style.borderLeftSize > 0) {
    cleaned.borderLeft = `${style.borderLeftSize}px ${style.borderStyle || 'solid'} ${style.borderLeftColor || 'transparent'}`;
  }

  if (style.borderRightSize > 0) {
    cleaned.borderRight = `${style.borderRightSize}px ${style.borderStyle || 'solid'} ${style.borderRightColor || 'transparent'}`;
  }

  return cleaned;
}

// ========== UTILITY FUNCTIONS ==========
function parseContentData(contentData: string | null): any {
  if (!contentData) return null;
  try {
    return JSON.parse(contentData);
  } catch {
    return contentData;
  }
}

function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
