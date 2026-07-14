import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Tooltip,
  IconButton,
  Stack,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Select,
  MenuItem,
  FormControl,
  Slider
} from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import StorageIcon from "@mui/icons-material/Storage";
import EditIcon from "@mui/icons-material/Edit";
import RestoreIcon from "@mui/icons-material/Restore";
import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateLinkEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import ColorPicker from "../../../../utils/ColorPicker";
import { FONT_FAMILIES } from "../../../../../Constants/StyleConstants";
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";

import { SpacingControl } from "../../../../utils/SharedStyleTab";
import { AdvancedBorderControl } from "../../../../utils/AdvancedBorderControl";
import { BackgroundControl } from "../../../../utils/BackgroundControl";
import { LinkEditorOptions } from "../../../../../Store/Slice/workspaceSlice";

const LinkWidgetEditor = () => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, linkEditorOptions } = useSelector(
    (state: RootState) => state.workspace
  );

  const {
    fontFamily,
    fontWeight,
    fontSize,
    color,
    backgroundColor,
    textAlign,
    textTransform,
    lineHeight,
    letterSpace = 0,
    width,
    height,
    padding = { top: 0, left: 0, right: 0, bottom: 0 },
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = linkEditorOptions;

  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isStrokeOpen, setIsStrokeOpen] = useState(false);
  const [isShadowOpen, setIsShadowOpen] = useState(false);

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

  const updateData = useCallback((newData: Partial<LinkEditorOptions>) => {
    dispatch(updateLinkEditorOptions(newData));
  }, [dispatch]);

  const debouncedUpdate = useMemo(() => {
    let timeoutId: any;
    return (newData: Partial<LinkEditorOptions>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateData(newData), 50);
    };
  }, [updateData]);

  const handlePaddingChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    debouncedUpdate({ padding: { ...padding, [side]: value } });
  };

  const handleMarginChange = (side: "top" | "left" | "right" | "bottom", value: number) => {
    debouncedUpdate({ margin: { ...margin, [side]: value } });
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 0, bgcolor: '#fff' }}>
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, border: 'none', bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '20px' }} />} sx={{ minHeight: 48, p: '0 16px', '& .MuiAccordionSummary-content': { m: 0 } }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>Link</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Link Text</Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={linkEditorOptions.text ?? ''}
                  onChange={(e) => debouncedUpdate({ text: e.target.value })}
                  placeholder="Click here"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>URL</Typography>
                <TextField
                  size="small"
                  fullWidth
                  value={linkEditorOptions.url || '#'}
                  onChange={(e) => debouncedUpdate({ url: e.target.value })}
                  placeholder="https://example.com"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alignment</Typography>
                <ToggleButtonGroup
                  exclusive
                  fullWidth
                  value={linkEditorOptions.textAlign || 'left'}
                  onChange={(e, newAlign) => newAlign && debouncedUpdate({ textAlign: newAlign })}
                  size="small"
                  sx={{ bgcolor: '#f9f9f9' }}
                >
                  <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="justify" sx={{ p: '5px' }}><FormatAlignJustifyIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <FormControlLabel
                control={
                  <Switch
                    checked={linkEditorOptions.underline || false}
                    onChange={(e) => debouncedUpdate({ underline: e.target.checked })}
                    color="primary"
                    size="small"
                  />
                }
                label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Underline Link</Typography>}
                sx={{ ml: 0 }}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee', mx: -2, px: 2 }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', p: 0, '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Link</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Link Color */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  Link Color
                </Typography>
                <Box display="flex" gap={0.5} alignItems="center">
                  <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                    <ColorPicker
                      label=""
                      value={color}
                      onChange={(newColor) => debouncedUpdate({ color: newColor })}
                      size="small"
                    />
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee', mx: -2, px: 2 }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', p: 0, '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Typography</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Family */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#555' }}>Family</Typography>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={fontFamily || 'global'}
                    onChange={(e) => debouncedUpdate({ fontFamily: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {FONT_FAMILIES.map((font) => (
                      <MenuItem key={font} value={font === 'Global' ? 'global' : font} sx={{ fontSize: '12px', fontFamily: font !== 'Global' ? font : 'inherit' }}>
                        {font}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Size */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '12px', color: '#555' }}>Size</Typography>
                  <Typography sx={{ fontSize: '11px', color: '#888' }}>px ⌄</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Slider
                    value={fontSize || 14}
                    min={10} max={100}
                    onChange={(e, val) => debouncedUpdate({ fontSize: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={fontSize || 14}
                    onChange={(e) => debouncedUpdate({ fontSize: Number(e.target.value) })}
                    size="small" type="number"
                    sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                  />
                </Box>
              </Box>

              {/* Weight */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#555' }}>Weight</Typography>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={fontWeight || 'normal'}
                    onChange={(e) => debouncedUpdate({ fontWeight: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'].map((weight) => (
                      <MenuItem key={weight} value={weight} sx={{ fontSize: '12px' }}>{weight === 'normal' ? 'Normal' : weight === 'bold' ? 'Bold' : weight}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Transform */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#555' }}>Transform</Typography>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={textTransform || 'none'}
                    onChange={(e) => debouncedUpdate({ textTransform: e.target.value as any })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['none', 'uppercase', 'lowercase', 'capitalize'].map((transform) => (
                      <MenuItem key={transform} value={transform} sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {transform === 'none' ? 'Default' : transform}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Style */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#555' }}>Style</Typography>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={linkEditorOptions.fontStyle || 'normal'}
                    onChange={(e) => debouncedUpdate({ fontStyle: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['normal', 'italic', 'oblique'].map((style) => (
                      <MenuItem key={style} value={style} sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {style === 'normal' ? 'Default' : style}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Decoration */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '12px', color: '#555' }}>Decoration</Typography>
                <FormControl size="small" sx={{ width: '160px' }}>
                  <Select
                    value={linkEditorOptions.textDecoration || 'none'}
                    onChange={(e) => debouncedUpdate({ textDecoration: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['none', 'underline', 'overline', 'line-through'].map((decoration) => (
                      <MenuItem key={decoration} value={decoration} sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
                        {decoration === 'none' ? 'Default' : decoration}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Letter Spacing */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '12px', color: '#555' }}>Letter Spacing</Typography>
                  <Typography sx={{ fontSize: '11px', color: '#888' }}>px ⌄</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Slider
                    value={letterSpace}
                    min={-5} max={20} step={0.5}
                    onChange={(e, val) => debouncedUpdate({ letterSpace: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={letterSpace}
                    onChange={(e) => debouncedUpdate({ letterSpace: Number(e.target.value) })}
                    size="small" type="number" inputProps={{ step: 0.5 }}
                    sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                  />
                </Box>
              </Box>

              {/* Word Spacing */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '12px', color: '#555' }}>Word Spacing</Typography>
                  <Typography sx={{ fontSize: '11px', color: '#888' }}>px ⌄</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Slider
                    value={linkEditorOptions.wordSpacing || 0}
                    min={-5} max={50} step={1}
                    onChange={(e, val) => debouncedUpdate({ wordSpacing: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={linkEditorOptions.wordSpacing || 0}
                    onChange={(e) => debouncedUpdate({ wordSpacing: Number(e.target.value) })}
                    size="small" type="number"
                    sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                  />
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ bgcolor: '#fff' }}>
          <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Layout</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              <SpacingControl
                label="Margin"
                value={margin}
                onChange={handleMarginChange}
                onChangeAll={(v) => debouncedUpdate({ margin: { top: v, right: v, bottom: v, left: v } })}
                unit={linkEditorOptions.marginUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ marginUnit: u as any })}
              />

              <SpacingControl
                label="Padding"
                value={padding}
                onChange={handlePaddingChange}
                onChangeAll={(v) => debouncedUpdate({ padding: { top: v, right: v, bottom: v, left: v } })}
                unit={linkEditorOptions.paddingUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ paddingUnit: u as any })}
              />

              {/* Width */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={linkEditorOptions.width === 'custom' ? 1.5 : 0}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '12px', color: '#555' }}>Width</Typography>
                  </Box>
                  <FormControl size="small" sx={{ width: '150px' }}>
                    <Select
                      value={linkEditorOptions.width || 'Default'}
                      onChange={(e) => debouncedUpdate({ width: e.target.value as string })}
                      sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                      MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                    >
                      {['Default', '100%', 'auto', 'custom'].map((w) => (
                        <MenuItem key={w} value={w} sx={{ fontSize: '12px', textTransform: 'capitalize' }}>
                          {w === '100%' ? 'Full Width' : w === 'auto' ? 'Inline (auto)' : w}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>

                {linkEditorOptions.width === 'custom' && (
                  <Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography sx={{ fontSize: '12px', color: '#555' }}>Custom Width</Typography>
                        <DesktopMacIcon sx={{ fontSize: '14px', color: '#888' }} />
                      </Box>
                      <Box display="flex" alignItems="center" gap={0.5} sx={{ cursor: 'pointer' }}>
                        <Typography sx={{ fontSize: '11px', color: '#777' }}>px</Typography>
                        <ExpandMoreIcon sx={{ fontSize: '14px', color: '#777' }} />
                      </Box>
                    </Box>
                    <Box display="flex" alignItems="center" gap={1.5}>
                      <Slider
                        size="small"
                        value={parseInt(linkEditorOptions.customWidth || '100')}
                        onChange={(e, val) => debouncedUpdate({ customWidth: `${val}px` })}
                        min={0}
                        max={1000}
                        sx={{ color: '#ddd', flexGrow: 1, '& .MuiSlider-thumb': { width: 14, height: 14, bgcolor: '#fff', border: '1px solid #ccc' } }}
                      />
                      <Box display="flex" alignItems="stretch" sx={{ width: '70px', height: '28px' }}>
                        <TextField
                          size="small"
                          value={parseInt(linkEditorOptions.customWidth || '100')}
                          onChange={(e) => debouncedUpdate({ customWidth: `${e.target.value}px` })}
                          sx={{
                            flexGrow: 1,
                            '& .MuiInputBase-root': { fontSize: '12px', height: '100%', borderRadius: '4px 0 0 4px', bgcolor: '#fff' },
                            '& fieldset': { borderRight: 'none', borderColor: '#ddd' }
                          }}
                        />
                        <Box sx={{ border: '1px solid #ddd', borderLeft: '1px solid #ddd', borderRadius: '0 4px 4px 0', width: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#fff', cursor: 'pointer' }}>
                          <StorageIcon sx={{ fontSize: '12px', color: '#555' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Box>
                )}
              </Box>
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Border</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <AdvancedBorderControl
                borderType={linkEditorOptions.borderTopStyle || 'none'}
                borderWidth={{
                  top: linkEditorOptions.borderTopWidth || 0,
                  right: linkEditorOptions.borderRightWidth || 0,
                  bottom: linkEditorOptions.borderBottomWidth || 0,
                  left: linkEditorOptions.borderLeftWidth || 0
                }}
                borderColor={linkEditorOptions.borderTopColor || '#00000000'}
                borderRadius={linkEditorOptions.borderRadius || 0}
                borderRadiusUnit={linkEditorOptions.borderRadiusUnit || 'px'}
                onBorderRadiusUnitChange={(u) => debouncedUpdate({ borderRadiusUnit: u as any })}
                boxShadow={linkEditorOptions.boxShadow || 'none'}
                borderTypeHover={linkEditorOptions.borderTypeHover}
                borderWidthHover={{
                  top: linkEditorOptions.borderTopWidthHover || linkEditorOptions.borderTopWidth || 0,
                  right: linkEditorOptions.borderRightWidthHover || linkEditorOptions.borderRightWidth || 0,
                  bottom: linkEditorOptions.borderBottomWidthHover || linkEditorOptions.borderBottomWidth || 0,
                  left: linkEditorOptions.borderLeftWidthHover || linkEditorOptions.borderLeftWidth || 0
                }}
                borderColorHover={linkEditorOptions.borderColorHover}
                borderRadiusHover={linkEditorOptions.borderRadiusHover}
                boxShadowHover={linkEditorOptions.boxShadowHover}
                transitionDuration={linkEditorOptions.transitionDuration}
                hideBoxShadow={true}
                onChange={(isHover, prop, value) => {
                  if (prop === 'borderType') {
                    debouncedUpdate(isHover ? { borderTypeHover: value } : { borderTopStyle: value, borderRightStyle: value, borderBottomStyle: value, borderLeftStyle: value });
                  } else if (prop === 'borderColor') {
                    debouncedUpdate(isHover ? { borderColorHover: value } : { borderTopColor: value, borderRightColor: value, borderBottomColor: value, borderLeftColor: value });
                  } else if (prop === 'borderWidthAll') {
                    debouncedUpdate(isHover ? { borderTopWidthHover: value, borderRightWidthHover: value, borderBottomWidthHover: value, borderLeftWidthHover: value } : { borderTopWidth: value, borderRightWidth: value, borderBottomWidth: value, borderLeftWidth: value });
                  } else if (prop === 'borderRadius') {
                    debouncedUpdate(isHover ? { borderRadiusHover: value } : { borderRadius: value });
                  } else if (prop === 'boxShadow') {
                    debouncedUpdate(isHover ? { boxShadowHover: value } : { boxShadow: value });
                  } else {
                    debouncedUpdate(isHover ? { [`${prop}Hover`]: value } : { [prop]: value });
                  }
                }}
                onTransitionChange={(val) => debouncedUpdate({ transitionDuration: val })}
              />
            </AccordionDetails>
          </Accordion>

          <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Background</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2 }}>
              <BackgroundControl
                backgroundColor={linkEditorOptions.backgroundColor || ''}
                backgroundImage={linkEditorOptions.backgroundImage || ''}
                backgroundColorHover={linkEditorOptions.backgroundColorHover || ''}
                backgroundImageHover={linkEditorOptions.backgroundImageHover || ''}
                onChange={(isHover, prop, value) => {
                  if (prop === 'color') {
                    debouncedUpdate({
                      ...(isHover ? { backgroundColorHover: value } : { backgroundColor: value })
                    });
                  } else if (prop === 'image' || prop === 'gradient') {
                    debouncedUpdate({
                      ...(isHover ? { backgroundImageHover: value } : { backgroundImage: value })
                    });
                  }
                }}
              />
            </AccordionDetails>
          </Accordion>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Link"
      description="Edit link properties and style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      disableStyleInterception={true}
    />
  );
};

export default LinkWidgetEditor;
