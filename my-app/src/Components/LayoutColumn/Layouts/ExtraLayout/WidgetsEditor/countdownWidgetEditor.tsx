import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Tooltip,
  IconButton,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Stack,
  Divider,
  Switch,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateCountdownEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ColorPicker from "../../../../utils/ColorPicker";
import { FONT_FAMILIES } from '../../../../../Constants/StyleConstants';

const CountdownWidgetEditor = () => {
  const dispatch = useDispatch();
  const { countdownEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  // Initialize targetDate from countdownEditorOptions
  const getInitialDate = () => {
    if (countdownEditorOptions.targetDate) {
      try {
        return new Date(countdownEditorOptions.targetDate);
      } catch (e) {
        console.error("Invalid date format:", countdownEditorOptions.targetDate);
      }
    }
    // Default: 7 days from now
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  };

  const [targetDate, setTargetDate] = useState<Date>(getInitialDate());
  const [dateInputValue, setDateInputValue] = useState<string>('');

  // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Initialize date input value on component mount
  useEffect(() => {
    const initialDate = getInitialDate();
    setTargetDate(initialDate);
    setDateInputValue(formatDateForInput(initialDate));
  }, [countdownEditorOptions.targetDate]);

  const handleChange = (field: keyof typeof countdownEditorOptions) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    const value = 'target' in e ? e.target.value : (e as React.ChangeEvent<HTMLInputElement>).target.value;

    if (field === 'showLabels') {
      const checked = (e as React.ChangeEvent<HTMLInputElement>).target.checked;
      dispatch(updateCountdownEditorOptions({ [field]: checked }));
    } else {
      dispatch(updateCountdownEditorOptions({ [field]: value as string }));
    }
  };

  const handleColorChange = (field: string, newColor: string) => {
    dispatch(updateCountdownEditorOptions({ [field]: newColor }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDateInputValue(value);

    if (value) {
      try {
        const newDate = new Date(value);
        setTargetDate(newDate);
        dispatch(updateCountdownEditorOptions({ targetDate: newDate.toISOString() }));
      } catch (error) {
        console.error("Error parsing date:", error);
      }
    }
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
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#495157' }}>Countdown</Typography>
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
          Set timer settings for your countdown.
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
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Target Time</Typography>
                <Box sx={{ p: 1.5, border: '1px solid #e7e9eb', borderRadius: '4px', bgcolor: '#fdfdfd' }}>
                  <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Date & Time</Typography>
                  <TextField
                    type="datetime-local"
                    value={dateInputValue}
                    onChange={handleDateChange}
                    size="small"
                    fullWidth
                    InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                  />
                  <Typography sx={{ fontSize: '11px', color: '#888', mt: 1, fontStyle: 'italic' }}>
                    Selected: {targetDate.toLocaleString()}
                  </Typography>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Text Settings</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Title Text</Typography>
                    <TextField
                      value={countdownEditorOptions.title || ''}
                      onChange={(e) => dispatch(updateCountdownEditorOptions({ title: e.target.value }))}
                      size="small"
                      fullWidth
                      placeholder="e.g. SALES ENDS IN"
                      InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Footer Text</Typography>
                    <TextField
                      value={countdownEditorOptions.footer || ''}
                      onChange={(e) => dispatch(updateCountdownEditorOptions({ footer: e.target.value }))}
                      size="small"
                      fullWidth
                      placeholder="e.g. All courses 50% off"
                      InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                    />
                  </Box>
                  <Divider />
                  <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Unit Labels</Typography>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Days</Typography>
                      <TextField value={countdownEditorOptions.daysLabel || 'Days'} onChange={(e) => dispatch(updateCountdownEditorOptions({ daysLabel: e.target.value }))} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Hours</Typography>
                      <TextField value={countdownEditorOptions.hoursLabel || 'Hours'} onChange={(e) => dispatch(updateCountdownEditorOptions({ hoursLabel: e.target.value }))} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Minutes</Typography>
                      <TextField value={countdownEditorOptions.minutesLabel || 'Minutes'} onChange={(e) => dispatch(updateCountdownEditorOptions({ minutesLabel: e.target.value }))} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Seconds</Typography>
                      <TextField value={countdownEditorOptions.secondsLabel || 'Seconds'} onChange={(e) => dispatch(updateCountdownEditorOptions({ secondsLabel: e.target.value }))} size="small" fullWidth InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                    </Box>
                  </Box>
                </Stack>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Visibility</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
                  <FormControlLabel
                    control={<Switch checked={countdownEditorOptions.showDays !== false} onChange={(e) => dispatch(updateCountdownEditorOptions({ showDays: e.target.checked }))} size="small" />}
                    label={<Typography sx={{ fontSize: '12px', color: '#495157' }}>Days</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={countdownEditorOptions.showHours !== false} onChange={(e) => dispatch(updateCountdownEditorOptions({ showHours: e.target.checked }))} size="small" />}
                    label={<Typography sx={{ fontSize: '12px', color: '#495157' }}>Hours</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={countdownEditorOptions.showMinutes !== false} onChange={(e) => dispatch(updateCountdownEditorOptions({ showMinutes: e.target.checked }))} size="small" />}
                    label={<Typography sx={{ fontSize: '12px', color: '#495157' }}>Minutes</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={countdownEditorOptions.showSeconds !== false} onChange={(e) => dispatch(updateCountdownEditorOptions({ showSeconds: e.target.checked }))} size="small" />}
                    label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Seconds</Typography>}
                    sx={{ ml: 0 }}
                  />
                </Box>
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
            <Stack spacing={2.5}>
              <ColorPicker label="Box Background" value={countdownEditorOptions.backgroundColor || '#d32f2f'} onChange={(color) => handleColorChange('backgroundColor', color)} />
              <ColorPicker label="Box Text Color" value={countdownEditorOptions.textColor || '#ffffff'} onChange={(color) => handleColorChange('textColor', color)} />
              <ColorPicker label="Label Color" value={countdownEditorOptions.labelColor || '#333333'} onChange={(color) => handleColorChange('labelColor', color)} />
              <ColorPicker label="Title Color" value={countdownEditorOptions.titleColor || '#000000'} onChange={(color) => handleColorChange('titleColor', color)} />
              <ColorPicker label="Footer Color" value={countdownEditorOptions.footerColor || '#000000'} onChange={(color) => handleColorChange('footerColor', color)} />
              <ColorPicker label="Container Background" value={countdownEditorOptions.containerBgColor || 'transparent'} onChange={(color) => handleColorChange('containerBgColor', color)} />

              <Box>
                <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Font Family</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={(countdownEditorOptions as any).fontFamily || 'inherit'}
                    onChange={(e) => dispatch(updateCountdownEditorOptions({ fontFamily: e.target.value } as any))}
                    sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {FONT_FAMILIES.map((font) => (
                      <MenuItem key={font} value={font === 'Global' ? 'inherit' : font} sx={{ fontSize: '11px' }}>
                        {font}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Box Border Radius (px)</Typography>
                <TextField
                  type="number"
                  size="small"
                  fullWidth
                  value={(countdownEditorOptions as any).borderRadius ?? 4}
                  onChange={(e) => dispatch(updateCountdownEditorOptions({ borderRadius: Number(e.target.value) } as any))}
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                  inputProps={{ min: 0 }}
                />
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default CountdownWidgetEditor;