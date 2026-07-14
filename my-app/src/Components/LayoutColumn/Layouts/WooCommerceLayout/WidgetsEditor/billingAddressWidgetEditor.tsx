import React from 'react';
import {
  Box, Typography, TextField, MenuItem,
  ToggleButtonGroup,
  InputAdornment,
  Tooltip,
  IconButton,
  Stack,
  Divider,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import { closeEditor, deleteColumnContent, updateBillingAddressEditorOptions, BillingAddressEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
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

const fontFamilies = ['Global', 'Arial', 'Roboto', 'Times New Roman', 'Verdana'];
const fontWeights = ['Normal', 'Bold', 'Lighter', 'Bolder'];



const BillingAddressWidgetEditor = () => {
  const dispatch = useDispatch();
  const { billingAddressEditorOptions, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);
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

  const handleFieldChange = (field: keyof BillingAddressEditorOptions, value: string) => {
    dispatch(updateBillingAddressEditorOptions({ [field]: value }));
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff', maxHeight: '400px', overflowY: 'auto' }}>
          <Stack spacing={1}>
            <CompactTextField
              label="Title"
              value={billingAddressEditorOptions.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
            />
            <CompactTextField
              label="Full Name"
              value={billingAddressEditorOptions.fullName || ''}
              onChange={(e) => handleFieldChange('fullName', e.target.value)}
            />
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Phone"
                value={billingAddressEditorOptions.phone || ''}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
              />
              <CompactTextField
                label="Email"
                value={billingAddressEditorOptions.email || ''}
                onChange={(e) => handleFieldChange('email', e.target.value)}
              />
            </Box>
            <CompactTextField
              label="Address Line 1"
              value={billingAddressEditorOptions.addressLine1 || ''}
              onChange={(e) => handleFieldChange('addressLine1', e.target.value)}
            />
            <CompactTextField
              label="Address Line 2"
              value={billingAddressEditorOptions.addressLine2 || ''}
              onChange={(e) => handleFieldChange('addressLine2', e.target.value)}
            />
            <Box display="flex" gap={1}>
              <CompactTextField
                label="City"
                value={billingAddressEditorOptions.city || ''}
                onChange={(e) => handleFieldChange('city', e.target.value)}
              />
              <CompactTextField
                label="State"
                value={billingAddressEditorOptions.state || ''}
                onChange={(e) => handleFieldChange('state', e.target.value)}
              />
            </Box>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Postal Code"
                value={billingAddressEditorOptions.postalCode || ''}
                onChange={(e) => handleFieldChange('postalCode', e.target.value)}
              />
              <CompactTextField
                label="Country"
                value={billingAddressEditorOptions.country || ''}
                onChange={(e) => handleFieldChange('country', e.target.value)}
              />
            </Box>
            <Typography sx={{ fontSize: '13px', color: '#555', textAlign: 'center', mt: 2, mb: 2 }}>
              Click on any label or value in the canvas to edit its content and styling individually.
            </Typography>
          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <CommonStylingControls
              options={billingAddressEditorOptions}
              onUpdate={(updatedOptions) => dispatch(updateBillingAddressEditorOptions(updatedOptions))}
              showMargin={true}
                            />
          </Stack>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Typography sx={{ fontSize: '12px', color: '#6d7882', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
            No advanced settings available for this widget.
          </Typography>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Billing Address"
      description="Style the billing address section."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      hideAdvancedLayout={true}
    />
  );
};

export default BillingAddressWidgetEditor;