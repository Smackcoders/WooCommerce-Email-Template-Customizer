import React from 'react';

import {
  Box,
  Typography,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId, defaultTaxBillingEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';





const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};

interface TaxBillingFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
}

const defaultTaxBillingTotalsRowOrder = ['subtotal', 'shipping', 'discount', 'tax', 'tax_rate', 'total'];
const defaultTaxBillingAddressRowOrder = ['billing_name', 'billing_address_line', 'billing_location'];

interface TaxBillingRowDragItem {
  type: string;
  rowId: string;
  index: number;
  widgetDragId: string;
}

interface DraggableTaxBillingRowProps {
  rowId: string;
  order: number;
  dragType: string;
  widgetDragId: string;
  previewMode: boolean;
  children: React.ReactNode;
  onMove: (dragRowId: string, hoverRowId: string) => void;
}

const DraggableTaxBillingRow: React.FC<DraggableTaxBillingRowProps> = ({
  rowId,
  order,
  dragType,
  widgetDragId,
  previewMode,
  children,
  onMove,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const setInnerDragActive = (active: boolean) => {
    (window as any).__woomailerInnerElementDragActive = active;
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: dragType,
    item: { type: dragType, rowId, index: order, widgetDragId },
    canDrag: !previewMode,
    end: () => setInnerDragActive(false),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [dragType, rowId, order, widgetDragId, previewMode]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: dragType,
    hover: (item: TaxBillingRowDragItem) => {
      if (!ref.current || previewMode) return;
      if (item.widgetDragId !== widgetDragId || item.rowId === rowId) return;
      if (item.index === order) return;

      onMove(item.rowId, rowId);
      item.index = order;
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [dragType, rowId, order, widgetDragId, previewMode, onMove]);

  drag(drop(ref));

  return (
    <div
      ref={ref}
      onMouseDownCapture={e => {
        if (previewMode) return;
        setInnerDragActive(true);
        e.stopPropagation();
      }}
      onMouseUpCapture={() => setInnerDragActive(false)}
      onMouseLeave={() => {
        if (!isDragging) setInnerDragActive(false);
      }}
      style={{
        order,
        width: '100%',
        opacity: isDragging ? 0.45 : 1,
        cursor: previewMode ? 'inherit' : 'grab',
        outline: isOver ? '1px dashed #9c27b0' : 'none',
        outlineOffset: '-1px',
      }}
    >
      {children}
    </div>
  );
};

const TaxBillingFieldComponent: React.FC<TaxBillingFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  previewMode = true,
  widgetData
}) => {
  const { blocks } = useSelector((state: RootState) => state.workspace);
  const dispatch = useDispatch();

  const storeBlock = blocks.find((b) => b.id === blockId);
  const storeColumn = storeBlock?.columns[columnIndex];
  const storeWidget = storeColumn?.widgetContents[widgetIndex];

  const widget = widgetData || storeWidget;

  const content = widget?.contentData
    ? { ...defaultTaxBillingEditorOptions, ...JSON.parse(widget.contentData) }
    : defaultTaxBillingEditorOptions;

  const fallback = (val: string | number, placeholder: string | number) =>
    val === '' || val === null || val === undefined ? placeholder : val;

  const orderNumber = replaceDynamicVariables(fallback(content.orderNumber, '{{order_id}}'));
  const orderDate = replaceDynamicVariables(fallback(content.orderDate, '{{order_date}}'));
  const taxRate = replaceDynamicVariables(fallback(content.taxRate, '{{tax_rate}}'));
  const totalsRows = [
    {
      id: 'subtotal',
      label: fallback(content.subtotalLabel, 'Subtotal'),
      value: fallback(content.orderSubtotal, previewMode ? '$169.97' : '{{order_subtotal}}'),
      show: true,
      valuePrefix: '',
      color: 'inherit',
      bold: false,
      borderBottom: true,
    },
    {
      id: 'shipping',
      label: fallback(content.shippingLabel, 'Shipping'),
      value: fallback(content.orderShipping, previewMode ? '$10.00' : '{{shipping_cost}}'),
      show: true,
      valuePrefix: '',
      color: 'inherit',
      bold: false,
      borderBottom: true,
    },
    {
      id: 'discount',
      label: fallback(content.discountLabel, 'Discount'),
      value: fallback(content.orderDiscount, previewMode ? '$0.00' : '{{order_discount}}'),
      show: (content.orderDiscount !== '$0.00' && content.orderDiscount !== '0' && content.orderDiscount !== '') || !previewMode,
      valuePrefix: '-',
      color: '#e53e3e',
      bold: false,
      borderBottom: true,
    },
    {
      id: 'tax',
      label: fallback(content.taxLabel, 'Tax'),
      value: fallback(content.orderTax, previewMode ? '$15.30' : '{{tax_amount}}'),
      show: true,
      valuePrefix: '',
      color: 'inherit',
      bold: false,
      borderBottom: true,
    },
    {
      id: 'tax_rate',
      label: fallback(content.taxRateLabel, 'Tax Rate'),
      value: taxRate,
      show: true,
      valuePrefix: '',
      color: 'inherit',
      bold: false,
      borderBottom: true,
    },
    {
      id: 'total',
      label: fallback(content.totalLabel, 'Total'),
      value: fallback(content.orderTotal, previewMode ? '$195.27' : '{{order_total}}'),
      show: true,
      valuePrefix: '',
      color: 'inherit',
      bold: true,
      borderBottom: false,
    },
  ];
  const totalsRowOrder = Array.isArray(content.taxBillingTotalsRowOrder)
    ? [
        ...content.taxBillingTotalsRowOrder.filter((rowId: string) => defaultTaxBillingTotalsRowOrder.includes(rowId)),
        ...defaultTaxBillingTotalsRowOrder.filter(rowId => !content.taxBillingTotalsRowOrder.includes(rowId)),
      ]
    : defaultTaxBillingTotalsRowOrder;
  const orderedTotalsRows = totalsRowOrder
    .map(rowId => totalsRows.find(row => row.id === rowId))
    .filter((row): row is typeof totalsRows[number] => Boolean(row && row.show));
  const billingRows = [
    {
      id: 'billing_name',
      labelId: 'billing_name_label',
      valueId: 'billing_name_value',
      containerId: 'billing_name_container',
      label: fallback(content.billingNameLabel, 'Name:'),
      value: fallback(content.billingFirstName, previewMode ? 'John Smith' : '{{billing_first_name}} {{billing_last_name}}'),
    },
    {
      id: 'billing_address_line',
      labelId: 'billing_address_label',
      valueId: 'billing_address_value',
      containerId: 'billing_address_line_container',
      label: fallback(content.billingAddressLabel, 'Address:'),
      value: fallback(content.billingAddress1, previewMode ? '123 Main Street' : '{{billing_address_1}}'),
    },
    {
      id: 'billing_location',
      labelId: 'billing_location_label',
      valueId: 'billing_location_value',
      containerId: 'billing_location_container',
      label: fallback(content.billingLocationLabel, 'Location:'),
      value: fallback(content.billingCity, previewMode ? 'New York, NY 10001, United States' : '{{billing_city}}, {{billing_state}} {{billing_postcode}}, {{billing_country}}'),
    },
  ];
  const billingRowOrder = Array.isArray(content.taxBillingAddressRowOrder)
    ? [
        ...content.taxBillingAddressRowOrder.filter((rowId: string) => defaultTaxBillingAddressRowOrder.includes(rowId)),
        ...defaultTaxBillingAddressRowOrder.filter(rowId => !content.taxBillingAddressRowOrder.includes(rowId)),
      ]
    : defaultTaxBillingAddressRowOrder;
  const orderedBillingRows = billingRowOrder
    .map(rowId => billingRows.find(row => row.id === rowId))
    .filter((row): row is typeof billingRows[number] => Boolean(row));
  const totalsWidgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:taxBillingTotals`;
  const billingWidgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:taxBillingAddress`;

  const moveTaxBillingRow = React.useCallback((orderKey: 'taxBillingTotalsRowOrder' | 'taxBillingAddressRowOrder', currentOrder: string[], dragRowId: string, hoverRowId: string) => {
    const nextOrder = [...currentOrder];
    const dragIndex = nextOrder.indexOf(dragRowId);
    const hoverIndex = nextOrder.indexOf(hoverRowId);
    if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

    nextOrder.splice(dragIndex, 1);
    nextOrder.splice(hoverIndex, 0, dragRowId);

    const nextBlocks = JSON.parse(JSON.stringify(blocks));
    const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
    const nextColumn = nextBlock?.columns?.[columnIndex];
    const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
    if (!nextWidget || nextWidget.contentType !== 'taxBilling') return;

    let nextData: any = {};
    try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
    nextData[orderKey] = nextOrder;
    nextWidget.contentData = JSON.stringify(nextData);
    dispatch(setBlocks(nextBlocks));
  }, [blockId, blocks, columnIndex, dispatch, widgetIndex]);

  const moveTotalsRow = React.useCallback((dragRowId: string, hoverRowId: string) => {
    moveTaxBillingRow('taxBillingTotalsRowOrder', totalsRowOrder, dragRowId, hoverRowId);
  }, [moveTaxBillingRow, totalsRowOrder]);

  const moveBillingRow = React.useCallback((dragRowId: string, hoverRowId: string) => {
    moveTaxBillingRow('taxBillingAddressRowOrder', billingRowOrder, dragRowId, hoverRowId);
  }, [billingRowOrder, moveTaxBillingRow]);

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      sx={{
        width: content.width || '100%',
        height: content.height || 'auto',
        minWidth: 0,
        boxSizing: 'border-box',
        wordBreak: 'break-word',
        overflowWrap: 'anywhere',
        fontFamily: content.fontFamily === 'inherit' || !content.fontFamily ? 'inherit' : content.fontFamily,
        fontSize: content.fontSize || '14px',
        fontWeight: content.fontWeight || 'normal',
        color: content.textColor || '#333333',
        textAlign: content.textAlign || 'left',
        border: isSelected ? '2px dashed blue' : '1px solid #ddd',
        borderRadius: '8px',
        padding: getSpacingStyle(content.padding, '0px'),
        margin: getSpacingStyle(content.margin, '0px'),
        backgroundColor: content.backgroundColor && content.backgroundColor !== 'transparent' ? content.backgroundColor : '#fff',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        ...getSubElementSx(content.subStyles, 'outer_container')
      }}
    >
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="invoice_header_container" previewMode={previewMode}>
        <Box sx={{ ...getSubElementSx(content.subStyles, 'invoice_header_container') }}>
          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="invoice_title" previewMode={previewMode}>
            <Typography variant="h6" sx={{
              marginTop: 0,
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: '1.25rem',
              fontWeight: 'bold',
              ...getSubElementSx(content.subStyles, 'invoice_title')
            }}>
              {fallback(content.invoiceTitle, 'Tax Invoice')} #{orderNumber}
            </Typography>
          </SubElementWrapper>

          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="order_date_container" previewMode={previewMode}>
            <Box sx={{ display: 'flex', gap: 0.5, mb: 2, ...getSubElementSx(content.subStyles, 'order_date_container') }}>
              <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="order_date_label" previewMode={previewMode}>
                <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'inherit', fontSize: 'inherit', ...getSubElementSx(content.subStyles, 'order_date_label') }}>
                  {fallback(content.orderDateLabel, 'Order Date:')}
                </Typography>
              </SubElementWrapper>
              <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="order_date_value" previewMode={previewMode}>
                <Typography component="span" variant="body2" sx={{ fontFamily: 'inherit', fontSize: 'inherit', ...getSubElementSx(content.subStyles, 'order_date_value') }}>
                  {orderDate}
                </Typography>
              </SubElementWrapper>
            </Box>
          </SubElementWrapper>
        </Box>
      </SubElementWrapper>

      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="totals_container" previewMode={previewMode}>
        <Box sx={{ width: '100%', mt: 1, display: 'flex', flexDirection: 'column', ...getSubElementSx(content.subStyles, 'totals_container') }}>
          {orderedTotalsRows.map(row => (
            <DraggableTaxBillingRow key={row.id} rowId={row.id} order={totalsRowOrder.indexOf(row.id)} dragType="TAX_BILLING_TOTALS_ROW" widgetDragId={totalsWidgetDragId} previewMode={previewMode} onMove={moveTotalsRow}>
              <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={`${row.id}_container`} previewMode={previewMode}>
                <Box sx={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: 1,
                  borderBottom: row.borderBottom ? '1px solid #eee' : 'none',
                  ...getSubElementSx(content.subStyles, `${row.id}_container`)
                }}>
                  <Box sx={{ padding: '8px', color: row.color, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: row.bold ? 'bold' : 'inherit', ...getSubElementSx(content.subStyles, `${row.id}_label`) }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={`${row.id}_label`} previewMode={previewMode}>
                      {replaceDynamicVariables(row.label)}
                    </SubElementWrapper>
                  </Box>
                  <Box sx={{ padding: '8px', textAlign: 'right', color: row.color, fontFamily: 'inherit', fontSize: 'inherit', fontWeight: row.bold ? 'bold' : 'inherit', ...getSubElementSx(content.subStyles, `${row.id}_value`) }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={`${row.id}_value`} previewMode={previewMode}>
                      {row.valuePrefix}{replaceDynamicVariables(row.value)}
                    </SubElementWrapper>
                  </Box>
                </Box>
              </SubElementWrapper>
            </DraggableTaxBillingRow>
          ))}
        </Box>
      </SubElementWrapper>
 
      {content.showBillingAddress !== false && (
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="billing_address_container" previewMode={previewMode}>
        <Box sx={{
          mt: 2,
          padding: '10px',
          backgroundColor: '#f9f9f9',
          borderRadius: '5px',
          color: 'inherit',
          ...getSubElementSx(content.subStyles, 'billing_address_container')
        }}>
          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="billing_address_title" previewMode={previewMode}>
            <Typography variant="body2" sx={{
              fontWeight: 'bold',
              mb: 1,
              fontFamily: 'inherit',
              fontSize: 'inherit',
              ...getSubElementSx(content.subStyles, 'billing_address_title')
            }}>
              {replaceDynamicVariables(fallback(content.billingAddressTitle, 'Billing Address:'))}
            </Typography>
          </SubElementWrapper>
 
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {orderedBillingRows.map(row => (
              <DraggableTaxBillingRow key={row.id} rowId={row.id} order={billingRowOrder.indexOf(row.id)} dragType="TAX_BILLING_ADDRESS_ROW" widgetDragId={billingWidgetDragId} previewMode={previewMode} onMove={moveBillingRow}>
                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={row.containerId} previewMode={previewMode}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 1, margin: '2px 0', ...getSubElementSx(content.subStyles, row.containerId) }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={row.labelId} previewMode={previewMode}>
                      <Typography component="span" variant="body2" sx={{ fontWeight: 'bold', fontFamily: 'inherit', fontSize: 'inherit', ...getSubElementSx(content.subStyles, row.labelId) }}>
                        {replaceDynamicVariables(row.label)}
                      </Typography>
                    </SubElementWrapper>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId={row.valueId} previewMode={previewMode}>
                      <Typography component="span" variant="body2" sx={{ fontFamily: 'inherit', fontSize: 'inherit', ...getSubElementSx(content.subStyles, row.valueId) }}>
                        {replaceDynamicVariables(row.value)}
                      </Typography>
                    </SubElementWrapper>
                  </Box>
                </SubElementWrapper>
              </DraggableTaxBillingRow>
            ))}
          </Box>
        </Box>
      </SubElementWrapper>
      )}

      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="taxBilling" subElementId="footer_text" previewMode={previewMode}>
        <Typography variant="body2" sx={{
          mt: 2,
          fontFamily: 'inherit',
          fontSize: 'inherit',
          color: 'inherit',
          ...getSubElementSx(content.subStyles, 'footer_text')
        }}>
          <strong>{replaceDynamicVariables(fallback(content.footerText, 'Tax Billing'))}</strong>
        </Typography>
      </SubElementWrapper>
    </Box>
  );
};

export default TaxBillingFieldComponent;
