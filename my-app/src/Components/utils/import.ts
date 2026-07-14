import { DroppedBlock } from '../../Store/Slice/workspaceSlice';

export interface ImportResult {
  success: boolean;
  data?: DroppedBlock[];
  error?: string;
  warnings?: string[];
  fileName?: string;
  templateMeta?: {
    name?: string;
    description?: string;
    emailType?: string;
    priority?: number;
  };
}

export interface ImportOptions {
  validateSchema?: boolean;
  regenerateIds?: boolean;
  allowPartial?: boolean;
}

export interface ExportSchema {
  version: string;
  schema: string;
  generated: string;
  template: {
    name: string;
    description: string;
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

/**
 * Import template from JSON text (copy-paste)
 */
export function importFromText(jsonText: string, options: ImportOptions = {}): ImportResult {
  try {
    const parsedData = JSON.parse(jsonText);

    // Validate the JSON structure
    const validation = validateImportSchema(parsedData, options);

    if (!validation.isValid && !options.allowPartial) {
      return {
        success: false,
        error: `Invalid template format: ${validation.errors.join(', ')}`,
        warnings: validation.warnings
      };
    }

    // Convert to DroppedBlock format
    const blocks = convertToDroppedBlocks(parsedData.blocks, options);

    return {
      success: true,
      data: blocks,
      warnings: validation.warnings,
      templateMeta: parsedData.template ? {
        name: parsedData.template.name,
        description: parsedData.template.description,
        emailType: parsedData.template.emailType,
        priority: parsedData.template.priority
      } : undefined
    };

  } catch (error: any) {
    return {
      success: false,
      error: `Failed to parse JSON: ${error.message}`
    };
  }
}

/**
 * Import JSON template file
 */
export function importTemplate(file: File, options: ImportOptions = {}): Promise<ImportResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsedData = JSON.parse(content);

        // Validate the JSON structure
        const validation = validateImportSchema(parsedData, options);

        if (!validation.isValid && !options.allowPartial) {
          resolve({
            success: false,
            error: `Invalid template format: ${validation.errors.join(', ')}`,
            warnings: validation.warnings,
            fileName: file.name
          });
          return;
        }

        // Convert to DroppedBlock format
        const blocks = convertToDroppedBlocks(parsedData.blocks, options);

        resolve({
          success: true,
          data: blocks,
          warnings: validation.warnings,
          fileName: file.name,
          templateMeta: parsedData.template ? {
            name: parsedData.template.name,
            description: parsedData.template.description,
            emailType: parsedData.template.emailType,
            priority: parsedData.template.priority
          } : undefined
        });

      } catch (error: any) {
        resolve({
          success: false,
          error: `Failed to parse JSON: ${error.message}`,
          fileName: file.name
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        error: 'Failed to read the file',
        fileName: file.name
      });
    };

    reader.readAsText(file);
  });
}

/**
 * Validate import schema
 */
function validateImportSchema(data: any, options: ImportOptions): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if data is an object
  if (!data || typeof data !== 'object') {
    errors.push('Invalid JSON structure');
    return { isValid: false, errors, warnings };
  }

  // Check for required fields (for your export schema)
  if (data.schema !== 'woocommerce-email-v1') {
    warnings.push('Schema version may not be compatible');
  }

  // Check if blocks exist
  if (!Array.isArray(data.blocks)) {
    errors.push('Missing or invalid blocks array');
  }

  // Validate each block
  if (Array.isArray(data.blocks)) {
    data.blocks.forEach((block: any, index: number) => {
      if (!block.columns || !Array.isArray(block.columns)) {
        warnings.push(`Block ${index + 1} missing columns array (defaulting to empty)`);
      }

      if (block.columns) {
        block.columns.forEach((column: any, colIndex: number) => {
          if (!column.widgetContents || !Array.isArray(column.widgetContents)) {
            warnings.push(`Column ${colIndex + 1} in block ${index + 1} has no widget contents`);
          }
        });
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Convert imported blocks to DroppedBlock format
 */
export function convertToDroppedBlocks(importedBlocks: any[], options: ImportOptions): DroppedBlock[] {
  return importedBlocks.map(block => ({
    id: options.regenerateIds ? generateId('block') : block.id || generateId('block'),
    style: convertStyleToBlockStyle(block.style),
    columns: (block.columns || []).map((column: any) => {
      // Helper to extract nested editor options from widgetContents if available
      const getWidgetContentData = (type: string) => {
        const found = (column.widgetContents || []).find((w: any) => (w.contentType || w.type) === type);
        if (found) {
          try {
            const dataStr = found.contentData !== undefined ? found.contentData : found.data;
            return typeof dataStr === 'string' ? JSON.parse(dataStr) : dataStr;
          } catch (e) {
            return {};
          }
        }
        return {};
      };

      return {
        id: options.regenerateIds ? generateId('col') : column.id || generateId('col'),
        style: convertStyleToColumnStyle(column.style),
        contentType: null,
        contentData: null,
        widgetContents: (column.widgetContents || []).map((widget: any) => ({
          contentType: widget.contentType || widget.type || 'unknown',
          contentData: widget.contentData !== undefined
            ? (typeof widget.contentData === 'string' ? widget.contentData : JSON.stringify(widget.contentData))
            : (typeof widget.data === 'string' ? widget.data : JSON.stringify(widget.data))
        })),
        // Initialize all editor options with defaults or parsed widget data
        textEditorOptions: getWidgetContentData('text') || { content: '' },
        headingEditorOptions: getWidgetContentData('heading') || {},
        socialIconsEditorOptions: getWidgetContentData('socialIcons') || {},
        dividerEditorOptions: getWidgetContentData('divider') || {},
        imageEditorOptions: getWidgetContentData('image') || {},
        buttonEditorOptions: getWidgetContentData('button') || {},
        sectionEditorOptions: getWidgetContentData('section') || {},
        spacerEditorOptions: getWidgetContentData('spacer') || {},
        tableEditorOptions: getWidgetContentData('table') || {},
        linkEditorOptions: getWidgetContentData('link') || {},
        iconEditorOptions: getWidgetContentData('icon') || {},
        shippingAddressEditorOptions: getWidgetContentData('shippingAddress') || {},
        billingAddressEditorOptions: getWidgetContentData('billingAddress') || {},
        orderItemsEditorOptions: getWidgetContentData('orderItems') || {},
        taxBillingEditorOptions: getWidgetContentData('taxBilling') || {},
        paragraphRowEditorOptions: getWidgetContentData('paragraph-row') || getWidgetContentData('paragraphRow') || {}
      };
    })
  }));
}

/**
 * Convert imported style to BlockStyle
 */
function convertStyleToBlockStyle(style: any): any {
  if (!style) {
    return {
      bgColor: 'transparent',
      borderTopColor: 'transparent',
      borderBottomColor: 'transparent',
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      borderStyle: 'solid' as const,
      borderTopSize: 0,
      borderBottomSize: 0,
      borderLeftSize: 0,
      borderRightSize: 0,
      padding: { top: 0, right: 0, bottom: 0, left: 0 },
      height: 'auto'
    };
  }

  return {
    bgColor: style.backgroundColor || style.bgColor || 'transparent',
    borderTopColor: style.borderTopColor || parseBorderColor(style.borderTop, 'transparent'),
    borderBottomColor: style.borderBottomColor || parseBorderColor(style.borderBottom, 'transparent'),
    borderLeftColor: style.borderLeftColor || parseBorderColor(style.borderLeft, 'transparent'),
    borderRightColor: style.borderRightColor || parseBorderColor(style.borderRight, 'transparent'),
    borderStyle: (style.borderStyle || 'solid') as 'solid' | 'dashed' | 'dotted',
    borderTopSize: parseBorderSize(style.borderTop),
    borderBottomSize: parseBorderSize(style.borderBottom),
    borderLeftSize: parseBorderSize(style.borderLeft),
    borderRightSize: parseBorderSize(style.borderRight),
    padding: {
      top: style.paddingTop || style.padding?.top || 0,
      right: style.paddingRight || style.padding?.right || 0,
      bottom: style.paddingBottom || style.padding?.bottom || 0,
      left: style.paddingLeft || style.padding?.left || 0
    },
    height: style.height || 'auto'
  };
}

/**
 * Convert imported style to ColumnStyle
 */
function convertStyleToColumnStyle(style: any): any {
  if (!style) {
    return {
      bgColor: '#ffffffff',
      borderTopColor: '#a0c4ff',
      borderBottomColor: '#a0c4ff',
      borderLeftColor: '#a0c4ff',
      borderRightColor: '#a0c4ff',
      borderStyle: 'solid' as const,
      borderTopSize: 0,
      borderBottomSize: 0,
      borderLeftSize: 0,
      borderRightSize: 0,
      padding: { top: 10, right: 10, bottom: 10, left: 10 },
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
  }

  return {
    bgColor: style.backgroundColor || style.bgColor || '#ffffffff',
    borderTopColor: style.borderTopColor || parseBorderColor(style.borderTop, '#a0c4ff'),
    borderBottomColor: style.borderBottomColor || parseBorderColor(style.borderBottom, '#a0c4ff'),
    borderLeftColor: style.borderLeftColor || parseBorderColor(style.borderLeft, '#a0c4ff'),
    borderRightColor: style.borderRightColor || parseBorderColor(style.borderRight, '#a0c4ff'),
    borderStyle: (style.borderStyle || 'solid') as 'solid' | 'dashed' | 'dotted',
    borderTopSize: parseBorderSize(style.borderTop),
    borderBottomSize: parseBorderSize(style.borderBottom),
    borderLeftSize: parseBorderSize(style.borderLeft),
    borderRightSize: parseBorderSize(style.borderRight),
    padding: {
      top: style.paddingTop || style.padding?.top || 10,
      right: style.paddingRight || style.padding?.right || 10,
      bottom: style.paddingBottom || style.padding?.bottom || 10,
      left: style.paddingLeft || style.padding?.left || 10
    },
    height: style.height || 'auto',
    textAlign: style.textAlign || 'left',
    bgImage: cleanBgImageUrl(style.bgImage || style.backgroundImage || ''),
    bgSize: style.bgSize || style.backgroundSize || 'cover',
    bgPosition: style.bgPosition || style.backgroundPosition || 'center',
    bgRepeat: style.bgRepeat || style.backgroundRepeat || 'no-repeat',
    bgAttachment: style.bgAttachment || style.backgroundAttachment || 'scroll',
    borderRadius: style.borderRadius ? (typeof style.borderRadius === 'object' ? {
      top: style.borderRadius.top || 0,
      right: style.borderRadius.right || 0,
      bottom: style.borderRadius.bottom || 0,
      left: style.borderRadius.left || 0
    } : {
      top: Number(style.borderRadius) || 0,
      right: Number(style.borderRadius) || 0,
      bottom: Number(style.borderRadius) || 0,
      left: Number(style.borderRadius) || 0
    }) : { top: 0, right: 0, bottom: 0, left: 0 },
    margin: style.margin ? (typeof style.margin === 'object' ? {
      top: style.margin.top || 0,
      right: style.margin.right || 0,
      bottom: style.margin.bottom || 0,
      left: style.margin.left || 0
    } : {
      top: Number(style.margin) || 0,
      right: Number(style.margin) || 0,
      bottom: Number(style.margin) || 0,
      left: Number(style.margin) || 0
    }) : { top: 0, right: 0, bottom: 0, left: 0 },
  };
}

/**
 * Parse border size from CSS string (e.g., "2px solid #000")
 */
function parseBorderSize(borderStr: string): number {
  if (!borderStr) return 0;
  const match = borderStr.match(/(\d+)px/);
  return match ? parseInt(match[1], 10) : 0;
}

/**
 * Parse border color from CSS string (e.g., "2px solid #000")
 */
function parseBorderColor(borderStr: string, defaultColor: string): string {
  if (!borderStr) return defaultColor;
  const parts = borderStr.trim().split(/\s+/);
  if (parts.length >= 3) {
    return parts[2];
  }
  return defaultColor;
}

/**
 * Clean background image URL by removing url("...") wrapper
 */
function cleanBgImageUrl(urlStr: string | undefined): string {
  if (!urlStr) return '';
  const match = urlStr.match(/url\(['"]?(.*?)['"]?\)/);
  return match ? match[1] : urlStr;
}

/**
 * Generate unique ID
 */
function generateId(prefix: string = 'id'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}