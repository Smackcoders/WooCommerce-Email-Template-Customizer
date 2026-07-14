import React from 'react';
import {
  Box,
  Typography,
  Select,
  MenuItem,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  FormControl,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Slider,
  Button,
  IconButton,
} from '@mui/material';
import { SpacingControl } from './SharedStyleTab';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  FormatAlignLeft,
  FormatAlignCenter,
  FormatAlignRight,
  FormatAlignJustify,
  CropOriginal as CropOriginalIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ColorPicker from './ColorPicker';
import { FONT_FAMILIES } from '../../Constants/StyleConstants';

// Custom Accordion Wrapper
const AccordionSection: React.FC<{ title: string; defaultExpanded?: boolean; children: React.ReactNode }> = ({
  title,
  defaultExpanded = true,
  children,
}) => (
  <Accordion defaultExpanded={defaultExpanded} disableGutters sx={{ border: 'none', borderBottom: '1px solid #e2e8f0', boxShadow: 'none', '&:before': { display: 'none' } }}>
    <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ px: 1.5, py: 0.5, bgcolor: '#f8fafc' }}>
      <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {title}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ p: 2, bgcolor: '#ffffff' }}>
      {children}
    </AccordionDetails>
  </Accordion>
);

interface GlobalStyleTabProps {
  subStyles: any;
  onUpdate: (updatedFields: Record<string, any>) => void;
  contentType?: any;
}

export const GlobalStyleTab: React.FC<GlobalStyleTabProps> = ({
  subStyles = {},
  onUpdate,
  contentType,
}) => {
  // Helpers for text color mapping (both color & textColor)
  const getTextColorValue = () => {
    return subStyles.color || subStyles.textColor || '#000000';
  };

  const handleTextColorChange = (newColor: string) => {
    onUpdate({ color: newColor, textColor: newColor });
  };

  // Helpers for background color mapping (both backgroundColor & bgColor)
  const getBgColorValue = () => {
    return subStyles.backgroundColor || subStyles.bgColor || 'transparent';
  };

  const handleBgColorChange = (newColor: string) => {
    onUpdate({ backgroundColor: newColor, bgColor: newColor });
  };

  // Helpers for alignment mapping (textAlign, align, alignment, iconAlign)
  const getAlignmentValue = () => {
    return subStyles.textAlign || subStyles.align || subStyles.alignment || subStyles.iconAlign || 'left';
  };

  const handleAlignmentChange = (val: string) => {
    onUpdate({
      textAlign: val,
      align: val,
      alignment: val,
      iconAlign: val
    });
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
        onUpdate({ bgImage: attachment.url, backgroundImage: attachment.url });
      });

      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available.');
    }
  };

  const handleRemoveBgImage = () => {
    onUpdate({ bgImage: '', backgroundImage: '' });
  };

  // Border Radius Object Normalizer
  const getBorderRadius = () => {
    const raw = subStyles.borderRadius;
    if (raw && typeof raw === 'object') {
      return {
        top: raw.top ?? raw.topLeft ?? 0,
        right: raw.right ?? raw.topRight ?? 0,
        bottom: raw.bottom ?? raw.bottomRight ?? 0,
        left: raw.left ?? raw.bottomLeft ?? 0,
      };
    }
    const val = Number(raw) || 0;
    return { top: val, right: val, bottom: val, left: val };
  };

  const handleBorderRadiusChange = (side: 'top' | 'right' | 'bottom' | 'left', val: number) => {
    const current = getBorderRadius();
    const nextObj = { ...current, [side]: val };
    
    // Write back both shorthand object keys ({ top, right, bottom, left })
    // and Button's specific keys ({ topLeft, topRight, bottomRight, bottomLeft })
    // and the fallback number if all corners are identical.
    onUpdate({
      borderRadius: {
        top: nextObj.top,
        right: nextObj.right,
        bottom: nextObj.bottom,
        left: nextObj.left,
        topLeft: nextObj.top,
        topRight: nextObj.right,
        bottomRight: nextObj.bottom,
        bottomLeft: nextObj.left,
      }
    });
  };

  const borderRadius = getBorderRadius();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* 1. TYPOGRAPHY */}
      <AccordionSection title="Typography">
        <Stack spacing={2.5}>
          {/* Family */}
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography sx={{ fontSize: '12px', color: '#555' }}>Family</Typography>
            <FormControl size="small" sx={{ width: '160px' }}>
              <Select
                value={subStyles.fontFamily === 'inherit' || !subStyles.fontFamily ? 'global' : (FONT_FAMILIES.includes(subStyles.fontFamily) ? subStyles.fontFamily : 'global')}
                onChange={(e) => onUpdate({ fontFamily: e.target.value === 'global' ? '' : e.target.value })}
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
                value={subStyles.fontSize !== undefined ? parseInt(subStyles.fontSize) : 14}
                min={10} max={100}
                onChange={(e, val) => onUpdate({ fontSize: val as number })}
                sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
              />
              <TextField
                value={subStyles.fontSize !== undefined ? parseInt(subStyles.fontSize) : ''}
                onChange={(e) => onUpdate({ fontSize: e.target.value === '' ? '' : Number(e.target.value) })}
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
                value={subStyles.fontWeight || '400'}
                onChange={(e) => onUpdate({ fontWeight: e.target.value })}
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
                value={subStyles.textTransform || 'none'}
                onChange={(e) => onUpdate({ textTransform: e.target.value })}
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
                value={subStyles.fontStyle || 'normal'}
                onChange={(e) => onUpdate({ fontStyle: e.target.value })}
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
                value={subStyles.textDecoration || 'none'}
                onChange={(e) => onUpdate({ textDecoration: e.target.value })}
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
                value={subStyles.lineHeight || 0}
                min={0} max={150}
                onChange={(e, val) => onUpdate({ lineHeight: val as number })}
                sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
              />
              <TextField
                value={subStyles.lineHeight || ''}
                onChange={(e) => onUpdate({ lineHeight: Number(e.target.value) })}
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
                value={subStyles.letterSpace || 0}
                min={-5} max={20} step={0.5}
                onChange={(e, val) => onUpdate({ letterSpace: val as number })}
                sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
              />
              <TextField
                value={subStyles.letterSpace || 0}
                onChange={(e) => onUpdate({ letterSpace: Number(e.target.value) })}
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
                value={subStyles.wordSpacing || 0}
                min={-5} max={50} step={1}
                onChange={(e, val) => onUpdate({ wordSpacing: val as number })}
                sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
              />
              <TextField
                value={subStyles.wordSpacing || 0}
                onChange={(e) => onUpdate({ wordSpacing: Number(e.target.value) })}
                size="small" type="number"
                sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
              />
            </Box>
          </Box>
        </Stack>
      </AccordionSection>

      {/* 2. LAYOUT & SIZE */}
      <AccordionSection title="Layout & Size">
        <Stack spacing={2.5}>
          {/* Width & Height */}
          {contentType !== 'container' && (
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Width</Typography>
                <TextField
                  type="text"
                  value={subStyles.width !== undefined ? subStyles.width : ''}
                  onChange={(e) => onUpdate({ width: e.target.value })}
                  placeholder="e.g. 100% or 100px"
                  size="small"
                  fullWidth
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f8fafc' } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Height</Typography>
                <TextField
                  type="text"
                  value={subStyles.height !== undefined ? subStyles.height : ''}
                  onChange={(e) => onUpdate({ height: e.target.value })}
                  placeholder="e.g. auto or 50px"
                  size="small"
                  fullWidth
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#f8fafc' } }}
                />
              </Box>
            </Box>
          )}

          {/* Display & Flex Controls */}
          {contentType !== 'container' && contentType !== 'text' && (
            <>
              <Box>
                <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Display</Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={subStyles.display || 'block'}
                    onChange={(e) => onUpdate({ display: e.target.value })}
                    sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    {['block', 'inline-block', 'inline', 'flex', 'inline-flex', 'grid'].map((display) => (
                      <MenuItem key={display} value={display} sx={{ fontSize: '11px' }}>
                        {display}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {(subStyles.display === 'flex' || subStyles.display === 'inline-flex') && (
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={1.5}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Justify Content</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subStyles.justifyContent || 'flex-start'}
                        onChange={(e) => onUpdate({ justifyContent: e.target.value })}
                        sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        {['flex-start', 'center', 'flex-end', 'space-between', 'space-around', 'space-evenly'].map((v) => (
                          <MenuItem key={v} value={v} sx={{ fontSize: '11px' }}>{v}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Align Items</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subStyles.alignItems || 'stretch'}
                        onChange={(e) => onUpdate({ alignItems: e.target.value })}
                        sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        {['flex-start', 'center', 'flex-end', 'stretch', 'baseline'].map((v) => (
                          <MenuItem key={v} value={v} sx={{ fontSize: '11px' }}>{v}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </>
          )}

          {/* Alignment */}
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Alignment</Typography>
            <ToggleButtonGroup
              value={getAlignmentValue()}
              exclusive
              onChange={(e, newAlign) => newAlign && handleAlignmentChange(newAlign)}
              size="small"
              fullWidth
              sx={{ bgcolor: '#f8fafc', height: '32px' }}
            >
              <ToggleButton value="left" sx={{ p: '4px' }}><FormatAlignLeft sx={{ fontSize: '16px' }} /></ToggleButton>
              <ToggleButton value="center" sx={{ p: '4px' }}><FormatAlignCenter sx={{ fontSize: '16px' }} /></ToggleButton>
              <ToggleButton value="right" sx={{ p: '4px' }}><FormatAlignRight sx={{ fontSize: '16px' }} /></ToggleButton>
              <ToggleButton value="justify" sx={{ p: '4px' }}><FormatAlignJustify sx={{ fontSize: '16px' }} /></ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {/* Image Fit (only for image content type) */}
          {contentType === 'image' && (
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Image Fit</Typography>
              <ToggleButtonGroup
                value={subStyles.objectFit || 'contain'}
                exclusive
                onChange={(e, val) => val && onUpdate({ objectFit: val })}
                size="small"
                fullWidth
                sx={{ bgcolor: '#f8fafc', height: '32px' }}
              >
                <ToggleButton value="contain" sx={{ fontSize: '10px', textTransform: 'capitalize' }}>Fit (Contain)</ToggleButton>
                <ToggleButton value="cover" sx={{ fontSize: '10px', textTransform: 'capitalize' }}>Fill (Cover)</ToggleButton>
                <ToggleButton value="fill" sx={{ fontSize: '10px', textTransform: 'capitalize' }}>Stretch (Fill)</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          )}

          {/* Z-Index */}
          {contentType !== 'container' && contentType !== 'text' && (
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Z-Index</Typography>
              <TextField
                type="number"
                value={subStyles.zIndex !== undefined ? subStyles.zIndex : ''}
                onChange={(e) => onUpdate({ zIndex: e.target.value === '' ? '' : Number(e.target.value) })}
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f8fafc' } }}
              />
            </Box>
          )}
        </Stack>
      </AccordionSection>

      {/* 3. COLORS & BACKGROUND */}
      <AccordionSection title="Colors & Background">
        <Stack spacing={2}>
          <ColorPicker
            label="Text Color"
            value={getTextColorValue()}
            onChange={handleTextColorChange}
          />
          <ColorPicker
            label="Background Color"
            value={getBgColorValue()}
            onChange={handleBgColorChange}
          />
          
          {contentType !== 'container' && contentType !== 'text' && (
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Background Image</Typography>
              {(subStyles.bgImage || subStyles.backgroundImage) ? (
                <Box sx={{ border: "1px dashed #ccc", borderRadius: '4px', p: 1, bgcolor: '#f8fafc', textAlign: 'center', mb: 1 }}>
                  <Box display="flex" justifyContent="flex-end" mb={0.5}>
                    <IconButton onClick={handleRemoveBgImage} size="small" sx={{ p: 0.25 }}>
                      <DeleteIcon fontSize="small" sx={{ color: '#ff4d4d' }} />
                    </IconButton>
                  </Box>
                  <Box
                    component="img"
                    src={subStyles.bgImage || subStyles.backgroundImage}
                    alt="Background Preview"
                    sx={{ maxWidth: "100%", maxHeight: 80, objectFit: "contain" }}
                  />
                </Box>
              ) : null}

              <Button
                variant="outlined"
                fullWidth
                startIcon={<CropOriginalIcon />}
                size="small"
                onClick={handleBrowseBgImage}
                sx={{ color: '#475569', borderColor: '#cbd5e1', '&:hover': { bgcolor: '#f8fafc', borderColor: '#cbd5e1' }, textTransform: 'none', fontSize: '11px', mb: 1 }}
              >
                {(subStyles.bgImage || subStyles.backgroundImage) ? 'Change Image' : 'Select Image'}
              </Button>

              {/* Background Size & Background Position */}
              {(subStyles.bgImage || subStyles.backgroundImage) && (
                <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                  <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Size</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subStyles.bgSize || subStyles.backgroundSize || 'cover'}
                        onChange={(e) => onUpdate({ bgSize: e.target.value, backgroundSize: e.target.value })}
                        sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        <MenuItem value="auto" sx={{ fontSize: '11px' }}>Auto</MenuItem>
                        <MenuItem value="cover" sx={{ fontSize: '11px' }}>Cover</MenuItem>
                        <MenuItem value="contain" sx={{ fontSize: '11px' }}>Contain</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Position</Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={subStyles.bgPosition || subStyles.backgroundPosition || 'center'}
                        onChange={(e) => onUpdate({ bgPosition: e.target.value, backgroundPosition: e.target.value })}
                        sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        <MenuItem value="left top" sx={{ fontSize: '11px' }}>Left Top</MenuItem>
                        <MenuItem value="left center" sx={{ fontSize: '11px' }}>Left Center</MenuItem>
                        <MenuItem value="left bottom" sx={{ fontSize: '11px' }}>Left Bottom</MenuItem>
                        <MenuItem value="right top" sx={{ fontSize: '11px' }}>Right Top</MenuItem>
                        <MenuItem value="right center" sx={{ fontSize: '11px' }}>Right Center</MenuItem>
                        <MenuItem value="right bottom" sx={{ fontSize: '11px' }}>Right Bottom</MenuItem>
                        <MenuItem value="center top" sx={{ fontSize: '11px' }}>Center Top</MenuItem>
                        <MenuItem value="center center" sx={{ fontSize: '11px' }}>Center Center</MenuItem>
                        <MenuItem value="center bottom" sx={{ fontSize: '11px' }}>Center Bottom</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </AccordionSection>

      {/* 4. BORDER */}
      <AccordionSection title="Border">
        <Stack spacing={2}>
          {/* Border Type */}
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Border Type</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={subStyles.borderTopStyle || 'none'}
                onChange={(e) => onUpdate({
                  borderTopStyle: e.target.value,
                  borderRightStyle: e.target.value,
                  borderBottomStyle: e.target.value,
                  borderLeftStyle: e.target.value,
                })}
                sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
              >
                {['none', 'solid', 'dashed', 'dotted', 'double'].map((style) => (
                  <MenuItem key={style} value={style} sx={{ fontSize: '11px', textTransform: 'capitalize' }}>
                    {style}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Border Width and Color - Only when type is not none */}
          {(subStyles.borderTopStyle && subStyles.borderTopStyle !== 'none') && (
            <>
              <Box>
                <SpacingControl
                  label="Border Width"
                  value={{
                    top: subStyles.borderTopWidth ?? 1,
                    right: subStyles.borderRightWidth ?? 1,
                    bottom: subStyles.borderBottomWidth ?? 1,
                    left: subStyles.borderLeftWidth ?? 1
                  }}
                  unit="px"
                  onChange={(side, val) => onUpdate({ [`border${side.charAt(0).toUpperCase() + side.slice(1)}Width`]: val })}
                  onChangeAll={(val) => onUpdate({ borderTopWidth: val, borderRightWidth: val, borderBottomWidth: val, borderLeftWidth: val })}
                />
              </Box>
              <ColorPicker
                label="Border Color"
                value={subStyles.borderTopColor || '#000000'}
                onChange={(color) => onUpdate({
                  borderTopColor: color,
                  borderRightColor: color,
                  borderBottomColor: color,
                  borderLeftColor: color,
                })}
              />
            </>
          )}

          {/* Border Radius (4 sides) */}
          {contentType !== 'container' && contentType !== 'text' && (
            <Box>
              <SpacingControl
                label="Border Radius"
                value={borderRadius}
                unit="px"
                onChange={(side, val) => handleBorderRadiusChange(side as 'top'|'right'|'bottom'|'left', val)}
                onChangeAll={(val) => {
                  handleBorderRadiusChange('top', val);
                  handleBorderRadiusChange('right', val);
                  handleBorderRadiusChange('bottom', val);
                  handleBorderRadiusChange('left', val);
                }}
              />
            </Box>
          )}
        </Stack>
      </AccordionSection>
    </Box>
  );
};

export default GlobalStyleTab;
