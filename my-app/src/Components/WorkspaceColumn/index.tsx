import { Box, } from '@mui/material';
import WorkspaceArea from './workspaceArea';
import WorkspaceTop from './workspaceTop';
import { useSelector } from 'react-redux';
import { RootState } from '../../Store/store';

const Workspace = () => {
  const bodyStyle = useSelector((state: RootState) => state.workspace.bodyStyle);

  return (
    <Box
      sx={{
        width: '100%',
        display: "flex",
        flexDirection: "column",
        backgroundColor: bodyStyle?.backgroundColor || '#f5f7f9',
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      <WorkspaceTop />
      <Box sx={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
        minWidth: 0,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        WebkitOverflowScrolling: 'touch',
      }}>
        <WorkspaceArea />
      </Box>
    </Box>
  );
};

export default Workspace;