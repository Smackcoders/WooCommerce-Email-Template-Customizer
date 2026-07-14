import React from 'react';
import { TextField, MenuItem, Box, Typography } from '@mui/material';

export const ICONS = [
    { label: 'Star (Filled)', value: '★' },
    { label: 'Star (Outline)', value: '☆' },
    { label: 'Check Mark', value: '✔' },
    { label: 'Cross Mark', value: '✖' },
    { label: 'Warning', value: '⚠️' },
    { label: 'Info', value: 'ℹ️' },
    { label: 'Heart', value: '❤️' },
    { label: 'Thumbs Up', value: '👍' },
    { label: 'Envelope', value: '✉' },
    { label: 'Phone', value: '📞' },
    { label: 'Mobile', value: '📱' },
    { label: 'Location Pin', value: '📍' },
    { label: 'Globe', value: '🌐' },
    { label: 'Link', value: '🔗' },
    { label: 'Shopping Cart', value: '🛒' },
    { label: 'Package', value: '📦' },
    { label: 'Arrow Right', value: '→' },
    { label: 'Arrow Left', value: '←' },
    { label: 'Airplane', value: '✈️' },
    { label: 'Facebook', value: '📘' },
    { label: 'Instagram', value: '📷' },
];

interface IconInsertSelectProps {
    onSelect: (icon: string) => void;
    label?: string;
    size?: 'small' | 'medium';
}

export const IconInsertSelect: React.FC<IconInsertSelectProps> = ({
    onSelect,
    label = "Icons",
    size = "small"
}) => {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        if (value) {
            onSelect(value);
        }
    };

    return (
        <TextField
            select
            fullWidth
            size={size}
            label={label}
            value=""
            onChange={handleChange}
            InputLabelProps={{
                shrink: true,
                sx: { fontSize: '13px', fontWeight: 600, color: '#555' }
            }}
            sx={{
                "& .MuiOutlinedInput-root": {
                    fontSize: '11px',
                    bgcolor: '#f9f9f9',
                    "& fieldset": { borderColor: "#e7e9eb" },
                    "&:hover fieldset": { borderColor: "#d5dadf" },
                    "&.Mui-focused fieldset": { borderColor: "#000000" },
                },
                "& .MuiInputBase-input": { padding: "8px 12px" },
            }}
            SelectProps={{
                displayEmpty: true,
                renderValue: (value: any) => {
                    if (value === "") {
                        return <span style={{ color: "rgba(0, 0, 0, 0.6)", fontSize: '11px' }}>...</span>;
                    }
                    return <span style={{ fontSize: '11px' }}>{value}</span>;
                },
                MenuProps: {
                    disablePortal: true,
                    sx: { zIndex: 1300001 },
                    style: { zIndex: 1300001 },
                    PaperProps: {
                        style: {
                            maxHeight: 300
                        }
                    }
                }
            }}
        >
            <MenuItem value="" disabled sx={{ fontSize: '11px' }}>
                ...
            </MenuItem>
            {ICONS.map((icon) => (
                <MenuItem key={icon.label} value={icon.value} sx={{ fontSize: '11px' }}>
                    <Box display="flex" justifyContent="center" width="100%">
                        <Typography variant="body1" sx={{ fontSize: '1.2rem' }}>
                            {icon.value}
                        </Typography>
                    </Box>
                </MenuItem>
            ))}
        </TextField>
    );
};
