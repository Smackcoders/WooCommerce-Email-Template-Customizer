import { Box, Typography } from '@mui/material';
import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import LayersIcon from '@mui/icons-material/Layers';
import {
  defaultHeadingEditorOptions,
  defaultTextEditorOptions,
} from '../../../../../Store/Slice/workspaceSlice';

const NestedContainerWidget = () => {
  const ref = useRef<HTMLDivElement>(null);

  const customStructureData = {
    maxWidth: '800px',
    backgroundColor: '#ffffff',
    padding: 20,
    border: { width: 1, style: 'solid', color: '#dddddd', radius: 4 },
    children: [
      {
        id: 'child_container_level2',
        contentType: 'container',
        contentData: JSON.stringify({
          maxWidth: '800px',
          backgroundColor: '#f9f9f9',
          padding: 15,
          border: { width: 1, style: 'dashed', color: '#cccccc', radius: 4 },
          children: [
            {
              id: 'child_container_level3',
              contentType: 'container',
              contentData: JSON.stringify({
                maxWidth: '800px',
                backgroundColor: '#f1f3f5',
                padding: 10,
                border: { width: 1, style: 'dotted', color: '#aaaaaa', radius: 4 },
                children: [
                  {
                    id: 'child_heading',
                    contentType: 'heading',
                    contentData: JSON.stringify({
                      ...defaultHeadingEditorOptions,
                      content: 'Type your heading here...'
                    })
                  }
                ]
              })
            }
          ]
        })
      }
    ]
  };

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'layout',
    item: {
      widgetType: 'container',
      columns: 1,
      customData: customStructureData
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [drag]);

  return (
    <Box
      ref={ref}
      sx={{
        width: '100%',
        height: '80px',
        backgroundColor: '#fff',
        border: '1px solid #e0e0e0',
        borderRadius: '3px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'grab',
        opacity: isDragging ? 0.5 : 1,
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: '#93003c',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }
      }}
    >
      <LayersIcon sx={{ fontSize: "28px", mb: 1, color: '#6d7882' }} />
      <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 500, color: '#6d7882', textAlign: 'center', px: 0.5 }}>
        Nested Divs
      </Typography>
    </Box>
  );
};

export default NestedContainerWidget;
