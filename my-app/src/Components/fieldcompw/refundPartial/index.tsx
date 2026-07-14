import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultRefundPartialEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSpacingStyle } from '../../utils/treeHelper';

interface RefundPartialFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const RefundPartialFieldComponent: React.FC<RefundPartialFieldComponentProps> = ({
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
    const storeWidget = column?.widgetContents?.[widgetIndex];
    const widget = widgetData || storeWidget;

    const options = React.useMemo(() => {
        if (widget && widget.contentData) {
            try {
                return { ...defaultRefundPartialEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) { /* ignore */ }
        }
        return defaultRefundPartialEditorOptions;
    }, [widget]);

    const sampleItems = [
        { name: '{{product_name_1}}', amount: '{{refund_amount_1}}' },
        { name: '{{product_name_2}}', amount: '{{refund_amount_2}}' },
    ];

    return (
        <Box
            onClick={(e) => {
                e.stopPropagation();
                onWidgetClick(e);
                onClick();
                dispatch(setSelectedBlockId(blockId));
            }}
            sx={{
                width: '100%',
                padding: getSpacingStyle(options.padding as any, '0px'),
                margin: getSpacingStyle(options.margin as any, '0px'),
                cursor: 'pointer',
                border: '1px solid transparent',
                borderRadius: '4px',
            }}
        >
            <Box
                sx={{
                    backgroundColor: options.backgroundColor,
                    border: `1px solid ${options.borderColor}`,
                    padding: '16px',
                    fontFamily: options.fontFamily || 'inherit',
                    fontSize: options.fontSize || 14,
                    color: options.textColor,
                    fontWeight: options.fontWeight,
                    lineHeight: options.lineHeight ? `${options.lineHeight}px` : undefined,
                    letterSpacing: options.letterSpace ? `${options.letterSpace}px` : undefined,
                    textTransform: options.textTransform,
                    textDecoration: options.textDecoration,
                    fontStyle: options.fontStyle,
                    wordSpacing: options.wordSpacing ? `${options.wordSpacing}px` : undefined,
                }}
            >
                <Box sx={{ fontWeight: 700, fontSize: '1.1em', mb: 2, color: options.textColor }}>
                    {options.title || 'Partial Refund'}
                </Box>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit', fontFamily: 'inherit' }}>
                    <thead>
                        <tr style={{ backgroundColor: options.headerBackgroundColor, color: options.headerTextColor }}>
                            <th style={{ padding: '8px', border: `1px solid ${options.borderColor}`, textAlign: 'left' }}>
                                {options.productHeader || 'Item'}
                            </th>
                            <th style={{ padding: '8px', border: `1px solid ${options.borderColor}`, textAlign: 'right' }}>
                                {options.amountHeader || 'Refund Amount'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sampleItems.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{ padding: '8px', border: `1px solid ${options.borderColor}` }}>{item.name}</td>
                                <td style={{ padding: '8px', border: `1px solid ${options.borderColor}`, textAlign: 'right' }}>{item.amount}</td>
                            </tr>
                        ))}
                        <tr>
                            <td style={{ padding: '8px', border: `1px solid ${options.borderColor}`, fontWeight: 600 }}>
                                {options.reasonLabel || 'Reason'}
                            </td>
                            <td style={{ padding: '8px', border: `1px solid ${options.borderColor}` }}>
                                {'{{refund_reason}}'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Box>
        </Box>
    );
};

export default RefundPartialFieldComponent;
