import React from 'react';
import { Box, Typography, TextField, Button, Table, TableBody, TableCell, TableRow, TableHead, Tooltip, IconButton, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import { closeEditor, deleteColumnContent, OrderItem, updateOrderItemsEditorOptions, OrderItemsEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
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

const OrderItemsWidgetEditor = () => {
  const dispatch = useDispatch();
  const { orderItemsEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
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

  const handleFieldChange = (field: keyof OrderItemsEditorOptions, value: any) => {
    dispatch(updateOrderItemsEditorOptions({ [field]: value }));
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff', maxHeight: '450px', overflowY: 'auto' }}>
          <Stack spacing={1}>
            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Order Details</Typography>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Order Number"
                value={orderItemsEditorOptions.orderNumber || ''}
                onChange={(e) => handleFieldChange('orderNumber', e.target.value)}
              />
              <CompactTextField
                label="Order Date"
                value={orderItemsEditorOptions.orderDate || ''}
                onChange={(e) => handleFieldChange('orderDate', e.target.value)}
              />
            </Box>
            <CompactTextField
              label="Payment Method"
              value={orderItemsEditorOptions.paymentMethod || ''}
              onChange={(e) => handleFieldChange('paymentMethod', e.target.value)}
            />

            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Pricing Details</Typography>
            <Box display="flex" gap={1}>
              <CompactTextField
                label="Subtotal"
                value={orderItemsEditorOptions.subtotal || ''}
                onChange={(e) => handleFieldChange('subtotal', e.target.value)}
              />
              <CompactTextField
                label="Discount"
                value={orderItemsEditorOptions.discount || ''}
                onChange={(e) => handleFieldChange('discount', e.target.value)}
              />
            </Box>
            <CompactTextField
              label="Total"
              value={orderItemsEditorOptions.total || ''}
              onChange={(e) => handleFieldChange('total', e.target.value)}
            />

            <Divider sx={{ my: 1.5 }} />

            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Items List</Typography>
            {(orderItemsEditorOptions.items || []).map((item: OrderItem, index: number) => (
              <Box key={index} sx={{ border: '1px solid #e7e9eb', p: 1.5, borderRadius: '4px', mb: 1, bgcolor: '#fbfbfb' }}>
                <CompactTextField
                  label="Product Name"
                  value={item.product || ''}
                  onChange={(e) => {
                    const newItems = [...(orderItemsEditorOptions.items || [])];
                    newItems[index] = { ...newItems[index], product: e.target.value };
                    handleFieldChange('items', newItems);
                  }}
                />
                <Box display="flex" gap={1} alignItems="center" mt={0.5}>
                  <CompactTextField
                    label="Qty"
                    value={String(item.quantity ?? '')}
                    onChange={(e) => {
                      const newItems = [...(orderItemsEditorOptions.items || [])];
                      newItems[index] = { ...newItems[index], quantity: parseInt(e.target.value) || 0 };
                      handleFieldChange('items', newItems);
                    }}
                  />
                  <CompactTextField
                    label="Price"
                    value={item.price || ''}
                    onChange={(e) => {
                      const newItems = [...(orderItemsEditorOptions.items || [])];
                      newItems[index] = { ...newItems[index], price: e.target.value };
                      handleFieldChange('items', newItems);
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={() => {
                      const newItems = (orderItemsEditorOptions.items || []).filter((_, i) => i !== index);
                      handleFieldChange('items', newItems);
                    }}
                    sx={{ mt: 1, color: '#d32f2f' }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            ))}
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                const newItems = [...(orderItemsEditorOptions.items || []), { product: 'New Product', quantity: 1, price: '$9.99' }];
                handleFieldChange('items', newItems);
              }}
              sx={{ alignSelf: 'flex-start', mt: 1, fontSize: '11px', textTransform: 'none' }}
            >
              + Add Item
            </Button>
          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
            <CommonStylingControls
              options={orderItemsEditorOptions}
              onUpdate={(updatedOptions) => dispatch(updateOrderItemsEditorOptions(updatedOptions))}
              showMargin={true}
                            />
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
      title="Order Items"
      description="Manage order details and items."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      hideAdvancedLayout={true}
    />
  );
};

export default OrderItemsWidgetEditor;