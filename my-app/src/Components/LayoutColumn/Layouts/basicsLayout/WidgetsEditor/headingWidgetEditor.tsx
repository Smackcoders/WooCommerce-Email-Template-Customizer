import {
  Box,
  ClickAwayListener,
  FormControl,
  IconButton,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Stack,
  Divider,
  InputLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Tabs,
  Tab,
  Slider,

} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import VerticalAlignTopIcon from "@mui/icons-material/VerticalAlignTop";
import VerticalAlignBottomIcon from "@mui/icons-material/VerticalAlignBottom";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import BlockIcon from "@mui/icons-material/Block";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import EditIcon from '@mui/icons-material/Edit';
import DesktopMacIcon from '@mui/icons-material/DesktopMac';
import FormatColorResetIcon from '@mui/icons-material/FormatColorReset';
import RestoreIcon from '@mui/icons-material/Restore';
import AddIcon from '@mui/icons-material/Add';
import StorageIcon from '@mui/icons-material/Storage';
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../Store/store";
import { AIAssistant } from "../../../../utils/AIAssistant";
import {
  updateHeadingEditorOptions,
  deleteColumnContent,
  closeEditor,
} from "../../../../../Store/Slice/workspaceSlice";
import { useMemo, useState, useCallback, useRef, useEffect } from "react";
import ColorPicker from "../../../../utils/ColorPicker";
import { TransformControl } from "../../../../utils/TransformControl";
import { BackgroundControl } from "../../../../utils/BackgroundControl";
import { HeadingEditorOptions } from "../../../../../Store/Slice/workspaceSlice";
import { FONT_FAMILIES } from "../../../../../Constants/StyleConstants";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";
import { AdvancedBorderControl } from "../../../../utils/AdvancedBorderControl";
import { PlaceholderSelect } from "../../../../utils/PlaceholderSelect";

const HeadingWidgetEditor = () => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, headingEditorOptions } = useSelector(
    (state: RootState) => state.workspace
  );

  const {
    fontFamily,
    fontWeight,
    fontSize,
    headingType,
    color,
    backgroundColor,
    textAlign,
    textTransform,
    lineHeight,
    letterSpace,
    width,
    height,
    padding = { top: 0, left: 0, right: 0, bottom: 0 },
    margin = { top: 0, left: 0, right: 0, bottom: 0 },
  } = headingEditorOptions;


  const [isTypographyOpen, setIsTypographyOpen] = useState(false);
  const [isStrokeOpen, setIsStrokeOpen] = useState(false);
  const [isShadowOpen, setIsShadowOpen] = useState(false);
  const [colorMode, setColorMode] = useState<'normal' | 'hover'>('normal');
  const [aiExpanded, setAiExpanded] = useState(false);
  const [localContent, setLocalContent] = useState(headingEditorOptions.content || "");

  useEffect(() => {
    setLocalContent(headingEditorOptions.content || "");
  }, [headingEditorOptions.content]);

  const optionsRef = useRef(headingEditorOptions);
  useEffect(() => {
    optionsRef.current = headingEditorOptions;
  }, [headingEditorOptions]);

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

  const updateData = useCallback((newData: Partial<HeadingEditorOptions>) => {
    dispatch(updateHeadingEditorOptions(newData));
  }, [dispatch]);

  const debouncedUpdate = useMemo(() => {
    let timeoutId: any;
    return (newData: Partial<HeadingEditorOptions>) => {
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


  const handleHeadingTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newHeadingType: "h1" | "h2" | "h3" | "h4" | "p" | null
  ) => {
    if (newHeadingType !== null) {
      let newFontSize = fontSize;
      switch (newHeadingType) {
        case "h1": newFontSize = 22; break;
        case "h2": newFontSize = 20; break;
        case "h3": newFontSize = 18; break;
        case "h4": newFontSize = 16; break;
        case "p": newFontSize = 14; break;
      }
      debouncedUpdate({ headingType: newHeadingType, fontSize: newFontSize });
    }
  };

  const handlePlaceholderSelect = (placeholderText: string) => {
    const newContent = localContent + placeholderText;
    setLocalContent(newContent);
    debouncedUpdate({ content: newContent });
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 0, bgcolor: '#fff' }}>
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, border: 'none', bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '20px' }} />} sx={{ minHeight: 48, p: '0 16px', '& .MuiAccordionSummary-content': { m: 0 } }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>Heading</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Title */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Title</Typography>
                  <Box display="flex" alignItems="center" sx={{ cursor: 'pointer', color: '#c026d3' }} onClick={() => setAiExpanded(true)}>
                    <AutoAwesomeIcon sx={{ fontSize: '14px', mr: 0.5 }} />
                    <Typography sx={{ fontSize: '11px', fontWeight: 600 }}>Write with AI</Typography>
                  </Box>
                </Box>
                <Box position="relative">
                  <TextField
                    key={`heading-content-${selectedWidgetIndex}`}
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    size="small"
                    value={localContent}
                    onChange={(e) => {
                      setLocalContent(e.target.value);
                      debouncedUpdate({ content: e.target.value });
                    }}
                    placeholder="Add Your Heading Text Here"
                    InputProps={{ sx: { fontSize: '12px', bgcolor: '#fff', p: 1, pr: 4 } }}
                  />
                  <Box position="absolute" top={4} right={4}>
                    <PlaceholderSelect
                      onSelect={handlePlaceholderSelect}
                      iconOnly={true}
                    />
                  </Box>
                </Box>
              </Box>



              {/* HTML Tag */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>HTML Tag</Typography>
                <FormControl size="small" sx={{ width: '120px' }}>
                  <Select
                    value={headingType || 'h2'}
                    onChange={(e) => handleHeadingTypeChange(null as any, e.target.value as any)}
                    sx={{ fontSize: '12px', bgcolor: '#fff' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].map((tag) => (
                      <MenuItem key={tag} value={tag} sx={{ fontSize: '12px', textTransform: 'uppercase' }}>
                        {tag}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

            </AccordionDetails>
          </Accordion>

          <Box mt={3} px={2} pb={2}>
            <Accordion expanded={aiExpanded} onChange={(e, expanded) => setAiExpanded(expanded)} disableGutters elevation={0} sx={{ border: '1px solid #eee', '&:before': { display: 'none' } }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f9f9f9', minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1 } }}>
                <Box display="flex" alignItems="center" gap={1}>
                  <AutoAwesomeIcon sx={{ fontSize: '16px', color: '#3858e9' }} />
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#3858e9' }}>AI Assistant</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2 }}>
                <AIAssistant
                  mode="text"
                  onInsertText={(text) => {
                    const newContent = localContent + text;
                    setLocalContent(newContent);
                    debouncedUpdate({ content: newContent });
                  }}
                  currentContent={localContent}
                />
              </AccordionDetails>
            </Accordion>
          </Box>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee', mx: -2, px: 2 }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', p: 0, '& .MuiAccordionSummary-content': { my: 1 } }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Heading</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {/* Alignment */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box display="flex" alignItems="center" gap={1}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Alignment</Typography>
                </Box>
                <ToggleButtonGroup
                  exclusive
                  value={textAlign}
                  onChange={(e, newAlign) => debouncedUpdate({ textAlign: newAlign || '' })}
                  size="small"
                  sx={{ bgcolor: '#fff', '& .MuiToggleButton-root': { p: '4px 8px', border: '1px solid #e0e0e0' } }}
                >
                  <ToggleButton value="left"><FormatAlignLeftIcon sx={{ fontSize: '16px' }} /></ToggleButton>
                  <ToggleButton value="center"><FormatAlignCenterIcon sx={{ fontSize: '16px' }} /></ToggleButton>
                  <ToggleButton value="right"><FormatAlignRightIcon sx={{ fontSize: '16px' }} /></ToggleButton>
                  <ToggleButton value="justify"><FormatAlignJustifyIcon sx={{ fontSize: '16px' }} /></ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Text Color */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>
                  Text Color
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
                    value={fontFamily}
                    onChange={(e) => debouncedUpdate({ fontFamily: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {FONT_FAMILIES.map((font) => (
                      <MenuItem key={font} value={font} sx={{ fontSize: '12px', fontFamily: font !== 'Global' ? font : 'inherit' }}>
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
                    value={fontSize}
                    min={10} max={100}
                    onChange={(e, val) => debouncedUpdate({ fontSize: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={fontSize}
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
                    value={fontWeight || '400'}
                    onChange={(e) => debouncedUpdate({ fontWeight: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((weight) => (
                      <MenuItem key={weight} value={weight} sx={{ fontSize: '12px' }}>{weight}</MenuItem>
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
                    onChange={(e) => debouncedUpdate({ textTransform: e.target.value as HeadingEditorOptions['textTransform'] })}
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
                    value={headingEditorOptions.fontStyle || 'normal'}
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
                    value={headingEditorOptions.textDecoration || 'none'}
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

              {/* Line Height */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '12px', color: '#555' }}>Line Height</Typography>
                  <Typography sx={{ fontSize: '11px', color: '#888' }}>px ⌄</Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={1.5}>
                  <Slider
                    value={lineHeight || 0}
                    min={0} max={150}
                    onChange={(e, val) => debouncedUpdate({ lineHeight: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={lineHeight || ''}
                    onChange={(e) => debouncedUpdate({ lineHeight: Number(e.target.value) })}
                    size="small" type="number"
                    sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                  />
                </Box>
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
                    value={headingEditorOptions.wordSpacing || 0}
                    min={-5} max={50} step={1}
                    onChange={(e, val) => debouncedUpdate({ wordSpacing: val as number })}
                    sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                  />
                  <TextField
                    value={headingEditorOptions.wordSpacing || 0}
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

              {/* Display */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333', mb: 1 }}>Display</Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={headingEditorOptions.display || 'block'}
                    onChange={(e) => debouncedUpdate({ display: e.target.value as string })}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['block', 'inline-block', 'inline'].map((d) => (
                      <MenuItem key={d} value={d} sx={{ fontSize: '12px' }}>
                        {d}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <SpacingControl
                label="Margin"
                value={margin}
                onChange={handleMarginChange}
                onChangeAll={(v) => debouncedUpdate({ margin: { top: v, right: v, bottom: v, left: v } })}
                unit={headingEditorOptions.marginUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ marginUnit: u as any })}
              />

              <SpacingControl
                label="Padding"
                value={padding}
                onChange={handlePaddingChange}
                onChangeAll={(v) => debouncedUpdate({ padding: { top: v, right: v, bottom: v, left: v } })}
                unit={headingEditorOptions.paddingUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ paddingUnit: u as any })}
              />

              {/* Width */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={headingEditorOptions.width === 'custom' ? 1.5 : 0}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '12px', color: '#555' }}>Width</Typography>
                  </Box>
                  <FormControl size="small" sx={{ width: '150px' }}>
                    <Select
                      value={headingEditorOptions.width || 'Default'}
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

                {headingEditorOptions.width === 'custom' && (
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
                        value={parseInt(headingEditorOptions.customWidth || '100')}
                        onChange={(e, val) => debouncedUpdate({ customWidth: `${val}px` })}
                        min={0}
                        max={1000}
                        sx={{ color: '#ddd', flexGrow: 1, '& .MuiSlider-thumb': { width: 14, height: 14, bgcolor: '#fff', border: '1px solid #ccc' } }}
                      />
                      <Box display="flex" alignItems="stretch" sx={{ width: '70px', height: '28px' }}>
                        <TextField
                          size="small"
                          value={parseInt(headingEditorOptions.customWidth || '100')}
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
                borderType={headingEditorOptions.borderTopStyle || 'none'}
                borderWidth={{
                  top: headingEditorOptions.borderTopWidth || 0,
                  right: headingEditorOptions.borderRightWidth || 0,
                  bottom: headingEditorOptions.borderBottomWidth || 0,
                  left: headingEditorOptions.borderLeftWidth || 0
                }}
                borderColor={headingEditorOptions.borderTopColor || '#00000000'}
                borderRadius={headingEditorOptions.borderRadius || 0}
                borderRadiusUnit={headingEditorOptions.borderRadiusUnit || 'px'}
                onBorderRadiusUnitChange={(u) => debouncedUpdate({ borderRadiusUnit: u as any })}
                boxShadow={headingEditorOptions.boxShadow || 'none'}
                borderTypeHover={headingEditorOptions.borderTypeHover}
                borderWidthHover={{
                  top: headingEditorOptions.borderTopWidthHover || headingEditorOptions.borderTopWidth || 0,
                  right: headingEditorOptions.borderRightWidthHover || headingEditorOptions.borderRightWidth || 0,
                  bottom: headingEditorOptions.borderBottomWidthHover || headingEditorOptions.borderBottomWidth || 0,
                  left: headingEditorOptions.borderLeftWidthHover || headingEditorOptions.borderLeftWidth || 0
                }}
                borderColorHover={headingEditorOptions.borderColorHover}
                borderRadiusHover={headingEditorOptions.borderRadiusHover}
                boxShadowHover={headingEditorOptions.boxShadowHover}
                transitionDuration={headingEditorOptions.transitionDuration}
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
                backgroundColor={headingEditorOptions.backgroundColor || ''}
                backgroundImage={headingEditorOptions.backgroundImage || ''}
                backgroundColorHover={headingEditorOptions.backgroundColorHover || ''}
                backgroundImageHover={headingEditorOptions.backgroundImageHover || ''}
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
      title="Heading"
      description="Customize heading style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      disableStyleInterception={true}
    />
  );
};

export default HeadingWidgetEditor;
