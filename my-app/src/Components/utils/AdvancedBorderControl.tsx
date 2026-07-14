import React, { useState } from 'react';
import { Box, Typography, Select, MenuItem, FormControl, ButtonBase, Tabs, Tab, Slider, TextField, Popover } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';
import ColorPicker from './ColorPicker';
import { SpacingControl } from './SharedStyleTab';

interface BorderControlProps {
  // Normal
  borderType: string;
  borderWidth: any;
  borderColor: string;
  borderRadius: any;
  borderRadiusUnit?: string;
  onBorderRadiusUnitChange?: (u: string) => void;
  boxShadow: string;
  hideBoxShadow?: boolean;
  hideBorderRadius?: boolean;

  // Hover
  borderTypeHover?: string;
  borderWidthHover?: any;
  borderColorHover?: string;
  borderRadiusHover?: any;
  boxShadowHover?: string;

  // Transition
  transitionDuration?: number;

  onChange: (isHover: boolean, prop: string, value: any) => void;
  onTransitionChange?: (value: number) => void;
}

export const AdvancedBorderControl: React.FC<BorderControlProps> = ({
  borderType, borderWidth, borderColor, borderRadius, borderRadiusUnit, onBorderRadiusUnitChange, boxShadow,
  borderTypeHover, borderWidthHover, borderColorHover, borderRadiusHover, boxShadowHover,
  transitionDuration = 0.3, onChange, onTransitionChange, hideBoxShadow = false, hideBorderRadius = false
}) => {
  const [tab, setTab] = useState<'normal' | 'hover'>('normal');
  const isHover = tab === 'hover';

  const [shadowAnchor, setShadowAnchor] = useState<HTMLButtonElement | null>(null);

  // Current active values
  const currentType = isHover ? (borderTypeHover || borderType) : borderType;
  const currentWidth = isHover ? (borderWidthHover || borderWidth) : borderWidth;
  const currentColor = isHover ? (borderColorHover || borderColor) : borderColor;
  const currentRadius = isHover ? (borderRadiusHover || borderRadius) : borderRadius;
  const currentShadow = isHover ? (boxShadowHover || boxShadow) : boxShadow;

  // Shadow parse logic
  const parseShadow = (shadowStr: string) => {
    if (!shadowStr || shadowStr === 'none') return { h: 0, v: 0, blur: 10, spread: 0, color: '#00000033', position: ' ' };
    // Very rudimentary parser for Elementor style shadow: "0px 0px 10px 0px rgba(0,0,0,0.5)"
    const match = shadowStr.match(/(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px\s+(-?\d+)px\s+(rgb.*?|#\w+)(\s+inset)?/);
    if (match) {
      return {
        h: parseInt(match[1]), v: parseInt(match[2]), blur: parseInt(match[3]), spread: parseInt(match[4]),
        color: match[5], position: match[6] ? 'inset' : ' '
      };
    }
    return { h: 0, v: 0, blur: 10, spread: 0, color: '#00000033', position: ' ' };
  };

  const shadowData = parseShadow(currentShadow);

  const updateShadow = (h: number, v: number, blur: number, spread: number, color: string, position: string) => {
    const newShadow = `${h}px ${v}px ${blur}px ${spread}px ${color}${position === 'inset' ? ' inset' : ''}`;
    onChange(isHover, 'boxShadow', newShadow);
  };

  const handleResetShadow = () => {
    onChange(isHover, 'boxShadow', 'none');
  };

  return (
    <Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontSize: '12px', color: '#555' }}>Border Type</Typography>
        <FormControl size="small" sx={{ width: 120 }}>
          <Select
            value={currentType === 'none' ? 'default' : currentType}
            onChange={(e) => onChange(isHover, 'borderType', e.target.value === 'default' ? 'none' : e.target.value)}
            sx={{ fontSize: '11px', height: 28 }}
            MenuProps={{
              disablePortal: true,
              sx: { zIndex: 999999 },
              PaperProps: {
                sx: {
                  width: 120,
                  '& .MuiMenuItem-root': {
                    justifyContent: 'flex-start !important',
                    textAlign: 'left !important',
                    pl: '12px !important',
                    fontSize: '11px',
                  }
                }
              }
            }}
          >
            <MenuItem value="default">Default</MenuItem>
            <MenuItem value="none">None</MenuItem>
            <MenuItem value="solid">Solid</MenuItem>
            <MenuItem value="dashed">Dashed</MenuItem>
            <MenuItem value="dotted">Dotted</MenuItem>
            <MenuItem value="double">Double</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {currentType !== 'default' && currentType !== 'none' && (
        <>
          <Box mb={2}>
            <SpacingControl
              label="Border Width"
              value={currentWidth}
              unit="px"
              onChange={(side, val) => onChange(isHover, `border${side.charAt(0).toUpperCase() + side.slice(1)}Width`, val)}
              onChangeAll={(val) => onChange(isHover, 'borderWidthAll', val)}
            />
          </Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography sx={{ fontSize: '12px', color: '#555' }}>Border Color</Typography>
            <ColorPicker
              label=""
              value={currentColor}
              onChange={(color) => onChange(isHover, 'borderColor', color)}
            />
          </Box>
        </>
      )}

      {!hideBorderRadius && (
        <Box mb={2}>
          <SpacingControl
            label="Border Radius"
            value={currentRadius}
            unit={borderRadiusUnit || 'px'}
            onUnitChange={onBorderRadiusUnitChange}
            onChange={(side, val) => onChange(isHover, 'borderRadius', { ...currentRadius, [side]: val })}
            onChangeAll={(val) => onChange(isHover, 'borderRadius', { top: val, right: val, bottom: val, left: val })}
          />
        </Box>
      )}

      {!hideBoxShadow && (
        <>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={tab === 'hover' ? 2 : 0}>
            <Typography sx={{ fontSize: '12px', color: '#555' }}>Box Shadow</Typography>
            <Box display="flex" gap={1} alignItems="center">
              {currentShadow && currentShadow !== 'none' && (
                <ButtonBase onClick={handleResetShadow} sx={{ color: '#999', '&:hover': { color: '#d32f2f' } }}>
                  <ReplayIcon sx={{ fontSize: 14 }} />
                </ButtonBase>
              )}
              <ButtonBase
                onClick={(e) => setShadowAnchor(e.currentTarget)}
                sx={{
                  width: 28, height: 28, borderRadius: 1, border: '1px solid',
                  borderColor: shadowAnchor ? '#1976d2' : '#ddd',
                  bgcolor: shadowAnchor ? '#e3f2fd' : '#fff',
                  color: shadowAnchor ? '#1976d2' : '#666'
                }}
              >
                <EditIcon sx={{ fontSize: 14 }} />
              </ButtonBase>
            </Box>
          </Box>

          <Popover
            open={Boolean(shadowAnchor)}
            anchorEl={shadowAnchor}
            onClose={() => setShadowAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            disablePortal
            PaperProps={{ sx: { width: 240, p: 2, mt: 1, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' } }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography sx={{ fontSize: '12px', color: '#555' }}>Color</Typography>
              <ColorPicker
                label=""
                value={shadowData.color}
                onChange={(c) => updateShadow(shadowData.h, shadowData.v, shadowData.blur, shadowData.spread, c, shadowData.position)}
              />
            </Box>

            {['Horizontal', 'Vertical', 'Blur', 'Spread'].map((name, i) => {
              const keys: ('h' | 'v' | 'blur' | 'spread')[] = ['h', 'v', 'blur', 'spread'];
              const key = keys[i];
              const val = shadowData[key];
              return (
                <Box mb={2} key={key}>
                  <Typography sx={{ fontSize: '11px', color: '#555', mb: 0.5 }}>{name}</Typography>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Slider
                      size="small" min={-100} max={100} value={val}
                      onChange={(e, v) => updateShadow(key === 'h' ? v as number : shadowData.h, key === 'v' ? v as number : shadowData.v, key === 'blur' ? v as number : shadowData.blur, key === 'spread' ? v as number : shadowData.spread, shadowData.color, shadowData.position)}
                    />
                    <TextField
                      size="small" type="number" value={val}
                      sx={{ width: 50, '& .MuiInputBase-root': { height: 24, fontSize: '11px' } }}
                      onChange={(e) => updateShadow(key === 'h' ? Number(e.target.value) : shadowData.h, key === 'v' ? Number(e.target.value) : shadowData.v, key === 'blur' ? Number(e.target.value) : shadowData.blur, key === 'spread' ? Number(e.target.value) : shadowData.spread, shadowData.color, shadowData.position)}
                    />
                  </Box>
                </Box>
              );
            })}

            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ fontSize: '12px', color: '#555' }}>Position</Typography>
              <FormControl size="small" sx={{ width: 100 }}>
                <Select
                  value={shadowData.position}
                  onChange={(e) => updateShadow(shadowData.h, shadowData.v, shadowData.blur, shadowData.spread, shadowData.color, e.target.value)}
                  sx={{ fontSize: '11px', height: 28 }}
                >
                  <MenuItem value=" " sx={{ fontSize: '11px' }}>Outline</MenuItem>
                  <MenuItem value="inset" sx={{ fontSize: '11px' }}>Inset</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Popover>
        </>
      )}

      {tab === 'hover' && onTransitionChange && (
        <Box mt={2} pt={2} borderTop="1px solid #eee">
          <Typography sx={{ fontSize: '12px', color: '#555', mb: 0.5 }}>Transition Duration (s)</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            <Slider
              size="small" min={0} max={3} step={0.1} value={transitionDuration}
              onChange={(e, val) => onTransitionChange(val as number)}
            />
            <TextField
              size="small" type="number" inputProps={{ step: 0.1 }}
              value={transitionDuration} onChange={(e) => onTransitionChange(Number(e.target.value))}
              sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px' } }}
            />
          </Box>
        </Box>
      )}
    </Box>
  );
};
