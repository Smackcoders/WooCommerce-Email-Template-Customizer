import React, { useCallback, useState, useEffect } from 'react';
import { FONT_FAMILIES } from '../../../../../Constants/StyleConstants';
import { Box, Typography, TextField, Stack, MenuItem, Select, FormControl, Accordion, AccordionSummary, AccordionDetails, IconButton, Button, Tooltip, InputAdornment, ToggleButtonGroup, ToggleButton, Slider } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StorageIcon from "@mui/icons-material/Storage";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";

import { PlaceholderSelect } from '../../../../utils/PlaceholderSelect';
import DesktopMacIcon from "@mui/icons-material/DesktopMac";
import ImageIcon from "@mui/icons-material/Image";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CloseIcon from "@mui/icons-material/Close";
import SettingsIcon from "@mui/icons-material/Settings";
import InfoIcon from "@mui/icons-material/Info";
import LandscapeIcon from "@mui/icons-material/Landscape";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import FormatColorResetIcon from "@mui/icons-material/FormatColorReset";
import EditIcon from "@mui/icons-material/Edit";
import FormatPaintIcon from "@mui/icons-material/FormatPaint";
import GradientIcon from "@mui/icons-material/Gradient";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateTableEditorOptions, TableEditorOptions, defaultTableEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import ColorPicker from "../../../../utils/ColorPicker";
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { SpacingControl } from "../../../../utils/SharedStyleTab";
import { AdvancedBorderControl } from '../../../../utils/AdvancedBorderControl';

const TableWidgetEditor = () => {
  const dispatch = useDispatch();
  const { tableEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { blocks, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const selectedWidget = React.useMemo(() => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      const block = blocks.find(b => b.id === selectedBlockForEditor);
      return block?.columns[selectedColumnIndex]?.widgetContents[selectedWidgetIndex];
    }
    return null;
  }, [blocks, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex]);

  const debouncedUpdate = useCallback((newData: Partial<TableEditorOptions>) => {
    dispatch(updateTableEditorOptions(newData));
  }, [dispatch]);

  useEffect(() => {
    if (selectedWidget && selectedWidget.contentType === 'table') {
      const parsedData = selectedWidget.contentData ? JSON.parse(selectedWidget.contentData) : {};
      dispatch(updateTableEditorOptions({ ...defaultTableEditorOptions, ...parsedData }));
    }
  }, [selectedWidget, dispatch]);

  // Sync tableRows defaults to Redux store on mount so preview reflects real data
  useEffect(() => {
    const existing = (tableEditorOptions as any).tableRows;
    if (!existing || existing.length === 0) {
      dispatch(updateTableEditorOptions({ tableRows: [
        { text: 'Row Starts', type: 'row' },
        { text: 'Stay Happy', type: 'column' },
        { text: 'Stay Safe', type: 'column' },
        { text: 'ww', type: 'column' },
      ] } as any));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [expandedItemIndex, setExpandedItemIndex] = useState<number | false>(false);
  const [innerTab, setInnerTab] = useState<'content' | 'style'>('content');
  const [mediaType, setMediaType] = useState<'none' | 'image'>('image');
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'head' | 'row' | false>('head');
  const [styleExpandedSection, setStyleExpandedSection] = useState<'global' | 'head' | 'row' | false>('global');
  const [expandedRowIndex, setExpandedRowIndex] = useState<number | false>(false);
  const [rowInnerTab, setRowInnerTab] = useState<'content' | 'style'>('content');
  const [rowMediaType, setRowMediaType] = useState<'none' | 'image'>('image');
  const [rowHoverTab, setRowHoverTab] = useState<'normal' | 'hover'>('normal');

  const headings = tableEditorOptions.headings || [{ text: 'Heading 1' }, { text: 'Heading 2' }];

  const [selectedRowImageUrl, setSelectedRowImageUrl] = useState<string | null>(null);

  const handleBrowseRowImage = (index: number) => {
    const wp = (window as any).wp;
    if (wp && wp.media) {
      const mediaFrame = wp.media({
        title: 'Select Image',
        button: { text: 'Use Image' },
        multiple: false,
      });
      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        const url = attachment.url;
        setSelectedRowImageUrl(url);
        
        const updatedRows = [...tableRows] as any[];
        updatedRows[index] = { ...updatedRows[index], imageUrl: url };
        debouncedUpdate({ tableRows: updatedRows } as any);
      });
      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available.');
    }
  };

  const handleBrowseImage = (index: number) => {
    const wp = (window as any).wp;
    if (wp && wp.media) {
      const mediaFrame = wp.media({
        title: 'Select Image',
        button: { text: 'Use Image' },
        multiple: false,
      });
      mediaFrame.on('select', () => {
        const attachment = mediaFrame.state().get('selection').first().toJSON();
        const url = attachment.url;
        setSelectedImageUrl(url);
        // Save the image URL to the specific heading
        const updatedHeadings = [...headings] as any[];
        updatedHeadings[index] = { ...updatedHeadings[index], imageUrl: url };
        debouncedUpdate({ headings: updatedHeadings } as any);
      });
      mediaFrame.open();
    } else {
      alert('WordPress Media Library is not available.');
    }
  };

  const handleAddHeading = () => {
    const newHeading = { text: `Heading ${headings.length + 1}` };
    const updatedHeadings = [...headings, newHeading];
    debouncedUpdate({ headings: updatedHeadings });
    setExpandedItemIndex(updatedHeadings.length - 1);
  };

  const tableRows: { text: string; type: 'row' | 'column' }[] = (tableEditorOptions as any).tableRows || [
    { text: 'Row Starts', type: 'row' },
    { text: 'Stay Happy', type: 'column' },
    { text: 'Stay Safe', type: 'column' },
    { text: 'ww', type: 'column' },
  ];

  const handleAddRowItem = () => {
    const newRow = { text: `Cell ${tableRows.filter(r => r.type === 'column').length + 1}`, type: 'column' as const };
    const updatedRows = [...tableRows, newRow];
    debouncedUpdate({ tableRows: updatedRows } as any);
    setExpandedRowIndex(updatedRows.length - 1);
  };

  const handleUpdateRowItem = (index: number, value: string) => {
    const updatedRows = [...tableRows];
    updatedRows[index] = { ...updatedRows[index], text: value };
    debouncedUpdate({ tableRows: updatedRows } as any);
  };

  const handleUpdateRowItemProp = (index: number, prop: string, value: any) => {
    const updatedRows = [...tableRows];
    updatedRows[index] = { ...updatedRows[index], [prop]: value };
    debouncedUpdate({ tableRows: updatedRows } as any);
  };

  const handleRemoveRowItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedRows = [...tableRows];
    updatedRows.splice(index, 1);
    debouncedUpdate({ tableRows: updatedRows } as any);
    if (expandedRowIndex === index) setExpandedRowIndex(false);
  };

  const handleDuplicateRowItem = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDuplicate = tableRows[index];
    const updatedRows = [...tableRows];
    updatedRows.splice(index + 1, 0, { ...itemToDuplicate });
    debouncedUpdate({ tableRows: updatedRows } as any);
    setExpandedRowIndex(index + 1);
  };

  const handleUpdateHeading = (index: number, value: string) => {
    const updatedHeadings = [...headings];
    updatedHeadings[index] = { ...updatedHeadings[index], text: value };
    debouncedUpdate({ headings: updatedHeadings });
  };

  const handleUpdateHeadingProp = (index: number, prop: string, value: any) => {
    const updatedHeadings = [...headings];
    updatedHeadings[index] = { ...updatedHeadings[index], [prop]: value };
    debouncedUpdate({ headings: updatedHeadings });
  };

  const handleRemoveHeading = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHeadings = [...headings];
    updatedHeadings.splice(index, 1);
    debouncedUpdate({ headings: updatedHeadings });
    if (expandedItemIndex === index) setExpandedItemIndex(false);
  };

  const handleDuplicateHeading = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const headingToDuplicate = headings[index];
    const updatedHeadings = [...headings];
    updatedHeadings.splice(index + 1, 0, { ...headingToDuplicate });
    debouncedUpdate({ headings: updatedHeadings });
    setExpandedItemIndex(index + 1);
  };

  const handleItemAccordionChange = (index: number) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedItemIndex(isExpanded ? index : false);
  };

  const handleChange = (field: keyof typeof tableEditorOptions) => (
    e: React.ChangeEvent<HTMLInputElement | { value: unknown }>
  ) => {
    debouncedUpdate({ [field]: e.target.value as any });
  };

  const handleColorChange = (field: keyof typeof tableEditorOptions) => (newColor: string) => {
    debouncedUpdate({ [field]: newColor });
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

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>

            <Accordion
              expanded={expandedSection === 'head'}
              onChange={() => setExpandedSection(expandedSection === 'head' ? false : 'head')}
              disableGutters
              sx={{ 
                boxShadow: 'none', 
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                '&:before': { display: 'none' },
                bgcolor: 'transparent'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: '14px', color: '#6d7882', transform: expandedSection === 'head' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
                sx={{ 
                  minHeight: '38px', 
                  '&.Mui-expanded': { minHeight: '38px' }, 
                  px: 0,
                  flexDirection: 'row-reverse',
                  gap: 0.5,
                  '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' },
                  '& .MuiAccordionSummary-content': { my: 0, '&.Mui-expanded': { my: 0 } } 
                }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Table Head</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 1.5 }}>
              <Box>
                {headings.map((heading, index) => (
                    <Accordion
                      key={index}
                      expanded={expandedItemIndex === index}
                      onChange={handleItemAccordionChange(index)}
                      disableGutters
                      sx={{
                        boxShadow: 'none',
                        border: '1px solid #d5d8dc',
                        mb: 1,
                        '&:before': { display: 'none' },
                        bgcolor: '#fff'
                      }}
                    >
                    <AccordionSummary
                      sx={{ 
                        minHeight: '40px', 
                        p: 0,
                        '& .MuiAccordionSummary-content': { 
                          m: 0, 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'stretch',
                          width: '100%',
                          '&.Mui-expanded': { m: 0 }
                        },
                        '&.Mui-expanded': { minHeight: '40px' } 
                      }}
                    >
                      <Box display="flex" alignItems="center" width="100%" pl={1.5}>
                        <Typography sx={{ fontSize: '12px', color: '#6d7882' }}>{heading.text || `Item #${index + 1}`}</Typography>
                      </Box>
                      <Box display="flex" alignItems="stretch">
                        <Tooltip title="Duplicate">
                          <Box 
                            onClick={(e) => handleDuplicateHeading(index, e)}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '40px', 
                              borderLeft: '1px solid #d5d8dc',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                          >
                            <ContentCopyIcon sx={{ fontSize: '14px', color: '#6d7882' }} />
                          </Box>
                        </Tooltip>
                        <Tooltip title="Remove">
                          <Box 
                            onClick={(e) => handleRemoveHeading(index, e)}
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              width: '40px', 
                              borderLeft: '1px solid #d5d8dc',
                              cursor: 'pointer',
                              '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                          >
                            <CloseIcon sx={{ fontSize: '16px', color: '#6d7882' }} />
                          </Box>
                        </Tooltip>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 2, borderTop: '1px solid #f0f0f0' }}>
                      <Stack spacing={2}>
                        

                            {/* Title Field */}
                            <Box>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                                <Typography sx={{ fontSize: '11px', color: '#666' }}>Title</Typography>
                              </Box>
                              <TextField
                                value={heading.text}
                                onChange={(e) => handleUpdateHeading(index, e.target.value)}
                                placeholder="Column Name"
                                size="small"
                                fullWidth
                                InputProps={{ 
                                  sx: { fontSize: '11px', bgcolor: '#fff' },
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateHeadingProp(index, 'text', (heading.text || '') + ph)} />
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Box>

                            {/* Col Span Field */}
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Typography sx={{ fontSize: '11px', color: '#666' }}>Col Span</Typography>
                              <TextField
                                value={(heading as any).colSpan || ''}
                                onChange={(e) => handleUpdateHeadingProp(index, 'colSpan', e.target.value)}
                                size="small"
                                sx={{ width: '80px' }}
                                InputProps={{ 
                                  sx: { fontSize: '11px', bgcolor: '#fff' },
                                  endAdornment: (
                                    <InputAdornment position="end">
                                      <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateHeadingProp(index, 'colSpan', ((heading as any).colSpan || '') + ph)} />
                                    </InputAdornment>
                                  )
                                }}
                              />
                            </Box>

                            {/* Media Field */}
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                              <Box display="flex" alignItems="center" gap={1}>
                                <Typography sx={{ fontSize: '11px', color: '#666' }}>Media</Typography>
                              </Box>
                              <Box display="flex" border="1px solid #ddd" borderRadius="4px" overflow="hidden">
                                <IconButton 
                                  size="small" 
                                  sx={{ borderRadius: 0, p: 0.5, borderLeft: '1px solid #ddd', bgcolor: mediaType === 'image' ? '#e0e0e0' : '#fff' }}
                                  onClick={() => setMediaType('image')}
                                >
                                  <ImageIcon sx={{ fontSize: '14px', color: '#666' }} />
                                </IconButton>
                              </Box>
                            </Box>

                            {mediaType === 'image' && (
                              <Box>
                                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                  <Typography sx={{ fontSize: '11px', color: '#666' }}>Image</Typography>
                                  <AutoAwesomeIcon sx={{ fontSize: '12px', color: '#d915a8' }} />
                                </Box>
                                
                                <Box sx={{ border: '1px solid #ddd', borderRadius: '3px', overflow: 'hidden', mb: 1.5 }}>
                                  {/* Image Upload Area */}
                                  <Box 
                                   onClick={() => handleBrowseImage(index)}
                                    sx={{ 
                                      height: '110px', 
                                      bgcolor: '#ced4da', 
                                      display: 'flex', 
                                      justifyContent: 'center', 
                                      alignItems: 'center',
                                      cursor: 'pointer',
                                      overflow: 'hidden',
                                      '&:hover': { bgcolor: '#c2c9cf' }
                                    }}
                                  >
                                    {((heading as any).imageUrl || selectedImageUrl) ? (
                                      <img 
                                        src={(heading as any).imageUrl || selectedImageUrl || ''} 
                                        alt="Selected" 
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                      />
                                    ) : (
                                      <LandscapeIcon sx={{ fontSize: '120px', color: '#e9ecef', opacity: 0.8 }} />
                                    )}
                                  </Box>
                                </Box>

                                {/* Image Resolution Dropdown */}
                                <Box>
                                  <Typography sx={{ fontSize: '11px', color: '#666', mb: 0.5 }}>Image Resolution</Typography>
                                  <FormControl size="small" fullWidth>
                                    <Select
                                      value="thumbnail"
                                      sx={{ fontSize: '11px', bgcolor: '#fff', height: '28px' }}
                                    >
                                      <MenuItem value="thumbnail" sx={{ fontSize: '11px' }}>Thumbnail - 150 x 150</MenuItem>
                                      <MenuItem value="medium" sx={{ fontSize: '11px' }}>Medium - 300 x 300</MenuItem>
                                      <MenuItem value="medium_large" sx={{ fontSize: '11px' }}>Medium Large - 768 x 0</MenuItem>
                                      <MenuItem value="large" sx={{ fontSize: '11px' }}>Large - 1024 x 1024</MenuItem>
                                      <MenuItem value="1536x1536" sx={{ fontSize: '11px' }}>1536x1536 - 1536 x 1536</MenuItem>
                                      <MenuItem value="2048x2048" sx={{ fontSize: '11px' }}>2048x2048 - 2048 x 2048</MenuItem>
                                      <MenuItem value="betterdocs-category-thumb" sx={{ fontSize: '11px' }}>Betterdocs-category-thumb - 360 x 512</MenuItem>
                                      <MenuItem value="woocommerce_thumbnail" sx={{ fontSize: '11px' }}>Woocommerce Thumbnail - 300 x 300</MenuItem>
                                      <MenuItem value="woocommerce_single" sx={{ fontSize: '11px' }}>Woocommerce Single - 600 x 0</MenuItem>
                                      <MenuItem value="woocommerce_gallery_thumbnail" sx={{ fontSize: '11px' }}>Woocommerce Gallery Thumbnail - 100 x 100</MenuItem>
                                      <MenuItem value="full" sx={{ fontSize: '11px' }}>Full</MenuItem>
                                      <MenuItem value="custom" sx={{ fontSize: '11px' }}>Custom</MenuItem>
                                    </Select>
                                  </FormControl>
                                </Box>
                              </Box>
                            )}

                      </Stack>
                    </AccordionDetails>
                  </Accordion>
                ))}

                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  onClick={handleAddHeading}
                  startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
                  sx={{ 
                    mt: 2, 
                    bgcolor: '#55595c', 
                    color: '#fff', 
                    textTransform: 'none', 
                    fontSize: '12px', 
                    fontWeight: 500, 
                    py: 1,
                    '&:hover': { bgcolor: '#444' } 
                  }}
                >
                  Add Item
                </Button>
              </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion
              expanded={expandedSection === 'row'}
              onChange={() => setExpandedSection(expandedSection === 'row' ? false : 'row')}
              disableGutters
              sx={{ 
                boxShadow: 'none', 
                border: 'none',
                borderBottom: '1px solid #e0e0e0',
                '&:before': { display: 'none' },
                bgcolor: 'transparent'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: '14px', color: '#6d7882', transform: expandedSection === 'row' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
                sx={{ 
                  minHeight: '38px', 
                  '&.Mui-expanded': { minHeight: '38px' }, 
                  px: 0,
                  flexDirection: 'row-reverse',
                  gap: 0.5,
                  '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' },
                  '& .MuiAccordionSummary-content': { my: 0, '&.Mui-expanded': { my: 0 } } 
                }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Table Row</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 1.5 }}>
              <Box>
                {/* Items - Map over all tableRows (rows and columns) */}
                {tableRows.map((rowItem: any, rowIndex: number) => {
                  const isRow = rowItem.type === 'row';
                  return (
                    <Accordion
                      key={rowIndex}
                      expanded={expandedRowIndex === rowIndex}
                      onChange={() => setExpandedRowIndex(expandedRowIndex === rowIndex ? false : rowIndex)}
                      disableGutters
                      sx={{ boxShadow: 'none', border: '1px solid #d5d8dc', borderTop: rowIndex === 0 ? '1px solid #d5d8dc' : 'none', mb: 0, '&:before': { display: 'none' }, borderRadius: '0 !important', ml: 0, bgcolor: '#ffffff' }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: '18px' }} />}
                        sx={{ minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1, alignItems: 'center', display: 'flex' }, p: 0, pl: 1.5, pr: 1 }}
                      >
                        <Box display="flex" alignItems="center" flex={1}>
                          <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: 400 }}>{isRow ? 'Row Starts' : (rowItem.text || 'Item')}</Typography>
                        </Box>
                        <Box display="flex" alignItems="stretch">
                          <Tooltip title="Duplicate">
                            <Box onClick={(e) => { e.stopPropagation(); handleDuplicateRowItem(rowIndex, e); }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', borderLeft: '1px solid #d5d8dc', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                              <ContentCopyIcon sx={{ fontSize: '14px', color: '#6d7882' }} />
                            </Box>
                          </Tooltip>
                          <Tooltip title="Remove">
                            <Box onClick={(e) => { e.stopPropagation(); handleRemoveRowItem(rowIndex, e); }} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', borderLeft: '1px solid #d5d8dc', cursor: 'pointer', '&:hover': { bgcolor: '#f5f5f5' } }}>
                              <CloseIcon sx={{ fontSize: '16px', color: '#6d7882' }} />
                            </Box>
                          </Tooltip>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 2, borderTop: '1px solid #f0f0f0', bgcolor: '#fafafa' }}>
                        <Stack spacing={2}>
                          {/* Row/Column Dropdown */}
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Typography sx={{ fontSize: '11px', color: '#666' }}>Row/Column</Typography>
                            <FormControl size="small" sx={{ width: '110px' }}>
                              <Select value={rowItem.type || 'column'} onChange={(e) => handleUpdateRowItemProp(rowIndex, 'type', e.target.value)} sx={{ fontSize: '11px', height: '28px', bgcolor: '#fff' }}>
                                <MenuItem value="row" sx={{ fontSize: '11px' }}>Row</MenuItem>
                                <MenuItem value="column" sx={{ fontSize: '11px' }}>Column</MenuItem>
                              </Select>
                            </FormControl>
                          </Box>

                          {/* Render Content/Style only for Columns */}
                          {!isRow && (
                            <>
                              {/* Content / Style Toggle */}
                              <ToggleButtonGroup
                                value={rowInnerTab}
                                exclusive
                                onChange={(_, v) => v && setRowInnerTab(v)}
                                fullWidth
                                size="small"
                                sx={{ bgcolor: '#e8e8e8', borderRadius: '4px', p: '2px' }}
                              >
                                <ToggleButton value="content" sx={{ textTransform: 'none', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '3px !important', '&.Mui-selected': { bgcolor: '#fff', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' } }}>Content</ToggleButton>
                                <ToggleButton value="style" sx={{ textTransform: 'none', fontSize: '11px', fontWeight: 600, border: 'none', borderRadius: '3px !important', '&.Mui-selected': { bgcolor: '#fff', color: '#333', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' } }}>Style</ToggleButton>
                              </ToggleButtonGroup>

                              {rowInnerTab === 'content' && (
                                <Stack spacing={1.5}>
                                  {/* Title Input */}
                                  <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Typography sx={{ fontSize: '11px', color: '#666' }}>Title</Typography>
                                    </Box>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      value={rowItem.text || ''}
                                      onChange={(e) => handleUpdateRowItem(rowIndex, e.target.value)}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateRowItem(rowIndex, (rowItem.text || '') + ph)} />
                                          </InputAdornment>
                                        )
                                      }}
                                      sx={{ '& .MuiInputBase-root': { height: '32px', fontSize: '12px', bgcolor: '#fff' } }}
                                    />
                                  </Box>

                                  {/* Link Input */}
                                  <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Typography sx={{ fontSize: '11px', color: '#666' }}>Link</Typography>
                                    </Box>
                                    <TextField
                                      fullWidth
                                      size="small"
                                      placeholder="https://example.com"
                                      value={(rowItem as any).link || ''}
                                      onChange={(e) => handleUpdateRowItemProp(rowIndex, 'link', e.target.value)}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <Box display="flex" alignItems="center" gap={0.5}>
                                              <Box sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '20px', height: '20px' }}>
                                                <SettingsIcon sx={{ fontSize: '14px', color: '#555' }} />
                                              </Box>
                                              <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateRowItemProp(rowIndex, 'link', ((rowItem as any).link || '') + ph)} />
                                            </Box>
                                          </InputAdornment>
                                        )
                                      }}
                                      sx={{ '& .MuiInputBase-root': { height: '32px', fontSize: '12px', bgcolor: '#fff' } }}
                                    />
                                  </Box>

                                  {/* ColSpan */}
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>Col Span</Typography>
                                    <TextField
                                      size="small"
                                      value={(rowItem as any).colSpan || ''}
                                      onChange={(e) => handleUpdateRowItemProp(rowIndex, 'colSpan', e.target.value)}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateRowItemProp(rowIndex, 'colSpan', ((rowItem as any).colSpan || '') + ph)} />
                                          </InputAdornment>
                                        )
                                      }}
                                      sx={{ width: '80px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
                                    />
                                  </Box>
                                  
                                  {/* RowSpan */}
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>Row Span</Typography>
                                    <TextField
                                      size="small"
                                      value={(rowItem as any).rowSpan || ''}
                                      onChange={(e) => handleUpdateRowItemProp(rowIndex, 'rowSpan', e.target.value)}
                                      InputProps={{
                                        endAdornment: (
                                          <InputAdornment position="end">
                                            <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateRowItemProp(rowIndex, 'rowSpan', ((rowItem as any).rowSpan || '') + ph)} />
                                          </InputAdornment>
                                        )
                                      }}
                                      sx={{ width: '80px', '& .MuiInputBase-root': { height: '28px', fontSize: '12px', bgcolor: '#fff' } }}
                                    />
                                  </Box>

                                  {/* Row Media */}
                                  <Box display="flex" alignItems="center" justifyContent="space-between" mt={1}>
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>Media</Typography>
                                    <Box display="flex" alignItems="center" sx={{ border: '1px solid #ccc', borderRadius: '4px', bgcolor: '#fff' }}>
                                      <Tooltip title="None">
                                        <Box onClick={() => setRowMediaType('none')} sx={{ p: 0.5, cursor: 'pointer', borderRight: '1px solid #ccc', bgcolor: rowMediaType === 'none' ? '#e0e0e0' : 'transparent', display: 'flex', alignItems: 'center' }}>
                                          <InfoIcon sx={{ fontSize: '14px', color: '#555' }} />
                                        </Box>
                                      </Tooltip>
                                      <Tooltip title="Image">
                                        <Box onClick={() => setRowMediaType('image')} sx={{ p: 0.5, cursor: 'pointer', borderRight: '1px solid #ccc', bgcolor: rowMediaType === 'image' ? '#e0e0e0' : 'transparent', display: 'flex', alignItems: 'center' }}>
                                          <ImageIcon sx={{ fontSize: '14px', color: '#555' }} />
                                        </Box>
                                      </Tooltip>
                                      <Tooltip title="Close">
                                        <Box onClick={() => setRowMediaType('none')} sx={{ p: 0.5, cursor: 'pointer', bgcolor: '#e0e0e0', display: 'flex', alignItems: 'center' }}>
                                          <CloseIcon sx={{ fontSize: '14px', color: '#555' }} />
                                        </Box>
                                      </Tooltip>
                                    </Box>
                                  </Box>

                                  <Box>
                                    {rowMediaType === 'image' && (
                                      <Box>
                                        <Box sx={{ border: '1px solid #ddd', borderRadius: '3px', overflow: 'hidden', mt: 1, mb: 1.5 }}>
                                          <Box 
                                           onClick={() => handleBrowseRowImage(rowIndex)}
                                            sx={{
                                              height: '110px',
                                              bgcolor: '#ced4da',
                                              display: 'flex',
                                              justifyContent: 'center',
                                              alignItems: 'center',
                                              cursor: 'pointer',
                                              overflow: 'hidden',
                                              '&:hover': { bgcolor: '#c2c9cf' }
                                            }}
                                          >
                                            {((rowItem as any).imageUrl || selectedRowImageUrl) ? (
                                              <img 
                                                src={(rowItem as any).imageUrl || selectedRowImageUrl || ''} 
                                                alt="Selected" 
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                              />
                                            ) : (
                                              <LandscapeIcon sx={{ fontSize: '120px', color: '#e9ecef', opacity: 0.8 }} />
                                            )}
                                          </Box>
                                        </Box>
                                      </Box>
                                    )}
                                  </Box>

                                </Stack>
                              )}
                              {rowInnerTab === 'style' && (
                                <Stack spacing={1.5}>
                                  {/* Background Color */}
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>Background Color</Typography>
                                    <Box display="flex" gap={0.5}>
                                      <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                                        <ColorPicker label="" value={(rowItem as any).backgroundColor || ''} onChange={(c) => handleUpdateRowItemProp(rowIndex, 'backgroundColor', c)} size="small" />
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Text Color */}
                                  <Box display="flex" justifyContent="space-between" alignItems="center">
                                    <Typography sx={{ fontSize: '11px', color: '#666' }}>Text Color</Typography>
                                    <Box display="flex" gap={0.5}>
                                      <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                                        <ColorPicker label="" value={(rowItem as any).color || ''} onChange={(c) => handleUpdateRowItemProp(rowIndex, 'color', c)} size="small" />
                                      </Box>
                                    </Box>
                                  </Box>

                                  {/* Icon/Image Size */}
                                  <Box>
                                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                                      <Typography sx={{ fontSize: '11px', color: '#666', display: 'flex', alignItems: 'center' }}>Icon/Image Size </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={1.5}>
                                      <Slider
                                        value={(rowItem as any).iconSize || 0}
                                        min={0} max={100}
                                        onChange={(e, val) => handleUpdateRowItemProp(rowIndex, 'iconSize', val as number)}
                                        sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                                      />
                                      <TextField
                                        value={(rowItem as any).iconSize || 0}
                                        onChange={(e) => handleUpdateRowItemProp(rowIndex, 'iconSize', Number(e.target.value))}
                                        size="small" type="number"
                                        InputProps={{
                                          endAdornment: (
                                            <InputAdornment position="end">
                                              <PlaceholderSelect iconOnly onSelect={(ph) => handleUpdateRowItemProp(rowIndex, 'iconSize', ((rowItem as any).iconSize || '') + ph)} />
                                            </InputAdornment>
                                          )
                                        }}
                                        sx={{ width: '80px', '& .MuiInputBase-root': { height: '30px', fontSize: '11px', bgcolor: '#fff' } }}
                                      />
                                    </Box>
                                  </Box>
                                </Stack>
                              )}
                            </>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                <Button
                  variant="contained"
                  fullWidth
                  disableElevation
                  onClick={handleAddRowItem}
                  startIcon={<AddIcon sx={{ fontSize: '16px' }} />}
                  sx={{ mt: 1, bgcolor: '#55595c', color: '#fff', textTransform: 'none', fontSize: '12px', fontWeight: 500, py: 1, '&:hover': { bgcolor: '#444' } }}
                >
                  Add Item
                </Button>
              </Box>
              </AccordionDetails>
            </Accordion>

          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={0}>
            {/* Global Table Style Accordion */}
            <Accordion
              expanded={styleExpandedSection === 'global'}
              onChange={() => setStyleExpandedSection(styleExpandedSection === 'global' ? false : 'global')}
              disableGutters
              sx={{ boxShadow: 'none', border: 'none', borderBottom: '1px solid #e0e0e0', '&:before': { display: 'none' }, bgcolor: 'transparent' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: '14px', color: '#6d7882', transform: styleExpandedSection === 'global' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
                sx={{ minHeight: '38px', '&.Mui-expanded': { minHeight: '38px' }, px: 0, flexDirection: 'row-reverse', gap: 0.5, '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' }, '& .MuiAccordionSummary-content': { my: 0, '&.Mui-expanded': { my: 0 } } }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Global Settings</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 2 }}>
                <Stack spacing={2}>
                  {/* Table Width */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '12px', color: '#555' }}>Table Width</Typography>
                    <TextField
                      value={tableEditorOptions.width || ''}
                      onChange={handleChange('width')}
                      placeholder="e.g. 100%, 500px"
                      size="small"
                      sx={{ width: '160px' }}
                      InputProps={{
                        sx: { fontSize: '12px', bgcolor: '#fff' }
                      }}
                    />
                  </Box>

                  {/* Table Alignment */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '12px', color: '#555' }}>Table Alignment</Typography>
                    <ToggleButtonGroup
                      size="small"
                      value={tableEditorOptions.tableAlign || 'center'}
                      onChange={(e, newAlign) => debouncedUpdate({ tableAlign: newAlign || 'center' })}
                      exclusive
                      sx={{ '& .MuiToggleButton-root': { py: 0.5, px: 1, bgcolor: '#fff' } }}
                    >
                      <ToggleButton value="left"><FormatAlignLeftIcon sx={{ fontSize: '14px' }} /></ToggleButton>
                      <ToggleButton value="center"><FormatAlignCenterIcon sx={{ fontSize: '14px' }} /></ToggleButton>
                      <ToggleButton value="right"><FormatAlignRightIcon sx={{ fontSize: '14px' }} /></ToggleButton>
                    </ToggleButtonGroup>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
            {/* Table Head Accordion */}
            <Accordion
              expanded={styleExpandedSection === 'head'}
              onChange={() => setStyleExpandedSection(styleExpandedSection === 'head' ? false : 'head')}
              disableGutters
              sx={{ boxShadow: 'none', border: 'none', borderBottom: '1px solid #e0e0e0', '&:before': { display: 'none' }, bgcolor: 'transparent' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: '14px', color: '#6d7882', transform: styleExpandedSection === 'head' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
                sx={{ minHeight: '38px', '&.Mui-expanded': { minHeight: '38px' }, px: 0, flexDirection: 'row-reverse', gap: 0.5, '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' }, '& .MuiAccordionSummary-content': { my: 0, '&.Mui-expanded': { my: 0 } } }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Table Head</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 2 }}>
                <Stack spacing={2}>

                  {/* NEW HEAD TYPOGRAPHY ACCORDION */}
                  <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', p: 0, '& .MuiAccordionSummary-content': { my: 1 } }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Head Typography</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {/* Family */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '12px', color: '#555' }}>Family</Typography>
                        <FormControl size="small" sx={{ width: '160px' }}>
                          <Select
                            value={tableEditorOptions.headFontFamily || 'Global'}
                            onChange={(e) => debouncedUpdate({ headFontFamily: e.target.value as string })}
                            sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                            MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                          >
                            {FONT_FAMILIES.map((font) => (
                              <MenuItem key={font} value={font} sx={{ fontSize: '12px', fontFamily: font !== 'Global' ? font : 'inherit' }}>
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
                            value={tableEditorOptions.headFontSize || 14}
                            min={10} max={100}
                            onChange={(e, val) => debouncedUpdate({ headFontSize: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.headFontSize || 14}
                            onChange={(e) => debouncedUpdate({ headFontSize: Number(e.target.value) })}
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
                            value={tableEditorOptions.headFontWeight || '400'}
                            onChange={(e) => debouncedUpdate({ headFontWeight: e.target.value as string })}
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
                            value={tableEditorOptions.headTextTransform || 'none'}
                            onChange={(e) => debouncedUpdate({ headTextTransform: e.target.value as any })}
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
                            value={tableEditorOptions.headFontStyle || 'normal'}
                            onChange={(e) => debouncedUpdate({ headFontStyle: e.target.value as string })}
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
                            value={tableEditorOptions.headTextDecoration || 'none'}
                            onChange={(e) => debouncedUpdate({ headTextDecoration: e.target.value as string })}
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
                            value={tableEditorOptions.headLineHeight || 0}
                            min={0} max={150}
                            onChange={(e, val) => debouncedUpdate({ headLineHeight: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.headLineHeight || 0}
                            onChange={(e) => debouncedUpdate({ headLineHeight: Number(e.target.value) })}
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
                            value={tableEditorOptions.headLetterSpacing || 0}
                            min={-5} max={20} step={0.5}
                            onChange={(e, val) => debouncedUpdate({ headLetterSpacing: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.headLetterSpacing || 0}
                            onChange={(e) => debouncedUpdate({ headLetterSpacing: Number(e.target.value) })}
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
                            value={tableEditorOptions.headWordSpacing || 0}
                            min={-5} max={50} step={1}
                            onChange={(e, val) => debouncedUpdate({ headWordSpacing: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.headWordSpacing || 0}
                            onChange={(e) => debouncedUpdate({ headWordSpacing: Number(e.target.value) })}
                            size="small" type="number"
                            sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                          />
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>





                  {/* Border Type */}
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: 600, mb: 0.5 }}>Border Type</Typography>
                    <FormControl size="small" fullWidth>
                      <Select 
                        value={tableEditorOptions.headBorderType || 'default'} 
                        onChange={(e) => debouncedUpdate({ headBorderType: e.target.value as string })} 
                        sx={{ fontSize: '11px', height: '30px' }}
                      >
                        <MenuItem value="default" sx={{ fontSize: '11px' }}>Default</MenuItem>
                        <MenuItem value="none" sx={{ fontSize: '11px' }}>None</MenuItem>
                        <MenuItem value="solid" sx={{ fontSize: '11px' }}>Solid</MenuItem>
                        <MenuItem value="dashed" sx={{ fontSize: '11px' }}>Dashed</MenuItem>
                        <MenuItem value="dotted" sx={{ fontSize: '11px' }}>Dotted</MenuItem>
                        <MenuItem value="double" sx={{ fontSize: '11px' }}>Double</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Background Color */}
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography sx={{ fontSize: '12px', color: '#555' }}>Background Color</Typography>
                    <Box display="flex" gap={0.5}>
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                        <ColorPicker
                          label=""
                          value={tableEditorOptions.headBackgroundColor || ''}
                          onChange={handleColorChange('headBackgroundColor')}
                          size="small"
                        />
                      </Box>
                    </Box>
                  </Box>

                  {/* Title Section */}
                  <Box mt={1}>
                    <Typography sx={{ fontSize: '12px', color: '#333', fontWeight: 700, mb: 1, borderBottom: '1px solid #f0f0f0', pb: 0.5 }}>Title</Typography>
                    <Stack spacing={1.5}>
                      
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '12px', color: '#555' }}>Color</Typography>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.headColor || ''} onChange={handleColorChange('headColor')} size="small" />
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                  {/* Icon/Image Section */}
                  <Box mt={1}>
                    <Typography sx={{ fontSize: '12px', color: '#333', fontWeight: 700, mb: 1, borderBottom: '1px solid #f0f0f0', pb: 0.5 }}>Icon/Image</Typography>
                    <Stack spacing={1.5}>
                      {/* Spacing */}
                      <SpacingControl
                        label="Spacing"
                        value={tableEditorOptions.headIconSpacing}
                        onChange={(side, v) => debouncedUpdate({ headIconSpacing: { ...(tableEditorOptions.headIconSpacing || { top: 0, right: 0, bottom: 0, left: 0 }), [side]: v } })}
                        onChangeAll={(v) => debouncedUpdate({ headIconSpacing: { top: v, right: v, bottom: v, left: v } })}
                        unit={tableEditorOptions.headIconSpacingUnit || 'px'}
                        onUnitChange={(u) => debouncedUpdate({ headIconSpacingUnit: u })}
                      />

                      {/* Icon Size */}
                      <Box>
                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.5}>
                          <Typography sx={{ fontSize: '12px', color: '#555' }}>Icon Size</Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={2}>
                          <Slider 
                            size="small" 
                            value={tableEditorOptions.headIconSize || 60} 
                            onChange={(e, val) => debouncedUpdate({ headIconSize: val as number })} 
                            min={0} 
                            max={200} 
                            sx={{ flex: 1, '& .MuiSlider-thumb': { width: 14, height: 14 } }} 
                          />
                          <TextField 
                            size="small" 
                            value={tableEditorOptions.headIconSize || 60}
                            onChange={(e) => debouncedUpdate({ headIconSize: Number(e.target.value) })}
                            sx={{ width: '45px', '& .MuiOutlinedInput-root': { borderRadius: '3px' } }} 
                            InputProps={{ sx: { fontSize: '11px', height: '24px' } }} 
                          />
                          <FormatListBulletedIcon sx={{ fontSize: '16px', color: '#777' }} />
                        </Box>
                      </Box>


                      {/* Icon Color */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '12px', color: '#555' }}>Icon Color</Typography>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.headIconColor || ''} onChange={handleColorChange('headIconColor')} size="small" />
                        </Box>
                      </Box>
                    </Stack>
                  </Box>

                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Table Row Accordion */}
            <Accordion
              expanded={styleExpandedSection === 'row'}
              onChange={() => setStyleExpandedSection(styleExpandedSection === 'row' ? false : 'row')}
              disableGutters
              sx={{ boxShadow: 'none', border: 'none', borderBottom: '1px solid #e0e0e0', '&:before': { display: 'none' }, bgcolor: 'transparent' }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ fontSize: '14px', color: '#6d7882', transform: styleExpandedSection === 'row' ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s' }} />}
                sx={{ minHeight: '38px', '&.Mui-expanded': { minHeight: '38px' }, px: 0, flexDirection: 'row-reverse', gap: 0.5, '& .MuiAccordionSummary-expandIconWrapper': { transform: 'none !important' }, '& .MuiAccordionSummary-content': { my: 0, '&.Mui-expanded': { my: 0 } } }}
              >
                <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882' }}>Table Row</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0, pb: 2 }}>
                <Stack spacing={2}>

                  {/* NEW ROW TYPOGRAPHY ACCORDION */}
                  <Accordion disableGutters defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
                    <AccordionSummary expandIcon={<ArrowDropDownIcon />} sx={{ minHeight: '40px', p: 0, '& .MuiAccordionSummary-content': { my: 1 } }}>
                      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>Row Typography</Typography>
                    </AccordionSummary>
                    <AccordionDetails sx={{ p: 0, pb: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                      {/* Family */}
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: '12px', color: '#555' }}>Family</Typography>
                        <FormControl size="small" sx={{ width: '160px' }}>
                          <Select
                            value={tableEditorOptions.rowFontFamily || 'Global'}
                            onChange={(e) => debouncedUpdate({ rowFontFamily: e.target.value as string })}
                            sx={{ fontSize: '12px', bgcolor: '#fff', height: '30px' }}
                            MenuProps={{ disablePortal: true, sx: { zIndex: 999999 } }}
                          >
                            {FONT_FAMILIES.map((font) => (
                              <MenuItem key={font} value={font} sx={{ fontSize: '12px', fontFamily: font !== 'Global' ? font : 'inherit' }}>
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
                            value={tableEditorOptions.rowFontSize || 14}
                            min={10} max={100}
                            onChange={(e, val) => debouncedUpdate({ rowFontSize: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.rowFontSize || 14}
                            onChange={(e) => debouncedUpdate({ rowFontSize: Number(e.target.value) })}
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
                            value={tableEditorOptions.rowFontWeight || '400'}
                            onChange={(e) => debouncedUpdate({ rowFontWeight: e.target.value as string })}
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
                            value={tableEditorOptions.rowTextTransform || 'none'}
                            onChange={(e) => debouncedUpdate({ rowTextTransform: e.target.value as any })}
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
                            value={tableEditorOptions.rowFontStyle || 'normal'}
                            onChange={(e) => debouncedUpdate({ rowFontStyle: e.target.value as string })}
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
                            value={tableEditorOptions.rowTextDecoration || 'none'}
                            onChange={(e) => debouncedUpdate({ rowTextDecoration: e.target.value as string })}
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
                            value={tableEditorOptions.rowLineHeight || 0}
                            min={0} max={150}
                            onChange={(e, val) => debouncedUpdate({ rowLineHeight: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.rowLineHeight || 0}
                            onChange={(e) => debouncedUpdate({ rowLineHeight: Number(e.target.value) })}
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
                            value={tableEditorOptions.rowLetterSpacing || 0}
                            min={-5} max={20} step={0.5}
                            onChange={(e, val) => debouncedUpdate({ rowLetterSpacing: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.rowLetterSpacing || 0}
                            onChange={(e) => debouncedUpdate({ rowLetterSpacing: Number(e.target.value) })}
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
                            value={tableEditorOptions.rowWordSpacing || 0}
                            min={-5} max={50} step={1}
                            onChange={(e, val) => debouncedUpdate({ rowWordSpacing: val as number })}
                            sx={{ color: '#ccc', '& .MuiSlider-thumb': { bgcolor: '#fff', border: '2px solid #ccc' } }}
                          />
                          <TextField
                            value={tableEditorOptions.rowWordSpacing || 0}
                            onChange={(e) => debouncedUpdate({ rowWordSpacing: Number(e.target.value) })}
                            size="small" type="number"
                            sx={{ width: '70px', '& .MuiInputBase-root': { height: '30px', fontSize: '12px', bgcolor: '#fff' } }}
                          />
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </Accordion>





                  {/* Border Type */}
                  <Box>
                    <Typography sx={{ fontSize: '12px', color: '#555', fontWeight: 600, mb: 0.5 }}>Border Type</Typography>
                    <FormControl size="small" fullWidth>
                      <Select 
                        value={tableEditorOptions.rowBorderType || 'default'} 
                        onChange={(e) => debouncedUpdate({ rowBorderType: e.target.value as string })} 
                        sx={{ fontSize: '11px', height: '30px' }}
                      >
                        <MenuItem value="default" sx={{ fontSize: '11px' }}>Default</MenuItem>
                        <MenuItem value="none" sx={{ fontSize: '11px' }}>None</MenuItem>
                        <MenuItem value="solid" sx={{ fontSize: '11px' }}>Solid</MenuItem>
                        <MenuItem value="dashed" sx={{ fontSize: '11px' }}>Dashed</MenuItem>
                        <MenuItem value="dotted" sx={{ fontSize: '11px' }}>Dotted</MenuItem>
                        <MenuItem value="double" sx={{ fontSize: '11px' }}>Double</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>


                  {/* Color settings list */}
                  <Stack spacing={1.5}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '12px', color: '#555' }}>Background Color (Even)</Typography>
                      <Box display="flex" gap={0.5}>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.rowBackgroundColorEven || ''} onChange={handleColorChange('rowBackgroundColorEven')} size="small" />
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '12px', color: '#555' }}>Background Color (Odd)</Typography>
                      <Box display="flex" gap={0.5}>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.rowBackgroundColorOdd || ''} onChange={handleColorChange('rowBackgroundColorOdd')} size="small" />
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '12px', color: '#555' }}>Color (Even)</Typography>
                      <Box display="flex" gap={0.5}>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.rowColorEven || ''} onChange={handleColorChange('rowColorEven')} size="small" />
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '12px', color: '#555' }}>Color (Odd)</Typography>
                      <Box display="flex" gap={0.5}>
                        <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                          <ColorPicker label="" value={tableEditorOptions.rowColorOdd || ''} onChange={handleColorChange('rowColorOdd')} size="small" />
                        </Box>
                      </Box>
                    </Box>

                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography sx={{ fontSize: '12px', color: '#555' }}>Link Color</Typography>
                      <Box sx={{ bgcolor: '#fff', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', alignItems: 'center', height: '26px' }}>
                        <ColorPicker label="" value={tableEditorOptions.rowLinkColor || ''} onChange={handleColorChange('rowLinkColor')} size="small" />
                      </Box>
                    </Box>
                  </Stack>

                  

                </Stack>
              </AccordionDetails>
            </Accordion>
            
            {/* Overall Table Border */}
            <Box mt={2}>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#6d7882', mb: 1.5 }}>Table Border</Typography>
              <AdvancedBorderControl
                borderType={tableEditorOptions.borderStyle || 'solid'}
                borderWidth={{
                  top: tableEditorOptions.borderWidth || 0,
                  right: tableEditorOptions.borderWidth || 0,
                  bottom: tableEditorOptions.borderWidth || 0,
                  left: tableEditorOptions.borderWidth || 0
                }}
                borderColor={tableEditorOptions.borderColor || '#cccccc'}
                borderRadius={{
                  top: tableEditorOptions.borderRadius || 0,
                  right: tableEditorOptions.borderRadius || 0,
                  bottom: tableEditorOptions.borderRadius || 0,
                  left: tableEditorOptions.borderRadius || 0
                }}
                borderRadiusUnit={tableEditorOptions.borderRadiusUnit || 'px'}
                onBorderRadiusUnitChange={(u) => debouncedUpdate({ borderRadiusUnit: u as any })}
                boxShadow={tableEditorOptions.boxShadow || 'none'}
                hideBorderRadius={true}
                onChange={(isHover, prop, value) => {
                  if (prop === 'borderType') debouncedUpdate({ borderStyle: value });
                  if (prop === 'borderColor') debouncedUpdate({ borderColor: value });
                  if (prop === 'borderWidthAll') debouncedUpdate({ borderWidth: value });
                  if (prop === 'borderRadius') debouncedUpdate({ borderRadius: value.top });
                  if (prop === 'boxShadow') debouncedUpdate({ boxShadow: value });
                }}
              />
            </Box>

          </Stack>


        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#333', mb: 1 }}>Table Head Padding</Typography>
              <SpacingControl
                label="Padding"
                value={tableEditorOptions.headPadding}
                onChange={(side, v) => debouncedUpdate({ headPadding: { ...(tableEditorOptions.headPadding || { top: 0, right: 0, bottom: 0, left: 0 }), [side]: v } })}
                onChangeAll={(v) => debouncedUpdate({ headPadding: { top: v, right: v, bottom: v, left: v } })}
                unit={tableEditorOptions.headPaddingUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ headPaddingUnit: u })}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: '#333', mb: 1 }}>Table Row Padding</Typography>
              <SpacingControl
                label="Padding"
                value={tableEditorOptions.rowPadding}
                onChange={(side, v) => debouncedUpdate({ rowPadding: { ...(tableEditorOptions.rowPadding || { top: 0, right: 0, bottom: 0, left: 0 }), [side]: v } })}
                onChangeAll={(v) => debouncedUpdate({ rowPadding: { top: v, right: v, bottom: v, left: v } })}
                unit={tableEditorOptions.rowPaddingUnit || 'px'}
                onUnitChange={(u) => debouncedUpdate({ rowPaddingUnit: u })}
              />
            </Box>
          </Stack>
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Table"
      description="Insert a data table into your layout."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      disableStyleInterception={true}
    />
  );
};

export default TableWidgetEditor;
