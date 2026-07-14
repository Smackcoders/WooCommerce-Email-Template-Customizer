import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  ToggleButton,
  ToggleButtonGroup,
  Switch,
  Slider,
  FormControlLabel,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  Close as CloseIcon,
} from "@mui/icons-material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../Store/store";
import {
  updateButtonEditorOptions,
  closeEditor,
  deleteColumnContent,
} from "../../../../../Store/Slice/workspaceSlice";
import { ButtonEditorOptions, defaultButtonEditorOptions } from "../../../../../Store/Slice/workspaceSlice";
import { PlaceholderSelect } from "../../../../utils/PlaceholderSelect";
import ColorPicker from "../../../../utils/ColorPicker";
import CommonStylingControls from "../../../../utils/CommonStylingControls";
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";
import { FONT_FAMILIES } from "../../../../../Constants/StyleConstants";

const ButtonWidgetEditor = () => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, buttonEditorOptions: buttonData } = useSelector(
    (state: RootState) => state.workspace
  );


  const optionsRef = useRef(buttonData);
  useEffect(() => {
    optionsRef.current = buttonData;
  }, [buttonData]);

  const updateData = useCallback((newData: Partial<ButtonEditorOptions>) => {
    dispatch(updateButtonEditorOptions(newData));
  }, [dispatch]);

  const debouncedUpdate = useMemo(() => {
    let timeoutId: any;
    return (newData: Partial<ButtonEditorOptions>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateData(newData), 50);
    };
  }, [updateData]);

  const handleChange = (field: keyof ButtonEditorOptions, value: any) => {
    debouncedUpdate({ [field]: value });
  };

  const handlePaddingChange = (side: any, value: number) => {
    debouncedUpdate({ padding: { ...buttonData.padding, [side]: value } });
  };

  const handleMarginChange = (side: any, value: number) => {
    debouncedUpdate({ margin: { ...buttonData.margin, [side]: value } });
  };

  const handleBorderRadiusChange = (side: keyof ButtonEditorOptions["borderRadius"], value: number) => {
    debouncedUpdate({ borderRadius: { ...buttonData.borderRadius, [side]: value } });
  };

  const handleWidthToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isAuto = event.target.checked;
    debouncedUpdate({
      widthAuto: isAuto,
      width: isAuto ? undefined : buttonData.width ?? 100,
    });
  };

  const handleWidthChange = (event: Event, newValue: number | number[]) => {
    debouncedUpdate({ width: newValue as number });
  };

  const handleCloseEditor = useCallback(() => {
    dispatch(closeEditor());
  }, [dispatch]);

  const handleDeleteContent = useCallback(() => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      dispatch(
        deleteColumnContent({
          blockId: selectedBlockForEditor,
          columnIndex: selectedColumnIndex,
          widgetIndex: selectedWidgetIndex,
        })
      );
    }
  }, [dispatch, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex]);

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Variables</Typography>
              <PlaceholderSelect onSelect={(ph) => handleChange("text", (buttonData.text || "") + ph)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Button Text</Typography>
              <TextField
                fullWidth
                value={buttonData.text}
                onChange={(e) => handleChange("text", e.target.value)}
                size="small"
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Link URL</Typography>
              <Box mb={1}>
                <PlaceholderSelect onSelect={(ph) => handleChange("url", (buttonData.url || "") + ph)} />
              </Box>
              <TextField
                fullWidth
                value={buttonData.url}
                onChange={(e) => handleChange("url", e.target.value)}
                size="small"
                placeholder="example.com"
                InputProps={{
                  sx: { fontSize: '11px', bgcolor: '#f9f9f9' },
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography sx={{ fontSize: '11px', color: '#a4afb7' }}>https://</Typography>
                    </InputAdornment>
                  ),
                }}
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
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <ColorPicker
                label="Background"
                value={buttonData.bgColor}
                onChange={(color) => handleChange("bgColor", color)}
              />
              <ColorPicker
                label="Text Color"
                value={buttonData.textColor}
                onChange={(color) => handleChange("textColor", color)}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Font Family</Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={buttonData.fontFamily || 'global'}
                  onChange={(e) => handleChange("fontFamily", e.target.value)}
                  sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                  MenuProps={{
                    disablePortal: true,
                    sx: { zIndex: 999999 }
                  }}
                >
                  {FONT_FAMILIES.map((font) => (
                    <MenuItem key={font} value={font === 'Global' ? 'global' : font} sx={{ fontSize: '11px', fontFamily: font !== 'Global' ? font : 'inherit' }}>
                      {font}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Font Size</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={buttonData.fontSize}
                  onChange={(e) => handleChange("fontSize", Number(e.target.value))}
                  size="small"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Line Height</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={buttonData.lineHeight || 24}
                  onChange={(e) => handleChange("lineHeight", Number(e.target.value))}
                  size="small"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Letter Spacing</Typography>
                <TextField
                  fullWidth
                  type="number"
                  value={buttonData.letterSpacing !== undefined ? buttonData.letterSpacing : (buttonData.letterSpace ?? 0)}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    handleChange("letterSpacing", value);
                    handleChange("letterSpace", value);
                  }}
                  size="small"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                  inputProps={{ step: 0.1 }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Text Transform</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={buttonData.textTransform || 'none'}
                    onChange={(e) => handleChange("textTransform", e.target.value)}
                    sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                    MenuProps={{
                      disablePortal: true,
                      sx: { zIndex: 999999 }
                    }}
                  >
                    {['none', 'uppercase', 'lowercase', 'capitalize'].map((transform) => (
                      <MenuItem key={transform} value={transform} sx={{ fontSize: '11px', textTransform: 'capitalize' }}>
                        {transform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>

            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Font Weight</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={buttonData.fontWeight || '400'}
                    onChange={(e) => handleChange("fontWeight", e.target.value)}
                    sx={{ fontSize: '11px', bgcolor: '#f9f9f9' }}
                    MenuProps={{
                      disablePortal: true,
                      sx: { zIndex: 999999 }
                    }}
                  >
                    {['Normal', 'Bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((weight) => (
                      <MenuItem key={weight} value={weight} sx={{ fontSize: '11px' }}>{weight}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alignment</Typography>
                <ToggleButtonGroup
                  exclusive
                  value={buttonData.textAlign}
                  onChange={(e, newAlign) => newAlign && handleChange("textAlign", newAlign)}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: '#f9f9f9' }}
                >
                  <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeft sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenter sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRight sx={{ fontSize: '18px' }} /></ToggleButton>
                </ToggleButtonGroup>
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={buttonData.widthAuto || false}
                      onChange={handleWidthToggle}
                      size="small"
                    />
                  }
                  label={<Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#555' }}>Auto</Typography>}
                  labelPlacement="start"
                  sx={{ m: 0 }}
                />
                {!buttonData.widthAuto && (
                  <Box width="100%" ml={1}>
                    <Slider
                      value={buttonData.width ?? 100}
                      onChange={handleWidthChange}
                      size="small"
                      sx={{ color: '#93003c' }}
                    />
                  </Box>
                )}
              </Box>
            </Box>
          </Stack>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>Border Radius</Typography>
              <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={1}>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>TOP</Typography>
                  <TextField type="number" size="small" fullWidth value={buttonData.borderRadius.topLeft} onChange={(e) => handleBorderRadiusChange("topLeft", Number(e.target.value))} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>RIGHT</Typography>
                  <TextField type="number" size="small" fullWidth value={buttonData.borderRadius.topRight} onChange={(e) => handleBorderRadiusChange("topRight", Number(e.target.value))} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>BOTTOM</Typography>
                  <TextField type="number" size="small" fullWidth value={buttonData.borderRadius.bottomRight} onChange={(e) => handleBorderRadiusChange("bottomRight", Number(e.target.value))} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '9px', fontWeight: 700, textAlign: 'center', mb: 0.5, color: '#6d7882' }}>LEFT</Typography>
                  <TextField type="number" size="small" fullWidth value={buttonData.borderRadius.bottomLeft} onChange={(e) => handleBorderRadiusChange("bottomLeft", Number(e.target.value))} InputProps={{ sx: { fontSize: '11px', textAlign: 'center', p: 0, bgcolor: '#f9f9f9' } }} />
                </Box>
              </Box>
            </Box>

            <SpacingControl
              label="Padding"
              value={buttonData.padding}
              onChange={handlePaddingChange}
              onChangeAll={(v) => debouncedUpdate({ padding: { top: v, right: v, bottom: v, left: v } })}
              unit={buttonData.paddingUnit || 'px'}
              onUnitChange={(u) => debouncedUpdate({ paddingUnit: u as any })}
            />

            <SpacingControl
              label="Margin"
              value={buttonData.margin}
              onChange={handleMarginChange}
              onChangeAll={(v) => debouncedUpdate({ margin: { top: v, right: v, bottom: v, left: v } })}
              unit={buttonData.marginUnit || 'px'}
              onUnitChange={(u) => debouncedUpdate({ marginUnit: u as any })}
            />

          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Button"
      description="Customize button style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default ButtonWidgetEditor;
