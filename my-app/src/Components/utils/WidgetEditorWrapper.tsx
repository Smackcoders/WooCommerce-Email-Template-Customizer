import React, { useState } from 'react';
import { Box, Typography, IconButton, Tooltip, Tabs, Tab } from '@mui/material';
import { 
  Close as CloseIcon, 
  Delete as DeleteIcon, 
  GridView as GridViewIcon,
} from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../Store/store';
import { updateSelectedWidgetStyles } from '../../Store/Slice/workspaceSlice';
import GlobalStyleTab from './GlobalStyleTab';
import { AdvancedTabContent } from './SharedStyleTab';

interface WidgetEditorWrapperProps {
  title: string;
  description: string;
  onClose: () => void;
  onDelete: () => void;
  tabs: {
    label: string;
    icon?: React.ReactNode;
    labelColor?: string;
    content: React.ReactNode;
  }[];
  disableStyleInterception?: boolean;
  hideAdvancedLayout?: boolean;
}

const WidgetEditorWrapper: React.FC<WidgetEditorWrapperProps> = ({
  title,
  description,
  onClose,
  onDelete,
  tabs,
  disableStyleInterception = false,
  hideAdvancedLayout = false
}) => {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);

  const { blocks, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, viewportMode } = useSelector(
    (state: RootState) => state.workspace
  );

  const selectedWidget = React.useMemo(() => {
    if (!selectedBlockForEditor || selectedColumnIndex === null || selectedWidgetIndex === null) return null;
    const block = blocks.find(b => b.id === selectedBlockForEditor);
    const col = block?.columns[selectedColumnIndex];
    return col?.widgetContents[selectedWidgetIndex];
  }, [blocks, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex]);

  const subStyles = React.useMemo(() => {
    if (!selectedWidget?.contentData) return {};
    try {
      return JSON.parse(selectedWidget.contentData);
    } catch {
      return {};
    }
  }, [selectedWidget]);

  const activeStyles = React.useMemo(() => {
    if (viewportMode === 'mobile') {
      return { ...subStyles, ...(subStyles.mobileStyles || {}) };
    }
    return subStyles;
  }, [subStyles, viewportMode]);

  const handleUpdateStyles = React.useCallback((updatedFields: Record<string, any>) => {
    dispatch(updateSelectedWidgetStyles(updatedFields));
  }, [dispatch]);

  // Reset to first tab whenever the widget/element being edited changes
  React.useEffect(() => {
    setActiveTab(0);
  }, [title]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Intercept tabs to replace the Style/Styles tab content with GlobalStyleTab
  // and the Advanced tab content with AdvancedTabContent.
  const interceptedTabs = React.useMemo(() => {
    if (disableStyleInterception) {
      return tabs;
    }
    const mapped = tabs.map(tab => {
      const labelLower = tab.label.toLowerCase();
      if (labelLower === 'style' || labelLower === 'styles') {
        return {
          ...tab,
          label: 'Style',
          content: (
            <Box sx={{ p: 2, bgcolor: '#fff' }}>
              <GlobalStyleTab
                subStyles={activeStyles}
                onUpdate={handleUpdateStyles}
                contentType={selectedWidget?.contentType}
              />
            </Box>
          )
        };
      }
      if (labelLower === 'advanced') {
        return {
          ...tab,
          label: 'Advanced',
          content: (
            <Box sx={{ p: 2, bgcolor: '#fff' }}>
              <AdvancedTabContent
                subStyles={activeStyles}
                onUpdate={handleUpdateStyles}
                hideLayout={hideAdvancedLayout}
              />
            </Box>
          )
        };
      }
      return tab;
    });

    const hasAdvanced = mapped.some(tab => tab.label.toLowerCase() === 'advanced');
    if (!hasAdvanced) {
      mapped.push({
        label: 'Advanced',
        content: (
          <Box sx={{ p: 2, bgcolor: '#fff' }}>
            <AdvancedTabContent
              subStyles={activeStyles}
              onUpdate={handleUpdateStyles}
              hideLayout={hideAdvancedLayout}
            />
          </Box>
        )
      });
    }

    return mapped;
  }, [tabs, subStyles, handleUpdateStyles, hideAdvancedLayout]);

  return (
    <Box sx={{ bgcolor: '#f5f5f5', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Elementor Style Header */}
      <Box sx={{ 
        p: '12px 15px', 
        bgcolor: '#ffffff', 
        borderBottom: '1px solid #d5dadf',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '50px',
        boxSizing: 'border-box'
      }}>
        {/* Left: Back to elements list */}
        <Box display="flex" alignItems="center" gap={1}>
          <Tooltip title="Back to Widgets">
            <IconButton onClick={onClose} size="small" sx={{ p: '6px', color: '#a4afb7', '&:hover': { color: '#54595f', bgcolor: '#f5f5f5' } }}>
              <GridViewIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
          <Typography sx={{ 
            fontSize: '13px', 
            fontWeight: 700, 
            color: '#23282d',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Edit {title}
          </Typography>
        </Box>

        {/* Right: Actions */}
        <Box display="flex" gap={0.5}>
          <Tooltip title="Delete Widget">
            <IconButton onClick={onDelete} size="small" sx={{ p: '6px', color: '#a4afb7', '&:hover': { color: '#b32121', bgcolor: '#fdf3f3' } }}>
              <DeleteIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Close Panel">
            <IconButton onClick={onClose} size="small" sx={{ p: '6px', color: '#a4afb7', '&:hover': { color: '#54595f', bgcolor: '#f5f5f5' } }}>
              <CloseIcon sx={{ fontSize: '18px' }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {viewportMode === 'mobile' && (
        <Box sx={{ bgcolor: '#e3f2fd', p: 1, borderBottom: '1px solid #90caf9', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography sx={{ fontSize: '11px', color: '#1565c0', fontWeight: 600 }}>
            📱 Mobile Editing Mode
          </Typography>
        </Box>
      )}

      {/* Elementor Style Tabs */}
      <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #d5dadf' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ 
            style: { 
              backgroundColor: '#000000',
              height: '3px'
            } 
          }}
          sx={{
            minHeight: '40px',
            height: '40px',
            '& .MuiTab-root': {
              minHeight: '40px',
              height: '40px',
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              color: '#a4afb7',
              padding: '0 10px',
              '&.Mui-selected': {
                color: '#23282d',
              },
              '&:hover': {
                color: '#23282d',
              }
            }
          }}
        >
          {interceptedTabs.map((tab, index) => (
            <Tab key={index} label={tab.label} />
          ))}
        </Tabs>
      </Box>

      {/* Tab Panel Content */}
      <Box sx={{ 
        flex: 1, 
        overflowY: 'auto', 
        bgcolor: '#ffffff',
        // Scrollbar customization
        '&::-webkit-scrollbar': {
          width: '5px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#cccccc',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#a4afb7',
          borderRadius: '3px',
        },
      }}>
        {interceptedTabs[activeTab] && (
          <Box sx={{ height: '100%' }}>
            {interceptedTabs[activeTab].content}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WidgetEditorWrapper;
