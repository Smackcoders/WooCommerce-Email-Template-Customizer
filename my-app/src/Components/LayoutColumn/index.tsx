import React, { useState, useEffect } from "react";
import { Box, Tabs, Tab } from "@mui/material";
import OverallLayout from "./Layouts";
import EditorPanel from "./Layouts/EditorPanel";
import { ThemeProvider } from "@mui/material/styles";
import theme from "../../Constants/Theme";
import { useSelector } from "react-redux";
import { RootState } from "../../Store/store";
import GridViewIcon from '@mui/icons-material/GridView';
import TuneIcon from '@mui/icons-material/Tune';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Box
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      sx={{
        height: 'calc(100% - 50px)',
        overflowY: 'auto',
        overflowX: 'hidden',
        // Hide scrollbar for Chrome, Safari and Opera
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#ddd',
          borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#ccc',
        },
      }}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </Box>
  );
}

const LayoutColumn = () => {
  const [value, setValue] = useState(0);
  const { editorOpen, selectedBlockForEditor, selectedWidgetIndex, selectedContentType, selectionCount } = useSelector((state: RootState) => state.workspace);

  // Auto-switch to Editor tab when a selection happens or editor opens
  useEffect(() => {
    if (editorOpen || selectedBlockForEditor !== null) {
      setValue(1);
    }
  }, [editorOpen, selectedBlockForEditor, selectedWidgetIndex, selectedContentType, selectionCount]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          height: "100%",
          background: "#fff",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          zIndex: 1,
          overflow: "hidden",
          fontFamily: "'Roboto', sans-serif",
        }}
      >
        <Box sx={{
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
          zIndex: 10,
          background: '#fff',
        }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="sidebar tabs"
            variant="fullWidth"
            TabIndicatorProps={{ sx: { height: 3, bgcolor: '#000000' } }}
            sx={{
              height: '50px',
              minHeight: '50px',
              borderBottom: '1px solid #e7e9eb',
              '& .MuiTab-root': {
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '14px',
                color: '#6d7882',
                height: '50px',
                minHeight: '50px',
                padding: '12px 16px',
                '&.Mui-selected': {
                  color: '#000000',
                },
                '&:hover': {
                  color: '#000000',
                }
              }
            }}
          >
            <Tab icon={<GridViewIcon fontSize="small" />} iconPosition="start" label="Elements" />
            <Tab icon={<TuneIcon fontSize="small" />} iconPosition="start" label={selectedBlockForEditor ? "Editor" : "Global"} />
          </Tabs>
        </Box>

        <CustomTabPanel value={value} index={0}>
          <OverallLayout />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          <EditorPanel />
        </CustomTabPanel>
      </Box>
    </ThemeProvider>
  );
};

export default LayoutColumn;
