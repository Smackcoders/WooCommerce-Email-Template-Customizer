import React from 'react';
import { Box, Typography, TextField, Stack, Divider, Tooltip, IconButton, MenuItem, ToggleButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateOrderTotalEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CommonStylingControls from '../../../../utils/CommonStylingControls';

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const OrderTotalWidgetEditor = () => {
    const dispatch = useDispatch();
    const { orderTotalEditorOptions } = useSelector((state: RootState) => state.workspace);
    const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
        (state: RootState) => state.workspace
    );

    const handleChange = (field: keyof typeof orderTotalEditorOptions) => (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        dispatch(updateOrderTotalEditorOptions({ [field]: e.target.value }));
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
                            <TextField value={orderTotalEditorOptions.label} onChange={handleChange('label')} size="small" fullWidth placeholder="Total" InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                        </Box>
                        <Divider />
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Last Column Width (%)</Typography>
                            <TextField
                                type="number"
                                value={orderTotalEditorOptions?.lastColumnWidth || 30}
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
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={2.5}>
                        <CommonStylingControls
                            options={orderTotalEditorOptions}
                            onUpdate={(updatedOptions) => dispatch(updateOrderTotalEditorOptions(updatedOptions))}
                            showMargin={true}
                            showFontWeight={true}
                            showTypography={true}
                            showTextColor={true}
                            showTextAlign={true}
                            showLabelAlign={true}
                            showValueAlign={true}
                            showLineHeight={true}
                        />

                        {/* Width & Height */}
                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Dimensions</Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Width</Typography>
                                    <TextField
                                        value={orderTotalEditorOptions?.width || '100%'}
                                        onChange={(e) => dispatch(updateOrderTotalEditorOptions({ width: e.target.value }))}
                                        size="small"
                                        fullWidth
                                        placeholder="100%"
                                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Height</Typography>
                                    <TextField
                                        value={orderTotalEditorOptions?.height || 'auto'}
                                        onChange={(e) => dispatch(updateOrderTotalEditorOptions({ height: e.target.value }))}
                                        size="small"
                                        fullWidth
                                        placeholder="auto"
                                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    />
                                </Box>
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Border</Typography>
                            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2} alignItems="end">
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Border Width</Typography>
                                    <TextField
                                        type="number"
                                        value={orderTotalEditorOptions?.borderWidth || 0}
                                        onChange={handleChange('borderWidth' as any)}
                                        size="small"
                                        fullWidth
                                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>
                                        Border Color
                                    </Typography>
                                    <Box display="flex" alignItems="center" gap={1} height="35px">
                                        <input
                                            type="color"
                                            value={orderTotalEditorOptions?.borderColor === 'transparent' ? '#eeeeee' : (orderTotalEditorOptions?.borderColor || '#eeeeee')}
                                            onChange={(e) => dispatch(updateOrderTotalEditorOptions({ borderColor: e.target.value }))}
                                            style={{
                                                width: '40px',
                                                height: '100%',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                padding: '0 2px',
                                                boxSizing: 'border-box'
                                            }}
                                        />
                                        <ToggleButton
                                            value="transparent"
                                            selected={orderTotalEditorOptions?.borderColor === 'transparent'}
                                            onChange={() => {
                                                const newColor = orderTotalEditorOptions?.borderColor === 'transparent' ? '#eeeeee' : 'transparent';
                                                dispatch(updateOrderTotalEditorOptions({ borderColor: newColor }));
                                            }}
                                            size="small"
                                            sx={{ height: '100%', flexGrow: 1, minWidth: '45px', border: '1px solid #ddd', fontSize: '9px' }}
                                        >
                                            NONE
                                        </ToggleButton>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Stack>
                </Box>
            )
        },
        {
            label: 'Advanced',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Typography sx={{ fontSize: '12px', color: '#6d7882', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
                        No advanced settings available for this widget.
                    </Typography>
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Order Total"
            description="Customize total display."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default OrderTotalWidgetEditor;
