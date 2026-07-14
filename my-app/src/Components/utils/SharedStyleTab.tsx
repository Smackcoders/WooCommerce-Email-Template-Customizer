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
  IconButton,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  ButtonBase,
  Menu,
  Slider,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FormatAlignLeftIcon from '@mui/icons-material/FormatAlignLeft';
import FormatAlignCenterIcon from '@mui/icons-material/FormatAlignCenter';
import FormatAlignRightIcon from '@mui/icons-material/FormatAlignRight';
import FormatAlignJustifyIcon from '@mui/icons-material/FormatAlignJustify';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import ColorPicker from './ColorPicker';
import { FONT_FAMILIES } from '../../Constants/StyleConstants';

// Styled helper wrapper for Accordion sections
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

/* ─── spacing grid (4-side) matching reference design ─── */
interface SpacingValue {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

export const SpacingControl: React.FC<{
  label: string;
  value: SpacingValue | undefined;
  onChange: (s: any, v: number) => void;
  onChangeAll?: (v: number) => void;
  unit?: string;
  onUnitChange?: (u: string) => void;
}> = ({ label, value, onChange, onChangeAll, unit, onUnitChange }) => {
  const [linked, setLinked] = React.useState(true);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleValChange = (side: string, v: number) => {
    if (linked) {
      if (onChangeAll) {
        onChangeAll(v);
      } else {
        onChange('top', v);
        onChange('right', v);
        onChange('bottom', v);
        onChange('left', v);
      }
    } else {
      onChange(side, v);
    }
  };

  const inputStyle = {
    width: '100%',
    border: 'none !important',
    outline: 'none !important',
    boxShadow: 'none !important',
    textAlign: 'center',
    fontSize: '11px',
    fontFamily: 'inherit',
    bgcolor: 'transparent',
    p: '6px 2px',
    height: '28px',
    boxSizing: 'border-box',
    color: '#333',
    '&::-webkit-inner-spin-button, &::-webkit-outer-spin-button': {
      WebkitAppearance: 'none',
      margin: 0,
    },
    MozAppearance: 'textfield',
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={0.75}>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#334155' }}>{label}</Typography>
        {unit && onUnitChange && (
          <Box>
            <ButtonBase
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                fontSize: '10px',
                color: '#94a3b8',
                fontWeight: 700,
                textTransform: 'uppercase',
                '&:hover': { color: '#64748b' },
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              {unit}
              <span style={{ fontSize: '7px', opacity: 0.7 }}>▼</span>
            </ButtonBase>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              disablePortal
              sx={{ zIndex: 999999 }}
              PaperProps={{
                sx: {
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  border: '1px solid #d5dadf',
                  borderRadius: '3px',
                  mt: 0.5,
                  minWidth: '45px',
                  '& .MuiList-root': {
                    padding: '0 !important',
                    margin: '0 !important',
                  },
                }
              }}
            >
              {['px', '%', 'em', 'rem'].map((u) => {
                const isSelected = unit === u;
                return (
                  <MenuItem
                    key={u}
                    onClick={() => {
                      onUnitChange(u);
                      setAnchorEl(null);
                    }}
                    sx={{
                      fontSize: '10px',
                      py: '4px',
                      px: '12px',
                      minHeight: 'auto',
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? '#b01e5c' : '#555',
                      justifyContent: 'center',
                      fontFamily: 'inherit',
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  >
                    {u}
                  </MenuItem>
                );
              })}
            </Menu>
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'stretch',
          border: '1px solid #cbd5e1',
          borderRadius: '3px',
          height: '28px',
          bgcolor: '#fff',
          overflow: 'hidden'
        }}>
          {/* Top */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              component="input"
              type="number"
              value={value?.top ?? 0}
              onChange={(e: any) => handleValChange('top', Number(e.target.value))}
              sx={inputStyle}
            />
          </Box>
          <Box sx={{ width: '1px', bgcolor: '#e2e8f0' }} />

          {/* Right */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              component="input"
              type="number"
              value={value?.right ?? 0}
              onChange={(e: any) => handleValChange('right', Number(e.target.value))}
              sx={inputStyle}
            />
          </Box>
          <Box sx={{ width: '1px', bgcolor: '#e2e8f0' }} />

          {/* Bottom */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              component="input"
              type="number"
              value={value?.bottom ?? 0}
              onChange={(e: any) => handleValChange('bottom', Number(e.target.value))}
              sx={inputStyle}
            />
          </Box>
          <Box sx={{ width: '1px', bgcolor: '#e2e8f0' }} />

          {/* Left */}
          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center' }}>
            <Box
              component="input"
              type="number"
              value={value?.left ?? 0}
              onChange={(e: any) => handleValChange('left', Number(e.target.value))}
              sx={inputStyle}
            />
          </Box>

          {/* Link button */}
          <Box sx={{ width: '1px', bgcolor: '#cbd5e1' }} />
          <ButtonBase
            onClick={() => setLinked(l => !l)}
            sx={{
              width: '28px',
              bgcolor: linked ? '#f1f5f9' : '#fff',
              color: linked ? '#3b82f6' : '#94a3b8',
              '&:hover': { bgcolor: '#e2e8f0' },
              transition: 'all 0.15s ease-in-out',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title={linked ? 'Unlink sides' : 'Link all sides'}
          >
            {linked ? <LinkIcon sx={{ fontSize: 13 }} /> : <LinkOffIcon sx={{ fontSize: 13 }} />}
          </ButtonBase>
        </Box>

        {/* Labels row */}
        <Box sx={{ display: 'flex', pr: '28px' }}>
          <Typography sx={{ flex: 1, fontSize: '9px', color: '#64748b', textAlign: 'center' }}>Top</Typography>
          <Typography sx={{ flex: 1, fontSize: '9px', color: '#64748b', textAlign: 'center' }}>Right</Typography>
          <Typography sx={{ flex: 1, fontSize: '9px', color: '#64748b', textAlign: 'center' }}>Bottom</Typography>
          <Typography sx={{ flex: 1, fontSize: '9px', color: '#64748b', textAlign: 'center' }}>Left</Typography>
        </Box>
      </Box>
    </Box>
  );
};

/* ─── Border Section ─── */
export const BorderControl: React.FC<{
  subStyles: any;
  onUpdate: (s: Record<string, any>) => void;
}> = ({ subStyles, onUpdate }) => {
  const globalBorderStyle = subStyles.borderTopStyle || 'none';
  const globalBorderColor = subStyles.borderTopColor || '#00000000';

  const handleBorderTypeChange = (type: string) => {
    onUpdate({
      borderTopStyle: type,
      borderRightStyle: type,
      borderBottomStyle: type,
      borderLeftStyle: type,
    });
  };

  const handleBorderColorChange = (color: string) => {
    onUpdate({
      borderTopColor: color,
      borderRightColor: color,
      borderBottomColor: color,
      borderLeftColor: color,
    });
  };

  const borderWidthObj = {
    top: subStyles.borderTopWidth ?? 0,
    right: subStyles.borderRightWidth ?? 0,
    bottom: subStyles.borderBottomWidth ?? 0,
    left: subStyles.borderLeftWidth ?? 0,
  };

  const handleBorderWidthChange = (side: string, val: number) => {
    onUpdate({ [`border${side.charAt(0).toUpperCase() + side.slice(1)}Width`]: val });
  };

  const handleBorderWidthChangeAll = (val: number) => {
    onUpdate({
      borderTopWidth: val,
      borderRightWidth: val,
      borderBottomWidth: val,
      borderLeftWidth: val,
    });
  };

  const rawRadius = subStyles.borderRadius;
  const radiusObj: any = (rawRadius && typeof rawRadius === 'object')
    ? rawRadius
    : { top: rawRadius ?? 0, right: rawRadius ?? 0, bottom: rawRadius ?? 0, left: rawRadius ?? 0 };

  const handleRadiusChange = (side: string, val: number) => {
    onUpdate({ borderRadius: { ...radiusObj, [side]: val } });
  };

  const handleRadiusChangeAll = (val: number) => {
    onUpdate({ borderRadius: { top: val, right: val, bottom: val, left: val } });
  };

  return (
    <Stack spacing={2}>
      {/* Border Type */}
      <Box>
        <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#334155', mb: 1 }}>Border Type</Typography>
        <FormControl fullWidth size="small">
          <Select
            value={globalBorderStyle}
            onChange={(e) => handleBorderTypeChange(e.target.value)}
            sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
            MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
          >
            {['none', 'solid', 'dashed', 'dotted', 'double'].map(s => (
              <MenuItem key={s} value={s} sx={{ fontSize: '11px', textTransform: 'capitalize' }}>{s}</MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Border Width and Color - Only show if type is not 'none' */}
      {globalBorderStyle !== 'none' && (
        <>
          <SpacingControl
            label="Border Width"
            value={borderWidthObj}
            onChange={handleBorderWidthChange}
            onChangeAll={handleBorderWidthChangeAll}
          />
          <ColorPicker
            label="Border Color"
            value={globalBorderColor}
            onChange={handleBorderColorChange}
          />
        </>
      )}

      {/* Border Radius */}
      <SpacingControl
        label="Border Radius"
        value={radiusObj}
        onChange={handleRadiusChange}
        onChangeAll={handleRadiusChangeAll}
      />
    </Stack>
  );
};

/* ─── Exported Style Tab Content Component ─── */
interface StyleTabContentProps {
  subStyles: any;
  onUpdate: (updatedFields: Record<string, any>) => void;
  showTypography?: boolean;
  showDimensions?: boolean;
}

export const StyleTabContent: React.FC<StyleTabContentProps> = ({
  subStyles = {},
  onUpdate,
  showTypography = true,
  showDimensions = false,
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {showDimensions && (
        <AccordionSection title="Dimensions">
          <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
            <Box>
              <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Width</Typography>
              <TextField
                type="text"
                value={subStyles.width !== undefined ? subStyles.width : ''}
                onChange={(e) => onUpdate({ width: e.target.value })}
                placeholder="e.g. 100px or 50%"
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
                placeholder="e.g. 50px or auto"
                size="small"
                fullWidth
                InputProps={{ sx: { fontSize: '11px', bgcolor: '#f8fafc' } }}
              />
            </Box>
          </Box>
        </AccordionSection>
      )}

      {showTypography && (
        <AccordionSection title="Typography">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
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
                  value={subStyles.fontSize || 0}
                  min={10} max={100}
                  onChange={(e, val) => onUpdate({ fontSize: val as number })}
                  sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                />
                <TextField
                  value={subStyles.fontSize || ''}
                  onChange={(e) => onUpdate({ fontSize: Number(e.target.value) })}
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
                  onChange={(e) => onUpdate({ fontWeight: e.target.value as string })}
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
                  onChange={(e) => onUpdate({ fontStyle: e.target.value as string })}
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
                  onChange={(e) => onUpdate({ textDecoration: e.target.value as string })}
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
                  value={subStyles.letterSpacing !== undefined ? subStyles.letterSpacing : (subStyles.letterSpace || 0)}
                  min={-5} max={20} step={0.5}
                  onChange={(e, val) => onUpdate({ letterSpacing: val as number, letterSpace: val as number })}
                  sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                />
                <TextField
                  value={subStyles.letterSpacing !== undefined ? subStyles.letterSpacing : (subStyles.letterSpace || '')}
                  onChange={(e) => onUpdate({ letterSpacing: Number(e.target.value), letterSpace: Number(e.target.value) })}
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

          </Box>
        </AccordionSection>
      )}

      <AccordionSection title="Background">
        <ColorPicker
          label="Background Color"
          value={subStyles.backgroundColor || 'transparent'}
          onChange={(newColor) => onUpdate({ backgroundColor: newColor })}
        />
      </AccordionSection>

      <AccordionSection title="Border">
        <BorderControl subStyles={subStyles} onUpdate={onUpdate} />
      </AccordionSection>
    </Box>
  );
};

/* ─── Exported Advanced Tab Content Component ─── */
interface AdvancedTabContentProps {
  subStyles: any;
  onUpdate: (updatedFields: Record<string, any>) => void;
  hideLayout?: boolean;
}

export const AdvancedTabContent: React.FC<AdvancedTabContentProps> = ({
  subStyles = {},
  onUpdate,
  hideLayout = false,
}) => {
  const margin = subStyles.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const padding = subStyles.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  const handleMarginChange = (side: string, v: number) => {
    onUpdate({ margin: { ...margin, [side]: v } });
  };

  const handleMarginChangeAll = (v: number) => {
    onUpdate({ margin: { top: v, right: v, bottom: v, left: v } });
  };

  const handlePaddingChange = (side: string, v: number) => {
    onUpdate({ padding: { ...padding, [side]: v } });
  };

  const handlePaddingChangeAll = (v: number) => {
    onUpdate({ padding: { top: v, right: v, bottom: v, left: v } });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {!hideLayout && (
        <AccordionSection title="Layout">
          <Box sx={{ mb: 2 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#475569', mb: 0.5 }}>Display</Typography>
            <FormControl fullWidth size="small">
              <Select
                value={subStyles.display || 'block'}
                onChange={(e) => onUpdate({ display: e.target.value })}
                sx={{ fontSize: '11px', bgcolor: '#f8fafc' }}
                MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
              >
                {['block', 'inline-block', 'inline'].map((display) => (
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
        </AccordionSection>
      )}

      <AccordionSection title="Spacing">
        <SpacingControl
          label="Margin"
          value={margin}
          onChange={handleMarginChange}
          onChangeAll={handleMarginChangeAll}
          unit={subStyles.marginUnit || 'px'}
          onUnitChange={(u) => onUpdate({ marginUnit: u })}
        />
        <SpacingControl
          label="Padding"
          value={padding}
          onChange={handlePaddingChange}
          onChangeAll={handlePaddingChangeAll}
          unit={subStyles.paddingUnit || 'px'}
          onUnitChange={(u) => onUpdate({ paddingUnit: u })}
        />
      </AccordionSection>
    </Box>
  );
};
