import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId, defaultRefundFullEditorOptions } from '../../../Store/Slice/workspaceSlice';
import { getSpacingStyle } from '../../utils/treeHelper';

interface RefundFullFieldComponentProps {
    blockId: string;
    columnIndex: number;
    isSelected: boolean;
    onClick: () => void;
    onWidgetClick: (e: React.MouseEvent) => void;
    widgetIndex: number;
    previewMode?: boolean;
    widgetData?: any;
}

const RefundFullFieldComponent: React.FC<RefundFullFieldComponentProps> = ({
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
                return { ...defaultRefundFullEditorOptions, ...JSON.parse(widget.contentData) };
            } catch (e) { /* ignore */ }
        }
        return defaultRefundFullEditorOptions;
    }, [widget]);

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
                    {options.title || 'Your order has been fully refunded'}
                </Box>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'inherit', fontFamily: 'inherit' }}>
                    <tbody>
                        <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 600, width: '40%', borderBottom: `1px solid ${options.borderColor}` }}>
                                {options.amountLabel || 'Refund Amount'}
                            </td>
                            <td style={{ padding: '6px 8px', borderBottom: `1px solid ${options.borderColor}` }}>
                                {'{{refund_amount}}'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 600, borderBottom: `1px solid ${options.borderColor}` }}>
                                {options.dateLabel || 'Refund Date'}
                            </td>
                            <td style={{ padding: '6px 8px', borderBottom: `1px solid ${options.borderColor}` }}>
                                {'{{refund_date}}'}
                            </td>
                        </tr>
                        <tr>
                            <td style={{ padding: '6px 8px', fontWeight: 600 }}>
                                {options.reasonLabel || 'Reason'}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                                {'{{refund_reason}}'}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </Box>
        </Box>
    );
};

export default RefundFullFieldComponent;
