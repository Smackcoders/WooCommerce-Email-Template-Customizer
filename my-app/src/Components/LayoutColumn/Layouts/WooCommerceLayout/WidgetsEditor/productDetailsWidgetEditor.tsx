import React from 'react';
import { Box, Typography, TextField, Stack, Divider, FormControlLabel, Switch, FormControl, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateProductDetailsEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const ProductDetailsWidgetEditor = () => {
  const dispatch = useDispatch();
  const {
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedWidgetIndex,
    productDetailsEditorOptions: options
  } = useSelector((state: RootState) => state.workspace);

  const handleChange = (key: string, value: any) => {
    dispatch(updateProductDetailsEditorOptions({ [key]: value }));
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
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Table Configurations</Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={options.showImage !== false}
                  onChange={(e) => handleChange('showImage', e.target.checked)}
                  size="small"
                />
              }
              label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Product Thumbnails</Typography>}
              sx={{ ml: 0 }}
            />
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Border Color</Typography>
              <TextField
                type="color"
                value={options.borderColor || '#dddddd'}
                onChange={(e) => handleChange('borderColor', e.target.value)}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                  '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Border Style</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={options.borderStyle || 'solid'}
                  onChange={(e) => handleChange('borderStyle', e.target.value)}
                  sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                  MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                >
                  {['none', 'solid', 'dashed', 'dotted', 'double'].map((s) => (
                    <MenuItem key={s} value={s} sx={{ fontSize: '11px', textTransform: 'capitalize' }}>{s}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Border Width (px)</Typography>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={options.borderWidth ?? 1}
                onChange={(e) => handleChange('borderWidth', Number(e.target.value))}
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Header Background</Typography>
              <TextField
                type="color"
                value={options.headerBackgroundColor || '#f9f9f9'}
                onChange={(e) => handleChange('headerBackgroundColor', e.target.value)}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                  '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Header Text Color</Typography>
              <TextField
                type="color"
                value={options.headerTextColor || '#333333'}
                onChange={(e) => handleChange('headerTextColor', e.target.value)}
                sx={{
                  width: '100%',
                  '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                  '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                }}
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
            subStyles={options}
            onUpdate={(val) => dispatch(updateProductDetailsEditorOptions(val))}
          />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Product Details"
      description="Configure order product details table."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default ProductDetailsWidgetEditor;
