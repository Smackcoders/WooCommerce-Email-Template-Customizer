import React from 'react';
import {
  Box,
  Typography,
  TextField,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  IconButton,
  Stack,
  Select,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import {
  closeEditor,
  deleteColumnContent,
  updateParagraphRowEditorOptions,
  ParagraphRowEditorOptions
} from '../../../../../Store/Slice/workspaceSlice';
import ColorPicker from "../../../../utils/ColorPicker";
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";

const CompactTextField = ({
  label,
  value,
  type = "text",
  onChange,
}: {
  label: string;
  value: string | number;
  type?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <Box sx={{ width: '100%' }}>
    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>{label}</Typography>
    <TextField
      type={type}
      size="small"
      fullWidth
      value={value}
      onChange={onChange}
      InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
      sx={{
        '& .MuiOutlinedInput-root': {
          height: '32px',
        },
        '& .MuiOutlinedInput-input': {
          padding: '6px 10px',
        }
      }}
    />
  </Box>
);

const ParagraphRowWidgetEditor = () => {
  const dispatch = useDispatch();
  const { paragraphRowEditorOptions, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const options = paragraphRowEditorOptions || {
    rowLayout: 'horizontal',
    gap: 10,
    justifyContent: 'flex-start',
    labelWidth: 120,
    hideIfEmpty: true,
    backgroundColor: 'transparent',
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
    margin: { top: 0, right: 0, bottom: 8, left: 0 }
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

  const handleFieldChange = (field: keyof ParagraphRowEditorOptions, value: any) => {
    dispatch(updateParagraphRowEditorOptions({ [field]: value }));
  };

  const handlePaddingChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    const currentPadding = options.padding || { top: 0, left: 0, right: 0, bottom: 0 };
    dispatch(updateParagraphRowEditorOptions({ padding: { ...currentPadding, [side]: value } }));
  };

  const handleMarginChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    const currentMargin = options.margin || { top: 0, left: 0, right: 0, bottom: 0 };
    dispatch(updateParagraphRowEditorOptions({ margin: { ...currentMargin, [side]: value } }));
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            {/* Row Layout */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.8 }}>Layout Direction</Typography>
              <ToggleButtonGroup
                value={options.rowLayout || 'horizontal'}
                exclusive
                onChange={(_, val) => val && handleFieldChange('rowLayout', val)}
                size="small"
                fullWidth
                sx={{ height: '32px' }}
              >
                <ToggleButton value="horizontal" sx={{ fontSize: '11px', textTransform: 'none' }}>
                  Horizontal (Side-by-Side)
                </ToggleButton>
                <ToggleButton value="vertical" sx={{ fontSize: '11px', textTransform: 'none' }}>
                  Vertical (Stacked)
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* Label Width - Only relevant when rowLayout is horizontal */}
            {options.rowLayout === 'horizontal' && (
              <CompactTextField
                label="Label Width (px)"
                type="number"
                value={options.labelWidth !== undefined ? options.labelWidth : 120}
                onChange={(e) => handleFieldChange('labelWidth', Number(e.target.value))}
              />
            )}

            {/* Gap */}
            <CompactTextField
              label="Gap between elements (px)"
              type="number"
              value={options.gap !== undefined ? options.gap : 10}
              onChange={(e) => handleFieldChange('gap', Number(e.target.value))}
            />

            {/* Alignment / Justify Content */}
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.8 }}>Alignment</Typography>
              <FormControl size="small" fullWidth>
                <Select
                  value={options.justifyContent || 'flex-start'}
                  onChange={(e) => handleFieldChange('justifyContent', e.target.value)}
                  sx={{ fontSize: '11px', bgcolor: '#f9f9f9', height: '32px' }}
                >
                  <MenuItem value="flex-start" sx={{ fontSize: '11px' }}>Left / Top</MenuItem>
                  <MenuItem value="center" sx={{ fontSize: '11px' }}>Center</MenuItem>
                  <MenuItem value="flex-end" sx={{ fontSize: '11px' }}>Right / Bottom</MenuItem>
                  <MenuItem value="space-between" sx={{ fontSize: '11px' }}>Space Between</MenuItem>
                  <MenuItem value="space-around" sx={{ fontSize: '11px' }}>Space Around</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Hide if Empty */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Hide if Empty</Typography>
                <Typography sx={{ fontSize: '11px', color: '#888' }}>Hide this row if value shortcodes are empty</Typography>
              </Box>
              <Switch
                checked={!!options.hideIfEmpty}
                onChange={(e) => handleFieldChange('hideIfEmpty', e.target.checked)}
                size="small"
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
          <Stack spacing={2.5}>
            {/* Background Color */}
            <ColorPicker
              label="Background Color"
              value={options.backgroundColor || 'transparent'}
              onChange={(color) => handleFieldChange('backgroundColor', color)}
            />
          </Stack>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            {/* Padding */}
            <SpacingControl
              label="Padding"
              value={options.padding}
              onChange={handlePaddingChange}
              onChangeAll={(v) => dispatch(updateParagraphRowEditorOptions({ padding: { top: v, right: v, bottom: v, left: v } }))}
            />

            {/* Margin */}
            <SpacingControl
              label="Margin"
              value={options.margin}
              onChange={handleMarginChange}
              onChangeAll={(v) => dispatch(updateParagraphRowEditorOptions({ margin: { top: v, right: v, bottom: v, left: v } }))}
            />
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Paragraph Row"
      description="Label-Value Layout row settings."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default ParagraphRowWidgetEditor;
