import React from 'react';
import { Box, Typography, TextField, Tooltip, IconButton, Stack, Divider, FormControlLabel, Switch } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateTaxBillingEditorOptions, TaxBillingEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import CommonStylingControls from '../../../../utils/CommonStylingControls';
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

const CompactTextField = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <TextField
    label={label}
    size="small"
    margin="dense"
    fullWidth
    value={value}
    onChange={onChange}
    sx={{
      '& .MuiInputBase-input': { fontSize: '13px' },
      '& .MuiInputLabel-root': { fontSize: '13px' }
    }}
  />
);

const TaxBillingWidgetEditor = () => {
  const dispatch = useDispatch();
  const { taxBillingEditorOptions, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex } = useSelector(
    (state: RootState) => state.workspace
  );

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

  const handleFieldChange = (field: keyof TaxBillingEditorOptions, value: string) => {
    dispatch(updateTaxBillingEditorOptions({ [field]: value }));
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff', maxHeight: '450px', overflowY: 'auto' }}>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Invoice Details</Typography>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Invoice/Order #"
                value={taxBillingEditorOptions.orderNumber || ''}
                onChange={(e) => handleFieldChange('orderNumber', e.target.value)}
              />
              <CompactTextField
                label="Order Date"
                value={taxBillingEditorOptions.orderDate || ''}
                onChange={(e) => handleFieldChange('orderDate', e.target.value)}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Totals & Tax Info</Typography>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Subtotal"
                value={taxBillingEditorOptions.orderSubtotal || ''}
                onChange={(e) => handleFieldChange('orderSubtotal', e.target.value)}
              />
              <CompactTextField
                label="Shipping"
                value={taxBillingEditorOptions.orderShipping || ''}
                onChange={(e) => handleFieldChange('orderShipping', e.target.value)}
              />
            </Box>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Discount"
                value={taxBillingEditorOptions.orderDiscount || ''}
                onChange={(e) => handleFieldChange('orderDiscount', e.target.value)}
              />
              <CompactTextField
                label="Tax Rate"
                value={taxBillingEditorOptions.taxRate || ''}
                onChange={(e) => handleFieldChange('taxRate', e.target.value)}
              />
            </Box>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Tax Amount"
                value={taxBillingEditorOptions.orderTax || ''}
                onChange={(e) => handleFieldChange('orderTax', e.target.value)}
              />
              <CompactTextField
                label="Total"
                value={taxBillingEditorOptions.orderTotal || ''}
                onChange={(e) => handleFieldChange('orderTotal', e.target.value)}
              />
            </Box>

            <Divider sx={{ my: 1.5 }} />

            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={(taxBillingEditorOptions as any).showBillingAddress !== false}
                  onChange={(e) => dispatch(updateTaxBillingEditorOptions({ showBillingAddress: e.target.checked } as any))}
                />
              }
              label={<Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Show Billing Address</Typography>}
              sx={{ ml: 0 }}
            />

            {(taxBillingEditorOptions as any).showBillingAddress !== false && (
              <>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Billing Address Details</Typography>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="First Name"
                value={taxBillingEditorOptions.billingFirstName || ''}
                onChange={(e) => handleFieldChange('billingFirstName', e.target.value)}
              />
              <CompactTextField
                label="Last Name"
                value={taxBillingEditorOptions.billingLastName || ''}
                onChange={(e) => handleFieldChange('billingLastName', e.target.value)}
              />
            </Box>
            <CompactTextField
              label="Address Line 1"
              value={taxBillingEditorOptions.billingAddress1 || ''}
              onChange={(e) => handleFieldChange('billingAddress1', e.target.value)}
            />
            <Box display="flex" gap={1}>
              <CompactTextField
                label="City"
                value={taxBillingEditorOptions.billingCity || ''}
                onChange={(e) => handleFieldChange('billingCity', e.target.value)}
              />
              <CompactTextField
                label="State"
                value={taxBillingEditorOptions.billingState || ''}
                onChange={(e) => handleFieldChange('billingState', e.target.value)}
              />
            </Box>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Postal Code"
                value={taxBillingEditorOptions.billingPostcode || ''}
                onChange={(e) => handleFieldChange('billingPostcode', e.target.value)}
              />
              <CompactTextField
                label="Country"
                value={taxBillingEditorOptions.billingCountry || ''}
                onChange={(e) => handleFieldChange('billingCountry', e.target.value)}
              />
            </Box>
              </>
            )}
          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
            <Typography sx={{ mb: 1, fontSize: '13px', fontWeight: 'bold', color: '#555555' }}>
                Layout
            </Typography>
            <Box display="flex" gap={1} mb={2}>
              <CompactTextField
                label="Width"
                value={taxBillingEditorOptions.width || ''}
                onChange={(e) => handleFieldChange('width', e.target.value)}
              />
              <CompactTextField
                label="Height"
                value={taxBillingEditorOptions.height || ''}
                onChange={(e) => handleFieldChange('height', e.target.value)}
              />
            </Box>
            <CommonStylingControls
              options={taxBillingEditorOptions}
              onUpdate={(updatedOptions) => dispatch(updateTaxBillingEditorOptions(updatedOptions))}
              showMargin={true}
              showFontWeight={true}
            />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Tax & Billing"
      description="Manage tax and billing information."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default TaxBillingWidgetEditor;