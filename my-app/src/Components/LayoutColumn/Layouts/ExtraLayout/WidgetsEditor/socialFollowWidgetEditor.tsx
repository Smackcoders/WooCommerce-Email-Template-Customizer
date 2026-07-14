import React, { useState } from 'react';
import { Box, Typography, TextField, Button, IconButton, List, ListItem, ListItemText, Tooltip, Select, MenuItem, FormControl, InputLabel, Stack, Divider, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateSocialFollowEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import DeleteIcon from "@mui/icons-material/Delete";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ColorPicker from "../../../../utils/ColorPicker";
import CommonStylingControls from '../../../../utils/CommonStylingControls';

const SocialFollowWidgetEditor = () => {
  const dispatch = useDispatch();
  const { socialFollowEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const [newPlatform, setNewPlatform] = useState({ name: '', url: '', icon: 'facebook' });

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

  const handleAddPlatform = () => {
    if (newPlatform.name && newPlatform.url) {
      const updatedPlatforms = [...(socialFollowEditorOptions.platforms || []), newPlatform];
      dispatch(updateSocialFollowEditorOptions({ platforms: updatedPlatforms }));
      setNewPlatform({ name: '', url: '', icon: 'facebook' });
    }
  };

  const handleRemovePlatform = (index: number) => {
    const updatedPlatforms = [...(socialFollowEditorOptions.platforms || [])];
    updatedPlatforms.splice(index, 1);
    dispatch(updateSocialFollowEditorOptions({ platforms: updatedPlatforms }));
  };

  const handleChange = (field: string) => (
    e: any
  ) => {
    let value = e.target.value;
    if (field === 'iconSize' || field === 'spacing') {
      value = Number(value);
    }
    dispatch(updateSocialFollowEditorOptions({ [field]: value }));
  };

  const handleColorChange = (newColor: string) => {
    dispatch(updateSocialFollowEditorOptions({ iconColor: newColor }));
  };


  const iconOptions = [
    'facebook', 'twitter', 'instagram', 'linkedin', 'youtube',
    'pinterest', 'tiktok', 'whatsapp', 'telegram', 'github'
  ];

  return (
    <Box sx={{ bgcolor: '#f9f9f9', height: '100%' }}>
      {/* Editor Header */}
      <Box sx={{ p: '15px 20px', bgcolor: '#fff', borderBottom: '1px solid #e7e9eb' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
          <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#495157' }}>Social Follow</Typography>
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
          Manage your social media profile links.
        </Typography>
      </Box>

      {/* Editor Sections */}
      <Box sx={{ height: 'calc(100% - 70px)', overflowY: 'auto' }}>
        {/* Content Section */}
        <Accordion defaultExpanded disableGutters sx={{ boxShadow: 'none', borderBottom: '1px solid #e7e9eb', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />} sx={{ minHeight: '40px', '&.Mui-expanded': { minHeight: '40px' }, '& .MuiAccordionSummary-content': { margin: '12px 0' } }}>
            <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', textTransform: 'none' }}>Social Links</Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 2, bgcolor: '#fff' }}>
            <Stack spacing={3}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Active Links</Typography>
                <List sx={{ border: '1px solid #e7e9eb', borderRadius: '4px', p: 0, bgcolor: '#fdfdfd', maxHeight: '200px', overflow: 'auto' }}>
                  {socialFollowEditorOptions.platforms?.map((platform, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => handleRemovePlatform(index)} size="small" sx={{ color: '#d32f2f' }}>
                          <DeleteIcon sx={{ fontSize: '18px' }} />
                        </IconButton>
                      }
                      sx={{ borderBottom: '1px solid #e7e9eb', '&:last-child': { borderBottom: 'none' } }}
                    >
                      <ListItemText
                        primary={<Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#495157' }}>{platform.name}</Typography>}
                        secondary={<Typography sx={{ fontSize: '11px', color: '#6d7882', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '180px' }}>{platform.url}</Typography>}
                      />
                    </ListItem>
                  ))}
                  {(!socialFollowEditorOptions.platforms || socialFollowEditorOptions.platforms.length === 0) && (
                    <ListItem sx={{ py: 2 }}>
                      <ListItemText primary={<Typography sx={{ fontSize: '12px', color: '#a4afb7', textAlign: 'center' }}>No social links added</Typography>} />
                    </ListItem>
                  )}
                </List>
              </Box>

              <Box sx={{ p: 1.5, border: '1px dashed #ced4da', borderRadius: '4px', bgcolor: '#f9f9f9' }}>
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', mb: 1.5, textTransform: 'none' }}>Add New Link</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Platform Name</Typography>
                    <TextField
                      value={newPlatform.name}
                      onChange={(e) => setNewPlatform({ ...newPlatform, name: e.target.value })}
                      size="small"
                      placeholder="e.g. Facebook"
                      fullWidth
                      InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff' } }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Profile URL</Typography>
                    <TextField
                      value={newPlatform.url}
                      onChange={(e) => setNewPlatform({ ...newPlatform, url: e.target.value })}
                      size="small"
                      placeholder="https://facebook.com/user"
                      fullWidth
                      InputProps={{ sx: { fontSize: '11px', bgcolor: '#fff' } }}
                    />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Icon Type</Typography>
                    <FormControl size="small" fullWidth>
                      <Select
                        value={newPlatform.icon}
                        onChange={(e) => setNewPlatform({ ...newPlatform, icon: e.target.value })}
                        sx={{ fontSize: '11px', bgcolor: '#fff' }}
                        MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                      >
                        {iconOptions.map((icon) => (
                          <MenuItem key={icon} value={icon} sx={{ fontSize: '11px' }}>
                            {icon.charAt(0).toUpperCase() + icon.slice(1)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Button
                    variant="contained"
                    disableElevation
                    onClick={handleAddPlatform}
                    startIcon={<AddIcon />}
                    disabled={!newPlatform.name || !newPlatform.url}
                    fullWidth
                    sx={{ textTransform: 'none', fontSize: '12px', py: 0.8, bgcolor: '#33d391', '&:hover': { bgcolor: '#2eb37d' } }}
                  >
                    Add This Link
                  </Button>
                </Stack>
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
            <Stack spacing={2.5}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Icon Preview</Typography>
                <Stack spacing={2}>
                  <ColorPicker
                    label="Icon Color"
                    value={socialFollowEditorOptions.iconColor || '#000000'}
                    onChange={handleColorChange}
                  />
                  <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Size (px)</Typography>
                      <TextField
                        type="number"
                        value={socialFollowEditorOptions.iconSize || 24}
                        onChange={handleChange('iconSize')}
                        size="small"
                        fullWidth
                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' }, inputProps: { min: 0 } }}
                      />
                    </Box>
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#6d7882', mb: 0.5 }}>Spacing (px)</Typography>
                      <TextField
                        type="number"
                        value={socialFollowEditorOptions.spacing || 10}
                        onChange={handleChange('spacing')}
                        size="small"
                        fullWidth
                        InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' }, inputProps: { min: 0 } }}
                      />
                    </Box>
                  </Box>
                </Stack>
              </Box>
              <Divider />
              <CommonStylingControls
                options={socialFollowEditorOptions}
                onUpdate={(updatedOptions) => dispatch(updateSocialFollowEditorOptions(updatedOptions))}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Box>
  );
};

export default SocialFollowWidgetEditor;