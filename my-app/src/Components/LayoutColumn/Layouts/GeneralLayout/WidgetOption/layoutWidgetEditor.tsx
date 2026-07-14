import React from 'react';
import {
  Box, Typography, TextField,
  Select, MenuItem, FormControl, Button,
  ToggleButton, ToggleButtonGroup,
  Tooltip, IconButton, Stack, Divider, Accordion, AccordionSummary, AccordionDetails
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import { useDispatch, useSelector } from "react-redux";
import {
  closeEditor, setSelectedBlockId, updateSelectedColumnIndex,
  updateColumnBgColor, updateColumnPadding,
  updateColumnBorderStyle, updateColumnBorderTopSize,
  updateColumnBorderBottomSize, updateColumnBorderLeftSize,
  updateColumnBorderRightSize, updateColumnBorderTopColor,
  updateColumnBorderBottomColor, updateColumnBorderLeftColor,
  updateColumnBorderRightColor, updateColumnTextAlign,
  updateColumnBgImage, updateColumnBgSize, updateColumnBgPosition, updateColumnBgRepeat, updateColumnBgAttachment,
  deleteColumnContent, updateColumnBorderRadius, updateColumnMargin,
  updateColumnPaddingUnit, updateColumnMarginUnit, updateColumnBorderRadiusUnit
} from "../../../../../Store/Slice/workspaceSlice";
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import { RootState } from "../../../../../Store/store";
import ColorPicker from "../../../../utils/ColorPicker";
import { SpacingControl } from '../../../../utils/SharedStyleTab';

const LayoutEditorWidget = () => {
  const dispatch = useDispatch();

  const selectedBlockForEditor = useSelector(
    (state: RootState) => state.workspace.selectedBlockForEditor
  );
  const selectedColumnIndex = useSelector(
    (state: RootState) => state.workspace.selectedColumnIndex
  );
  const selectedWidgetIndex = useSelector(
    (state: RootState) => state.workspace.selectedWidgetIndex
  );
  const selectedBlock = useSelector(
    (state: RootState) =>
      state.workspace.blocks.find(
        (block) => block.id === state.workspace.selectedBlockForEditor
      )
  );

  React.useEffect(() => {
    if (selectedBlockForEditor && selectedColumnIndex === null && selectedBlock?.columns?.length) {
      dispatch(updateSelectedColumnIndex(0));
    }
  }, [selectedBlockForEditor, selectedColumnIndex, selectedBlock, dispatch]);

  const isColumnSelected = selectedColumnIndex !== null && selectedBlock?.columns[selectedColumnIndex];
  const selectedStyle = isColumnSelected
    ? selectedBlock?.columns[selectedColumnIndex]?.style
    : selectedBlock?.style;

  const currentBgColor = isColumnSelected ? selectedStyle?.bgColor || "#ffffff" : undefined;
  const currentBgImage = isColumnSelected ? (selectedStyle as any)?.bgImage || "" : undefined;
  const currentBgSize = isColumnSelected ? (selectedStyle as any)?.bgSize || "cover" : undefined;
  const currentBgPosition = isColumnSelected ? (selectedStyle as any)?.bgPosition || "center" : undefined;
  const currentBgRepeat = isColumnSelected ? (selectedStyle as any)?.bgRepeat || "no-repeat" : undefined;
  const currentBgAttachment = isColumnSelected ? (selectedStyle as any)?.bgAttachment || "scroll" : undefined;
  const currentBorderStyle = isColumnSelected ? selectedStyle?.borderStyle || "solid" : undefined;
  const currentBorderTopSize = isColumnSelected ? selectedStyle?.borderTopSize || 0 : undefined;
  const currentBorderBottomSize = isColumnSelected ? selectedStyle?.borderBottomSize || 0 : undefined;
  const currentBorderLeftSize = isColumnSelected ? selectedStyle?.borderLeftSize || 0 : undefined;
  const currentBorderRightSize = isColumnSelected ? selectedStyle?.borderRightSize || 0 : undefined;
  const currentBorderTopColor = isColumnSelected ? selectedStyle?.borderTopColor || "#000000" : undefined;
  const currentBorderBottomColor = isColumnSelected ? selectedStyle?.borderBottomColor || "#000000" : undefined;
  const currentBorderLeftColor = isColumnSelected ? selectedStyle?.borderLeftColor || "#000000" : undefined;
  const currentBorderRightColor = isColumnSelected ? selectedStyle?.borderRightColor || "#000000" : undefined;

  const getPaddingObject = (padding: any) => {
    if (!padding) return { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof padding === 'object') return {
      top: Number(padding.top) || 0,
      right: Number(padding.right) || 0,
      bottom: Number(padding.bottom) || 0,
      left: Number(padding.left) || 0
    };
    const parts = String(padding).replace(/px/g, '').split(' ').map(Number);
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return { top: 0, right: 0, bottom: 0, left: 0 };
  };

  const getMarginObject = (margin: any) => {
    if (!margin) return { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof margin === 'object') return {
      top: Number(margin.top) || 0,
      right: Number(margin.right) || 0,
      bottom: Number(margin.bottom) || 0,
      left: Number(margin.left) || 0
    };
    const parts = String(margin).replace(/px/g, '').split(' ').map(Number);
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return { top: 0, right: 0, bottom: 0, left: 0 };
  };

  const getBorderRadiusObject = (borderRadius: any) => {
    if (!borderRadius) return { top: 0, right: 0, bottom: 0, left: 0 };
    if (typeof borderRadius === 'object') return {
      top: Number(borderRadius.top) || 0,
      right: Number(borderRadius.right) || 0,
      bottom: Number(borderRadius.bottom) || 0,
      left: Number(borderRadius.left) || 0
    };
    const parts = String(borderRadius).replace(/px/g, '').split(' ').map(Number);
    if (parts.length === 1) return { top: parts[0], right: parts[0], bottom: parts[0], left: parts[0] };
    if (parts.length >= 4) return { top: parts[0], right: parts[1], bottom: parts[2], left: parts[3] };
    return { top: 0, right: 0, bottom: 0, left: 0 };
  };

  const currentPadding = isColumnSelected ? getPaddingObject(selectedStyle?.padding) : undefined;
  const currentMargin = isColumnSelected ? getMarginObject((selectedStyle as any)?.margin) : undefined;
  const currentBorderRadius = isColumnSelected ? getBorderRadiusObject((selectedStyle as any)?.borderRadius) : undefined;
  const currentTextAlign = isColumnSelected ? (selectedStyle as any)?.textAlign || 'left' : undefined;

  const [borderColorLinked, setBorderColorLinked] = React.useState(true);

  const isEditorEnabled = !!selectedBlockForEditor;
  const numberOfColumns = selectedBlock?.columns.length || 0;

  const handleColumnSelectChange = (event: { target: { value: unknown } }) => {
    dispatch(updateSelectedColumnIndex(Number(event.target.value)));
  };

  const dispatchStyleUpdate = (blockAction: any, columnAction: any, payload: any) => {
    const finalColumnPayload = { ...payload, columnIndex: selectedColumnIndex, blockId: selectedBlockForEditor };
    const finalBlockPayload = { ...payload, blockId: selectedBlockForEditor };

    if (isColumnSelected && selectedColumnIndex !== null) {
      dispatch(columnAction(finalColumnPayload));
    } else {
      dispatch(blockAction(finalBlockPayload));
    }
  };

  const handleCloseEditor = () => {
    dispatch(closeEditor());
    dispatch(setSelectedBlockId(null));
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

  const handleBrowseBgImage = () => {
    const wp = (window as any).wp;
    if (wp && wp.media) {
      const mediaFrame = wp.media({
        title: 'Select Background Image',
        button: { text: 'Use as Background' },
        multiple: false,
      });

      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        dispatchStyleUpdate(() => { }, updateColumnBgImage, { image: attachment.url });
      });

      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available.');
    }
  };

  const handleRemoveBgImage = () => {
    dispatchStyleUpdate(() => { }, updateColumnBgImage, { image: '' });
  };

  return (
    <Box sx={{ bgcolor: '#f9f9f9', height: '100%' }}>
      {/* Editor Header */}
      <Box sx={{ p: '15px 20px', bgcolor: '#fff', borderBottom: '1px solid #e7e9eb' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#495157' }}>
            {isColumnSelected ? `Column ${selectedColumnIndex + 1}` : "Block Layout"}
          </Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Close">
              <IconButton onClick={handleCloseEditor} size="small" sx={{ p: 0.5 }}>
                <CloseIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            {isEditorEnabled && (
              <Tooltip title="Delete">
                <IconButton onClick={handleDeleteContent} size="small" sx={{ p: 0.5 }}>
                  <DeleteIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>
        <Typography sx={{ fontSize: '13px', color: '#6d7882', fontStyle: 'italic' }}>
          {isColumnSelected ? "Customize column style." : "Customize block layout and style."}
        </Typography>
      </Box>

      {!isEditorEnabled ? (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Select a block to edit its properties.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
          {/* Layout Section */}
          <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Layout</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
              <Stack spacing={2.5}>
                {numberOfColumns > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.8 }}>Choose Column</Typography>
                    <FormControl variant="outlined" size="small" fullWidth>
                      <Select
                        value={selectedColumnIndex !== null ? selectedColumnIndex : ""}
                        onChange={handleColumnSelectChange}
                        sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        {Array.from({ length: numberOfColumns }, (_, i) => (
                          <MenuItem key={i} value={i} sx={{ fontSize: '11px' }}>
                            Column {i + 1}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                )}

                {isColumnSelected && (
                  <Box>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>Content Alignment</Typography>
                    <ToggleButtonGroup
                      value={currentTextAlign}
                      exclusive
                      onChange={(_, newAlignment) => {
                        if (newAlignment) {
                          dispatchStyleUpdate(() => { }, updateColumnTextAlign, { textAlign: newAlignment });
                        }
                      }}
                      size="small"
                      fullWidth
                      sx={{ bgcolor: '#f9f9f9' }}
                    >
                      <ToggleButton value="center" sx={{ fontSize: '11px', textTransform: 'lowercase', py: '6px' }}>top</ToggleButton>
                      <ToggleButton value="left" sx={{ fontSize: '11px', textTransform: 'lowercase', py: '6px' }}>left</ToggleButton>
                      <ToggleButton value="right" sx={{ fontSize: '11px', textTransform: 'lowercase', py: '6px' }}>right</ToggleButton>
                      <ToggleButton value="justify" sx={{ fontSize: '11px', textTransform: 'lowercase', py: '6px' }}>row</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>

          {/* Style Section */}
          <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Style</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
              <Stack spacing={3}>
                {isColumnSelected && currentBorderStyle !== undefined && (
                  <>
                    <Box>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Border Settings</Typography>
                      <FormControl variant="outlined" size="small" fullWidth sx={{ mb: 2 }}>
                        <Typography sx={{ fontSize: '12px', color: '#6d7882', mb: 0.5 }}>Border Style</Typography>
                        <Select
                          value={currentBorderStyle}
                          onChange={(e) => dispatchStyleUpdate(() => { }, updateColumnBorderStyle, { style: e.target.value })}
                          sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                          MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                        >
                          <MenuItem value="none" sx={{ fontSize: '11px' }}>None</MenuItem>
                          <MenuItem value="solid" sx={{ fontSize: '11px' }}>Solid</MenuItem>
                          <MenuItem value="dashed" sx={{ fontSize: '11px' }}>Dashed</MenuItem>
                          <MenuItem value="dotted" sx={{ fontSize: '11px' }}>Dotted</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <SpacingControl
                        label="Border Width (px)"
                        value={{ top: currentBorderTopSize ?? 0, right: currentBorderRightSize ?? 0, bottom: currentBorderBottomSize ?? 0, left: currentBorderLeftSize ?? 0 }}
                        onChange={(side, val) => {
                          if (side === 'top') dispatchStyleUpdate(() => { }, updateColumnBorderTopSize, { size: val });
                          if (side === 'right') dispatchStyleUpdate(() => { }, updateColumnBorderRightSize, { size: val });
                          if (side === 'bottom') dispatchStyleUpdate(() => { }, updateColumnBorderBottomSize, { size: val });
                          if (side === 'left') dispatchStyleUpdate(() => { }, updateColumnBorderLeftSize, { size: val });
                        }}
                        onChangeAll={(val) => {
                          dispatchStyleUpdate(() => { }, updateColumnBorderTopSize, { size: val });
                          dispatchStyleUpdate(() => { }, updateColumnBorderRightSize, { size: val });
                          dispatchStyleUpdate(() => { }, updateColumnBorderBottomSize, { size: val });
                          dispatchStyleUpdate(() => { }, updateColumnBorderLeftSize, { size: val });
                        }}
                      />
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Border Color</Typography>
                        <IconButton
                          size="small"
                          onClick={() => setBorderColorLinked(!borderColorLinked)}
                          sx={{ p: '3px', color: borderColorLinked ? '#1976d2' : '#94a3b8', bgcolor: borderColorLinked ? 'rgba(25,118,210,0.08)' : 'transparent', borderRadius: '4px' }}
                        >
                          {borderColorLinked ? <LinkIcon sx={{ fontSize: 16 }} /> : <LinkOffIcon sx={{ fontSize: 16 }} />}
                        </IconButton>
                      </Box>
                      {borderColorLinked ? (
                        <ColorPicker
                          label=""
                          value={currentBorderTopColor || '#000'}
                          onChange={(color) => {
                            dispatchStyleUpdate(() => { }, updateColumnBorderTopColor, { color });
                            dispatchStyleUpdate(() => { }, updateColumnBorderRightColor, { color });
                            dispatchStyleUpdate(() => { }, updateColumnBorderBottomColor, { color });
                            dispatchStyleUpdate(() => { }, updateColumnBorderLeftColor, { color });
                          }}
                        />
                      ) : (
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
                          {[
                            { label: 'Top', val: currentBorderTopColor, action: updateColumnBorderTopColor },
                            { label: 'Right', val: currentBorderRightColor, action: updateColumnBorderRightColor },
                            { label: 'Bottom', val: currentBorderBottomColor, action: updateColumnBorderBottomColor },
                            { label: 'Left', val: currentBorderLeftColor, action: updateColumnBorderLeftColor },
                          ].map(p => (
                            <Box key={p.label}>
                              <Typography sx={{ fontSize: '9px', color: '#888', mb: 0.5 }}>{p.label}</Typography>
                              <ColorPicker label="" value={p.val || '#000'} onChange={(color) => dispatchStyleUpdate(() => { }, p.action, { color })} />
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>



                    {currentPadding && (
                      <Box sx={{ mb: 2 }}>
                        <SpacingControl
                          label="Padding"
                          value={currentPadding}
                          unit={selectedBlock?.columns?.[selectedColumnIndex ?? 0]?.style?.paddingUnit || 'px'}
                          onUnitChange={(u) => dispatchStyleUpdate(() => { }, updateColumnPaddingUnit, { unit: u })}
                          onChange={(side, val) => dispatchStyleUpdate(() => { }, updateColumnPadding, { side, value: val })}
                          onChangeAll={(val) => {
                            dispatchStyleUpdate(() => { }, updateColumnPadding, { side: 'top', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnPadding, { side: 'right', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnPadding, { side: 'bottom', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnPadding, { side: 'left', value: val });
                          }}
                        />
                      </Box>
                    )}

                    {currentMargin && (
                      <Box sx={{ mb: 2 }}>
                        <SpacingControl
                          label="Margin"
                          value={currentMargin}
                          unit={selectedBlock?.columns?.[selectedColumnIndex ?? 0]?.style?.marginUnit || 'px'}
                          onUnitChange={(u) => dispatchStyleUpdate(() => { }, updateColumnMarginUnit, { unit: u })}
                          onChange={(side, val) => dispatchStyleUpdate(() => { }, updateColumnMargin, { side, value: val })}
                          onChangeAll={(val) => {
                            dispatchStyleUpdate(() => { }, updateColumnMargin, { side: 'top', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnMargin, { side: 'right', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnMargin, { side: 'bottom', value: val });
                            dispatchStyleUpdate(() => { }, updateColumnMargin, { side: 'left', value: val });
                          }}
                        />
                      </Box>
                    )}
                  </>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        </Box>
      )}
    </Box>
  );
};

export default LayoutEditorWidget;
