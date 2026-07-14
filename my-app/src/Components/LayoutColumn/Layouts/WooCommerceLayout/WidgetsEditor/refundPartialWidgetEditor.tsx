import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateRefundPartialEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import ColorPicker from '../../../../utils/ColorPicker';

const RefundPartialWidgetEditor = () => {
  const dispatch = useDispatch();
  const {
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedWidgetIndex,
    refundPartialEditorOptions: options
  } = useSelector((state: RootState) => state.workspace);

  const handleChange = (key: string, value: any) => {
    dispatch(updateRefundPartialEditorOptions({ [key]: value }));
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
          <Stack spacing={2}>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Title</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.title || ''}
                onChange={(e) => handleChange('title', e.target.value)}
                InputProps={{ sx: { fontSize: '12px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Product Column Header</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.productHeader || ''}
                onChange={(e) => handleChange('productHeader', e.target.value)}
                InputProps={{ sx: { fontSize: '12px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Amount Column Header</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.amountHeader || ''}
                onChange={(e) => handleChange('amountHeader', e.target.value)}
                InputProps={{ sx: { fontSize: '12px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Reason Label</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.reasonLabel || ''}
                onChange={(e) => handleChange('reasonLabel', e.target.value)}
                InputProps={{ sx: { fontSize: '12px' } }}
              />
            </Box>
            <Box sx={{ mt: 2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333', mb: 1 }}>Header Colors</Typography>
              <Stack spacing={2}>
                <ColorPicker
                  label="Header Background"
                  value={options.headerBackgroundColor || '#fff8f8'}
                  onChange={(color) => handleChange('headerBackgroundColor', color)}
                />
                <ColorPicker
                  label="Header Text Color"
                  value={options.headerTextColor || '#333333'}
                  onChange={(color) => handleChange('headerTextColor', color)}
                />
              </Stack>
            </Box>
          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: <></>
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Partial Refund"
      description="Display partial refund details with item breakdown."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default RefundPartialWidgetEditor;
