import React from 'react';
import { Box, Typography, TextField, Tooltip, IconButton, Switch, FormControlLabel, Stack, Divider, InputAdornment, Select, MenuItem, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updatePriceEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CommonStylingControls from '../../../../utils/CommonStylingControls';

const PriceWidgetEditor = () => {
  const dispatch = useDispatch();
  const { priceEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleChange = (field: keyof typeof priceEditorOptions) => (
    e: any
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch(updatePriceEditorOptions({ [field]: value }));
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

  return (
    <Box sx={{ bgcolor: '#f9f9f9', height: '100%' }}>
      {/* Editor Header */}
      <Box sx={{ p: '15px 20px', bgcolor: '#fff', borderBottom: '1px solid #e7e9eb' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#495157' }}>Price Display</Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Close">
              <IconButton onClick={handleCloseEditor} size="small" sx={{ p: 0.5 }}>
                <CloseIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={handleDeleteContent} size="small" sx={{ p: 0.5 }}>
                <DeleteIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography sx={{ fontSize: '11px', color: '#6d7882', fontStyle: 'italic' }}>
          Edit the pricing format and amount.
        </Typography>
      </Box>

      {/* Editor Sections */}
      <Box sx={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
        {/* Content Section */}
        <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Content</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Amount & Currency</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Label</Typography>
                    <TextField
                      value={priceEditorOptions.label}
                      onChange={handleChange('label')}
                      size="small"
                      fullWidth
                      placeholder="Price"
                      InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                    />
                  </Box>

                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Amount</Typography>
                      <TextField
                        type="number"
                        value={priceEditorOptions.amount || 99.99}
                        onChange={handleChange('amount')}
                        size="small"
                        placeholder="99.99"
                        fullWidth
                        InputProps={{
                          sx: { fontSize: '11px', bgcolor: '#f9f9f9' },
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography sx={{ fontSize: '12px', color: '#666' }}>
                                {priceEditorOptions.currencySymbol || '$'}
                              </Typography>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Currency</Typography>
                      <TextField
                        value={priceEditorOptions.currency || ''}
                        onChange={handleChange('currency')}
                        size="small"
                        placeholder="USD"
                        fullWidth
                        disabled={priceEditorOptions.showCurrencyCode === false}
                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Formatting</Typography>
                <Stack spacing={2}>
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Symbol</Typography>
                      <Select
                        value={priceEditorOptions.currencySymbol ?? '$'}
                        onChange={handleChange('currencySymbol')}
                        size="small"
                        fullWidth
                        sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        <MenuItem value="" sx={{ fontSize: '11px', color: '#999' }}>None</MenuItem>
                        {['$', '€', '£', '¥', '₹', 'Rp', 'R$', 'AED', 'sar', 'Fr'].map((symbol) => (
                          <MenuItem key={symbol} value={symbol} sx={{ fontSize: '11px' }}>
                            {symbol}
                          </MenuItem>
                        ))}
                      </Select>
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Decimals</Typography>
                      <TextField
                        type="number"
                        value={priceEditorOptions.decimals || 2}
                        onChange={handleChange('decimals')}
                        size="small"
                        fullWidth
                        inputProps={{ min: 0, max: 4 }}
                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                      />
                    </Box>
                  </Box>

                  <Stack spacing={0.5}>
                    <FormControlLabel
                      control={<Switch checked={priceEditorOptions.showDecimals !== false} onChange={handleChange('showDecimals')} size="small" />}
                      label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Decimals</Typography>}
                      sx={{ ml: 0 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={priceEditorOptions.showCurrencySymbol !== false} onChange={handleChange('showCurrencySymbol')} size="small" />}
                      label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Symbol</Typography>}
                      sx={{ ml: 0 }}
                    />
                    <FormControlLabel
                      control={<Switch checked={priceEditorOptions.showCurrencyCode !== false} onChange={handleChange('showCurrencyCode')} size="small" />}
                      label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Currency Code</Typography>}
                      sx={{ ml: 0 }}
                    />
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Style Section */}
        <Accordion disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Style</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
            <CommonStylingControls
              options={priceEditorOptions}
              onUpdate={(updatedOptions) => dispatch(updatePriceEditorOptions(updatedOptions))}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default PriceWidgetEditor;