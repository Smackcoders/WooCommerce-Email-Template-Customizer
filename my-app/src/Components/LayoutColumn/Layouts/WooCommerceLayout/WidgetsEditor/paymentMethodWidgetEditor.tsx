import React from 'react';
import { Box, Typography, TextField, Stack, Divider, Switch, Slider, FormControlLabel } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updatePaymentMethodEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const PaymentMethodWidgetEditor = () => {
  const dispatch = useDispatch();
  const { paymentMethodEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleChange = (field: keyof typeof paymentMethodEditorOptions) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(updatePaymentMethodEditorOptions({ [field]: e.target.value }));
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
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Label</Typography>
              <TextField value={paymentMethodEditorOptions.label} onChange={handleChange('label')} size="small" fullWidth placeholder="Payment Method" InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
            </Box>
            <Divider />
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Last column width (%)</Typography>
              <TextField
                type="number"
                value={paymentMethodEditorOptions?.lastColumnWidth || 30}
                onChange={handleChange('lastColumnWidth' as any)}
                size="small"
                sx={{ width: '80px' }}
                InputProps={{ inputProps: { min: 10, max: 90 }, sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Divider />
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={!paymentMethodEditorOptions?.width || paymentMethodEditorOptions.width === '100%'}
                      onChange={(e) => {
                        const isAuto = e.target.checked;
                        dispatch(updatePaymentMethodEditorOptions({
                          width: isAuto ? '100%' : '75%',
                        }));
                      }}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#555' }}>Auto (100%)</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0 }}
                />
                {paymentMethodEditorOptions?.width && paymentMethodEditorOptions.width !== '100%' && (
                  <Box width="100%" ml={1}>
                    <Slider
                      value={parseInt(paymentMethodEditorOptions.width) || 100}
                      onChange={(e, newValue) => dispatch(updatePaymentMethodEditorOptions({ width: `${newValue as number}%` }))}
                      min={10}
                      max={100}
                      size="small"
                      valueLabelDisplay="auto"
                      valueLabelFormat={(v) => `${v}%`}
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
      label: 'Style',
      content: <div /> // Replaced by GlobalStyleTab inside WidgetEditorWrapper
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <AdvancedTabContent
            subStyles={paymentMethodEditorOptions}
            onUpdate={(val) => dispatch(updatePaymentMethodEditorOptions(val))}
          />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Payment Method"
      description="Customize payment method display."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default PaymentMethodWidgetEditor;
