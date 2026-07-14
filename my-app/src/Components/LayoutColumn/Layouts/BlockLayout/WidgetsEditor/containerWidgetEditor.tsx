import React from 'react';
import { Box, Typography, TextField, Tooltip, IconButton, Stack, Select, MenuItem, FormControl, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateContainerEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import LinkIcon from '@mui/icons-material/Link';
import LinkOffIcon from '@mui/icons-material/LinkOff';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const ContainerWidgetEditor = () => {
  const dispatch = useDispatch();
  const [gapsLinked, setGapsLinked] = React.useState(false);
  const { containerEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleColumnGapChange = (val: number) => {
    if (gapsLinked) {
      dispatch(updateContainerEditorOptions({ columnGap: val, rowGap: val }));
    } else {
      dispatch(updateContainerEditorOptions({ columnGap: val }));
    }
  };

  const handleRowGapChange = (val: number) => {
    if (gapsLinked) {
      dispatch(updateContainerEditorOptions({ columnGap: val, rowGap: val }));
    } else {
      dispatch(updateContainerEditorOptions({ rowGap: val }));
    }
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
            <Box display="grid" gridTemplateColumns="1fr 1fr" gap={2}>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Width</Typography>
                <TextField
                  type="text"
                  value={containerEditorOptions.width !== undefined ? containerEditorOptions.width : ''}
                  onChange={(e) => dispatch(updateContainerEditorOptions({ width: e.target.value }))}
                  placeholder="e.g. 100% or 100px"
                  size="small"
                  fullWidth
                  InputProps={{ sx: { fontSize: '13px', bgcolor: '#f8fafc' } }}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Height</Typography>
                <TextField
                  type="text"
                  value={containerEditorOptions.height !== undefined ? containerEditorOptions.height : ''}
                  onChange={(e) => dispatch(updateContainerEditorOptions({ height: e.target.value }))}
                  placeholder="e.g. auto or 50px"
                  size="small"
                  fullWidth
                  InputProps={{ sx: { fontSize: '13px', bgcolor: '#f8fafc' } }}
                />
              </Box>
            </Box>

          </Stack>
        </Box>
      )
    },
    {
      label: 'Style',
      content: <div /> // Replaced by GlobalStyleTab inside WidgetEditorWrapper
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <AdvancedTabContent
            subStyles={containerEditorOptions}
            onUpdate={(val) => dispatch(updateContainerEditorOptions(val))}
            hideLayout={true}
          />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Container"
      description="Edit container style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
      hideAdvancedLayout={true}
    />
  );
};

export default ContainerWidgetEditor;