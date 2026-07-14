import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  Switch,
  FormControlLabel,
  Stack,
  IconButton,
  FormControl,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tooltip,
  Divider,
  Menu,
  ButtonBase
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../Store/store";
import {
  closeEditor,
  deleteColumnContent,
  updateImageEditorOptions,
} from "../../../../../Store/Slice/workspaceSlice";
import DeleteIcon from "@mui/icons-material/Delete";
import CropOriginalIcon from "@mui/icons-material/CropOriginal";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";
import { PlaceholderSelect } from "../../../../utils/PlaceholderSelect";
import { AdvancedBorderControl } from "../../../../utils/AdvancedBorderControl";

interface ImageWidgetEditorProps {
  blockId: string;
  columnIndex: number;
}

interface PaddingOptions {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

const ImageWidgetEditor: React.FC<ImageWidgetEditorProps> = ({
  blockId,
  columnIndex,
}) => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, imageEditorOptions: imageOptions } = useSelector(
    (state: RootState) => state.workspace
  );
  const [previewUrl, setPreviewUrl] = useState<string | null>(imageOptions.src);

  const handleBrowseImage = () => {
    // Check if wp.media is available
    const wp = (window as any).wp;
    if (wp && wp.media) {
      const mediaFrame = wp.media({
        title: 'Select Image',
        button: {
          text: 'Insert into Email',
        },
        multiple: false,
      });

      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        const imageUrl = attachment.url;
        dispatch(updateImageEditorOptions({ src: imageUrl }));
        setPreviewUrl(imageUrl);
      });

      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available. Please ensure you are in the WordPress admin area.');
    }
  };

  const handleRemoveImage = () => {
    const placeholder = "https://cdn.tools.unlayer.com/image/placeholder.png";
    setPreviewUrl(placeholder);
    dispatch(updateImageEditorOptions({ src: placeholder }));
  };

  const handleAlignChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlign: "left" | "center" | "right"
  ) => {
    if (newAlign !== null) {
      dispatch(updateImageEditorOptions({ align: newAlign }));
    }
  };

  const parseValueAndUnit = (val: string) => {
    if (!val || val === 'auto') return { value: '', unit: 'px' };
    const match = val.match(/^(\d+(?:\.\d+)?)(px|%|em|rem)?$/);
    if (match) {
      return { value: match[1], unit: match[2] || 'px' };
    }
    return { value: val, unit: 'px' };
  };

  const { value: widthVal, unit: widthUnit } = parseValueAndUnit(imageOptions.width);
  const { value: heightVal, unit: heightUnit } = parseValueAndUnit(imageOptions.height);

  const handleWidthToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAuto = e.target.checked;
    dispatch(updateImageEditorOptions({
      autoWidth: newAuto,
      width: newAuto ? "100%" : `${widthVal || '300'}${widthUnit}`,
    }));
  };

  const handleWidthUnitChange = (newUnit: string) => {
    dispatch(updateImageEditorOptions({
      width: `${widthVal || '300'}${newUnit}`,
      autoWidth: false,
    }));
  };

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateImageEditorOptions({
      width: `${e.target.value}${widthUnit}`,
      autoWidth: false,
    }));
  };

  const handleHeightToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAuto = e.target.checked;
    dispatch(updateImageEditorOptions({
      autoHeight: newAuto,
      height: newAuto ? "auto" : `${heightVal || '300'}${heightUnit}`,
    }));
  };

  const handleHeightUnitChange = (newUnit: string) => {
    dispatch(updateImageEditorOptions({
      height: `${heightVal || '300'}${newUnit}`,
      autoHeight: false,
    }));
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(updateImageEditorOptions({
      height: `${e.target.value}${heightUnit}`,
      autoHeight: false,
    }));
  };

  const handleCloseEditor = () => {
    dispatch(closeEditor());
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setPreviewUrl(newUrl);
    dispatch(updateImageEditorOptions({ src: newUrl }));
  };

  const handleAltTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newAltText = e.target.value;
    dispatch(updateImageEditorOptions({ altText: newAltText }));
  };

  const handlePaddingChange = (side: keyof PaddingOptions, value: number) => {
    dispatch(updateImageEditorOptions({
      padding: { ...imageOptions.padding, [side]: Math.max(0, value) },
    }));
  };

  const handleDeleteContent = () => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      dispatch(
        deleteColumnContent({
          blockId: selectedBlockForEditor,
          columnIndex: selectedColumnIndex,
          widgetIndex: selectedWidgetIndex,
        })
      );
    }
  };

  const currentWidthValue = parseInt(imageOptions.width) || 300;

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 0, bgcolor: '#fff' }}>
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, border: 'none', bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon sx={{ fontSize: '20px' }} />} sx={{ minHeight: 48, p: '0 16px', '& .MuiAccordionSummary-content': { m: 0 } }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>Image</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Choose Image Title & Dynamic Selector Row */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Choose Image</Typography>
                  <Box display="flex" gap={0.5} alignItems="center">
                    {previewUrl && previewUrl !== "https://cdn.tools.unlayer.com/image/placeholder.png" && (
                      <Tooltip title="Remove Image">
                        <IconButton onClick={handleRemoveImage} size="small" sx={{ border: '1px solid #ddd', borderRadius: '4px', p: '4px', bgcolor: '#fff' }}>
                          <DeleteIcon fontSize="small" sx={{ color: '#ff4d4d', fontSize: '15px' }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>
                      <PlaceholderSelect
                        onSelect={(placeholder) => {
                          dispatch(updateImageEditorOptions({ src: placeholder }));
                          setPreviewUrl(placeholder);
                        }}
                        iconOnly={true}
                      />
                    </Box>
                  </Box>
                </Box>

                {/* Choose Image Box */}
                <Box
                  onClick={handleBrowseImage}
                  sx={{
                    width: '100%',
                    height: '140px',
                    bgcolor: '#eaebed',
                    border: '1px solid #d5dadf',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'border-color 0.2s',
                    '&:hover': {
                      borderColor: '#93003c',
                      '& .choose-image-overlay': { opacity: 1 }
                    }
                  }}
                >
                  {previewUrl && previewUrl !== "https://cdn.tools.unlayer.com/image/placeholder.png" ? (
                    <Box
                      component="img"
                      src={previewUrl}
                      alt="Selected"
                      sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    />
                  ) : (
                    /* Default Elementor Mountain/Sun Landscape SVG */
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM5 19V5H19V19H5ZM14.14 11.86L11.14 15.86L9 13.14L6 17H18L14.14 11.86Z" fill="#a4afb7" />
                    </svg>
                  )}
                  {/* Subtle hover overlay to change image */}
                  <Box
                    className="choose-image-overlay"
                    sx={{
                      position: 'absolute',
                      top: 0, left: 0, right: 0, bottom: 0,
                      bgcolor: 'rgba(0,0,0,0.15)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      fontSize: '11px',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}
                  >
                    Choose Image
                  </Box>
                </Box>
              </Box>

              {/* Image URL input field */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Image URL</Typography>
                <TextField
                  fullWidth
                  value={imageOptions.src}
                  onChange={handleUrlChange}
                  size="small"
                  placeholder="https://example.com/image.png"
                  InputProps={{
                    sx: { fontSize: '11px', bgcolor: '#fff' }
                  }}
                />
              </Box>

              {/* Image Resolution */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', color: '#555' }}>Image Resolution</Typography>
                <FormControl size="small" sx={{ width: '180px' }}>
                  <Select
                    value={imageOptions.imageResolution || 'large'}
                    onChange={(e) => dispatch(updateImageEditorOptions({ imageResolution: e.target.value }))}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    <MenuItem value="thumbnail" sx={{ fontSize: '12px' }}>Thumbnail - 150 x 150</MenuItem>
                    <MenuItem value="medium" sx={{ fontSize: '12px' }}>Medium - 300 x 300</MenuItem>
                    <MenuItem value="large" sx={{ fontSize: '12px' }}>Large - 1024 x 1024</MenuItem>
                    <MenuItem value="full" sx={{ fontSize: '12px' }}>Full</MenuItem>
                  </Select>
                </FormControl>
              </Box>


              {/* Link */}
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', color: '#555' }}>Link</Typography>
                <FormControl size="small" sx={{ width: '180px' }}>
                  <Select
                    value={imageOptions.linkType || 'none'}
                    onChange={(e) => dispatch(updateImageEditorOptions({ linkType: e.target.value }))}
                    sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                    MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                  >
                    <MenuItem value="none" sx={{ fontSize: '12px' }}>None</MenuItem>
                    <MenuItem value="file" sx={{ fontSize: '12px' }}>Media File</MenuItem>
                    <MenuItem value="custom" sx={{ fontSize: '12px' }}>Custom URL</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Custom URL Field - Show only when Link is Custom URL */}
              {imageOptions.linkType === 'custom' && (
                <Box>
                  <Typography sx={{ fontSize: '12px', color: '#555', mb: 0.5 }}>Link URL</Typography>
                  <Box display="flex" gap={0.5}>
                    <TextField
                      fullWidth
                      value={imageOptions.linkUrl || ''}
                      onChange={(e) => dispatch(updateImageEditorOptions({ linkUrl: e.target.value }))}
                      size="small"
                      placeholder="https://example.com"
                      InputProps={{ sx: { fontSize: '12px', bgcolor: '#fff' } }}
                    />
                    <Box sx={{ border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', bgcolor: '#fff' }}>
                      <PlaceholderSelect
                        onSelect={(placeholder) => dispatch(updateImageEditorOptions({ linkUrl: (imageOptions.linkUrl || '') + placeholder }))}
                        iconOnly={true}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {imageOptions.linkType && imageOptions.linkType !== 'none' && (
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography sx={{ fontSize: '13px', color: '#555' }}>Link Target</Typography>
                  <ToggleButtonGroup
                    value={imageOptions.linkTarget || '_self'}
                    exclusive
                    onChange={(_, value) => value && dispatch(updateImageEditorOptions({ linkTarget: value }))}
                    size="small"
                    sx={{ bgcolor: '#fff', '& .MuiToggleButton-root': { py: 0.5, px: 1.5, fontSize: '11px', textTransform: 'none' } }}
                  >
                    <ToggleButton value="_self">Same Tab</ToggleButton>
                    <ToggleButton value="_blank">New Tab</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
              )}

            </AccordionDetails>
          </Accordion>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 0, bgcolor: '#fff' }}>
          <Accordion defaultExpanded disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, border: 'none', bgcolor: 'transparent' }}>
            <AccordionSummary expandIcon={<ArrowDropDownIcon sx={{ fontSize: '20px' }} />} sx={{ minHeight: 48, p: '0 16px', '& .MuiAccordionSummary-content': { m: 0 } }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#333' }}>Image</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 2, pt: 0, display: 'flex', flexDirection: 'column', gap: 2.5 }}>

              {/* Alignment */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alignment</Typography>
                <ToggleButtonGroup
                  value={imageOptions.align}
                  exclusive
                  onChange={handleAlignChange as any}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: '#fff' }}
                >
                  <ToggleButton value="left" sx={{ p: '5px' }}><FormatAlignLeftIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="center" sx={{ p: '5px' }}><FormatAlignCenterIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                  <ToggleButton value="right" sx={{ p: '5px' }}><FormatAlignRightIcon sx={{ fontSize: '18px' }} /></ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Width */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Width</Typography>
                    <FormControlLabel
                      control={<Switch checked={imageOptions.autoWidth} onChange={handleWidthToggle} size="small" color="primary" />}
                      label={<Typography sx={{ fontSize: '12px', color: '#555' }}>Auto</Typography>}
                      labelPlacement="start"
                      sx={{ mr: 0, ml: 1 }}
                    />
                  </Box>
                  {!imageOptions.autoWidth && (
                    <select
                      value={widthUnit}
                      onChange={(e) => handleWidthUnitChange(e.target.value)}
                      style={{
                        fontSize: '11px',
                        height: '24px',
                        width: '55px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        paddingLeft: '6px',
                        paddingRight: '16px',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        color: '#555',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 3px center',
                        backgroundSize: '10px'
                      }}
                    >
                      <option value="px">PX</option>
                      <option value="%">%</option>
                      <option value="em">EM</option>
                      <option value="rem">REM</option>
                    </select>
                  )}
                </Box>
                {!imageOptions.autoWidth && (
                  <Box mt={1}>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      value={widthVal}
                      onChange={handleWidthChange}
                      InputProps={{
                        sx: { fontSize: '11px', bgcolor: '#fff' },
                        endAdornment: <Typography sx={{ fontSize: '11px', color: '#a4afb7', textTransform: 'uppercase' }}>{widthUnit}</Typography>
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Height */}
              <Box>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555' }}>Height</Typography>
                    <FormControlLabel
                      control={<Switch checked={imageOptions.autoHeight ?? true} onChange={handleHeightToggle} size="small" color="primary" />}
                      label={<Typography sx={{ fontSize: '12px', color: '#555' }}>Auto</Typography>}
                      labelPlacement="start"
                      sx={{ mr: 0, ml: 1 }}
                    />
                  </Box>
                  {!(imageOptions.autoHeight ?? true) && (
                    <select
                      value={heightUnit}
                      onChange={(e) => handleHeightUnitChange(e.target.value)}
                      style={{
                        fontSize: '11px',
                        height: '24px',
                        width: '55px',
                        backgroundColor: '#fff',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        paddingLeft: '6px',
                        paddingRight: '16px',
                        fontFamily: 'inherit',
                        fontWeight: 600,
                        color: '#555',
                        cursor: 'pointer',
                        outline: 'none',
                        appearance: 'none',
                        WebkitAppearance: 'none',
                        MozAppearance: 'none',
                        backgroundImage: `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23777' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 3px center',
                        backgroundSize: '10px'
                      }}
                    >
                      <option value="px">PX</option>
                      <option value="%">%</option>
                      <option value="em">EM</option>
                      <option value="rem">REM</option>
                    </select>
                  )}
                </Box>
                {!(imageOptions.autoHeight ?? true) && (
                  <Box mt={1}>
                    <TextField
                      type="number"
                      fullWidth
                      size="small"
                      value={heightVal}
                      onChange={handleHeightChange}
                      InputProps={{
                        sx: { fontSize: '11px', bgcolor: '#fff' },
                        endAdornment: <Typography sx={{ fontSize: '11px', color: '#a4afb7', textTransform: 'uppercase' }}>{heightUnit}</Typography>
                      }}
                    />
                  </Box>
                )}
              </Box>

              {/* Image Fit */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Image Fit</Typography>
                <ToggleButtonGroup
                  value={imageOptions.objectFit || 'contain'}
                  exclusive
                  onChange={(_, value) => value && dispatch(updateImageEditorOptions({ objectFit: value }))}
                  fullWidth
                  size="small"
                  sx={{ bgcolor: '#fff' }}
                >
                  <ToggleButton value="contain" sx={{ fontSize: '11px', textTransform: 'none' }}>Contain</ToggleButton>
                  <ToggleButton value="cover" sx={{ fontSize: '11px', textTransform: 'none' }}>Cover</ToggleButton>
                  <ToggleButton value="fill" sx={{ fontSize: '11px', textTransform: 'none' }}>Fill</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {/* Alt Text */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Alt Text</Typography>
                <TextField
                  fullWidth
                  value={imageOptions.altText || ''}
                  onChange={handleAltTextChange}
                  size="small"
                  placeholder="Image description"
                  InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff' } }}
                />
              </Box>

              <Divider sx={{ mx: -2 }} />

              {/* Borders & Border Radius */}
              <AdvancedBorderControl
                borderType={imageOptions.borderTopStyle || 'none'}
                borderWidth={{
                  top: imageOptions.borderTopWidth || 0,
                  right: imageOptions.borderRightWidth || 0,
                  bottom: imageOptions.borderBottomWidth || 0,
                  left: imageOptions.borderLeftWidth || 0
                }}
                borderColor={imageOptions.borderTopColor || 'transparent'}
                borderRadius={{
                  top: imageOptions.borderRadiusTop || 0,
                  right: imageOptions.borderRadiusRight || 0,
                  bottom: imageOptions.borderRadiusBottom || 0,
                  left: imageOptions.borderRadiusLeft || 0
                }}
                boxShadow="none"
                hideBoxShadow={true}
                onChange={(isHover, prop, value) => {
                  if (prop === 'borderType') {
                    dispatch(updateImageEditorOptions({ borderTopStyle: value, borderRightStyle: value, borderBottomStyle: value, borderLeftStyle: value }));
                  } else if (prop === 'borderColor') {
                    dispatch(updateImageEditorOptions({ borderTopColor: value, borderRightColor: value, borderBottomColor: value, borderLeftColor: value }));
                  } else if (prop === 'borderWidthAll') {
                    dispatch(updateImageEditorOptions({ borderTopWidth: value, borderRightWidth: value, borderBottomWidth: value, borderLeftWidth: value }));
                  } else if (prop.startsWith('border') && prop.endsWith('Width')) {
                    dispatch(updateImageEditorOptions({ [prop]: value }));
                  } else if (prop === 'borderRadius') {
                    dispatch(updateImageEditorOptions({ borderRadiusTop: value.top, borderRadiusRight: value.right, borderRadiusBottom: value.bottom, borderRadiusLeft: value.left }));
                  }
                }}
              />

            </AccordionDetails>
          </Accordion>
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <SpacingControl
              label="Padding"
              value={imageOptions.padding}
              onChange={handlePaddingChange}
              onChangeAll={(v) => dispatch(updateImageEditorOptions({ padding: { top: v, right: v, bottom: v, left: v } }))}
            />

            <SpacingControl
              label="Margin"
              value={imageOptions.margin}
              onChange={(side, v) => dispatch(updateImageEditorOptions({ margin: { ...imageOptions.margin, [side]: v } }))}
              onChangeAll={(v) => dispatch(updateImageEditorOptions({ margin: { top: v, right: v, bottom: v, left: v } }))}
            />
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Image"
      description="Upload and customize image."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      disableStyleInterception
    />
  );
};

export default ImageWidgetEditor;