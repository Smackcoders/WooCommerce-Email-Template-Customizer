import React, { useState } from 'react';
import { Box, Typography, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, IconButton, Stack, Divider, Popover, ToggleButtonGroup, ToggleButton, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateIconEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ColorPicker from "../../../../utils/ColorPicker";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";

const IconWidgetEditor = () => {
  const dispatch = useDispatch();
  const { iconEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleChange = (field: keyof typeof iconEditorOptions) => (
    e: any
  ) => {
    let value = e.target ? e.target.value : e;
    if (field === 'size' || field === 'width' || field === 'height' || field === 'paddingTop' || field === 'paddingRight' || field === 'paddingBottom' || field === 'paddingLeft') {
      value = Number(value);
    }
    dispatch(updateIconEditorOptions({ [field]: value }));
  };

  const handleColorChange = (newColor: string) => {
    dispatch(updateIconEditorOptions({ color: newColor }));
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

  const iconTypes = [
    'star', 'heart', 'check', 'info', 'warning', 'error',
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
    'home', 'mail', 'phone', 'location', 'calendar', 'user'
  ];

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Icon Type</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={iconEditorOptions.iconType || 'star'}
                  onChange={handleChange('iconType')}
                  sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                  MenuProps={{
                    disablePortal: true,
                    sx: { zIndex: 999999 }
                  }}
                >
                  {iconTypes.map((icon) => (
                    <MenuItem key={icon} value={icon} sx={{ fontSize: '11px' }}>
                      {icon.charAt(0).toUpperCase() + icon.slice(1)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Link URL</Typography>
              <TextField
                size="small"
                fullWidth
                value={iconEditorOptions.link || ''}
                onChange={handleChange('link')}
                placeholder="https://example.com"
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alignment</Typography>
              <ToggleButtonGroup
                exclusive
                fullWidth
                value={iconEditorOptions.alignment || 'left'}
                onChange={(e, newAlign) => newAlign && handleChange('alignment')(newAlign)}
                size="small"
                sx={{ bgcolor: '#f9f9f9' }}
              >
                <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                <ToggleButton value="justify" sx={{ p: '5px' }}><FormatAlignJustifyIcon sx={{ fontSize: '18px' }} /></ToggleButton>
              </ToggleButtonGroup>
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
            <ColorPicker
              label="Icon Color"
              value={iconEditorOptions.color || '#000000'}
              onChange={handleColorChange}
            />

            <ColorPicker
              label="Background Color"
              value={(iconEditorOptions as any).backgroundColor || 'transparent'}
              onChange={(newColor: string) => dispatch(updateIconEditorOptions({ backgroundColor: newColor } as any))}
            />

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width (px)</Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={iconEditorOptions.width ?? iconEditorOptions.size ?? 32}
                  onChange={handleChange('width')}
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Height (px)</Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={iconEditorOptions.height ?? iconEditorOptions.size ?? 32}
                  onChange={handleChange('height')}
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
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
          <Stack spacing={2.5}>
            <SpacingControl
              label="Padding"
              value={{
                top: iconEditorOptions.paddingTop || 0,
                right: iconEditorOptions.paddingRight || 0,
                bottom: iconEditorOptions.paddingBottom || 0,
                left: iconEditorOptions.paddingLeft || 0,
              }}
              onChange={(side, v) => dispatch(updateIconEditorOptions({ [`padding${side.charAt(0).toUpperCase() + side.slice(1)}`]: v }))}
              onChangeAll={(v) => dispatch(updateIconEditorOptions({ paddingTop: v, paddingRight: v, paddingBottom: v, paddingLeft: v }))}
            />

            <SpacingControl
              label="Margin"
              value={{
                top: iconEditorOptions.marginTop || 0,
                right: iconEditorOptions.marginRight || 0,
                bottom: iconEditorOptions.marginBottom || 0,
                left: iconEditorOptions.marginLeft || 0,
              }}
              onChange={(side, v) => dispatch(updateIconEditorOptions({ [`margin${side.charAt(0).toUpperCase() + side.slice(1)}`]: v }))}
              onChangeAll={(v) => dispatch(updateIconEditorOptions({ marginTop: v, marginRight: v, marginBottom: v, marginLeft: v }))}
            />
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Icon"
      description="Customize icon content and style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default IconWidgetEditor;