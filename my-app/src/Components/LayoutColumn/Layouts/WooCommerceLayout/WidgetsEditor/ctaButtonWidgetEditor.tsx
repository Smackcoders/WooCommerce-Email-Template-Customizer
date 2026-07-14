import React from 'react';
import { Box, TextField, Typography, Select, MenuItem, FormControl, InputLabel, Stack, Divider, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Switch, Slider, FormControlLabel } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateCtaButtonEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import CommonStylingControls from '../../../../utils/CommonStylingControls';

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const CtaButtonWidgetEditor: React.FC = () => {
    const dispatch = useDispatch();
    const { ctaButtonEditorOptions, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);

    const handleChange = (field: string, value: any) => {
        dispatch(updateCtaButtonEditorOptions({ [field]: value }));
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
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Link Preset</Typography>
                            <FormControl fullWidth size="small">
                                <Select
                                    value={''}
                                    displayEmpty
                                    onChange={(e) => {
                                        const val = e.target.value as string;
                                        if (val === 'view_order') {
                                            dispatch(updateCtaButtonEditorOptions({
                                                buttonText: 'View Order',
                                                buttonUrl: '{{order_url}}'
                                            }));
                                        } else if (val === 'track_order') {
                                            dispatch(updateCtaButtonEditorOptions({
                                                buttonText: 'Track Your Order',
                                                buttonUrl: '{{order_tracking_url}}'
                                            }));
                                        } else if (val === 'shop_now') {
                                            dispatch(updateCtaButtonEditorOptions({
                                                buttonText: 'Shop Now',
                                                buttonUrl: '{{shop_url}}'
                                            }));
                                        }
                                    }}
                                    sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                                    MenuProps={{
                                        disablePortal: true,
                                        sx: { zIndex: 999999 }
                                    }}
                                >
                                    <MenuItem value="" disabled sx={{ fontSize: '11px' }}>Select a Preset</MenuItem>
                                    <MenuItem value="view_order" sx={{ fontSize: '11px' }}>View Order</MenuItem>
                                    <MenuItem value="track_order" sx={{ fontSize: '11px' }}>Track Your Order</MenuItem>
                                    <MenuItem value="shop_now" sx={{ fontSize: '11px' }}>Shop Now</MenuItem>
                                </Select>
                            </FormControl>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Button Text</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={ctaButtonEditorOptions?.buttonText || ''}
                                onChange={(e) => handleChange('buttonText', e.target.value)}
                                placeholder="e.g. View Order"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Button URL</Typography>
                            <TextField
                                fullWidth
                                size="small"
                                value={ctaButtonEditorOptions?.buttonUrl || ''}
                                onChange={(e) => handleChange('buttonUrl', e.target.value)}
                                placeholder="{{order_url}}"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
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
                            options={ctaButtonEditorOptions}
                            onUpdate={(updatedOptions) => dispatch(updateCtaButtonEditorOptions(updatedOptions))}
                            showMargin={true}
                        />

                        <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Border Radius (px)</Typography>
                                <TextField
                                    fullWidth
                                    type="number"
                                    size="small"
                                    value={parseInt(ctaButtonEditorOptions?.borderRadius) || 0}
                                    onChange={(e) => handleChange('borderRadius', e.target.value + 'px')}
                                    InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                />
                            </Box>
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Hover Color</Typography>
                                <TextField
                                    fullWidth
                                    type="color"
                                    size="small"
                                    value={ctaButtonEditorOptions?.hoverColor === 'transparent' ? '#45a049' : (ctaButtonEditorOptions?.hoverColor || '#45a049')}
                                    onChange={(e) => handleChange('hoverColor', e.target.value)}
                                    sx={{
                                        '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                                        '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
                            <Box display="flex" alignItems="center" gap={2}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={ctaButtonEditorOptions?.widthAuto !== false}
                                            onChange={(e) => {
                                                const isAuto = e.target.checked;
                                                dispatch(updateCtaButtonEditorOptions({
                                                    widthAuto: isAuto,
                                                    width: isAuto ? undefined : (ctaButtonEditorOptions?.width ?? 100),
                                                }));
                                            }}
                                            size="small"
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#555' }}>Auto</Typography>}
                                    labelPlacement="start"
                                    sx={{ m: 0 }}
                                />
                                {ctaButtonEditorOptions?.widthAuto === false && (
                                    <Box width="100%" ml={1}>
                                        <Slider
                                            value={ctaButtonEditorOptions?.width ?? 100}
                                            onChange={(e, newValue) => dispatch(updateCtaButtonEditorOptions({ width: newValue as number }))}
                                            size="small"
                                            sx={{ color: '#93003c' }}
                                        />
                                    </Box>
                                )}
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
            title="Call-to-Action Button"
            description="Customize your call-to-action button."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default CtaButtonWidgetEditor;
