import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultShippingMethodEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
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

const ShippingMethodFieldComponent: React.FC<Props> = ({
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
    const block = useSelector((state: RootState) => state.workspace.blocks.find(b => b.id === blockId));
    const column = block?.columns[columnIndex];
    const storeWidget = column?.widgetContents[widgetIndex];
    const widget = widgetData || storeWidget;

    const options = React.useMemo(() => {
        if (widget?.contentData) {
            try {
                return { ...defaultShippingMethodEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                console.error("Failed to parse shippingMethod options", e);
            }
        }
        return defaultShippingMethodEditorOptions;
    }, [widget]);

    const lastColumnWidth = options.lastColumnWidth || 30;
    const labelColumnWidth = 100 - lastColumnWidth;

    // Resolved alignment helpers
    const labelJustify = alignToFlex(options.labelAlign);
    const labelTextAlign = alignToText(options.labelAlign);
    const valueJustify = alignToFlex(options.valueAlign);
    const valueTextAlign = alignToText(options.valueAlign);

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
                display: 'flex',
                width: options.width || '100%',
                height: options.height || 'auto',
                backgroundColor: options.backgroundColor && options.backgroundColor !== 'transparent' ? options.backgroundColor : 'transparent',
                ...getSubElementSx(options.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingMethod" subElementId="row_container" previewMode={previewMode}>
                <div style={{
                    boxSizing: 'border-box',
                    fontFamily: options.fontFamily || 'Arial, sans-serif',
                    fontSize: options.fontSize || '14px',
                    color: options.textColor || '#333333',
                    display: 'flex',
                    alignItems: (options.borderWidth || 0) > 0 ? 'stretch' : 'center',
                    width: '100%',
                    paddingTop: `${options.spacing || 0}px`,
                    paddingBottom: `${options.spacing || 0}px`,
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
                        fontWeight: options.fontWeight || 'bold',
                        borderRight: options.borderWidth ? `${options.borderWidth}px solid ${options.borderColor || '#eeeeee'}` : 'none',
                        padding: options.borderWidth ? (options.padding || '10px') : 0,
                        ...getSubElementSx(options.subStyles, 'label_p')
                    }}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingMethod" subElementId="label_p" previewMode={previewMode}>
                            {replaceDynamicVariables(options.label)}
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
                        fontWeight: options.fontWeight || 'normal',
                        padding: options.borderWidth ? (options.padding || '10px') : 0,
                        ...getSubElementSx(options.subStyles, 'value_p')
                    }}>
                        <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="shippingMethod" subElementId="value_p" previewMode={previewMode}>
                            {replaceDynamicVariables(options.value || '{{shipping_method}}')}
                        </SubElementWrapper>
                    </div>
                </div>
            </SubElementWrapper>
        </div>
    );
};

export default ShippingMethodFieldComponent;
