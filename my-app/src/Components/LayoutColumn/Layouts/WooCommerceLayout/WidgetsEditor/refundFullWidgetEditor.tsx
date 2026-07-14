import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateRefundFullEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';

const RefundFullWidgetEditor = () => {
  const dispatch = useDispatch();
  const {
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedWidgetIndex,
    refundFullEditorOptions: options
  } = useSelector((state: RootState) => state.workspace);

  const handleChange = (key: string, value: any) => {
    dispatch(updateRefundFullEditorOptions({ [key]: value }));
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
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Amount Label</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.amountLabel || ''}
                onChange={(e) => handleChange('amountLabel', e.target.value)}
                InputProps={{ sx: { fontSize: '12px' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', color: '#666', mb: 0.5 }}>Date Label</Typography>
              <TextField
                size="small"
                fullWidth
                value={options.dateLabel || ''}
                onChange={(e) => handleChange('dateLabel', e.target.value)}
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
      title="Full Refund"
      description="Display full refund details to the customer."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default RefundFullWidgetEditor;
