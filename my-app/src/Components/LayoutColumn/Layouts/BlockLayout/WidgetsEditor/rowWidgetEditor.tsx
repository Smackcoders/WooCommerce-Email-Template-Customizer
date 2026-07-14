import React from 'react';
import { Box, Typography, Slider, Stack } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { closeEditor, deleteColumnContent, updateRowEditorOptions } from '../../../../../Store/Slice/workspaceSlice';
import WidgetEditorWrapper from '../../../../utils/WidgetEditorWrapper';
import { AdvancedTabContent } from '../../../../utils/SharedStyleTab';

const RowWidgetEditor = () => {
  const dispatch = useDispatch();
  const { rowEditorOptions } = useSelector((state: RootState) => state.workspace);
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector(
    (state: RootState) => state.workspace
  );

  const handleSliderChange = (field: keyof typeof rowEditorOptions) => (
    event: Event,
    newValue: number | number[]
  ) => {
    dispatch(updateRowEditorOptions({ [field]: newValue as number }));
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
          <Stack spacing={3}>
            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 1 }}>
                Columns: {rowEditorOptions.columns}
              </Typography>
              <Slider
                value={rowEditorOptions.columns || 1}
                min={1}
                max={4}
                step={1}
                marks
                onChange={handleSliderChange('columns')}
                sx={{
                  color: '#93003c',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                  }
                }}
              />
            </Box>

            <Box>
              <Typography sx={{ fontSize: '13px', color: '#666', mb: 1 }}>
                Gap: {rowEditorOptions.gap}px
              </Typography>
              <Slider
                value={rowEditorOptions.gap || 0}
                min={0}
                max={50}
                step={1}
                onChange={handleSliderChange('gap')}
                sx={{
                  color: '#93003c',
                  height: 4,
                  '& .MuiSlider-thumb': {
                    width: 12,
                    height: 12,
                    backgroundColor: '#fff',
                    border: '2px solid currentColor',
                  }
                }}
              />
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
            subStyles={rowEditorOptions}
            onUpdate={(val) => dispatch(updateRowEditorOptions(val))}
          />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Row Layout"
      description="Edit row layout settings."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};

export default RowWidgetEditor;
