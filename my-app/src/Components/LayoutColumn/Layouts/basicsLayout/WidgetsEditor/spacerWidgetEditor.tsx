import React, { useState } from 'react';
import { Box, Typography, TextField, Tooltip, IconButton, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateSpacerEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import ColorPicker from "../../../../utils/ColorPicker";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";

const SpacerWidgetEditor = () => {
  const dispatch = useDispatch();
  const { spacerEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );


  const handleChange = (field: keyof typeof spacerEditorOptions) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    dispatch(updateSpacerEditorOptions({ [field]: e.target.value }));
  };

  const handleColorChange = (newColor: string) => {
    dispatch(updateSpacerEditorOptions({ backgroundColor: newColor }));
  };

  const handlePaddingChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    dispatch(updateSpacerEditorOptions({ padding: { ...(spacerEditorOptions.padding || { top: 0, left: 0, right: 0, bottom: 0 }), [side]: value } }));
  };

  const handleMarginChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    dispatch(updateSpacerEditorOptions({ margin: { ...(spacerEditorOptions.margin || { top: 0, left: 0, right: 0, bottom: 0 }), [side]: value } }));
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
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Height (px)</Typography>
              <TextField
                type="number"
                value={spacerEditorOptions.height || 20}
                onChange={handleChange('height')}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width (%)</Typography>
              <TextField
                type="text"
                value={spacerEditorOptions.width || '100%'}
                onChange={handleChange('width')}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
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
            <ColorPicker
              label="Background Color"
              value={spacerEditorOptions.backgroundColor || 'transparent'}
              onChange={handleColorChange}
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
              value={spacerEditorOptions.padding}
              onChange={handlePaddingChange}
              onChangeAll={(v) => dispatch(updateSpacerEditorOptions({ padding: { top: v, right: v, bottom: v, left: v } }))}
            />

            <SpacingControl
              label="Margin"
              value={spacerEditorOptions.margin}
              onChange={handleMarginChange}
              onChangeAll={(v) => dispatch(updateSpacerEditorOptions({ margin: { top: v, right: v, bottom: v, left: v } }))}
            />
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Spacer"
      description="Adjust spacing between elements."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default SpacerWidgetEditor;