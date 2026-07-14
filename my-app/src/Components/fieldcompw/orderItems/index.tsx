import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId, defaultOrderItemsEditorOptions, OrderItem } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';

const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
};



interface OrderItemsFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
}

const defaultOrderItemsSummaryRowOrder = ['subtotal', 'discount', 'payment', 'total'];

interface DraggableOrderItemsSummaryRowProps {
  rowId: string;
  widgetDragId: string;
  previewMode: boolean;
  children: (dragProps: Record<string, any>) => React.ReactElement<any>;
  onMove: (dragRowId: string, hoverRowId: string) => void;
}

const DraggableOrderItemsSummaryRow: React.FC<DraggableOrderItemsSummaryRowProps> = ({
  rowId,
  widgetDragId,
  previewMode,
  children,
  onMove,
}) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isOver, setIsOver] = React.useState(false);

  const setInnerDragActive = (active: boolean) => {
    (window as any).__woomailerInnerElementDragActive = active;
  };

  if (previewMode) {
    return children({});
  }

  return children({
    draggable: true,
    onMouseDownCapture: (e: React.MouseEvent) => {
      setInnerDragActive(true);
      e.stopPropagation();
    },
    onMouseUpCapture: (e: React.MouseEvent) => {
      setInnerDragActive(false);
    },
    onDragStart: (e: React.DragEvent) => {
      setInnerDragActive(true);
      setIsDragging(true);
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', `${widgetDragId}:${rowId}`);
      e.dataTransfer.setData('application/x-woomailer-order-items-row', JSON.stringify({ widgetDragId, rowId }));
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsOver(true);
    },
    onDragLeave: (e: React.DragEvent) => {
      setIsOver(false);
    },
    onDrop: (e: React.DragEvent) => {
      e.preventDefault();
      setIsOver(false);
      setInnerDragActive(false);
      try {
        const payload = JSON.parse(e.dataTransfer.getData('application/x-woomailer-order-items-row') || '{}');
        if (payload.widgetDragId === widgetDragId && payload.rowId && payload.rowId !== rowId) {
          onMove(payload.rowId, rowId);
        }
      } catch {
        // Ignore drops from other drag sources.
      }
    },
    onDragEnd: (e: React.DragEvent) => {
      setIsDragging(false);
      setIsOver(false);
      setInnerDragActive(false);
    },
    sx: {
      cursor: 'grab',
      ...(isDragging ? { opacity: 0.45 } : {}),
      ...(isOver ? { outline: '1px dashed #9c27b0', outlineOffset: '-1px' } : {}),
    },
  });
};

const OrderItemsFieldComponent: React.FC<OrderItemsFieldComponentProps> = ({
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

  const visibilityStyles = {
    wordBreak: 'break-word' as const,
    whiteSpace: 'normal' as const,
    overflow: 'visible' as const,
    textOverflow: 'clip' as const,
  };

  const storeBlock = blocks.find((b) => b.id === blockId);
  const storeColumn = storeBlock?.columns[columnIndex];
  const storeWidget = storeColumn?.widgetContents[widgetIndex];

  const widget = widgetData || storeWidget;

  const content = (widget?.contentData)
    ? { ...defaultOrderItemsEditorOptions, ...JSON.parse(widget.contentData) }
    : defaultOrderItemsEditorOptions;

  const fallback = (val: string | number, placeholder: string | number) =>
    val === '' || val === null || val === undefined ? placeholder : val;

  const cellBorderColor = content.borderColor || '#eee';
  const showDiscount = (content.discount !== 'Â£0.00' && content.discount !== '$0.00' && content.discount !== '0' && content.discount !== '') || !previewMode;
  const normalizedDiscountValue = String(content.discount ?? '').trim();
  const shouldShowDiscount = !previewMode || !['', '0', '0.00', '$0.00', '\u00a30.00'].includes(normalizedDiscountValue);
  const orderNumber = fallback(content.orderNumber, previewMode ? '12345' : '{{order_id}}');
  const orderDate = fallback(content.orderDate, previewMode ? 'December 10, 2025' : '{{order_date}}');
  const orderHeading = fallback(content.orderHeading, `[Order #${orderNumber}] (${orderDate})`);
  const productHeader = fallback(content.productHeader, 'Product');
  const quantityHeader = fallback(content.quantityHeader, 'Quantity');
  const priceHeader = fallback(content.priceHeader, 'Price');
  const productPlaceholder = fallback(content.productPlaceholder, '{{product_name}}');
  const quantityPlaceholder = fallback(content.quantityPlaceholder, '{{qty}}');
  const pricePlaceholder = fallback(content.pricePlaceholder, '{{price}}');
  const summaryRows = [
    {
      id: 'subtotal',
      label: fallback(content.subtotalLabel, 'Subtotal:'),
      value: fallback(content.subtotal, previewMode ? '$169.97' : '{{order_subtotal}}'),
      show: true,
      valuePrefix: '',
      valueColor: undefined,
      bold: true,
    },
    {
      id: 'discount',
      label: fallback(content.discountLabel, 'Discount:'),
      value: fallback(content.discount, previewMode ? '$0.00' : '{{order_discount}}'),
      show: shouldShowDiscount,
      valuePrefix: '-',
      valueColor: '#e53e3e',
      bold: true,
    },
    {
      id: 'payment',
      label: fallback(content.paymentLabel, 'Payment method:'),
      value: fallback(content.paymentMethod, previewMode ? 'Credit Card' : '{{payment_method}}'),
      show: true,
      valuePrefix: '',
      valueColor: undefined,
      bold: false,
    },
    {
      id: 'total',
      label: fallback(content.totalLabel, 'Total:'),
      value: fallback(content.total, previewMode ? '$169.97' : '{{order_total}}'),
      show: true,
      valuePrefix: '',
      valueColor: undefined,
      bold: true,
    },
  ];
  const summaryRowOrder = Array.isArray(content.orderItemsSummaryRowOrder)
    ? [
        ...content.orderItemsSummaryRowOrder.filter((rowId: string) => defaultOrderItemsSummaryRowOrder.includes(rowId)),
        ...defaultOrderItemsSummaryRowOrder.filter(rowId => !content.orderItemsSummaryRowOrder.includes(rowId)),
      ]
    : defaultOrderItemsSummaryRowOrder;
  const orderedSummaryRows = summaryRowOrder
    .map(rowId => summaryRows.find(row => row.id === rowId))
    .filter((row): row is typeof summaryRows[number] => Boolean(row && row.show));
  const widgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:orderItems`;

  const moveOrderItemsSummaryRow = React.useCallback((dragRowId: string, hoverRowId: string) => {
    const nextOrder = [...summaryRowOrder];
    const dragIndex = nextOrder.indexOf(dragRowId);
    const hoverIndex = nextOrder.indexOf(hoverRowId);
    if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

    nextOrder.splice(dragIndex, 1);
    nextOrder.splice(hoverIndex, 0, dragRowId);

    const nextBlocks = JSON.parse(JSON.stringify(blocks));
    const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
    const nextColumn = nextBlock?.columns?.[columnIndex];
    const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
    if (!nextWidget || nextWidget.contentType !== 'orderItems') return;

    let nextData: any = {};
    try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
    nextData.orderItemsSummaryRowOrder = nextOrder;
    nextWidget.contentData = JSON.stringify(nextData);
    dispatch(setBlocks(nextBlocks));
  }, [blockId, blocks, columnIndex, dispatch, summaryRowOrder, widgetIndex]);

  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      style={{
        width: '100%',
        padding: getSpacingStyle(content.padding, '0px'),
        margin: getSpacingStyle(content.margin, '0px'),
        borderRadius: '4px',
        backgroundColor: content.backgroundColor && content.backgroundColor !== 'transparent' ? content.backgroundColor : '#fff',
        fontFamily: content.fontFamily === 'inherit' || !content.fontFamily ? 'inherit' : content.fontFamily,
        fontSize: content.fontSize || '14px',
        color: content.textColor || '#333333',
        ...getSubElementSx(content.subStyles, 'outer_container')
      }}
    >
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="order_heading" previewMode={previewMode}>
        <div
          style={{
            margin: '0 0 12px 0',
            wordBreak: 'break-word',
            overflowWrap: 'anywhere',
            textAlign: (content.textAlign || 'left') as any,
            fontFamily: content.fontFamily === 'inherit' || !content.fontFamily ? 'inherit' : content.fontFamily,
            fontSize: content.fontSize || '18px',
            fontWeight: 'bold',
            color: content.textColor || '#333333',
            ...getSubElementSx(content.subStyles, 'order_heading')
          }}
        >
          {replaceDynamicVariables(orderHeading)}
        </div>
      </SubElementWrapper>

      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="table_container" previewMode={previewMode}>
        <div style={{
          overflowX: 'auto',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          WebkitOverflowScrolling: 'touch',
          ...getSubElementSx(content.subStyles, 'table_container')
        }}>
          <table
            style={{
              width: '100%',
              minWidth: '280px',
              borderCollapse: 'collapse',
              tableLayout: 'fixed',
            }}
          >
            <thead>
              <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="header_row" previewMode={previewMode}>
                <tr style={{
                  borderBottom: `1px solid ${cellBorderColor}`,
                  ...getSubElementSx(content.subStyles, 'header_row')
                }}>
                  <th style={{
                    textAlign: 'left',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    color: 'inherit',
                    fontWeight: 'bold',
                    padding: '8px',
                    ...visibilityStyles,
                    ...getSubElementSx(content.subStyles, 'header_product')
                  }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="header_product" previewMode={previewMode}>
                      {replaceDynamicVariables(productHeader)}
                    </SubElementWrapper>
                  </th>
                  <th style={{
                    textAlign: 'right',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    color: 'inherit',
                    fontWeight: 'bold',
                    width: '28%',
                    padding: '8px',
                    ...visibilityStyles,
                    ...getSubElementSx(content.subStyles, 'header_quantity')
                  }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="header_quantity" previewMode={previewMode}>
                      {replaceDynamicVariables(quantityHeader)}
                    </SubElementWrapper>
                  </th>
                  <th style={{
                    textAlign: 'right',
                    fontFamily: 'inherit',
                    fontSize: 'inherit',
                    color: 'inherit',
                    fontWeight: 'bold',
                    width: '28%',
                    padding: '8px',
                    ...visibilityStyles,
                    ...getSubElementSx(content.subStyles, 'header_price')
                  }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="header_price" previewMode={previewMode}>
                      {replaceDynamicVariables(priceHeader)}
                    </SubElementWrapper>
                  </th>
                </tr>
              </SubElementWrapper>
            </thead>
            <tbody>
              {content.items.length > 0 ? (
                content.items.map((item: OrderItem, index: number) => (
                  <SubElementWrapper key={index} blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_row" previewMode={previewMode}>
                    <tr style={{
                      borderBottom: `1px solid ${cellBorderColor}`,
                      ...getSubElementSx(content.subStyles, 'item_row')
                    }}>
                      <td style={{
                        textAlign: 'left',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        padding: '8px',
                        ...visibilityStyles,
                        ...getSubElementSx(content.subStyles, 'item_product')
                      }}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_product" previewMode={previewMode}>
                          {replaceDynamicVariables(fallback(item.product, previewMode ? 'Sample Product' : productPlaceholder))}
                        </SubElementWrapper>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        padding: '8px',
                        ...visibilityStyles,
                        ...getSubElementSx(content.subStyles, 'item_quantity')
                      }}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_quantity" previewMode={previewMode}>
                          {replaceDynamicVariables(fallback(item.quantity, previewMode ? '2' : quantityPlaceholder))}
                        </SubElementWrapper>
                      </td>
                      <td style={{
                        textAlign: 'right',
                        fontFamily: 'inherit',
                        fontSize: 'inherit',
                        color: 'inherit',
                        padding: '8px',
                        ...visibilityStyles,
                        ...getSubElementSx(content.subStyles, 'item_price')
                      }}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_price" previewMode={previewMode}>
                          {replaceDynamicVariables(fallback(item.price, previewMode ? '$49.99' : pricePlaceholder))}
                        </SubElementWrapper>
                      </td>
                    </tr>
                  </SubElementWrapper>
                ))
              ) : (
                previewMode ? (
                  <>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_row" previewMode={previewMode}>
                      <tr style={{
                        borderBottom: `1px solid ${cellBorderColor}`,
                        ...getSubElementSx(content.subStyles, 'item_row')
                      }}>
                        <td style={{
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_product')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_product" previewMode={previewMode}>
                            Premium Wireless Headphones
                          </SubElementWrapper>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_quantity')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_quantity" previewMode={previewMode}>
                            1
                          </SubElementWrapper>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_price')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_price" previewMode={previewMode}>
                            $129.99
                          </SubElementWrapper>
                        </td>
                      </tr>
                    </SubElementWrapper>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_row" previewMode={previewMode}>
                      <tr style={{
                        borderBottom: `1px solid ${cellBorderColor}`,
                        ...getSubElementSx(content.subStyles, 'item_row')
                      }}>
                        <td style={{
                          textAlign: 'left',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_product')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_product" previewMode={previewMode}>
                            USB-C Charging Cable
                          </SubElementWrapper>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_quantity')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_quantity" previewMode={previewMode}>
                            2
                          </SubElementWrapper>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: 'inherit',
                          padding: '8px',
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, 'item_price')
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId="item_price" previewMode={previewMode}>
                            $19.99
                          </SubElementWrapper>
                        </td>
                      </tr>
                    </SubElementWrapper>
                  </>
                ) : (
                  <tr style={{ borderBottom: `1px solid ${cellBorderColor}` }}>
                    <td colSpan={3} style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', fontFamily: 'inherit', fontSize: 'inherit', padding: '8px' }}>
                      {'{{order_items_rows}}'} - Items will appear here
                    </td>
                  </tr>
                )
              )}
              {orderedSummaryRows.map(row => {
                const rowPadding = row.id === 'subtotal' ? '8px 8px 4px 8px' : row.id === 'total' ? '4px 8px 8px 8px' : '4px 8px';
                const cleanLabel = replaceDynamicVariables(row.label);
                const cleanValue = replaceDynamicVariables(row.value);
                const labelContent = row.bold ? <strong>{cleanLabel}</strong> : cleanLabel;
                const valueContent = row.bold ? <strong>{row.valuePrefix}{cleanValue}</strong> : <>{row.valuePrefix}{cleanValue}</>;

                return (
                  <DraggableOrderItemsSummaryRow key={row.id} rowId={row.id} widgetDragId={widgetDragId} previewMode={previewMode} onMove={moveOrderItemsSummaryRow}>
                    {(dragProps) => (
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId={`${row.id}_container`} previewMode={previewMode} childProps={dragProps}>
                      <tr style={{ ...getSubElementSx(content.subStyles, `${row.id}_container`) }}>
                        <td colSpan={2} style={{
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: row.valueColor || 'inherit',
                          padding: rowPadding,
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, `${row.id}_label`)
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId={`${row.id}_label`} previewMode={previewMode}>
                            {labelContent}
                          </SubElementWrapper>
                        </td>
                        <td style={{
                          textAlign: 'right',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          color: row.valueColor || 'inherit',
                          padding: rowPadding,
                          ...visibilityStyles,
                          ...getSubElementSx(content.subStyles, `${row.id}_value`)
                        }}>
                          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderItems" subElementId={`${row.id}_value`} previewMode={previewMode}>
                            {valueContent}
                          </SubElementWrapper>
                        </td>
                      </tr>
                    </SubElementWrapper>
                    )}
                  </DraggableOrderItemsSummaryRow>
                );
              })}
              {false && (<>
              <tr>
                <td colSpan={2} style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '8px 8px 4px 8px' }}>
                  <strong>Subtotal:</strong>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '8px 8px 4px 8px' }}>
                  <strong>{fallback(content.subtotal, previewMode ? '$169.97' : '{{order_subtotal}}')}</strong>
                </td>
              </tr>
              {(content.discount !== '£0.00' && content.discount !== '$0.00' && content.discount !== '0' && content.discount !== '') || !previewMode ? (
                <tr>
                  <td colSpan={2} style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '4px 8px' }}>
                    <strong>Discount:</strong>
                  </td>
                  <td style={{ textAlign: 'right', color: '#e53e3e', fontFamily: 'inherit', fontSize: 'inherit', padding: '4px 8px' }}>
                    -{fallback(content.discount, previewMode ? '$0.00' : '{{order_discount}}')}
                  </td>
                </tr>
              ) : null}
              <tr>
                <td colSpan={2} style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '4px 8px' }}>
                  <strong>Payment method:</strong>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '4px 8px' }}>
                  {fallback(content.paymentMethod, previewMode ? 'Credit Card' : '{{payment_method}}')}
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '4px 8px 8px 8px' }}>
                  <strong>Total:</strong>
                </td>
                <td style={{ textAlign: 'right', fontFamily: 'inherit', fontSize: 'inherit', color: 'inherit', padding: '4px 8px 8px 8px' }}>
                  <strong>{fallback(content.total, previewMode ? '$169.97' : '{{order_total}}')}</strong>
                </td>
              </tr>
              </>)}
            </tbody>
          </table>
        </div>
      </SubElementWrapper>
    </div>
  );
};

export default OrderItemsFieldComponent;
