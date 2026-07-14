import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId, defaultOrderSubtotalEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
import { getPreviewValue } from '../../../utils/previewHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';

// Helper: convert labelAlign / valueAlign string → CSS textAlign + flexbox justifyContent
const alignToFlex = (align?: string): string => {
  if (align === 'center') return 'center';
  if (align === 'right') return 'flex-end';
  if (align === 'justify') return 'space-between';
  return 'flex-start';
};

const alignToText = (align?: string): string => {
  if (align === 'center') return 'center';
  if (align === 'right') return 'right';
  if (align === 'justify') return 'justify';
  return 'left';
};

interface Props {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const defaultOrderSubtotalRowOrder = ['subtotal', 'discount', 'shipping', 'refunded_full', 'refunded_partial'];

interface OrderSubtotalRowDragItem {
    type: 'ORDER_SUBTOTAL_ROW';
    rowId: string;
    index: number;
    widgetDragId: string;
}

interface DraggableOrderSubtotalRowProps {
    rowId: string;
    order: number;
    widgetDragId: string;
    previewMode: boolean;
    children: React.ReactNode;
    onMove: (dragRowId: string, hoverRowId: string) => void;
}

const DraggableOrderSubtotalRow: React.FC<DraggableOrderSubtotalRowProps> = ({
    rowId,
    order,
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
        type: 'ORDER_SUBTOTAL_ROW',
        item: { type: 'ORDER_SUBTOTAL_ROW', rowId, index: order, widgetDragId },
        canDrag: !previewMode,
        end: () => setInnerDragActive(false),
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    }), [rowId, order, widgetDragId, previewMode]);

    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'ORDER_SUBTOTAL_ROW',
        hover: (item: OrderSubtotalRowDragItem) => {
            if (!ref.current || previewMode) return;
            if (item.widgetDragId !== widgetDragId || item.rowId === rowId) return;
            if (item.index === order) return;

            onMove(item.rowId, rowId);
            item.index = order;
        },
        collect: monitor => ({
            isOver: monitor.isOver({ shallow: true }),
        }),
    }), [rowId, order, widgetDragId, previewMode, onMove]);

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

const OrderSubtotalFieldComponent: React.FC<Props> = ({
    blockId,
    columnIndex,
    isSelected,
    onClick,
    onWidgetClick,
    widgetIndex,
    previewMode = true,
    widgetData
}) => {
    const dispatch = useDispatch();
    const blocks = useSelector((state: RootState) => state.workspace.blocks);
    const block = blocks.find(b => b.id === blockId);
    const column = block?.columns[columnIndex];
    const storeWidget = column?.widgetContents[widgetIndex];
    const widget = widgetData || storeWidget;

    const visibilityStyles = {
        wordBreak: 'break-word' as const,
        whiteSpace: 'normal' as const,
        overflow: 'visible' as const,
        textOverflow: 'clip' as const,
    };

    const options = React.useMemo(() => {
        if (widget?.contentData) {
            try {
                return { ...defaultOrderSubtotalEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                console.error("Failed to parse orderSubtotal options", e);
            }
        }
        return defaultOrderSubtotalEditorOptions;
    }, [widget]);

    const lastColumnWidth = options.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;
    const columnGap = options.columnGap || 0;

    // Resolved alignment helpers
    const labelJustify = alignToFlex(options.labelAlign);
    const labelTextAlign = alignToText(options.labelAlign);
    const valueJustify = alignToFlex(options.valueAlign);
    const valueTextAlign = alignToText(options.valueAlign);
    const rowOrder = Array.isArray(options.orderSubtotalRowOrder)
        ? [
            ...options.orderSubtotalRowOrder.filter((rowId: string) => defaultOrderSubtotalRowOrder.includes(rowId)),
            ...defaultOrderSubtotalRowOrder.filter(rowId => !options.orderSubtotalRowOrder.includes(rowId)),
        ]
        : defaultOrderSubtotalRowOrder;
    const getRowOrder = (rowId: string) => rowOrder.indexOf(rowId);
    const widgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:orderSubtotal`;

    const moveOrderSubtotalRow = React.useCallback((dragRowId: string, hoverRowId: string) => {
        const nextOrder = [...rowOrder];
        const dragIndex = nextOrder.indexOf(dragRowId);
        const hoverIndex = nextOrder.indexOf(hoverRowId);
        if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

        nextOrder.splice(dragIndex, 1);
        nextOrder.splice(hoverIndex, 0, dragRowId);

        const nextBlocks = JSON.parse(JSON.stringify(blocks));
        const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
        const nextColumn = nextBlock?.columns?.[columnIndex];
        const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
        if (!nextWidget || nextWidget.contentType !== 'orderSubtotal') return;

        let nextData: any = {};
        try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
        nextData.orderSubtotalRowOrder = nextOrder;
        nextWidget.contentData = JSON.stringify(nextData);
        dispatch(setBlocks(nextBlocks));
    }, [blockId, blocks, columnIndex, dispatch, rowOrder, widgetIndex]);
    const totalsRows = [
        { id: 'subtotal', label: options.subtotalLabel || 'Subtotal', value: '₹50.00' },
        { id: 'discount', label: options.discountLabel || 'Discount', value: '-₹5.00', color: '#e53e3e' },
        { id: 'shipping', label: options.shippingLabel || 'Shipping', value: '₹10.00' },
        { id: 'refunded_full', label: options.refundedFullyLabel || 'Order fully refunded', value: '-₹0.00', weight: 'bold', border: true },
        { id: 'refunded_partial', label: options.refundedPartialLabel || 'Refund', value: '-₹0.00' },
    ];
    const orderedTotalsRows = rowOrder
        .map(rowId => totalsRows.find(row => row.id === rowId))
        .filter(Boolean) as typeof totalsRows;

    const getTotalsRowValue = (rowId: string, previewValue: string) => {
        if (previewMode) return previewValue;
        const values: Record<string, string> = {
            subtotal: options.subtotalValue || '{{order_subtotal}}',
            discount: options.discountValue ? `-${options.discountValue}` : '-{{order_discount}}',
            shipping: options.shippingValue || '{{order_shipping}}',
            refunded_full: options.refundedFullyValue ? `-${options.refundedFullyValue}` : '-{{order_total}}',
            refunded_partial: options.refundedPartialValue ? `-${options.refundedPartialValue}` : '-{{refund_amount}}',
        };
        return values[rowId] || previewValue;
    };

    return (
        <div
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
                onClick();
                dispatch(setSelectedBlockId(blockId));
            }}
            style={{
                outline: 'none',
                boxSizing: 'border-box',
                boxShadow: isSelected ? '0 0 0 2px #2196f3' : 'none',
                border: `${options.borderWidth || 0}px solid ${options.borderColor || '#eeeeee'}`,
                padding: getSpacingStyle(options.padding, (options.borderWidth || 0) > 0 ? '0px' : '10px'),
                margin: getSpacingStyle(options.margin, '0px'),
                cursor: 'pointer',
                width: options.width || '100%',
                height: options.height || 'auto',
                backgroundColor: options.backgroundColor && options.backgroundColor !== 'transparent' ? options.backgroundColor : 'transparent',
                ...getSubElementSx(options.subStyles, 'outer_container')
            }}
        >
            {options.value === '{{order_subtotal}}' || options.value === '{{order_totals_table}}' || !options.value ? (
                /* ── Multi-row table mode ── */
                <div style={{ width: '100%', boxSizing: 'border-box' }}>
                    {orderedTotalsRows.map((item, index) => (
                        <DraggableOrderSubtotalRow key={item.id} rowId={item.id} order={getRowOrder(item.id)} widgetDragId={widgetDragId} previewMode={previewMode} onMove={moveOrderSubtotalRow}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId={`${item.id}_container`} previewMode={previewMode}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'stretch',
                                    boxSizing: 'border-box',
                                    gap: columnGap > 0 ? `${columnGap}px` : undefined,
                                    borderBottom: (index < 4 && (options.borderWidth || 0) > 0) ? `${options.borderWidth}px solid ${options.borderColor || '#eeeeee'}` : 'none',
                                    borderTop: (item.border && !(options.borderWidth || 0)) ? `1px solid ${options.borderColor || '#eee'}` : 'none',
                                    fontFamily: options.fontFamily === 'inherit' || !options.fontFamily ? 'inherit' : options.fontFamily,
                                    fontSize: options.fontSize,
                                    lineHeight: options.lineHeight ? String(options.lineHeight) : undefined,
                                    color: item.color || options.textColor,
                                    ...getSubElementSx(options.subStyles, `${item.id}_container`)
                                }}
                            >
                                {/* Label cell */}
                                <div style={{
                                    boxSizing: 'border-box',
                                    width: `${labelColumnWidth}%`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: labelJustify,
                                    textAlign: labelTextAlign as any,
                                    fontWeight: item.weight || options.fontWeight || 'normal',
                                    borderRight: (options.borderWidth || 0) > 0 ? `${options.borderWidth}px solid ${options.borderColor || '#eeeeee'}` : 'none',
                                    paddingRight: (options.borderWidth || 0) > 0 ? '10px' : '0',
                                    paddingLeft: (options.borderWidth || 0) > 0 ? '10px' : '0',
                                    paddingTop: `${options.spacing || 0}px`,
                                    paddingBottom: `${options.spacing || 0}px`,
                                    ...visibilityStyles,
                                    ...getSubElementSx(options.subStyles, `${item.id}_label`)
                                }}>
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId={`${item.id}_label`} previewMode={previewMode}>
                                        {previewMode ? getPreviewValue(item.label) : replaceDynamicVariables(item.label)}:
                                    </SubElementWrapper>
                                </div>

                                {/* Value cell */}
                                <div style={{
                                    boxSizing: 'border-box',
                                    width: `${lastColumnWidth}%`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: valueJustify,
                                    textAlign: valueTextAlign as any,
                                    fontWeight: item.weight || 'normal',
                                    paddingLeft: (options.borderWidth || 0) > 0 ? '10px' : '0',
                                    paddingRight: (options.borderWidth || 0) > 0 ? '10px' : '0',
                                    paddingTop: `${options.spacing || 0}px`,
                                    paddingBottom: `${options.spacing || 0}px`,
                                    ...visibilityStyles,
                                    ...getSubElementSx(options.subStyles, `${item.id}_value`)
                                  }}>
                                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId={`${item.id}_value`} previewMode={previewMode}>
                                        {previewMode ? getPreviewValue(getTotalsRowValue(item.id, item.value)) : replaceDynamicVariables(getTotalsRowValue(item.id, item.value))}
                                    </SubElementWrapper>
                                </div>
                            </div>
                        </SubElementWrapper>
                        </DraggableOrderSubtotalRow>
                    ))}
                </div>
            ) : (
                /* ── Single-row mode ── */
                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId="row_container" previewMode={previewMode}>
                    <div style={{
                        boxSizing: 'border-box',
                        display: 'flex',
                        alignItems: 'center',
                        gap: columnGap > 0 ? `${columnGap}px` : undefined,
                        backgroundColor: options.backgroundColor || 'transparent',
                        fontFamily: options.fontFamily || 'Arial, sans-serif',
                        fontSize: options.fontSize || '14px',
                        color: options.textColor || '#333333',
                        paddingTop: `${options.spacing || 0}px`,
                        paddingBottom: `${options.spacing || 0}px`,
                        width: '100%',
                        ...getSubElementSx(options.subStyles, 'row_container')
                    }}>
                        {/* Label cell */}
                        <div style={{
                            boxSizing: 'border-box',
                            width: `${labelColumnWidth}%`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: labelJustify,
                            textAlign: labelTextAlign as any,
                            fontWeight: options.fontWeight || 'normal',
                            ...visibilityStyles,
                            ...getSubElementSx(options.subStyles, 'label_p')
                        }}>
                            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId="label_p" previewMode={previewMode}>
                                {previewMode ? getPreviewValue(options.label) : replaceDynamicVariables(options.label)}
                            </SubElementWrapper>
                        </div>

                        {/* Value cell */}
                        <div style={{
                            boxSizing: 'border-box',
                            width: `${lastColumnWidth}%`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: valueJustify,
                            textAlign: valueTextAlign as any,
                            ...visibilityStyles,
                            ...getSubElementSx(options.subStyles, 'value_p')
                        }}>
                            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="orderSubtotal" subElementId="value_p" previewMode={previewMode}>
                                {previewMode ? getPreviewValue(options.value) : replaceDynamicVariables(options.value)}
                            </SubElementWrapper>
                        </div>
                    </div>
                </SubElementWrapper>
            )}
        </div>
    );
};

export default OrderSubtotalFieldComponent;
