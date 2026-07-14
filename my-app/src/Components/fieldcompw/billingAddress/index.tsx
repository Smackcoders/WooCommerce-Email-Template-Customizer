import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId, defaultBillingAddressEditorOptions } from '../../../Store/Slice/workspaceSlice';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';
import { getPreviewValue } from '../../../utils/previewHelper';
import { getSubElementSx, replaceDynamicVariables } from '../../utils/treeHelper';

const getSpacingStyle = (spacing: any, defaultVal: string = '0px') => {
  if (!spacing) return defaultVal;
  if (typeof spacing === 'string') return spacing;
  return `${spacing.top || 0}px ${spacing.right || 0}px ${spacing.bottom || 0}px ${spacing.left || 0}px`;
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

const toInlineStyle = (sx: Record<string, any>): React.CSSProperties => {
  return getSubElementSx({ elem: sx }, 'elem') as React.CSSProperties;
};

const getBorderStyles = (content: any): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  if (content.borderStyle) {
    styles.borderStyle = content.borderStyle;
  } else {
    if (content.borderTopStyle) styles.borderTopStyle = content.borderTopStyle;
    if (content.borderRightStyle) styles.borderRightStyle = content.borderRightStyle;
    if (content.borderBottomStyle) styles.borderBottomStyle = content.borderBottomStyle;
    if (content.borderLeftStyle) styles.borderLeftStyle = content.borderLeftStyle;
  }

  if (content.borderWidth !== undefined) {
    styles.borderWidth = typeof content.borderWidth === 'number' ? `${content.borderWidth}px` : content.borderWidth;
  } else {
    if (content.borderTopWidth !== undefined) styles.borderTopWidth = typeof content.borderTopWidth === 'number' ? `${content.borderTopWidth}px` : content.borderTopWidth;
    if (content.borderRightWidth !== undefined) styles.borderRightWidth = typeof content.borderRightWidth === 'number' ? `${content.borderRightWidth}px` : content.borderRightWidth;
    if (content.borderBottomWidth !== undefined) styles.borderBottomWidth = typeof content.borderBottomWidth === 'number' ? `${content.borderBottomWidth}px` : content.borderBottomWidth;
    if (content.borderLeftWidth !== undefined) styles.borderLeftWidth = typeof content.borderLeftWidth === 'number' ? `${content.borderLeftWidth}px` : content.borderLeftWidth;
  }

  if (content.borderColor) {
    styles.borderColor = content.borderColor;
  } else {
    if (content.borderTopColor) styles.borderTopColor = content.borderTopColor;
    if (content.borderRightColor) styles.borderRightColor = content.borderRightColor;
    if (content.borderBottomColor) styles.borderBottomColor = content.borderBottomColor;
    if (content.borderLeftColor) styles.borderLeftColor = content.borderLeftColor;
  }

  const hasAnyBorderStyle = !!(styles.borderStyle || styles.borderTopStyle || styles.borderRightStyle || styles.borderBottomStyle || styles.borderLeftStyle);
  if (hasAnyBorderStyle) {
    if (!styles.borderWidth && !styles.borderTopWidth && !styles.borderRightWidth && !styles.borderBottomWidth && !styles.borderLeftWidth) {
      styles.borderWidth = '1px';
    }
    if (!styles.borderColor && !styles.borderTopColor && !styles.borderRightColor && !styles.borderBottomColor && !styles.borderLeftColor) {
      styles.borderColor = '#dddddd';
    }
  }

  const rawRadius = content.borderRadius;
  if (rawRadius !== undefined) {
    if (typeof rawRadius === 'object' && rawRadius !== null) {
      const top = rawRadius.top ?? rawRadius.topLeft ?? 0;
      const right = rawRadius.right ?? rawRadius.topRight ?? 0;
      const bottom = rawRadius.bottom ?? rawRadius.bottomRight ?? 0;
      const left = rawRadius.left ?? rawRadius.bottomLeft ?? 0;
      styles.borderRadius = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      styles.borderRadius = typeof rawRadius === 'number' ? `${rawRadius}px` : rawRadius;
    }
  }

  return styles;
};

const defaultBillingAddressFieldOrder = ['name', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];

interface BillingAddressRowDragItem {
  type: 'BILLING_ADDRESS_FIELD_ROW';
  fieldId: string;
  index: number;
  widgetDragId: string;
}

interface DraggableBillingAddressFieldProps {
  fieldId: string;
  order: number;
  widgetDragId: string;
  previewMode: boolean;
  children: React.ReactNode;
  onMove: (dragFieldId: string, hoverFieldId: string) => void;
}

const DraggableBillingAddressField: React.FC<DraggableBillingAddressFieldProps> = ({
  fieldId,
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
    type: 'BILLING_ADDRESS_FIELD_ROW',
    item: { type: 'BILLING_ADDRESS_FIELD_ROW', fieldId, index: order, widgetDragId },
    canDrag: !previewMode,
    end: () => setInnerDragActive(false),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [fieldId, order, widgetDragId, previewMode]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'BILLING_ADDRESS_FIELD_ROW',
    hover: (item: BillingAddressRowDragItem) => {
      if (!ref.current || previewMode) return;
      if (item.widgetDragId !== widgetDragId || item.fieldId === fieldId) return;
      if (item.index === order) return;

      onMove(item.fieldId, fieldId);
      item.index = order;
    },
    collect: monitor => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [fieldId, order, widgetDragId, previewMode, onMove]);

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

const BillingAddressFieldComponent: React.FC<Props> = ({
  isSelected, onClick, onWidgetClick,
  blockId, columnIndex, widgetIndex, previewMode = true, widgetData,
}) => {
  const { blocks } = useSelector((state: RootState) => state.workspace);
  const dispatch = useDispatch();

  const storeBlock = blocks.find(b => b.id === blockId);
  const storeColumn = storeBlock?.columns[columnIndex];
  const storeWidget = storeColumn?.widgetContents[widgetIndex];
  const widget = widgetData || storeWidget;

  const content = widget?.contentData
    ? { ...defaultBillingAddressEditorOptions, ...JSON.parse(widget.contentData) }
    : defaultBillingAddressEditorOptions;

  const sub = content.subStyles || {};

  const fields: Array<{ id: string; labelKey: string; valueKey: string; defaultLabel: string; placeholder: string }> = [
    { id: 'name',       labelKey: 'nameLabel',        valueKey: 'fullName',     defaultLabel: 'Name:',          placeholder: previewMode ? getPreviewValue('{{billing_first_name}} {{billing_last_name}}') : '{{billing_first_name}} {{billing_last_name}}' },
    { id: 'email',      labelKey: 'emailLabel',        valueKey: 'email',        defaultLabel: 'Email:',         placeholder: previewMode ? getPreviewValue('{{billing_email}}') : '{{billing_email}}' },
    { id: 'phone',      labelKey: 'phoneLabel',        valueKey: 'phone',        defaultLabel: 'Phone:',         placeholder: previewMode ? getPreviewValue('{{billing_phone}}') : '{{billing_phone}}' },
    { id: 'address1',   labelKey: 'addressLine1Label', valueKey: 'addressLine1', defaultLabel: 'Address Line 1:',placeholder: previewMode ? getPreviewValue('{{billing_address_1}}') : '{{billing_address_1}}' },
    { id: 'address2',   labelKey: 'addressLine2Label', valueKey: 'address2', defaultLabel: 'Address Line 2:',placeholder: previewMode ? getPreviewValue('{{billing_address_2}}') : '{{billing_address_2}}' },
    { id: 'city',       labelKey: 'cityLabel',         valueKey: 'city',         defaultLabel: 'City:',          placeholder: previewMode ? getPreviewValue('{{billing_city}}') : '{{billing_city}}' },
    { id: 'state',      labelKey: 'stateLabel',        valueKey: 'state',        defaultLabel: 'State:',         placeholder: previewMode ? getPreviewValue('{{billing_state}}') : '{{billing_state}}' },
    { id: 'postalCode', labelKey: 'postalCodeLabel',   valueKey: 'postalCode',   defaultLabel: 'Postal Code:',   placeholder: previewMode ? getPreviewValue('{{billing_postcode}}') : '{{billing_postcode}}' },
    { id: 'country',    labelKey: 'countryLabel',      valueKey: 'country',      defaultLabel: 'Country:',       placeholder: previewMode ? getPreviewValue('{{billing_country}}') : '{{billing_country}}' }
  ];

  const fieldOrder = Array.isArray(content.billingAddressFieldOrder)
    ? [
        ...content.billingAddressFieldOrder.filter((fieldId: string) => defaultBillingAddressFieldOrder.includes(fieldId)),
        ...defaultBillingAddressFieldOrder.filter(fieldId => !content.billingAddressFieldOrder.includes(fieldId)),
      ]
    : defaultBillingAddressFieldOrder;

  const orderedFields = fieldOrder
    .map(fieldId => fields.find(field => field.id === fieldId))
    .filter(Boolean) as typeof fields;

  const getFieldOrder = (fieldId: string) => fieldOrder.indexOf(fieldId);
  const widgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:billingAddress`;

  const moveBillingAddressField = React.useCallback((dragFieldId: string, hoverFieldId: string) => {
    const nextOrder = [...fieldOrder];
    const dragIndex = nextOrder.indexOf(dragFieldId);
    const hoverIndex = nextOrder.indexOf(hoverFieldId);
    if (dragIndex === -1 || hoverIndex === -1 || dragIndex === hoverIndex) return;

    nextOrder.splice(dragIndex, 1);
    nextOrder.splice(hoverIndex, 0, dragFieldId);

    const nextBlocks = JSON.parse(JSON.stringify(blocks));
    const nextBlock = nextBlocks.find((b: any) => b.id === blockId);
    const nextColumn = nextBlock?.columns?.[columnIndex];
    const nextWidget = nextColumn?.widgetContents?.[widgetIndex];
    if (!nextWidget || nextWidget.contentType !== 'billingAddress') return;

    let nextData: any = {};
    try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
    nextData.billingAddressFieldOrder = nextOrder;
    nextWidget.contentData = JSON.stringify(nextData);
    dispatch(setBlocks(nextBlocks));
  }, [blockId, blocks, columnIndex, dispatch, fieldOrder, widgetIndex]);

  return (
    <div
      onClick={e => { e.stopPropagation(); onWidgetClick(e); onClick(); dispatch(setSelectedBlockId(blockId)); }}
      id="billing_address"
      style={{
        width: '100%', wordBreak: 'break-word',
        textAlign: (content.textAlign as any) || 'left',
        padding: getSpacingStyle(content.padding, '0px'),
        margin: getSpacingStyle(content.margin, '0px'),
        backgroundColor: content.backgroundColor && content.backgroundColor !== 'transparent' ? content.backgroundColor : 'transparent',
        ...getBorderStyles(content),
        ...toInlineStyle(sub.outer_container || {}),
      }}
    >
      {/* Header */}
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId="header_container" previewMode={previewMode}>
        <div style={{ ...toInlineStyle(sub.header_container || {}) }}>
          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId="header_title" previewMode={previewMode}>
            {React.createElement(
              (sub.header_title?.htmlTag || 'h4') as any,
              {
                style: {
                  margin: '0 0 8px 0',
                  fontFamily: content.fontFamily !== 'inherit' ? content.fontFamily : undefined,
                  fontSize: content.fontSize, color: content.textColor, fontWeight: 'bold',
                  ...toInlineStyle(sub.header_title || {}),
                }
              },
              replaceDynamicVariables(content.title || 'BILL TO:', true)
            )}
          </SubElementWrapper>
        </div>
      </SubElementWrapper>

      {/* Fields */}
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId="fields_container" previewMode={previewMode}>
        <div style={{ ...toInlineStyle(sub.fields_container || {}) }}>
          {orderedFields.map(({ id, labelKey, valueKey, defaultLabel, placeholder }) => {
            const labelSub     = sub[`${id}_label`]     || {};
            const valueSub     = sub[`${id}_value`]     || {};
            const containerSub = sub[`${id}_container`] || {};
            const labelText = replaceDynamicVariables((content as any)[labelKey] !== undefined ? (content as any)[labelKey] : defaultLabel, true);
            const valueText = replaceDynamicVariables((content as any)[valueKey]?.trim() || placeholder, true);
            const linkHref   = replaceDynamicVariables(valueSub.linkHref   || '', true);
            const linkTarget = valueSub.linkTarget  || '_self';
            const htmlTag    = labelSub.htmlTag     || 'span';

            return (
              <DraggableBillingAddressField key={id} fieldId={id} order={getFieldOrder(id)} widgetDragId={widgetDragId} previewMode={previewMode} onMove={moveBillingAddressField}>
                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId={`${id}_container`} previewMode={previewMode}>
                  <div style={{
                    display: 'block', marginBottom: '4px',
                    ...toInlineStyle(containerSub),
                  }}>
                    {/* Label */}
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId={`${id}_label`} previewMode={previewMode}>
                      {React.createElement(htmlTag as any, {
                        style: {
                          margin: 0, marginRight: '6px',
                          fontFamily: content.fontFamily !== 'inherit' ? content.fontFamily : undefined,
                          fontSize: content.fontSize, color: content.textColor, fontWeight: 'bold',
                          lineHeight: content.lineHeight || undefined,
                          ...toInlineStyle(labelSub),
                        }
                      }, labelText)}
                    </SubElementWrapper>

                  {/* Value */}
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="billingAddress" subElementId={`${id}_value`} previewMode={previewMode}>
                      {linkHref ? (
                        <a href={linkHref} target={linkTarget} style={{
                          margin: 0,
                          fontFamily: content.fontFamily !== 'inherit' ? content.fontFamily : undefined,
                          fontSize: content.fontSize, color: content.textColor,
                          fontWeight: content.fontWeight || 'normal',
                          lineHeight: content.lineHeight || undefined,
                          textDecoration: 'none',
                          ...toInlineStyle(valueSub),
                        }}>{valueText}</a>
                      ) : (
                        <span style={{
                          margin: 0,
                          fontFamily: content.fontFamily !== 'inherit' ? content.fontFamily : undefined,
                          fontSize: content.fontSize, color: content.textColor,
                          fontWeight: content.fontWeight || 'normal',
                          lineHeight: content.lineHeight || undefined,
                          ...toInlineStyle(valueSub),
                        }}>{valueText}</span>
                      )}
                    </SubElementWrapper>
                  </div>
                </SubElementWrapper>
              </DraggableBillingAddressField>
            );
          })}
        </div>
      </SubElementWrapper>
    </div>
  );
};

export default BillingAddressFieldComponent;
