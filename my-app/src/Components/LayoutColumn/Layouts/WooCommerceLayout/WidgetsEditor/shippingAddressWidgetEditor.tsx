import React from 'react';
import { Box, Typography, TextField, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateShippingAddressEditorOptions, ShippingAddressEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

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

const ShippingAddressWidgetEditor = () => {
  const dispatch = useDispatch();
  const { shippingAddressEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleFieldChange = (field: keyof ShippingAddressEditorOptions, value: string) => {
    dispatch(updateShippingAddressEditorOptions({ [field]: value }));
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
          <Stack spacing={1}>
            <CompactTextField
              label="Title"
              value={shippingAddressEditorOptions.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
            <CompactTextField
              label="Full Name"
              value={shippingAddressEditorOptions.fullName || ''}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
            />
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Phone"
                value={shippingAddressEditorOptions.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
              <CompactTextField
                label="Email"
                value={shippingAddressEditorOptions.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Box>
            <CompactTextField
              label="Address Line 1"
              value={shippingAddressEditorOptions.addressLine1 || ''}
              onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
            />
            <CompactTextField
              label="Address Line 2"
              value={shippingAddressEditorOptions.addressLine2 || ''}
              onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
            />
            <Box display="flex" gap={1}>
              <CompactTextField
                label="City"
                value={shippingAddressEditorOptions.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
              <CompactTextField
                label="State"
                value={shippingAddressEditorOptions.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
              />
            </Box>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Postal Code"
                value={shippingAddressEditorOptions.postalCode || ''}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              />
              <CompactTextField
                label="Country"
                value={shippingAddressEditorOptions.country || ''}
                onChange={(e) => handleFieldChange('country', e.target.value)}
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
            subStyles={shippingAddressEditorOptions}
            onUpdate={(val) => dispatch(updateShippingAddressEditorOptions(val))}
          />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Shipping Address"
      description="Edit the shipping address fields."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      hideAdvancedLayout={true}
    />
  );
};

export default ShippingAddressWidgetEditor;