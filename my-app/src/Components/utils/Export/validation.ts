export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export function validateExportSchema(schema: any): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  
  // Check schema structure
  if (!schema.version) {
    errors.push('Missing version field');
  }
  
  if (!schema.blocks || !Array.isArray(schema.blocks)) {
    errors.push('Blocks must be an array');
  }
  
  // Validate each block
  schema.blocks?.forEach((block: any, index: number) => {
    validateBlock(block, index, warnings, errors);
  });
  
  // Check for empty content
  if (schema.blocks?.length === 0) {
    warnings.push('Export contains no blocks');
  }
  
  return {
    isValid: errors.length === 0,
    warnings,
    errors
  };
}

function validateBlock(block: any, index: number, warnings: string[], errors: string[]): void {
  if (!block) {
    errors.push(`Block ${index} is null or undefined`);
    return;
  }
  
  // Check block ID
  if (!block.id) {
    warnings.push(`Block ${index} missing ID`);
  }
  
  // Check columns
  if (!block.columns || !Array.isArray(block.columns)) {
    errors.push(`Block ${block.id || index} missing columns array`);
    return;
  }
  
  if (block.columns.length === 0) {
    warnings.push(`Block ${block.id || index} has no columns`);
  }
  
  // Validate each column
  block.columns.forEach((column: any, colIndex: number) => {
    validateColumn(column, colIndex, block.id || index, warnings, errors);
  });
  
  // Check block styles
  if (!block.style) {
    warnings.push(`Block ${block.id || index} missing style object`);
  }
}

function validateColumn(column: any, colIndex: number, blockId: string | number, warnings: string[], errors: string[]): void {
  if (!column) {
    errors.push(`Column ${colIndex} in block ${blockId} is null`);
    return;
  }
  
  // Check column ID
  if (!column.id) {
    warnings.push(`Column ${colIndex} in block ${blockId} missing ID`);
  }
  
  // Check widget contents
  if (!column.widgetContents || !Array.isArray(column.widgetContents)) {
    errors.push(`Column ${colIndex} in block ${blockId} missing widgetContents array`);
    return;
  }
  
  // Validate each widget
  column.widgetContents.forEach((widget: any, widgetIndex: number) => {
    validateWidget(widget, widgetIndex, colIndex, blockId, warnings, errors);
  });
  
  // Check column styles
  if (!column.style) {
    warnings.push(`Column ${colIndex} in block ${blockId} missing style object`);
  }
}

function validateWidget(widget: any, widgetIndex: number, colIndex: number, blockId: string | number, warnings: string[], errors: string[]): void {
  if (!widget) {
    errors.push(`Widget ${widgetIndex} in column ${colIndex}, block ${blockId} is null`);
    return;
  }
  
  // Check widget type
  if (!widget.type && !widget.contentType) {
    errors.push(`Widget ${widgetIndex} in column ${colIndex}, block ${blockId} missing type`);
  }
  
  // Check for empty content
  if (!widget.data && !widget.contentData) {
    warnings.push(`Widget ${widget.type || widget.contentType || 'unknown'} at position ${widgetIndex} has no content data`);
  }
  
  // Validate specific widget types
  const type = widget.type || widget.contentType;
  if (type) {
    validateWidgetData(type, widget.data || widget.contentData, widgetIndex, colIndex, blockId, warnings, errors);
  }
}

function validateWidgetData(type: string, data: any, widgetIndex: number, colIndex: number, blockId: string | number, warnings: string[], errors: string[]): void {
  if (!data) return;
  
  switch(type) {
    case 'text':
      if (typeof data !== 'string' && !data?.content) {
        warnings.push(`Text widget at position ${widgetIndex} has invalid content`);
      }
      break;
      
    case 'button':
      if (!data?.text) {
        warnings.push(`Button widget at position ${widgetIndex} missing text`);
      }
      break;
      
    case 'taxBilling':
      if (!data?.orderNumber || !data?.orderTotal) {
        warnings.push(`TaxBilling widget at position ${widgetIndex} missing required fields`);
      }
      break;
      
    case 'billingAddress':
    case 'shippingAddress':
      if (!data?.fullName || !data?.addressLine1) {
        warnings.push(`${type} widget at position ${widgetIndex} missing address details`);
      }
      break;
      
    case 'orderItems':
      if (!data?.items || !Array.isArray(data.items)) {
        warnings.push(`OrderItems widget at position ${widgetIndex} missing items array`);
      }
      break;
      
    case 'image':
      if (!data?.src) {
        warnings.push(`Image widget at position ${widgetIndex} missing image source`);
      }
      break;
  }
}

// Quick validation for immediate use
export function validateBlocks(blocks: any[]): ValidationResult {
  return validateExportSchema({
    version: '1.0.0',
    blocks: blocks
  });
}