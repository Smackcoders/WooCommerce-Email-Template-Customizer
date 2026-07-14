import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useDrag, useDrop } from 'react-dnd';
import { RootState } from '../../../Store/store';
import { setBlocks, setSelectedBlockId, defaultShippingAddressEditorOptions } from '../../../Store/Slice/workspaceSlice';
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

const defaultShippingAddressFieldOrder = ['name', 'email', 'phone', 'address1', 'address2', 'city', 'state', 'postalCode', 'country'];

interface ShippingAddressRowDragItem {
  type: 'SHIPPING_ADDRESS_FIELD_ROW';
  fieldId: string;
  index: number;
  widgetDragId: string;
}

interface DraggableShippingAddressFieldProps {
  fieldId: string;
  order: number;
  widgetDragId: string;
  previewMode: boolean;
  children: React.ReactNode;
  onMove: (dragFieldId: string, hoverFieldId: string) => void;
}

const DraggableShippingAddressField: React.FC<DraggableShippingAddressFieldProps> = ({
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
    type: 'SHIPPING_ADDRESS_FIELD_ROW',
    item: { type: 'SHIPPING_ADDRESS_FIELD_ROW', fieldId, index: order, widgetDragId },
    canDrag: !previewMode,
    end: () => setInnerDragActive(false),
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  }), [fieldId, order, widgetDragId, previewMode]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'SHIPPING_ADDRESS_FIELD_ROW',
    hover: (item: ShippingAddressRowDragItem) => {
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

const ShippingAddressFieldComponent: React.FC<Props> = ({
  isSelected, onClick, onWidgetClick,
  blockId, columnIndex, widgetIndex, previewMode = true, widgetData,
}) => {
  const { blocks } = useSelector((state: RootState) => state.workspace);
  const dispatch = useDispatch();

  const storeBlock  = blocks.find(b => b.id === blockId);
  const storeColumn = storeBlock?.columns[columnIndex];
  const storeWidget = storeColumn?.widgetContents[widgetIndex];
  const widget = widgetData || storeWidget;

  const content = widget?.contentData
    ? { ...defaultShippingAddressEditorOptions, ...JSON.parse(widget.contentData) }
    : defaultShippingAddressEditorOptions;

  const sub = content.subStyles || {};

  const fields: Array<{ id: string; labelKey: string; valueKey: string; defaultLabel: string; placeholder: string }> = [
    { id: 'name',       labelKey: 'nameLabel',        valueKey: 'fullName',     defaultLabel: 'Name:',          placeholder: previewMode ? getPreviewValue('{{shipping_name}}') : '{{shipping_name}}' },
    { id: 'email',      labelKey: 'emailLabel',        valueKey: 'email',        defaultLabel: 'Email:',         placeholder: previewMode ? getPreviewValue('{{shipping_email}}') : '{{shipping_email}}' },
    { id: 'phone',      labelKey: 'phoneLabel',        valueKey: 'phone',        defaultLabel: 'Phone:',         placeholder: previewMode ? getPreviewValue('{{shipping_phone}}') : '{{shipping_phone}}' },
    { id: 'address1',   labelKey: 'addressLine1Label', valueKey: 'addressLine1', defaultLabel: 'Address Line 1:',placeholder: previewMode ? getPreviewValue('{{shipping_address_1}}') : '{{shipping_address_1}}' },
    { id: 'address2',   labelKey: 'addressLine2Label', valueKey: 'addressLine2', defaultLabel: 'Address Line 2:',placeholder: previewMode ? getPreviewValue('{{shipping_address_2}}') : '{{shipping_address_2}}' },
    { id: 'city',       labelKey: 'cityLabel',         valueKey: 'city',         defaultLabel: 'City:',          placeholder: previewMode ? getPreviewValue('{{shipping_city}}') : '{{shipping_city}}' },
    { id: 'state',      labelKey: 'stateLabel',        valueKey: 'state',        defaultLabel: 'State:',         placeholder: previewMode ? getPreviewValue('{{shipping_state}}') : '{{shipping_state}}' },
    { id: 'postalCode', labelKey: 'postalCodeLabel',   valueKey: 'postalCode',   defaultLabel: 'Postal Code:',   placeholder: previewMode ? getPreviewValue('{{shipping_postcode}}') : '{{shipping_postcode}}' },
    { id: 'country',    labelKey: 'countryLabel',      valueKey: 'country',      defaultLabel: 'Country:',       placeholder: previewMode ? getPreviewValue('{{shipping_country}}') : '{{shipping_country}}' },
  ];

  const fieldOrder = Array.isArray(content.shippingAddressFieldOrder)
    ? [
        ...content.shippingAddressFieldOrder.filter((fieldId: string) => defaultShippingAddressFieldOrder.includes(fieldId)),
        ...defaultShippingAddressFieldOrder.filter(fieldId => !content.shippingAddressFieldOrder.includes(fieldId)),
      ]
    : defaultShippingAddressFieldOrder;

  const orderedFields = fieldOrder
    .map(fieldId => fields.find(field => field.id === fieldId))
    .filter(Boolean) as typeof fields;

  const getFieldOrder = (fieldId: string) => fieldOrder.indexOf(fieldId);
  const widgetDragId = `${blockId}:${columnIndex}:${widgetIndex}:shippingAddress`;

  const moveShippingAddressField = React.useCallback((dragFieldId: string, hoverFieldId: string) => {
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
    if (!nextWidget || nextWidget.contentType !== 'shippingAddress') return;

    let nextData: any = {};
    try { nextData = JSON.parse(nextWidget.contentData || '{}'); } catch { nextData = {}; }
    nextData.shippingAddressFieldOrder = nextOrder;
    nextWidget.contentData = JSON.stringify(nextData);
    dispatch(setBlocks(nextBlocks));
  }, [blockId, blocks, columnIndex, dispatch, fieldOrder, widgetIndex]);

  return (
    <div
      onClick={e => { e.stopPropagation(); onWidgetClick(e); onClick(); dispatch(setSelectedBlockId(blockId)); }}
      id="shipping_address"
      style={{
        width: '100%', wordBreak: 'break-word',
        textAlign: (content.textAlign as any) || 'left',
        padding: getSpacingStyle(content.padding, '0px'),
        margin: getSpacingStyle(content.margin, '0px'),
        backgroundColor: content.backgroundColor && content.backgroundColor !== 'transparent' ? content.backgroundColor : 'transparent',
        ...toInlineStyle(sub.outer_container || {}),
      }}
    >
      {/* Header */}
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId="header_container" previewMode={previewMode}>
        <div style={{ ...toInlineStyle(sub.header_container || {}) }}>
          <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId="header_title" previewMode={previewMode}>
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
              replaceDynamicVariables(content.title || 'SHIP TO:')
            )}
          </SubElementWrapper>
        </div>
      </SubElementWrapper>

      {/* Fields */}
      <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId="fields_container" previewMode={previewMode}>
        <div style={{ ...toInlineStyle(sub.fields_container || {}) }}>
          {orderedFields.map(({ id, labelKey, valueKey, defaultLabel, placeholder }) => {
            const labelSub     = sub[`${id}_label`]     || {};
            const valueSub     = sub[`${id}_value`]     || {};
            const containerSub = sub[`${id}_container`] || {};
            const labelText = replaceDynamicVariables((content as any)[labelKey] !== undefined ? (content as any)[labelKey] : defaultLabel);
            const valueText = replaceDynamicVariables((content as any)[valueKey]?.trim() || placeholder);
            const linkHref   = replaceDynamicVariables(valueSub.linkHref   || '');
            const linkTarget = valueSub.linkTarget  || '_self';
            const htmlTag    = labelSub.htmlTag     || 'span';

            return (
              <DraggableShippingAddressField key={id} fieldId={id} order={getFieldOrder(id)} widgetDragId={widgetDragId} previewMode={previewMode} onMove={moveShippingAddressField}>
                <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId={`${id}_container`} previewMode={previewMode}>
                  <div style={{
                    display: 'block', marginBottom: '4px',
                    ...toInlineStyle(containerSub),
                  }}>
                    {/* Label */}
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId={`${id}_label`} previewMode={previewMode}>
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
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingAddress" subElementId={`${id}_value`} previewMode={previewMode}>
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
              </DraggableShippingAddressField>
            );
          })}
        </div>
      </SubElementWrapper>
    </div>
  );
};

export default ShippingAddressFieldComponent;
