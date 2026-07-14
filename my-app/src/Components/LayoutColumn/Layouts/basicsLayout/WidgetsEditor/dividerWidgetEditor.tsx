import {
  Box, Typography, Slider, TextField, MenuItem,
  ToggleButton, ToggleButtonGroup,
  IconButton, Tooltip,
  Stack,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../Store/store";
import CloseIcon from "@mui/icons-material/Close";
import { updateDividerEditorOptions, deleteColumnContent, closeEditor } from "../../../../../Store/Slice/workspaceSlice";
import { useState } from "react";
import ColorPicker from "../../../../utils/ColorPicker";
import { DividerEditorOptions } from "../../../../../Store/Slice/workspaceSlice";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";

const DividerWidgetEditor = () => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, dividerEditorOptions: dividerOptions } = useSelector(
    (state: RootState) => state.workspace
  );


  const handleOptionChange = (field: keyof DividerEditorOptions, value: any) => {
    dispatch(updateDividerEditorOptions({ [field]: value }));
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

  const handleCloseEditor = () => {
    dispatch(closeEditor());
  };

  const handlePaddingChange = (side: keyof DividerEditorOptions["padding"], value: number) => {
    const newPadding = { ...dividerOptions.padding, [side]: Math.max(0, value) };
    dispatch(updateDividerEditorOptions({ padding: newPadding }));
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width (%)</Typography>
              <Slider
                value={parseInt(dividerOptions.width)}
                onChange={(_, value) => handleOptionChange("width", `${value || 1}`)}
                min={1}
                max={100}
                step={1}
                size="small"
                sx={{ color: '#93003c' }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alignment</Typography>
              <ToggleButtonGroup
                value={dividerOptions.alignment}
                exclusive
                onChange={(_, newAlign) => newAlign && handleOptionChange("alignment", newAlign)}
                fullWidth
                size="small"
                sx={{ bgcolor: '#f9f9f9' }}
              >
                <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
              </ToggleButtonGroup>
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
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Style</Typography>
                <TextField
                  select
                  value={dividerOptions.style}
                  onChange={(e) => handleOptionChange("style", e.target.value)}
                  fullWidth
                  size="small"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                  SelectProps={{
                    MenuProps: {
                      disablePortal: true,
                      sx: { zIndex: 999999 }
                    }
                  }}
                >
                  <MenuItem value="solid" sx={{ fontSize: '11px' }}>Solid</MenuItem>
                  <MenuItem value="dashed" sx={{ fontSize: '11px' }}>Dashed</MenuItem>
                  <MenuItem value="dotted" sx={{ fontSize: '11px' }}>Dotted</MenuItem>
                </TextField>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Weight (px)</Typography>
                <TextField
                  type="number"
                  value={dividerOptions.thickness}
                  onChange={(e) => handleOptionChange("thickness", parseInt(e.target.value) || 1)}
                  inputProps={{ min: 1 }}
                  fullWidth
                  size="small"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
            </Box>

            <ColorPicker
              label="Color"
              value={dividerOptions.color}
              onChange={(color) => handleOptionChange("color", color)}
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
            <SpacingControl
              label="Padding"
              value={dividerOptions.padding}
              onChange={handlePaddingChange}
              onChangeAll={(v) => dispatch(updateDividerEditorOptions({ padding: { top: v, right: v, bottom: v, left: v } }))}
            />
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Divider"
      description="Customize divider line."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default DividerWidgetEditor;