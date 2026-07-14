import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultCustomerNoteEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSubElementSx, replaceDynamicVariables, getSpacingStyle } from '../../utils/treeHelper';
import SubElementWrapper from '../../WorkspaceColumn/workspaceArea/SubElementWrapper';



interface Props {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    widgetData?: any;
    previewMode?: boolean;
}

const CustomerNoteFieldComponent: React.FC<Props> = ({
    blockId,
    columnIndex,
    isSelected,
    onClick,
    onWidgetClick,
    widgetIndex,
    widgetData,
    previewMode = false
}) => {
    const { blocks } = useSelector((state: RootState) => state.workspace);
    const dispatch = useDispatch();

    const storeBlock = blocks.find((b) => b.id === blockId);
    const storeColumn = storeBlock?.columns[columnIndex];
    const storeWidget = storeColumn?.widgetContents[widgetIndex];

    const widget = widgetData || storeWidget;

    const customerNoteEditorOptions = React.useMemo(() => {
        if (widget?.contentData) {
            try {
                return { ...defaultCustomerNoteEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) {
                console.error("Failed to parse customerNote options", e);
            }
        }
        return storeColumn?.customerNoteEditorOptions || defaultCustomerNoteEditorOptions;
    }, [storeColumn, widget]);

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
                border: `${customerNoteEditorOptions.borderWidth || 0}px solid ${customerNoteEditorOptions.borderColor || '#eeeeee'}`,
                padding: (customerNoteEditorOptions.borderWidth || 0) > 0 ? '0' : (customerNoteEditorOptions.padding || '10px'),
                margin: getSpacingStyle(customerNoteEditorOptions.margin, '0px'),
                cursor: 'pointer',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: (customerNoteEditorOptions.borderWidth || 0) > 0 ? 'stretch' : 'center',
                textAlign: (customerNoteEditorOptions.textAlign as any) || 'left',
                width: '100%',
                backgroundColor: customerNoteEditorOptions.backgroundColor && customerNoteEditorOptions.backgroundColor !== 'transparent' ? customerNoteEditorOptions.backgroundColor : 'transparent',
                ...getSubElementSx(customerNoteEditorOptions.subStyles, 'outer_container')
            }}
        >
            <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="customerNote" subElementId="note_container" previewMode={previewMode}>
                <div style={{
                    boxSizing: 'border-box',
                    fontFamily: customerNoteEditorOptions.fontFamily || 'Arial, sans-serif',
                    fontSize: customerNoteEditorOptions.fontSize || '14px',
                    fontWeight: customerNoteEditorOptions.fontWeight,
                    lineHeight: customerNoteEditorOptions.lineHeight
                        ? (customerNoteEditorOptions.lineHeight > 10
                            ? `${customerNoteEditorOptions.lineHeight}px`
                            : customerNoteEditorOptions.lineHeight)
                        : 'normal',
                    color: customerNoteEditorOptions.textColor || '#333333',
                    display: 'flex',
                    alignItems: 'stretch',
                    width: '100%',
                    ...getSubElementSx(customerNoteEditorOptions.subStyles, 'note_container')
                }}>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="customerNote" subElementId="note_label" previewMode={previewMode}>
                        <div style={{
                            boxSizing: 'border-box',
                            textAlign: (customerNoteEditorOptions.labelAlign as any) || 'left',
                            justifyContent: (customerNoteEditorOptions.labelAlign === 'center') ? 'center' : (customerNoteEditorOptions.labelAlign === 'right' ? 'flex-end' : 'flex-start'),
                            width: `${100 - (customerNoteEditorOptions.lastColumnWidth || 30)}%`,
                            borderRight: customerNoteEditorOptions.borderWidth ? `${customerNoteEditorOptions.borderWidth}px solid ${customerNoteEditorOptions.borderColor || '#eeeeee'}` : 'none',
                            padding: customerNoteEditorOptions.borderWidth ? (customerNoteEditorOptions.padding || '10px') : '5px 0',
                            display: 'flex',
                            alignItems: 'center',
                            ...getSubElementSx(customerNoteEditorOptions.subStyles, 'note_label')
                        }}>
                            {replaceDynamicVariables(customerNoteEditorOptions.label === 'Customer Note' || !customerNoteEditorOptions.label ? 'Note:' : customerNoteEditorOptions.label)}
                        </div>
                    </SubElementWrapper>
                    <SubElementWrapper blockId={blockId} columnIndex={columnIndex} widgetIndex={widgetIndex} contentType="customerNote" subElementId="note_value" previewMode={previewMode}>
                        <div style={{
                            boxSizing: 'border-box',
                            textAlign: (customerNoteEditorOptions.valueAlign as any) || 'right',
                            justifyContent: (customerNoteEditorOptions.valueAlign === 'center') ? 'center' : (customerNoteEditorOptions.valueAlign === 'left' ? 'flex-start' : 'flex-end'),
                            width: `${customerNoteEditorOptions.lastColumnWidth || 30}%`,
                            padding: customerNoteEditorOptions.borderWidth ? (customerNoteEditorOptions.padding || '10px') : '5px 0',
                            display: 'flex',
                            alignItems: 'center',
                            ...getSubElementSx(customerNoteEditorOptions.subStyles, 'note_value')
                        }}>
                            {replaceDynamicVariables(customerNoteEditorOptions.value === '{{customer_note}}' || !customerNoteEditorOptions.value ? 'Please deliver between 9 AM and 5 PM.' : customerNoteEditorOptions.value)}
                        </div>
                    </SubElementWrapper>
                </div>
            </SubElementWrapper>
        </div>
    );
};

export default CustomerNoteFieldComponent;
