import React from 'react';
import ExportColumn from '../Components/ExportColumn';
import LayoutColumn from '../Components/LayoutColumn';
import WorkspaceColumn from '../Components/WorkspaceColumn';
import { Box } from '@mui/material';
import PreviewPage from '../Components/Preview';
import { useSelector } from 'react-redux';
import { RootState } from '../Store/store';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

const Layout: React.FC = () => {
  const { previewMode } = useSelector((state: RootState) => state.workspace);
  const [isFullScreen, setIsFullScreen] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isFullScreen) {
      document.body.classList.add('wetc-fullscreen');
    } else {
      document.body.classList.remove('wetc-fullscreen');
    }
    
    // Cleanup on unmount
    return () => document.body.classList.remove('wetc-fullscreen');
  }, [isFullScreen]);

  return (
    <Box sx={{
      height: '100%',
      display: 'flex',
      width: "100%",
      margin: 0,
      overflow: "hidden",
      backgroundColor: "#f5f5f5"
    }}>
      <style>
        {`
          /* Position the content pane fixed under the admin bar */
          #wpcontent {
            position: fixed !important;
            top: 32px !important;
            left: 160px !important;
            right: 0 !important;
            bottom: 0 !important;
            height: calc(100vh - 32px) !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
            z-index: 10 !important;
            box-sizing: border-box !important;
          }
          /* Folded/collapsed menu offset */
          .folded #wpcontent {
            left: 36px !important;
          }
          /* Fullscreen mode overrides */
          body.wetc-fullscreen #wpcontent {
            left: 0 !important;
            z-index: 99999 !important;
          }
          body.wetc-fullscreen #adminmenuback,
          body.wetc-fullscreen #adminmenuwrap {
            display: none !important;
          }
          /* Hide WP admin footer */
          #wpfooter {
            display: none !important;
          }
          /* Mobile / small screen responsiveness */
          @media screen and (max-width: 782px) {
            #wpcontent {
              top: 46px !important;
              left: 0 !important;
              height: calc(100vh - 46px) !important;
            }
          }
          /* Ensure our app takes 100% of the fixed container */
          #wpbody, #wpbody-content, .wrap, #root, #root > div {
            height: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: hidden !important;
          }
        `}
      </style>
      {!previewMode ? (
        <>
          <Box sx={{ width: "300px", flexShrink: 0, borderRight: "1px solid #e0e0e0", backgroundColor: "#fff", zIndex: 10 }}>
            <LayoutColumn />
          </Box>

          <Box
            onClick={() => setIsFullScreen(!isFullScreen)}
            sx={{
              position: 'absolute',
              left: '0px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '15px',
              height: '50px',
              backgroundColor: '#000',
              color: '#fff',
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              zIndex: 99999,
              borderTopRightRadius: '8px',
              borderBottomRightRadius: '8px',
              boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
              border: '1px solid #000',
              borderLeft: 'none'
            }}
          >
            {isFullScreen ? <ChevronRightIcon fontSize="small" sx={{ fontSize: 14 }} /> : <ChevronLeftIcon fontSize="small" sx={{ fontSize: 14 }} />}
          </Box>

          <Box sx={{ flex: 1, height: "100%", overflow: "hidden", position: "relative" }}>
            <WorkspaceColumn />
          </Box>
          <Box sx={{ width: "300px", flexShrink: 0, borderLeft: "1px solid #e0e0e0", backgroundColor: "#fff", zIndex: 10 }}>
            <ExportColumn />
          </Box>
        </>
      ) : (
        <PreviewPage />
      )}
    </Box>
  );
};
export default Layout;
