import React from 'react';
import { Box, Typography, TextField, Stack, FormControl, Select, MenuItem } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updatePromoCodeEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import ColorPicker from "../../../../utils/ColorPicker";
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';

const PromoCodeWidgetEditor = () => {
  const dispatch = useDispatch();
  const { promoCodeEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleChange = (field: keyof typeof promoCodeEditorOptions) => (e: any) => {
    dispatch(updatePromoCodeEditorOptions({ [field]: e.target.value }));
  };

  const handleColorChange = (field: string, newValue: any) => {
    dispatch(updatePromoCodeEditorOptions({ [field]: newValue }));
  };

  const handleCloseEditor = () => dispatch(closeEditor());

  const handleDeleteContent = () => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      dispatch(deleteColumnContent({
        blockId: selectedBlockForEditor,
        columnIndex: selectedColumnIndex,
        widgetIndex: selectedWidgetIndex,
      }));
    }
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Title</Typography>
              <TextField
                value={promoCodeEditorOptions.title ?? ''}
                onChange={handleChange('title')}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Promo Code</Typography>
              <TextField
                value={promoCodeEditorOptions.code ?? ''}
                onChange={handleChange('code')}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Description</Typography>
              <TextField
                multiline
                rows={2}
                value={promoCodeEditorOptions.description ?? ''}
                onChange={handleChange('description')}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Valid Until</Typography>
              <TextField
                value={promoCodeEditorOptions.validUntil ?? ''}
                onChange={handleChange('validUntil')}
                size="small"
                fullWidth
                placeholder="e.g. Dec 31, 2024"
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
          <Stack spacing={2}>
            <ColorPicker
              label="Background Color"
              value={promoCodeEditorOptions.backgroundColor || '#fff3cd'}
              onChange={(color) => handleColorChange('backgroundColor', color)}
            />
            <ColorPicker
              label="Text Color"
              value={promoCodeEditorOptions.textColor || '#856404'}
              onChange={(color) => handleColorChange('textColor', color)}
            />
            <ColorPicker
              label="Border Color"
              value={promoCodeEditorOptions.borderColor || '#ffeaa7'}
              onChange={(color) => handleColorChange('borderColor', color)}
            />
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#555', mb: 0.5 }}>Border Style</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={promoCodeEditorOptions.borderStyle || 'solid'}
                  onChange={(e) => handleColorChange('borderStyle', e.target.value)}
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
              <Typography sx={{ fontSize: '12px', color: '#555', mb: 0.5 }}>Border Width (px)</Typography>
              <TextField
                type="number"
                size="small"
                fullWidth
                value={promoCodeEditorOptions.borderWidth ?? 1}
                onChange={(e) => handleColorChange('borderWidth', Number(e.target.value))}
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
      title="Promo Code"
      description="Edit promo code details and styling."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default PromoCodeWidgetEditor;
