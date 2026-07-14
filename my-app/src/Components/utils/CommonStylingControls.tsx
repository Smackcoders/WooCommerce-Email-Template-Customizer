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
    InputLabel,
} from '@mui/material';
import {
    FormatAlignLeft,
    FormatAlignCenter,
    FormatAlignRight,
    FormatAlignJustify,
} from '@mui/icons-material';
import { FONT_FAMILIES } from '../../Constants/StyleConstants';
import { SpacingControl } from './SharedStyleTab';

interface CommonStylingControlsProps {
    options: any;
    onUpdate: (updatedOptions: any) => void;
    title?: string;
    showTextColor?: boolean;
    showTextAlign?: boolean;
    showTypography?: boolean;
    textAlignLabel?: string;
    showLabelAlign?: boolean;
    showValueAlign?: boolean;
    showPadding?: boolean;
    showMargin?: boolean;
    showFontWeight?: boolean;
    showLineHeight?: boolean;
    showLetterSpacing?: boolean;
    showTextTransform?: boolean;
    showDisplay?: boolean;
}

const CommonStylingControls: React.FC<CommonStylingControlsProps> = ({
    options,
    onUpdate,
    title = 'Styling',
    showTextColor = true,
    showTextAlign = true,
    showTypography = true,
    textAlignLabel = 'Text Alignment',
    showLabelAlign = false,
    showValueAlign = false,
    showPadding = true,
    showMargin = false,
    showFontWeight = true,
    showLineHeight = true,
    showLetterSpacing = true,
    showTextTransform = true,
    showDisplay = true,
}) => {
    const handleChange = (field: string, value: any) => {
        onUpdate({ [field]: value });
    };

    const handleLetterSpacingChange = (value: string) => {
        const nextValue = value === '' ? '' : Number(value);
        onUpdate({ letterSpacing: nextValue, letterSpace: nextValue });
    };

    const getSpacingObj = (spacingStrOrObj: any) => {
        if (spacingStrOrObj && typeof spacingStrOrObj === 'object') {
            return {
                top: parseInt(spacingStrOrObj.top || 0),
                right: parseInt(spacingStrOrObj.right || 0),
                bottom: parseInt(spacingStrOrObj.bottom || 0),
                left: parseInt(spacingStrOrObj.left || 0)
            };
        } else {
            const values = (spacingStrOrObj || '0px 0px 0px 0px').replace(/px/g, '').split(' ');
            const t = parseInt(values[0] || '0');
            const r = parseInt(values[1] || `${t}`);
            const b = parseInt(values[2] || `${t}`);
            const l = parseInt(values[3] || `${r}`);
            return { top: t, right: r, bottom: b, left: l };
        }
    };

    const handlePaddingChange = (side: string, v: number) => {
        const current = getSpacingObj(options.padding);
        const newObj = { ...current, [side]: v };
        if (options.padding && typeof options.padding === 'object') {
            handleChange('padding', newObj);
        } else {
            handleChange('padding', `${newObj.top}px ${newObj.right}px ${newObj.bottom}px ${newObj.left}px`);
        }
    };

    const handlePaddingChangeAll = (v: number) => {
        if (options.padding && typeof options.padding === 'object') {
            handleChange('padding', { top: v, right: v, bottom: v, left: v });
        } else {
            handleChange('padding', `${v}px ${v}px ${v}px ${v}px`);
        }
    };

    const handleMarginChange = (side: string, v: number) => {
        const current = getSpacingObj(options.margin);
        const newObj = { ...current, [side]: v };
        if (options.margin && typeof options.margin === 'object') {
            handleChange('margin', newObj);
        } else {
            handleChange('margin', `${newObj.top}px ${newObj.right}px ${newObj.bottom}px ${newObj.left}px`);
        }
    };

    const handleMarginChangeAll = (v: number) => {
        if (options.margin && typeof options.margin === 'object') {
            handleChange('margin', { top: v, right: v, bottom: v, left: v });
        } else {
            handleChange('margin', `${v}px ${v}px ${v}px ${v}px`);
        }
    };

    return (
        <Box sx={{ mt: 2, mb: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
            <Typography sx={{ mb: 2, fontSize: '13px', fontWeight: 'bold', color: '#555555' }}>
                {title}
            </Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 1.5 }}>
                {/* Font Family */}
                {showTypography && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Font Family
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <Select
                                value={options.fontFamily === 'inherit' || !options.fontFamily ? 'inherit' : (FONT_FAMILIES.includes(options.fontFamily.split(',')[0].replace(/'/g, '').trim()) ? options.fontFamily.split(',')[0].replace(/'/g, '').trim() : 'inherit')}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                sx={{ fontSize: '11px' }}
                                MenuProps={{
                                    disablePortal: false,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: { zIndex: 1300001 },
                                    style: { zIndex: 1300001 },
                                    PaperProps: {
                                        sx: {
                                            maxHeight: 300,
                                        }
                                    }
                                }}
                            >
                                {FONT_FAMILIES.map((font) => (
                                    <MenuItem key={font} value={font === 'Global' ? 'inherit' : font} sx={{ fontSize: '11px' }}>
                                        {font}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {/* Font Size */}
                {showTypography && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Font Size
                        </Typography>
                        <TextField
                            type="number"
                            value={parseInt(options.fontSize) || 14}
                            onChange={(e) => handleChange('fontSize', `${e.target.value}px`)}
                            size="small"
                            fullWidth
                            placeholder="14"
                            InputProps={{
                                sx: { fontSize: '11px' },
                                inputProps: { min: 1 }
                            }}
                        />
                    </Box>
                )}

                {/* Font Weight */}
                {showTypography && showFontWeight && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Font Weight
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <Select
                                value={options.fontWeight || '400'}
                                onChange={(e) => handleChange('fontWeight', e.target.value)}
                                style={{ fontSize: '11px' }}
                                MenuProps={{
                                    disablePortal: false,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: { zIndex: 1300001 },
                                    style: { zIndex: 1300001 }
                                }}
                            >
                                {['100', '200', '300', '400', '500', '600', '700', '800', '900'].map((weight) => (
                                    <MenuItem key={weight} value={weight} style={{ fontSize: '11px' }}>
                                        {weight}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {/* Line Height */}
                {showTypography && showLineHeight && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Line height
                        </Typography>
                        <TextField
                            type="number"
                            value={options.lineHeight || ''}
                            onChange={(e) => handleChange('lineHeight', parseFloat(e.target.value))}
                            size="small"
                            fullWidth
                            placeholder="1.5"
                            InputProps={{ sx: { fontSize: '11px' } }}
                            inputProps={{ step: 0.1, min: 0 }}
                        />
                    </Box>
                )}

                {/* Letter Spacing */}
                {showTypography && showLetterSpacing && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Letter Spacing
                        </Typography>
                        <TextField
                            type="number"
                            value={options.letterSpacing !== undefined ? options.letterSpacing : (options.letterSpace ?? '')}
                            onChange={(e) => handleLetterSpacingChange(e.target.value)}
                            size="small"
                            fullWidth
                            placeholder="0"
                            InputProps={{ sx: { fontSize: '11px' } }}
                            inputProps={{ step: 0.1 }}
                        />
                    </Box>
                )}

                {/* Text Transform */}
                {showTypography && showTextTransform && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Text Transform
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <Select
                                value={options.textTransform || 'none'}
                                onChange={(e) => handleChange('textTransform', e.target.value)}
                                sx={{ fontSize: '11px' }}
                                MenuProps={{
                                    disablePortal: false,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: { zIndex: 1300001 },
                                    style: { zIndex: 1300001 }
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
                )}

                {/* Text Color */}
                {showTextColor && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Text Color
                        </Typography>
                        <input
                            type="color"
                            value={(options.textColor && options.textColor !== 'transparent') ? options.textColor : '#333333'}
                            onChange={(e) => handleChange('textColor', e.target.value)}
                            style={{ width: '100%', height: '32px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', padding: '0 2px' }}
                        />
                    </Box>
                )}

                {/* Background Color */}
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                        Background Color
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        <input
                            type="color"
                            value={options.backgroundColor === 'transparent' ? '#ffffff' : (options.backgroundColor || '#ffffff')}
                            onChange={(e) => handleChange('backgroundColor', e.target.value)}
                            style={{ width: '32px', height: '32px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer', padding: '0 2px' }}
                        />
                        <ToggleButton
                            value="transparent"
                            selected={options.backgroundColor === 'transparent'}
                            onChange={() => handleChange('backgroundColor', options.backgroundColor === 'transparent' ? '#ffffff' : 'transparent')}
                            size="small"
                            sx={{ height: '32px', flexGrow: 1, p: '2px', minWidth: '45px' }}
                        >
                            <Typography variant="caption" sx={{ fontSize: '9px', fontWeight: 'bold' }}>NONE</Typography>
                        </ToggleButton>
                    </Box>
                </Box>

                {/* Display */}
                {showDisplay && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            Display
                        </Typography>
                        <FormControl size="small" fullWidth>
                            <Select
                                value={options.display || 'block'}
                                onChange={(e) => handleChange('display', e.target.value)}
                                sx={{ fontSize: '11px' }}
                                MenuProps={{
                                    disablePortal: false,
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: { zIndex: 1300001 },
                                    style: { zIndex: 1300001 }
                                }}
                            >
                                {['block', 'inline-block', 'inline'].map((display) => (
                                    <MenuItem key={display} value={display} sx={{ fontSize: '11px' }}>
                                        {display}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>
                )}
            </Box>

            {/* Alignment and Padding */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {showTextAlign && (
                    <Box>
                        <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                            {textAlignLabel}
                        </Typography>
                        <ToggleButtonGroup
                            value={options.textAlign || 'left'}
                            exclusive
                            onChange={(_, value) => value && handleChange('textAlign', value)}
                            size="small"
                            fullWidth
                        >
                            <ToggleButton value="left">
                                <FormatAlignLeft fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="center">
                                <FormatAlignCenter fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="right">
                                <FormatAlignRight fontSize="small" />
                            </ToggleButton>
                            <ToggleButton value="justify">
                                <FormatAlignJustify fontSize="small" />
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {(showLabelAlign || showValueAlign) && (
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                        {showLabelAlign && (
                            <Box>
                                <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                                    Label Align
                                </Typography>
                                <ToggleButtonGroup
                                    value={options.labelAlign || 'left'}
                                    exclusive
                                    onChange={(_, value) => value && handleChange('labelAlign', value)}
                                    size="small"
                                    fullWidth
                                >
                                    <ToggleButton value="left" sx={{ p: 0.5 }}>
                                        <FormatAlignLeft fontSize="small" />
                                    </ToggleButton>
                                    <ToggleButton value="center" sx={{ p: 0.5 }}>
                                        <FormatAlignCenter fontSize="small" />
                                    </ToggleButton>
                                    <ToggleButton value="right" sx={{ p: 0.5 }}>
                                        <FormatAlignRight fontSize="small" />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        )}
                        {showValueAlign && (
                            <Box>
                                <Typography sx={{ display: 'block', mb: 0.5, color: '#555', fontSize: '13px', fontWeight: 600 }}>
                                    Value Align
                                </Typography>
                                <ToggleButtonGroup
                                    value={options.valueAlign || 'right'}
                                    exclusive
                                    onChange={(_, value) => value && handleChange('valueAlign', value)}
                                    size="small"
                                    fullWidth
                                >
                                    <ToggleButton value="left" sx={{ p: 0.5 }}>
                                        <FormatAlignLeft fontSize="small" />
                                    </ToggleButton>
                                    <ToggleButton value="center" sx={{ p: 0.5 }}>
                                        <FormatAlignCenter fontSize="small" />
                                    </ToggleButton>
                                    <ToggleButton value="right" sx={{ p: 0.5 }}>
                                        <FormatAlignRight fontSize="small" />
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Box>
                        )}
                    </Box>
                )}

                {showPadding && (
                    <SpacingControl
                        label="Padding"
                        value={getSpacingObj(options.padding)}
                        onChange={handlePaddingChange}
                        onChangeAll={handlePaddingChangeAll}
                    />
                )}

                {showMargin && (
                    <SpacingControl
                        label="Margin"
                        value={getSpacingObj(options.margin)}
                        onChange={handleMarginChange}
                        onChangeAll={handleMarginChangeAll}
                    />
                )}
            </Box>
        </Box>
    );
};

export default CommonStylingControls;
