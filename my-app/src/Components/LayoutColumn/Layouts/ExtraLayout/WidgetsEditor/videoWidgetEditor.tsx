import React from 'react';
import { Box, Typography, TextField, Switch, FormControlLabel, Tooltip, IconButton, Stack, Divider, Select, MenuItem, InputAdornment, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateVideoEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import CommonStylingControls from '../../../../utils/CommonStylingControls';

const VideoWidgetEditor = () => {
  const dispatch = useDispatch();
  const { videoEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleChange = (field: keyof typeof videoEditorOptions) => (
    e: any
  ) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    dispatch(updateVideoEditorOptions({ [field]: value }));
  };

  const handleCloseEditor = () => {
    dispatch(closeEditor());
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

  return (
    <Box sx={{ bgcolor: '#f9f9f9', height: '100%' }}>
      {/* Editor Header */}
      <Box sx={{ p: '15px 20px', bgcolor: '#fff', borderBottom: '1px solid #e7e9eb' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#495157' }}>Video</Typography>
          <Box display="flex" gap={1}>
            <Tooltip title="Close">
              <IconButton onClick={handleCloseEditor} size="small" sx={{ p: 0.5 }}>
                <CloseIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Delete">
              <IconButton onClick={handleDeleteContent} size="small" sx={{ p: 0.5 }}>
                <DeleteIcon fontSize="small" sx={{ color: '#a4afb7', fontSize: '18px' }} />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Typography sx={{ fontSize: '11px', color: '#6d7882', fontStyle: 'italic' }}>
          Configure video settings and player style.
        </Typography>
      </Box>

      {/* Editor Sections */}
      <Box sx={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
        {/* Content Section */}
        <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Content</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Video Source</Typography>
                <Box>
                  <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Video URL</Typography>
                  <TextField
                    value={videoEditorOptions.url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
                    onChange={handleChange('url')}
                    size="small"
                    fullWidth
                    placeholder="YouTube or Vimeo URL"
                    InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                  />
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        {/* Style Section */}
        <Accordion disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Style</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Dimensions</Typography>
                <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Width</Typography>
                    <TextField
                      value={String(videoEditorOptions.width || '').replace(/[^0-9]/g, '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const unit = (videoEditorOptions.width || '').includes('%') ? '%' : 'px';
                        handleChange('width')({ target: { value: val === '' ? `0${unit}` : `${val}${unit}` } });
                      }}
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        sx: { fontSize: '11px', bgcolor: '#f9f9f9' },
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mx: 0 }}>
                            <Select
                              value={(videoEditorOptions.width || '').includes('%') ? '%' : 'px'}
                              onChange={(e) => {
                                const val = String(videoEditorOptions.width || '').replace(/[^0-9]/g, '');
                                const unit = e.target.value;
                                handleChange('width')({ target: { value: `${val}${unit}` } });
                              }}
                              variant="standard"
                              disableUnderline
                              sx={{
                                fontSize: '11px',
                                '& .MuiSelect-select': { py: 0, pr: '14px !important' }
                              }}
                              MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                            >
                              <MenuItem value="px" sx={{ fontSize: '11px' }}>px</MenuItem>
                              <MenuItem value="%" sx={{ fontSize: '11px' }}>%</MenuItem>
                            </Select>
                          </InputAdornment>
                        ),
                        inputProps: { min: 0 }
                      }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Height</Typography>
                    <TextField
                      value={String(videoEditorOptions.height || '').replace(/[^0-9]/g, '')}
                      onChange={(e) => {
                        const val = e.target.value;
                        const unit = (videoEditorOptions.height || '').includes('%') ? '%' : 'px';
                        handleChange('height')({ target: { value: val === '' ? `0${unit}` : `${val}${unit}` } });
                      }}
                      type="number"
                      size="small"
                      fullWidth
                      InputProps={{
                        sx: { fontSize: '11px', bgcolor: '#f9f9f9' },
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mx: 0 }}>
                            <Select
                              value={(videoEditorOptions.height || '').includes('%') ? '%' : 'px'}
                              onChange={(e) => {
                                const val = String(videoEditorOptions.height || '').replace(/[^0-9]/g, '');
                                const unit = e.target.value;
                                handleChange('height')({ target: { value: `${val}${unit}` } });
                              }}
                              variant="standard"
                              disableUnderline
                              sx={{
                                fontSize: '11px',
                                '& .MuiSelect-select': { py: 0, pr: '14px !important' }
                              }}
                              MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                            >
                              <MenuItem value="px" sx={{ fontSize: '11px' }}>px</MenuItem>
                              <MenuItem value="%" sx={{ fontSize: '11px' }}>%</MenuItem>
                            </Select>
                          </InputAdornment>
                        ),
                        inputProps: { min: 0 }
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Playback Settings</Typography>
                <Stack spacing={0.5}>
                  <FormControlLabel
                    control={<Switch checked={videoEditorOptions.autoplay || false} onChange={handleChange('autoplay')} size="small" />}
                    label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Autoplay</Typography>}
                    sx={{ ml: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch checked={videoEditorOptions.controls !== false} onChange={handleChange('controls')} size="small" />}
                    label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Controls</Typography>}
                    sx={{ ml: 0 }}
                  />
                </Stack>
              </Box>

              <Divider />
              <CommonStylingControls
                options={videoEditorOptions}
                onUpdate={(updatedOptions) => dispatch(updateVideoEditorOptions(updatedOptions))}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default VideoWidgetEditor;