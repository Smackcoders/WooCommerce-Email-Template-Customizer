import React, { useState } from 'react';
import { Box, Typography, Popover } from '@mui/material';
import { ChromePicker } from 'react-color';

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (color: string) => void;
    size?: 'small' | 'medium';
}

const ColorPicker: React.FC<ColorPickerProps> = ({ label, value, onChange, size }) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [localColor, setLocalColor] = useState<string>(value);

    React.useEffect(() => {
        setLocalColor(value);
    }, [value]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const open = Boolean(anchorEl);

    return (
        <Box>
            {label && (
                <Typography sx={{ fontSize: '13px', fontWeight: 600, display: 'block', mb: 0.8, color: '#555' }}>
                    {label}
                </Typography>
            )}
            <Box position="relative">
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: size === 'small' ? 'none' : '1px solid #ccc',
                        borderRadius: size === 'small' ? 0 : 1,
                        p: size === 'small' ? '2px 4px' : '4px 8px',
                        height: size === 'small' ? '24px' : '40px',
                        cursor: 'pointer'
                    }}
                    onClick={handleClick}
                >
                    <Box
                        sx={{
                            width: size === 'small' ? 18 : 24,
                            height: size === 'small' ? 18 : 24,
                            backgroundColor: localColor === 'transparent' ? 'transparent' : localColor,
                            borderRadius: 0.5,
                            border: "1px solid #ccc"
                        }}
                    />
                    <Typography sx={{ ml: 1, color: '#666', fontSize: '11px' }}>
                        {localColor}
                    </Typography>
                </Box>
                <Popover
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleClose}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    disablePortal={true}
                    sx={{ zIndex: 9999999 }}
                >
                    <ChromePicker
                        color={localColor === 'transparent' ? '#ffffff' : (localColor || '#ffffff')}
                        onChange={(newColor) => {
                            let nextColor = newColor.hex;
                            const { r, g, b, a } = newColor.rgb;
                            if (a !== undefined && a < 1) {
                                nextColor = `rgba(${r}, ${g}, ${b}, ${a})`;
                            }
                            setLocalColor(nextColor);
                            onChange(nextColor);
                        }}
                    />
                </Popover>
            </Box>
        </Box>
    );
};

export default ColorPicker;
