import React, { useState } from "react";
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Typography,
  Select,
  MenuItem,
  FormControl,
  OutlinedInput,
  InputAdornment,
  SelectChangeEvent,
} from "@mui/material";
import WorkspaceArea from "../WorkspaceColumn/workspaceArea";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../Store/store";
import { setPreviewMode, setViewportMode } from "../../Store/Slice/workspaceSlice"
import { getViewportWidth } from "../utils/viewportWidths";
import DesktopWindowsIcon from "@mui/icons-material/DesktopWindows";
import TabletMacIcon from "@mui/icons-material/TabletMac";
import PhoneIphoneIcon from "@mui/icons-material/PhoneIphone";
import CloseIcon from "@mui/icons-material/Close";
import ReplayIcon from "@mui/icons-material/Replay";

const deviceOptions = [
  { label: "iPhone 11 Pro/X", width: 375, height: 812 },
  { label: "iPhone 11 Pro Max", width: 414, height: 896 },
  { label: "iPad Mini", width: 768, height: 1024 },
  { label: 'iPad Pro 11"', width: 834, height: 1194 },
  { label: 'iPad Pro 12.9"', width: 1024, height: 1366 },
  { label: "Surface Pro 4", width: 1368, height: 912 },
  { label: "MacBook", width: 1152, height: 720 },
  { label: "MacBook Pro", width: 1440, height: 900 },
  { label: "Surface Book", width: 1500, height: 1000 },
  { label: "iMac", width: 1280, height: 800 },
];

const DEFAULT_WIDTH = 600;

const PreviewPage: React.FC = () => {
  const dispatch = useDispatch();
  const { viewportMode, blocks, previewMode } = useSelector(
    (state: RootState) => state.workspace
  );

  const [selectedDevice, setSelectedDevice] = useState<{
    label: string;
    width: number;
    height: number;
  } | null>(null);

  const [customWidth, setCustomWidth] = useState<number>(DEFAULT_WIDTH);

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: "desktop" | "tablet" | "mobile" | null
  ) => {
    if (newView !== null) {
      dispatch(setViewportMode(newView));
      setSelectedDevice(null);
      setCustomWidth(newView === "mobile" ? 375 : (newView === "tablet" ? 500 : 600));
    }
  };

  const handleCancel = () => {
    dispatch(setViewportMode("desktop"));
    dispatch(setPreviewMode(false))
  };

  const handleDeviceChange = (event: SelectChangeEvent) => {
    const device = deviceOptions.find(
      (opt) => opt.label === event.target.value
    );
    if (device) {
      setSelectedDevice(device);
      setCustomWidth(device.width);
      const mode = device.width <= 375 ? "mobile" : device.width <= 768 ? "tablet" : "desktop";
      dispatch(setViewportMode(mode));
    }
  };

  const handleWidthInput = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const newWidth = parseInt(event.target.value, 10);
    if (!isNaN(newWidth)) {
      setCustomWidth(newWidth);
      const mode = newWidth <= 375 ? "mobile" : newWidth <= 768 ? "tablet" : "desktop";
      dispatch(setViewportMode(mode));
      setSelectedDevice(null);
    }
  };

  const handleResetWidth = () => {
    setCustomWidth(DEFAULT_WIDTH);
    setSelectedDevice(null);
    dispatch(setViewportMode("desktop"));
  };

  const previewFrameWidth = selectedDevice
    ? customWidth
    : getViewportWidth(viewportMode);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        padding: 2,
        position: "relative",
        minHeight: "100vh",
        boxSizing: "border-box",
        backgroundColor: "#f5f5f5",
        width: "100%"
      }}
    >
      {/* Close Button */}
      <IconButton
        onClick={handleCancel}
        sx={{ position: "absolute", top: 8, right: 8, zIndex: 10 }}
      >
        <CloseIcon />
      </IconButton>

      {/* Top Controls */}
      <Box
        sx={{
          textAlign: "center",
          mb: 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Width Input + Reset */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl size="small" sx={{ width: 200 }}>
            <OutlinedInput
              type="number"
              value={customWidth}
              onChange={handleWidthInput}
              startAdornment={
                <InputAdornment position="start">
                  <Typography variant="body2">Width</Typography>
                </InputAdornment>
              }
              endAdornment={<InputAdornment position="end">px</InputAdornment>}
              inputProps={{
                min: 320,
                max: 2000,
                step: 10,
                style: { textAlign: "center" },
              }}
            />
          </FormControl>
          <IconButton onClick={handleResetWidth} size="small">
            <ReplayIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* View Toggle */}
        <ToggleButtonGroup
          value={viewportMode}
          exclusive
          onChange={handleViewChange}
          aria-label="preview mode"
          size="small"
        >
          <ToggleButton value="desktop" aria-label="desktop view">
            <DesktopWindowsIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="tablet" aria-label="tablet view">
            <TabletMacIcon fontSize="small" />
          </ToggleButton>
          <ToggleButton value="mobile" aria-label="mobile view">
            <PhoneIphoneIcon fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Device Dropdown */}
        <FormControl size="small" sx={{ minWidth: 180 }}>
          <Select
            displayEmpty
            value={selectedDevice?.label || ""}
            onChange={handleDeviceChange}
            MenuProps={{
              disablePortal: false,
              sx: { zIndex: 1300001 },
              style: { zIndex: 1300001 }
            }}
          >
            <MenuItem value="">
              <em>Select Device</em>
            </MenuItem>
            {deviceOptions.map((device) => (
              <MenuItem key={device.label} value={device.label}>
                {device.label} ({device.width}px)
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Preview Container Wrapper - Full Width/Height Centered */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          flex: 1,
          width: "100%",
          overflowY: "auto",
        }}
      >
        {/* Actual Email Content Container - Fixed Width/Mobile Width */}
        <Box
          sx={{
            width: `${previewFrameWidth}px`,
            maxWidth: "100%",
            minWidth: 0,
            height: selectedDevice
              ? `${selectedDevice.height}px`
              : viewportMode === "mobile"
                ? "667px"
                : "auto",
            minHeight: selectedDevice
              ? `${selectedDevice.height}px`
              : viewportMode === "mobile"
                ? "667px"
                : "800px",
            backgroundColor: "#fff",
            boxShadow: 3,
            borderRadius: 1,
            transition: "all 0.3s ease",
            display: "flex",
            flexDirection: "column",
            position: "relative",
            overflow: "hidden",
            margin: 4,
            boxSizing: "border-box",
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              overflowX: "auto",
              minWidth: 0,
              paddingBottom: viewportMode === "mobile" ? "60px" : 0,
              WebkitOverflowScrolling: "touch",
              "&::-webkit-scrollbar": {
                width: "8px",
              },
              "&::-webkit-scrollbar-track": {
                background: "#f1f1f1",
              },
              "&::-webkit-scrollbar-thumb": {
                background: "#888",
                borderRadius: "4px",
              },
              position: "relative",
            }}
          >
            {/* Overlay to block clicks but allow scroll */}
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                backgroundColor: "transparent",
              }}
            />
            {blocks.length === 0 ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "100%",
                  color: "#999",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                <Typography variant="h6">No content to preview</Typography>
              </Box>
            ) : (
              <WorkspaceArea previewMode={true} />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PreviewPage;
