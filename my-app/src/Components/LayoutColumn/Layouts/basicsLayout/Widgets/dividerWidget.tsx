import React, { useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { useDrag } from 'react-dnd';
import HorizontalRuleIcon from '@mui/icons-material/HorizontalRule';

const DividerWidget = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'content',
    item: {
      widgetType: 'divider',
      initialContent: 'divider',
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) {
      drag(ref.current);
    }
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
      <HorizontalRuleIcon sx={{ fontSize: "28px", mb: 1, color: '#6d7882' }} />
      <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 500, color: '#6d7882' }}>
        Divider
      </Typography>
    </Box>
  );
};

export default DividerWidget;