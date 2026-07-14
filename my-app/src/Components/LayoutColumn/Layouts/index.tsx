import React, { useState } from 'react';
import {
  Accordion, AccordionSummary,
  AccordionDetails, Typography,
  Box, Paper, InputBase, IconButton,
} from '@mui/material';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import SearchIcon from '@mui/icons-material/Search';

// Import Layouts
import GeneralLayout, { layoutOptions } from './GeneralLayout';
import MainLayout, { basicsWidgets } from './basicsLayout';
import WooCommerceLayout, { wooCommerceWidgets } from './WooCommerceLayout';
// import FormsLayout, { formsWidgets } from './FormsLayout';
import LayoutBlockLayout, { blockLayoutWidgets } from './BlockLayout';
import ExtraLayout, { extraWidgets } from './ExtraLayout';

const OverallLayout = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  // Helper to check matches
  const hasMatches = (items: { name?: string }[], term: string) => {
    if (!term) return true;
    return items.some(item =>
      (item.name && item.name.toLowerCase().includes(term.toLowerCase()))
    );
  };

  const hasGeneralMatches = !searchTerm || layoutOptions.some(col =>
    `${col} Column`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    'layout'.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const showGeneral = hasGeneralMatches;
  const showBasics = hasMatches(basicsWidgets, searchTerm);
  const showLayoutBlocks = hasMatches(blockLayoutWidgets, searchTerm);
  const showExtra = hasMatches(extraWidgets, searchTerm);
  const showWooCommerce = hasMatches(wooCommerceWidgets, searchTerm);

  // Common Accordion Styles for Elementor Look
  const accordionStyles = {
    boxShadow: 'none',
    border: 'none',
    '&:before': { display: 'none' }, // Remove default top border
    '&.Mui-expanded': { margin: 0 },
    backgroundColor: 'transparent',
  };

  const summaryStyles = {
    minHeight: '40px',
    borderBottom: '1px solid #e7e9eb',
    flexDirection: 'row-reverse', // Put icon on left
    '&.Mui-expanded': { 
      minHeight: '40px', 
      borderBottom: '1px solid #e7e9eb',
      '& .MuiAccordionSummary-expandIconWrapper': {
        transform: 'rotate(90deg)',
      }
    },
    '& .MuiAccordionSummary-content': { 
      margin: '12px 0',
      marginLeft: '8px',
    },
    '& .MuiAccordionSummary-expandIconWrapper': {
      color: '#6d7882',
      transition: 'transform 0.3s',
    }
  };

  const headerTypographyStyles = {
    fontSize: '13px', // Increased slightly for better visibility
    fontWeight: 700,
    textTransform: 'none', // Removed 'uppercase'
    letterSpacing: '0.2px',
    color: '#000000',
  };

  const detailsStyles = {
    padding: '0px',
  };

  return (
    <Box
      sx={{
        width: '100%', height: '100%',
        position: 'relative', overflow: 'hidden',
        display: 'flex', flexDirection: 'column',
        bgcolor: '#f9f9f9' // Light gray background for panel content
      }}
    >
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          // Custom Scrollbar
          '&::-webkit-scrollbar': {
            width: '6px',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#ddd',
            borderRadius: '3px',
          },
        }}
      >
        <Box sx={{ p: '15px 20px', position: 'sticky', top: 0, bgcolor: '#fff', borderBottom: '1px solid #e7e9eb', zIndex: 10, overflow: 'visible' }}>
          <Box
            sx={{
              p: '4px 12px',
              display: 'flex',
              alignItems: 'center',
              width: '100%',
              bgcolor: '#f1f3f5',
              borderRadius: '6px',
              minHeight: '35px',
              transition: 'all 0.2s',
              overflow: 'visible',
              boxSizing: 'border-box',
              border: '1px solid transparent',
              '&:focus-within': {
                bgcolor: '#fff',
                borderColor: '#93003c',
                boxShadow: '0 0 0 2px rgba(147, 0, 60, 0.1)'
              }
            }}
          >
            <SearchIcon sx={{ color: '#888', mr: 1, fontSize: '18px' }} />
            <InputBase
              sx={{
                ml: 0,
                flex: 1,
                fontSize: '13px',
                color: '#495157',
                border: 'none !important',
                outline: 'none !important',
                boxShadow: 'none !important',
                backgroundColor: 'transparent !important',
                '&::before': {
                  display: 'none',
                },
                '&::after': {
                  display: 'none',
                },
                '& input': {
                  outline: 'none !important',
                  border: 'none !important',
                  padding: '0 !important',
                  boxShadow: 'none !important',
                  backgroundColor: 'transparent !important',
                  '&:focus': {
                    outline: 'none !important',
                    border: 'none !important',
                    boxShadow: 'none !important',
                  }
                },
                '& .MuiInputBase-input': {
                  padding: '0 !important',
                  border: 'none !important',
                  outline: 'none !important',
                  boxShadow: 'none !important',
                  backgroundColor: 'transparent !important',
                },
                '&.Mui-focused': {
                  border: 'none !important',
                  outline: 'none !important',
                  boxShadow: 'none !important',
                }
              }}
              placeholder="Search Widget..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </Box>
        </Box>

        {/* General Layout */}
        {showGeneral && (
          <Accordion defaultExpanded disableGutters sx={accordionStyles}>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon sx={{ fontSize: '18px' }} />} sx={summaryStyles}>
              <Typography sx={headerTypographyStyles}>Layout</Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles}>
              <GeneralLayout searchTerm={searchTerm} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Basics Layout */}
        {showBasics && (
          <Accordion defaultExpanded disableGutters sx={accordionStyles}>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon sx={{ fontSize: '18px' }} />} sx={summaryStyles}>
              <Typography sx={headerTypographyStyles}>Basic</Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles}>
              <MainLayout searchTerm={searchTerm} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Layout Block */}
        {showLayoutBlocks && (
          <Accordion defaultExpanded disableGutters sx={accordionStyles}>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon sx={{ fontSize: '18px' }} />} sx={summaryStyles}>
              <Typography sx={headerTypographyStyles}>Structure</Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles}>
              <LayoutBlockLayout searchTerm={searchTerm} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* Extra Block  */}
        {showExtra && (
          <Accordion defaultExpanded disableGutters sx={accordionStyles}>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon sx={{ fontSize: '18px' }} />} sx={summaryStyles}>
              <Typography sx={headerTypographyStyles}>General</Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles}>
              <ExtraLayout searchTerm={searchTerm} />
            </AccordionDetails>
          </Accordion>
        )}

        {/* WooCommerce */}
        {showWooCommerce && (
          <Accordion defaultExpanded disableGutters sx={accordionStyles}>
            <AccordionSummary expandIcon={<KeyboardArrowRightIcon sx={{ fontSize: '18px' }} />} sx={summaryStyles}>
              <Typography sx={headerTypographyStyles}>Woocommerce</Typography>
            </AccordionSummary>
            <AccordionDetails sx={detailsStyles}>
              <WooCommerceLayout searchTerm={searchTerm} />
            </AccordionDetails>
          </Accordion>
        )}

        {!showGeneral && !showBasics && !showLayoutBlocks && !showExtra && !showWooCommerce && (
          <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
            <Typography sx={{ fontSize: '13px' }}>No matching widgets found.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default OverallLayout;
