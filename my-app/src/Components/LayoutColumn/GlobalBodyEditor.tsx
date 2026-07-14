import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Box, Typography, Stack, Tabs, Tab, Tooltip, IconButton } from "@mui/material";
import GridViewIcon from '@mui/icons-material/GridView';
import CloseIcon from "@mui/icons-material/Close";
import ColorPicker from "../utils/ColorPicker";
import { RootState } from "../../Store/store";
import { updateBodyStyle, closeEditor } from "../../Store/Slice/workspaceSlice";

const GlobalBodyEditor = () => {
    const dispatch = useDispatch();
    const bodyStyle = useSelector((state: RootState) => state.workspace.bodyStyle);
    const [activeTab, setActiveTab] = useState(0);

    const handleBgColorChange = (color: string) => {
        dispatch(updateBodyStyle({ ...bodyStyle, backgroundColor: color }));
    };

    const handleCloseEditor = () => {
        dispatch(closeEditor());
    };

    return (
        <Box sx={{ bgcolor: '#f5f5f5', height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Header */}
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
                <Box display="flex" alignItems="center" gap={1}>
                    <Tooltip title="Back to Widgets">
                        <IconButton onClick={handleCloseEditor} size="small" sx={{ p: '6px', color: '#a4afb7', '&:hover': { color: '#54595f', bgcolor: '#f5f5f5' } }}>
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
                        Global Settings
                    </Typography>
                </Box>
                <Tooltip title="Close Panel">
                    <IconButton onClick={handleCloseEditor} size="small" sx={{ p: '6px', color: '#a4afb7', '&:hover': { color: '#54595f', bgcolor: '#f5f5f5' } }}>
                        <CloseIcon sx={{ fontSize: '18px' }} />
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tabs */}
            <Box sx={{ bgcolor: '#ffffff', borderBottom: '1px solid #d5dadf' }}>
                <Tabs
                    value={activeTab}
                    onChange={(e, val) => setActiveTab(val)}
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
                    <Tab label="Style" />
                    <Tab label="Advanced" />
                </Tabs>
            </Box>

            {/* Tab Contents */}
            <Box sx={{ 
                flex: 1, 
                overflowY: 'auto', 
                bgcolor: '#ffffff',
                p: 2,
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
                },
            }}>
                {activeTab === 0 && (
                    <Stack spacing={2.5}>
                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1.5 }}>Body Background</Typography>
                            <ColorPicker
                                label="Background Color"
                                value={bodyStyle?.backgroundColor || "#f5f7f9"}
                                onChange={handleBgColorChange}
                            />
                        </Box>

                    </Stack>
                )}
                {activeTab === 1 && (
                    <Typography sx={{ fontSize: '12px', color: '#6d7882', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
                        No global advanced settings.
                    </Typography>
                )}
            </Box>
        </Box>
    );
};

export default GlobalBodyEditor;
