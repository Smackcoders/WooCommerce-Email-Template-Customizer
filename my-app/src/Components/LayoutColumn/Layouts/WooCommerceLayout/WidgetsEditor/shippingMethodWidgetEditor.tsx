import React from 'react';
import { Box, Typography, TextField, Stack, Divider } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateShippingMethodEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const ShippingMethodWidgetEditor = () => {
    const dispatch = useDispatch();
    const { shippingMethodEditorOptions } = useSelector((state: RootState) => state.workspace);
    const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
        (state: RootState) => state.workspace
    );

    const handleChange = (field: keyof typeof shippingMethodEditorOptions) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(updateShippingMethodEditorOptions({ [field]: e.target.value }));
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
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Label</Typography>
                            <TextField value={shippingMethodEditorOptions.label} onChange={handleChange('label')} size="small" fullWidth placeholder="Shipping Method" InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                        </Box>
                        <Divider />
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Last column width (%)</Typography>
                            <TextField
                                type="number"
                                value={shippingMethodEditorOptions?.lastColumnWidth || 30}
                                onChange={handleChange('lastColumnWidth' as any)}
                                size="small"
                                sx={{ width: '80px' }}
                                InputProps={{ inputProps: { min: 10, max: 90 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
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
                        subStyles={shippingMethodEditorOptions}
                        onUpdate={(val) => dispatch(updateShippingMethodEditorOptions(val))}
                    />
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Shipping Method"
            description="Customize shipping method display."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default ShippingMethodWidgetEditor;
