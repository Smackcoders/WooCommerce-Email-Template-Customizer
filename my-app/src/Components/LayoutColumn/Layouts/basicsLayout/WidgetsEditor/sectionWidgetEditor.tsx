import React, { useState } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, IconButton, SelectChangeEvent, Stack, Divider, Popover, Accordion, AccordionSummary, AccordionDetails, Button } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateSectionEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import ColorPicker from "../../../../utils/ColorPicker";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const SectionWidgetEditor = () => {
  const dispatch = useDispatch();
  const { sectionEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  if (!sectionEditorOptions) return null;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        dispatch(updateSectionEditorOptions({ backgroundImage: reader.result as string } as any));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    dispatch(updateSectionEditorOptions({ backgroundImage: '' } as any));
  };

  const handleBrowseImage = () => {
    const wp = (window as any).wp;
    if (wp && wp.media) {
      const mediaFrame = wp.media({
        title: 'Select Background Image',
        button: { text: 'Use Image' },
        multiple: false,
      });

      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        dispatch(updateSectionEditorOptions({ backgroundImage: attachment.url } as any));
      });

      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available.');
    }
  };

  // Handler for TextField inputs
  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const currentParent = (sectionEditorOptions as any)?.[parent];

      dispatch(updateSectionEditorOptions({
        [parent]: {
          ...(currentParent || {}),
          [child]: value,
        },
      } as any));
    } else {
      dispatch(updateSectionEditorOptions({ [field]: value } as any));
    }
  };

  const handleColorChange = (field: string, newColor: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const currentParent = (sectionEditorOptions as any)?.[parent];

      dispatch(updateSectionEditorOptions({
        [parent]: {
          ...(currentParent || {}),
          [child]: newColor,
        },
      } as any));
    } else {
      dispatch(updateSectionEditorOptions({ [field]: newColor } as any));
    }
  };


  // Handler for Select components
  const handleSelectChange = (field: string) => (
    e: SelectChangeEvent
  ) => {
    const value = e.target.value;

    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      const currentParent = (sectionEditorOptions as any)?.[parent];

      dispatch(updateSectionEditorOptions({
        [parent]: {
          ...(currentParent || {}),
          [child]: value,
        },
      } as any));
    } else {
      dispatch(updateSectionEditorOptions({ [field]: value } as any));
    }
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
            <ColorPicker
              label="Background Color"
              value={sectionEditorOptions.backgroundColor === 'transparent' ? '#ffffff' : (sectionEditorOptions.backgroundColor || '#ffffff')}
              onChange={(color) => handleColorChange('backgroundColor', color)}
            />

            <Box sx={{ border: "1px dashed #e0e0e0", borderRadius: '4px', p: 2, bgcolor: '#fdfdfd', textAlign: 'center' }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, alignItems: 'center' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Background Image</Typography>
                {sectionEditorOptions.backgroundImage && (
                  <IconButton onClick={handleRemoveImage} size="small" sx={{ p: 0.5 }}>
                    <DeleteIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                  </IconButton>
                )}
              </Box>
              <Box sx={{ bgcolor: '#fff', border: '1px solid #eee', p: 1, mb: 2, display: 'flex', justifyContent: 'center', minHeight: '80px', alignItems: 'center', backgroundImage: sectionEditorOptions.backgroundImage ? `url(${sectionEditorOptions.backgroundImage})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!sectionEditorOptions.backgroundImage && (
                  <Typography sx={{ fontSize: '12px', color: '#aaa' }}>No image selected</Typography>
                )}
              </Box>
              <Stack spacing={1}>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<CloudUploadIcon sx={{ fontSize: '18px' }} />}
                  size="small"
                  sx={{ textTransform: 'none', fontSize: '12px', border: '1px solid #e0e0e0', color: '#495157', bgcolor: '#fff', '&:hover': { bgcolor: '#f9f9f9' } }}
                >
                  Upload File
                  <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<CropOriginalIcon sx={{ fontSize: '18px' }} />}
                  size="small"
                  onClick={handleBrowseImage}
                  sx={{ textTransform: 'none', fontSize: '12px', border: '1px solid #e0e0e0', color: '#495157', bgcolor: '#fff', '&:hover': { bgcolor: '#f9f9f9' } }}
                >
                  Media Library
                </Button>
              </Stack>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
              <TextField
                size="small"
                fullWidth
                value={(sectionEditorOptions as any).width || '100%'}
                onChange={handleChange('width')}
                placeholder="100% or e.g. 600px"
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Height</Typography>
              <TextField
                size="small"
                fullWidth
                value={sectionEditorOptions.height || 'auto'}
                onChange={handleChange('height')}
                placeholder="auto or e.g. 300px"
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
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Border Width (px)</Typography>
                <TextField
                  type="number"
                  value={sectionEditorOptions.border?.width || 1}
                  onChange={handleChange('border.width')}
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Border Style</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={sectionEditorOptions.border?.style || 'solid'}
                    onChange={handleSelectChange('border.style')}
                    sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                    MenuProps={{
                      disablePortal: true,
                      sx: { zIndex: 999999 }
                    }}
                  >
                    <MenuItem value="solid" sx={{ fontSize: '11px' }}>Solid</MenuItem>
                    <MenuItem value="dashed" sx={{ fontSize: '11px' }}>Dashed</MenuItem>
                    <MenuItem value="dotted" sx={{ fontSize: '11px' }}>Dotted</MenuItem>
                    <MenuItem value="none" sx={{ fontSize: '11px' }}>None</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Border Radius (px)</Typography>
                <TextField
                  type="number"
                  value={sectionEditorOptions.border?.radius || 0}
                  onChange={handleChange('border.radius')}
                  size="small"
                  fullWidth
                  InputProps={{ inputProps: { min: 0 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
              <ColorPicker
                label="Border Color"
                value={sectionEditorOptions.border?.color === 'transparent' ? '#ddd' : (sectionEditorOptions.border?.color || '#ddd')}
                onChange={(color) => handleColorChange('border.color', color)}
              />
            </Box>
          </Stack>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>Padding (px)</Typography>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1}>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>TOP</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.padding?.top || 20} onChange={handleChange('padding.top')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>RIGHT</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.padding?.right || 20} onChange={handleChange('padding.right')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>BOTTOM</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.padding?.bottom || 20} onChange={handleChange('padding.bottom')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>LEFT</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.padding?.left || 20} onChange={handleChange('padding.left')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>Margin (px)</Typography>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1}>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>TOP</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.margin?.top || 0} onChange={handleChange('margin.top')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>RIGHT</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.margin?.right || 0} onChange={handleChange('margin.right')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>BOTTOM</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.margin?.bottom || 0} onChange={handleChange('margin.bottom')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>LEFT</Typography>
                  <TextField type="number" size="small" fullWidth value={sectionEditorOptions.margin?.left || 0} onChange={handleChange('margin.left')} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
              </Box>
            </Box>
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Section"
      description="Customize section layout and style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default SectionWidgetEditor;