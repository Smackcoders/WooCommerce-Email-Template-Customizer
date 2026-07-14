import React from 'react';
import { Box, Typography } from '@mui/material';
import ColorPicker from './ColorPicker';

interface BackgroundControlProps {
  backgroundColor: string;
  backgroundImage?: string;
  backgroundColorHover?: string;
  backgroundImageHover?: string;
  onChange: (isHover: boolean, prop: 'color' | 'image' | 'gradient', value: string) => void;
}

export const BackgroundControl: React.FC<BackgroundControlProps> = ({
  backgroundColor,
  onChange
}) => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center">
      <Typography sx={{ fontSize: '13px', color: '#555' }}>Color</Typography>
      <ColorPicker
        label=""
        value={backgroundColor || ''}
        onChange={c => onChange(false, 'color', c)}
        size="small"
      />
    </Box>
  );
};


