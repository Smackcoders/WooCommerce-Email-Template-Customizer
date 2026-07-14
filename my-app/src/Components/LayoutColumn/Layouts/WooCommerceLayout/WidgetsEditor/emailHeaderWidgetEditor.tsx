import React, { useState } from 'react';
import {
    Box, Typography, Slider, Button, IconButton, Stack, Divider, Tooltip, Accordion, AccordionSummary, AccordionDetails, TextField, ToggleButton, ToggleButtonGroup
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateEmailHeaderEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DeleteIcon from "@mui/icons-material/Delete";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import CommonStylingControls from '../../../../utils/CommonStylingControls';

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const EmailHeaderWidgetEditor: React.FC = () => {
    const dispatch = useDispatch();
    const { emailHeaderEditorOptions, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);
    const [previewUrl, setPreviewUrl] = useState<string | null>(emailHeaderEditorOptions?.logoUrl || null);

    const handleChange = (field: string, value: any) => {
        dispatch(updateEmailHeaderEditorOptions({ [field]: value }));
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                handleChange('logoUrl', result);
                setPreviewUrl(result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        handleChange('logoUrl', '');
        setPreviewUrl(null);
    };

    const handleBrowseImage = () => {
        const wp = (window as any).wp;
        if (wp && wp.media) {
            const mediaFrame = wp.media({
                title: 'Select Logo',
                button: {
                    text: 'Insert into Email',
                },
                multiple: false,
            });

            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                const imageUrl = attachment.url;
                handleChange('logoUrl', imageUrl);
                setPreviewUrl(imageUrl);
            });

            mediaFrame.open();
        } else {
            alert('WordPress Media Library is not available.');
        }
    };

    const handleWidthChange = (event: Event, newValue: number | number[]) => {
        handleChange('logoWidth', `${newValue}px`);
    };

    const currentWidth = parseInt(emailHeaderEditorOptions?.logoWidth) || 150;

    const tabs = [
        {
            label: 'Content',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={2.5}>




                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Title</Typography>
                            <TextField
                                size="small"
                                fullWidth
                                value={emailHeaderEditorOptions?.title || ''}
                                onChange={(e) => handleChange('title', e.target.value)}
                                placeholder="e.g. Order Confirmation"
                                InputProps={{ sx: { fontSize: '12px', bgcolor: '#f9f9f9' } }}
                            />
                            <Typography sx={{ fontSize: '11px', color: '#999', mt: 0.5 }}>
                                Displayed below the logo in the header.
                            </Typography>
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
              options={emailHeaderEditorOptions}
              onUpdate={(updatedOptions) => dispatch(updateEmailHeaderEditorOptions(updatedOptions))}
              showTypography={false}
              showTextColor={false}
              showTextAlign={false}
              showMargin={true}
                            />

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Header Icon Alignment</Typography>
                            <ToggleButtonGroup
                                value={emailHeaderEditorOptions?.logoAlign || 'left'}
                                exclusive
                                onChange={(_, newAlign) => newAlign && handleChange('logoAlign', newAlign)}
                                fullWidth
                                size="small"
                                sx={{ bgcolor: '#f9f9f9', mb: 2 }}
                            >
                                <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                                <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                                <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Header Content Alignment</Typography>
                            <ToggleButtonGroup
                                value={emailHeaderEditorOptions?.textAlign || 'left'}
                                exclusive
                                onChange={(_, newAlign) => newAlign && handleChange('textAlign', newAlign)}
                                fullWidth
                                size="small"
                                sx={{ bgcolor: '#f9f9f9', mb: 2 }}
                            >
                                <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                                <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                                <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                            </ToggleButtonGroup>
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Background Color</Typography>
                            <input
                                type="color"
                                value={emailHeaderEditorOptions?.backgroundColor || '#25A2D0'}
                                onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                style={{ width: '100%', height: '36px', border: '1px solid #e0e0e0', borderRadius: '4px', cursor: 'pointer', padding: '2px 4px', backgroundColor: '#f9f9f9' }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Height</Typography>
                            <TextField
                                size="small"
                                fullWidth
                                value={emailHeaderEditorOptions?.height || 'auto'}
                                onChange={(e) => handleChange('height', e.target.value)}
                                placeholder="auto or e.g. 200px"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
                            <TextField
                                size="small"
                                fullWidth
                                value={emailHeaderEditorOptions?.width || '100%'}
                                onChange={(e) => handleChange('width', e.target.value)}
                                placeholder="100% or e.g. 600px"
                                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                            />
                        </Box>
                    </Stack>
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Email Header"
            description="Customize your email header logo and layout."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default EmailHeaderWidgetEditor;
