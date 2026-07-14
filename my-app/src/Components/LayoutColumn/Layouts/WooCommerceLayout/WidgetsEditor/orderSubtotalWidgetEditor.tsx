import React from 'react';
import { Box, Typography, TextField, Stack, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateOrderSubtotalEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const OrderSubtotalWidgetEditor = () => {
    const dispatch = useDispatch();
    const { orderSubtotalEditorOptions } = useSelector((state: RootState) => state.workspace);
    const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
        (state: RootState) => state.workspace
    );

    const handleChange = (field: keyof typeof orderSubtotalEditorOptions) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(updateOrderSubtotalEditorOptions({ [field]: e.target.value }));
    };

    const handleCloseEditor = () => {
        dispatch(closeEditor());
    };

    const handleDeleteContent = () => {
        if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
            dispatch(
                deleteColumnContent({
                    blockId: selectedBlockForEditor,
                    columnIndex: selectedColumnIndex,
                    widgetIndex: selectedWidgetIndex,
                })
            );
        }
    };

    const tabs = [
        {
            label: 'Content',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>TRANSLATIONS</Typography>
                            <Stack spacing={1.5}>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Subtotal Label</Typography>
                                    <TextField value={orderSubtotalEditorOptions.subtotalLabel || 'Subtotal'} onChange={handleChange('subtotalLabel')} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Discount Label</Typography>
                                    <TextField value={orderSubtotalEditorOptions.discountLabel || 'Discount'} onChange={handleChange('discountLabel')} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Shipping Label</Typography>
                                    <TextField value={orderSubtotalEditorOptions.shippingLabel || 'Shipping'} onChange={handleChange('shippingLabel')} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Refunded Fully Label</Typography>
                                    <TextField value={orderSubtotalEditorOptions.refundedFullyLabel || 'Order fully refunded'} onChange={handleChange('refundedFullyLabel')} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Refunded Partial Label</Typography>
                                    <TextField value={orderSubtotalEditorOptions.refundedPartialLabel || 'Refund'} onChange={handleChange('refundedPartialLabel')} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                </Box>
                            </Stack>
                        </Box>
                        <Divider />
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Last column width (%)</Typography>
                            <TextField
                                type="number"
                                value={orderSubtotalEditorOptions?.lastColumnWidth || 30}
                                onChange={handleChange('lastColumnWidth')}
                                size="small"
                                sx={{ width: '80px' }}
                                InputProps={{ inputProps: { min: 10, max: 90 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>
                        {/* Row spacing */}
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Row Spacing (px)</Typography>
                            <TextField
                                type="number"
                                value={orderSubtotalEditorOptions.spacing || 0}
                                onChange={handleChange('spacing')}
                                size="small"
                                sx={{ width: '80px' }}
                                InputProps={{ inputProps: { min: 0 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>

                        {/* Column gap (label ↔ value) */}
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Label ↔ Value Gap (px)</Typography>
                                <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.3 }}>Horizontal space between label and value</Typography>
                            </Box>
                            <TextField
                                type="number"
                                value={orderSubtotalEditorOptions.columnGap ?? 0}
                                onChange={(e) => dispatch(updateOrderSubtotalEditorOptions({ columnGap: Number(e.target.value) }))}
                                size="small"
                                sx={{ width: '80px' }}
                                InputProps={{ inputProps: { min: 0 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>
                    </Stack>
                </Box>
            )
        },
        {
            label: 'Style',
            content: <div /> // Replaced by GlobalStyleTab inside WidgetEditorWrapper
        },
        {
            label: 'Advanced',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <AdvancedTabContent
                        subStyles={orderSubtotalEditorOptions}
                        onUpdate={(val) => dispatch(updateOrderSubtotalEditorOptions(val))}
                    />
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Order Subtotal"
            description="Customize subtotal display."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default OrderSubtotalWidgetEditor;
