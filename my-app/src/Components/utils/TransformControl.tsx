import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Slider, TextField, ButtonBase, Tabs, Tab } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ReplayIcon from '@mui/icons-material/Replay';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapVertIcon from '@mui/icons-material/SwapVert';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';

interface TransformControlProps {
  transformStr: string;
  transformHoverStr: string;
  onChange: (isHover: boolean, newStr: string) => void;
}

export const TransformControl: React.FC<TransformControlProps> = ({ transformStr, transformHoverStr, onChange }) => {
  const [tab, setTab] = useState<'normal' | 'hover'>('normal');

  const currentStr = tab === 'normal' ? transformStr : transformHoverStr;

  // Parsed state
  const [rotate, setRotate] = useState<number | ''>('');
  const [offsetX, setOffsetX] = useState<number | ''>('');
  const [offsetY, setOffsetY] = useState<number | ''>('');
  const [scale, setScale] = useState<number | ''>('');
  const [skewX, setSkewX] = useState<number | ''>('');
  const [skewY, setSkewY] = useState<number | ''>('');
  const [flipX, setFlipX] = useState<boolean>(false);
  const [flipY, setFlipY] = useState<boolean>(false);

  // Active edit section
  const [activeEdit, setActiveEdit] = useState<'rotate' | 'offset' | 'scale' | 'skew' | null>(null);
  
  // Link states
  const [linkOffset, setLinkOffset] = useState(false);
  const [linkSkew, setLinkSkew] = useState(false);

  // Parse string on mount/change
  useEffect(() => {
    let r: number | '' = '';
    let ox: number | '' = '';
    let oy: number | '' = '';
    let sc: number | '' = '';
    let skx: number | '' = '';
    let sky: number | '' = '';
    let fx = false;
    let fy = false;

    const regex = /(\w+)\(([^)]+)\)/g;
    let match;
    while ((match = regex.exec(currentStr || '')) !== null) {
      const prop = match[1];
      const val = match[2];
      if (prop === 'rotate') r = parseFloat(val);
      else if (prop === 'translate') {
        const parts = val.split(',').map(v => parseFloat(v));
        ox = parts[0] || '';
        oy = parts[1] || '';
      }
      else if (prop === 'scale') sc = parseFloat(val);
      else if (prop === 'skew') {
        const parts = val.split(',').map(v => parseFloat(v));
        skx = parts[0] || '';
        sky = parts[1] || '';
      }
      else if (prop === 'scaleX' && parseFloat(val) < 0) fx = true;
      else if (prop === 'scaleY' && parseFloat(val) < 0) fy = true;
    }

    setRotate(r);
    setOffsetX(ox);
    setOffsetY(oy);
    setScale(sc);
    setSkewX(skx);
    setSkewY(sky);
    setFlipX(fx);
    setFlipY(fy);
  }, [currentStr, tab]);

  const updateTransform = (
    r: number | '', ox: number | '', oy: number | '', sc: number | '', skx: number | '', sky: number | '', fx: boolean, fy: boolean
  ) => {
    let newStr = '';
    if (r !== '') newStr += `rotate(${r}deg) `;
    if (ox !== '' || oy !== '') newStr += `translate(${ox || 0}px, ${oy || 0}px) `;
    if (sc !== '') newStr += `scale(${sc}) `;
    if (skx !== '' || sky !== '') newStr += `skew(${skx || 0}deg, ${sky || 0}deg) `;
    if (fx) newStr += `scaleX(-1) `;
    if (fy) newStr += `scaleY(-1) `;
    
    onChange(tab === 'hover', newStr.trim());
  };

  const handleRotate = (val: number | '') => { setRotate(val); updateTransform(val, offsetX, offsetY, scale, skewX, skewY, flipX, flipY); };
  const handleOffset = (x: number | '', y: number | '') => { setOffsetX(x); setOffsetY(y); updateTransform(rotate, x, y, scale, skewX, skewY, flipX, flipY); };
  const handleScale = (val: number | '') => { setScale(val); updateTransform(rotate, offsetX, offsetY, val, skewX, skewY, flipX, flipY); };
  const handleSkew = (x: number | '', y: number | '') => { setSkewX(x); setSkewY(y); updateTransform(rotate, offsetX, offsetY, scale, x, y, flipX, flipY); };
  const handleFlipX = () => { const newFx = !flipX; setFlipX(newFx); updateTransform(rotate, offsetX, offsetY, scale, skewX, skewY, newFx, flipY); };
  const handleFlipY = () => { const newFy = !flipY; setFlipY(newFy); updateTransform(rotate, offsetX, offsetY, scale, skewX, skewY, flipX, newFy); };

  const renderSection = (
    name: string,
    id: 'rotate' | 'offset' | 'scale' | 'skew',
    hasValue: boolean,
    onReset: () => void,
    content: React.ReactNode
  ) => {
    const isActive = activeEdit === id;
    return (
      <Box mb={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography sx={{ fontSize: '13px', color: '#555' }}>{name}</Typography>
          <Box display="flex" alignItems="center" gap={1}>
            {hasValue && (
              <IconButton size="small" onClick={onReset} sx={{ p: 0.5, color: '#999', '&:hover': { color: '#d32f2f' } }}>
                <ReplayIcon sx={{ fontSize: 16 }} />
              </IconButton>
            )}
            <ButtonBase
              onClick={() => setActiveEdit(isActive ? null : id)}
              sx={{
                width: 24, height: 24, borderRadius: 1, border: '1px solid',
                borderColor: isActive ? '#1976d2' : '#ddd',
                bgcolor: isActive ? '#e3f2fd' : '#fff',
                color: isActive ? '#1976d2' : '#666'
              }}
            >
              <EditIcon sx={{ fontSize: 14 }} />
            </ButtonBase>
          </Box>
        </Box>
        {isActive && (
          <Box mt={1.5} p={1.5} bgcolor="#fafafa" borderRadius={1} border="1px solid #eee">
            {content}
          </Box>
        )}
      </Box>
    );
  };

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(e, v) => setTab(v)}
        sx={{
          minHeight: '30px', mb: 2,
          '& .MuiTab-root': { minHeight: '30px', p: '4px 8px', fontSize: '12px', minWidth: '50%', borderBottom: '1px solid #ddd' },
          '& .Mui-selected': { bgcolor: '#eee', color: '#333 !important', borderBottom: 'none', borderTop: '1px solid #ddd', borderLeft: '1px solid #ddd', borderRight: '1px solid #ddd' }
        }}
      >
        <Tab label="Normal" value="normal" />
        <Tab label="Hover" value="hover" />
      </Tabs>

      {renderSection('Rotate', 'rotate', rotate !== '', () => handleRotate(''), (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Slider
            size="small" min={-180} max={180} value={rotate || 0}
            onChange={(e, val) => handleRotate(val as number)}
          />
          <TextField
            size="small" type="number"
            value={rotate} onChange={(e) => handleRotate(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
          />
        </Box>
      ))}

      {renderSection('Offset', 'offset', offsetX !== '' || offsetY !== '', () => handleOffset('', ''), (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: '11px', color: '#888' }}>X</Typography>
            <Typography sx={{ fontSize: '11px', color: '#888' }}>Y</Typography>
            <IconButton
              size="small"
              onClick={() => setLinkOffset(!linkOffset)}
              sx={{ p: 0.5, bgcolor: linkOffset ? '#e0e0e0' : 'transparent' }}
            >
              {linkOffset ? <LinkIcon sx={{ fontSize: 14 }} /> : <LinkOffIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Slider
              size="small" min={-100} max={100} value={offsetX || 0}
              onChange={(e, val) => {
                handleOffset(val as number, linkOffset ? val as number : offsetY);
              }}
            />
            <TextField
              size="small" type="number"
              value={offsetX} onChange={(e) => handleOffset(e.target.value === '' ? '' : Number(e.target.value), linkOffset ? (e.target.value === '' ? '' : Number(e.target.value)) : offsetY)}
              sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Slider
              size="small" min={-100} max={100} value={offsetY || 0}
              onChange={(e, val) => {
                handleOffset(linkOffset ? val as number : offsetX, val as number);
              }}
            />
            <TextField
              size="small" type="number"
              value={offsetY} onChange={(e) => handleOffset(linkOffset ? (e.target.value === '' ? '' : Number(e.target.value)) : offsetX, e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
            />
          </Box>
        </Box>
      ))}

      {renderSection('Scale', 'scale', scale !== '', () => handleScale(''), (
        <Box display="flex" alignItems="center" gap={1.5}>
          <Slider
            size="small" min={0} max={3} step={0.1} value={scale || 1}
            onChange={(e, val) => handleScale(val as number)}
          />
          <TextField
            size="small" type="number" inputProps={{ step: 0.1 }}
            value={scale} onChange={(e) => handleScale(e.target.value === '' ? '' : Number(e.target.value))}
            sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
          />
        </Box>
      ))}

      {renderSection('Skew', 'skew', skewX !== '' || skewY !== '', () => handleSkew('', ''), (
        <Box>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography sx={{ fontSize: '11px', color: '#888' }}>X</Typography>
            <Typography sx={{ fontSize: '11px', color: '#888' }}>Y</Typography>
            <IconButton
              size="small"
              onClick={() => setLinkSkew(!linkSkew)}
              sx={{ p: 0.5, bgcolor: linkSkew ? '#e0e0e0' : 'transparent' }}
            >
              {linkSkew ? <LinkIcon sx={{ fontSize: 14 }} /> : <LinkOffIcon sx={{ fontSize: 14 }} />}
            </IconButton>
          </Box>
          <Box display="flex" alignItems="center" gap={1.5} mb={2}>
            <Slider
              size="small" min={-90} max={90} value={skewX || 0}
              onChange={(e, val) => {
                handleSkew(val as number, linkSkew ? val as number : skewY);
              }}
            />
            <TextField
              size="small" type="number"
              value={skewX} onChange={(e) => handleSkew(e.target.value === '' ? '' : Number(e.target.value), linkSkew ? (e.target.value === '' ? '' : Number(e.target.value)) : skewY)}
              sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
            />
          </Box>
          <Box display="flex" alignItems="center" gap={1.5}>
            <Slider
              size="small" min={-90} max={90} value={skewY || 0}
              onChange={(e, val) => {
                handleSkew(linkSkew ? val as number : skewX, val as number);
              }}
            />
            <TextField
              size="small" type="number"
              value={skewY} onChange={(e) => handleSkew(linkSkew ? (e.target.value === '' ? '' : Number(e.target.value)) : skewX, e.target.value === '' ? '' : Number(e.target.value))}
              sx={{ width: '60px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
            />
          </Box>
        </Box>
      ))}

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontSize: '13px', color: '#555' }}>Flip Horizontal</Typography>
        <ButtonBase
          onClick={handleFlipX}
          sx={{
            width: 24, height: 24, borderRadius: 1, border: '1px solid',
            borderColor: flipX ? '#1976d2' : '#ddd',
            bgcolor: flipX ? '#e3f2fd' : '#fff',
            color: flipX ? '#1976d2' : '#666'
          }}
        >
          <SwapHorizIcon sx={{ fontSize: 16 }} />
        </ButtonBase>
      </Box>

      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography sx={{ fontSize: '13px', color: '#555' }}>Flip Vertical</Typography>
        <ButtonBase
          onClick={handleFlipY}
          sx={{
            width: 24, height: 24, borderRadius: 1, border: '1px solid',
            borderColor: flipY ? '#1976d2' : '#ddd',
            bgcolor: flipY ? '#e3f2fd' : '#fff',
            color: flipY ? '#1976d2' : '#666'
          }}
        >
          <SwapVertIcon sx={{ fontSize: 16 }} />
        </ButtonBase>
      </Box>
    </Box>
  );
};
