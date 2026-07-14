import React from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel, Accordion, AccordionSummary, AccordionDetails, IconButton, Tooltip, Stack, Divider } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateContactEditorOptions, defaultContactEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import CommonStylingControls from '../../../../utils/CommonStylingControls';

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const ContactWidgetEditor = () => {
    const dispatch = useDispatch();
    const {
        selectedBlockForEditor,
        selectedColumnIndex,
        selectedWidgetIndex,
        contactEditorOptions: options
    } = useSelector((state: RootState) => state.workspace);

    const handleChange = (key: string, value: any) => {
        dispatch(updateContactEditorOptions({ [key]: value }));
    };

    const handleOptionsUpdate = (updated: any) => {
        dispatch(updateContactEditorOptions(updated));
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
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Website URL</Typography>
                            <TextField
                                fullWidth
                                value={options.url}
                                onChange={(e) => handleChange('url', e.target.value)}
                                size="small"
                                placeholder="{{site_url}}"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                            <FormControlLabel
                                control={<Switch size="small" checked={options.showUrl} onChange={(e) => handleChange('showUrl', e.target.checked)} />}
                                label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show URL</Typography>}
                                sx={{ mt: 1, ml: 0 }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Shop Email</Typography>
                            <TextField
                                fullWidth
                                value={options.email}
                                onChange={(e) => handleChange('email', e.target.value)}
                                size="small"
                                placeholder="{{store_email}}"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                            <FormControlLabel
                                control={<Switch size="small" checked={options.showEmail} onChange={(e) => handleChange('showEmail', e.target.checked)} />}
                                label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Shop Email</Typography>}
                                sx={{ mt: 1, ml: 0 }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Shop Phone</Typography>
                            <TextField
                                fullWidth
                                value={options.phone}
                                onChange={(e) => handleChange('phone', e.target.value)}
                                size="small"
                                placeholder="{{store_phone}}"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                            <FormControlLabel
                                control={<Switch size="small" checked={options.showPhone} onChange={(e) => handleChange('showPhone', e.target.checked)} />}
                                label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Phone</Typography>}
                                sx={{ mt: 1, ml: 0 }}
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
                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Icon Color</Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <TextField
                                    type="color"
                                    value={options.iconColor}
                                    onChange={(e) => handleChange('iconColor', e.target.value)}
                                    sx={{
                                        width: '100%',
                                        '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                                        '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                                    }}
                                />
                            </Box>
                        </Box>
            <CommonStylingControls
              options={options}
              onUpdate={(updatedOptions) => dispatch(updateContactEditorOptions(updatedOptions))}
              showMargin={true}
                            />
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
            title="Contact Info"
            description="Customize contact information and style."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default ContactWidgetEditor;
