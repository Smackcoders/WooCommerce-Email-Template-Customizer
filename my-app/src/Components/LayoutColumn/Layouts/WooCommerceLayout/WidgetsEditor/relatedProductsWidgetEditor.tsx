import React from 'react';
import { Box, TextField, Typography, Select, MenuItem, Switch, FormControlLabel, Stack, Divider, Button, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import LinkIcon from '@mui/icons-material/Link';
import ImageIcon from '@mui/icons-material/Image';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateRelatedProductsEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const RelatedProductsWidgetEditor: React.FC = () => {
    const dispatch = useDispatch();
    const { relatedProductsEditorOptions } = useSelector((state: RootState) => state.workspace);
    const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
        (state: RootState) => state.workspace
    );

    const handleChange = (field: string, value: any) => {
        dispatch(updateRelatedProductsEditorOptions({ [field]: value }));
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

    const handleBrowseImage = (field: string) => {
        const wp = (window as any).wp;
        if (wp && wp.media) {
            const mediaFrame = wp.media({
                title: 'Select Product Image',
                button: {
                    text: 'Insert into Email',
                },
                multiple: false,
            });

            mediaFrame.on('select', () => {
                const attachment = mediaFrame.state().get('selection').first().toJSON();
                const imageUrl = attachment.url;
                handleChange(field, imageUrl);
            });

            mediaFrame.open();
        } else {
            alert('WordPress Media Library is not available.');
        }
    };

    const tabs = [
        {
            label: 'Content',
            content: (
                <Box sx={{ p: 0, bgcolor: '#fff' }}>
                    {/* Content Section */}
                    <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0', px: 2 } }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>General</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
                            <Stack spacing={2.5}>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Section Title</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={relatedProductsEditorOptions?.title || ''}
                                        onChange={(e) => handleChange('title', e.target.value)}
                                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Button Text</Typography>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        value={relatedProductsEditorOptions?.buttonText || 'View Product'}
                                        onChange={(e) => handleChange('buttonText', e.target.value)}
                                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    />
                                </Box>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Number of Products</Typography>
                                    <Select
                                        fullWidth
                                        size="small"
                                        value={relatedProductsEditorOptions?.productsToShow || 3}
                                        onChange={(e) => handleChange('productsToShow', e.target.value)}
                                        sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                                        MenuProps={{
                                            disablePortal: true,
                                            sx: { zIndex: 999999 }
                                        }}
                                    >
                                        <MenuItem value={2} sx={{ fontSize: '11px' }}>2 Products</MenuItem>
                                        <MenuItem value={3} sx={{ fontSize: '11px' }}>3 Products</MenuItem>
                                        <MenuItem value={4} sx={{ fontSize: '11px' }}>4 Products</MenuItem>
                                    </Select>
                                </Box>
                                <Divider />
                                <Box>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={relatedProductsEditorOptions?.showImages !== false}
                                                onChange={(e) => handleChange('showImages', e.target.checked)}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Product Images</Typography>}
                                    />
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                size="small"
                                                checked={relatedProductsEditorOptions?.showCardShadow !== false}
                                                onChange={(e) => handleChange('showCardShadow', e.target.checked)}
                                            />
                                        }
                                        label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Card Shadow</Typography>}
                                    />
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* Manual Configuration Section */}
                    <Accordion disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0', px: 2 } }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Manual Configuration</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
                            <Stack spacing={2.5}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            size="small"
                                            checked={relatedProductsEditorOptions?.useManualData || false}
                                            onChange={(e) => handleChange('useManualData', e.target.checked)}
                                        />
                                    }
                                    label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Use Manual Data</Typography>}
                                />

                                {relatedProductsEditorOptions?.useManualData && (
                                    <Stack spacing={4}>
                                        {[1, 2, 3, 4].slice(0, relatedProductsEditorOptions?.productsToShow || 3).map((num) => (
                                            <Box key={num} sx={{ p: 2, border: '1px solid #eee', borderRadius: 1, bgcolor: '#fcfcfc' }}>
                                                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#495157', textTransform: 'none', mb: 2 }}>
                                                    Product {num}
                                                </Typography>
                                                <Stack spacing={2}>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Product Name</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={(relatedProductsEditorOptions as any)[`p${num}_name`] || ''}
                                                            onChange={(e) => handleChange(`p${num}_name`, e.target.value)}
                                                            placeholder={`Product Name ${num}`}
                                                            InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff' } }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Product Price</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={(relatedProductsEditorOptions as any)[`p${num}_price`] || ''}
                                                            onChange={(e) => handleChange(`p${num}_price`, e.target.value)}
                                                            placeholder={`$99.99`}
                                                            InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff' } }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Product URL</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={(relatedProductsEditorOptions as any)[`p${num}_url`] || ''}
                                                            onChange={(e) => handleChange(`p${num}_url`, e.target.value)}
                                                            placeholder="https://example.com/product"
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <LinkIcon fontSize="small" sx={{ color: '#a4afb7' }} />
                                                                    </InputAdornment>
                                                                ),
                                                                sx: { fontSize: '11px', bgcolor: '#fff' }
                                                            }}
                                                        />
                                                    </Box>
                                                    <Box>
                                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Product Image</Typography>
                                                        <TextField
                                                            fullWidth
                                                            size="small"
                                                            value={(relatedProductsEditorOptions as any)[`p${num}_image`] || ''}
                                                            onChange={(e) => handleChange(`p${num}_image`, e.target.value)}
                                                            placeholder="https://example.com/image.jpg"
                                                            sx={{ mb: 1 }}
                                                            InputProps={{
                                                                startAdornment: (
                                                                    <InputAdornment position="start">
                                                                        <ImageIcon fontSize="small" sx={{ color: '#a4afb7' }} />
                                                                    </InputAdornment>
                                                                ),
                                                                sx: { fontSize: '11px', bgcolor: '#fff' }
                                                            }}
                                                        />
                                                        <Button
                                                            variant="outlined"
                                                            fullWidth
                                                            startIcon={<CropOriginalIcon />}
                                                            size="small"
                                                            onClick={() => handleBrowseImage(`p${num}_image`)}
                                                            sx={{ border: '1px solid #ddd', bgcolor: 'white', color: '#495157', fontSize: '13px', textTransform: 'none', '&:hover': { bgcolor: '#f5f5f5', borderColor: '#ccc' } }}
                                                        >
                                                            Browse Media Library
                                                        </Button>
                                                    </Box>
                                                </Stack>
                                            </Box>
                                        ))}
                                    </Stack>
                                )}
                            </Stack>
                        </AccordionDetails>
                    </Accordion>

                    {/* Product Colors Section */}
                    <Accordion disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0', px: 2 } }}>
                            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Product Colors</Typography>
                        </AccordionSummary>
                        <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
                            <Stack spacing={2.5}>
                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Title Color</Typography>
                                        <TextField
                                            type="color"
                                            size="small"
                                            fullWidth
                                            value={relatedProductsEditorOptions?.titleColor === 'transparent' ? '#333333' : (relatedProductsEditorOptions?.titleColor || '#333333')}
                                            onChange={(e) => handleChange('titleColor', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none' }, '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Price Color</Typography>
                                        <TextField
                                            type="color"
                                            size="small"
                                            fullWidth
                                            value={relatedProductsEditorOptions?.priceColor === 'transparent' ? '#4CAF50' : (relatedProductsEditorOptions?.priceColor || '#4CAF50')}
                                            onChange={(e) => handleChange('priceColor', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none' }, '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' } }}
                                        />
                                    </Box>
                                </Box>
                                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Button Color</Typography>
                                        <TextField
                                            type="color"
                                            size="small"
                                            fullWidth
                                            value={relatedProductsEditorOptions?.buttonColor === 'transparent' ? '#4CAF50' : (relatedProductsEditorOptions?.buttonColor || '#4CAF50')}
                                            onChange={(e) => handleChange('buttonColor', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none' }, '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' } }}
                                        />
                                    </Box>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Button Hover</Typography>
                                        <TextField
                                            type="color"
                                            size="small"
                                            fullWidth
                                            value={relatedProductsEditorOptions?.buttonHoverColor === 'transparent' ? '#45a049' : (relatedProductsEditorOptions?.buttonHoverColor || '#45a049')}
                                            onChange={(e) => handleChange('buttonHoverColor', e.target.value)}
                                            sx={{ '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none' }, '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' } }}
                                        />
                                    </Box>
                                </Box>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
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
                        subStyles={relatedProductsEditorOptions}
                        onUpdate={(val) => dispatch(updateRelatedProductsEditorOptions(val))}
                    />
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Related Products"
            description="Customize related products recommendation section."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default RelatedProductsWidgetEditor;
