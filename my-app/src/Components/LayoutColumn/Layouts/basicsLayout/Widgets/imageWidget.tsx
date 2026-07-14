import React, { useRef } from 'react';
import { Box, Typography } from '@mui/material';
import { useDrag } from 'react-dnd';
import ImageIcon from '@mui/icons-material/Image';

const ImageWidget = () => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'content',
    item: {
      widgetType: 'image',
      initialContent: JSON.stringify({
        src: 'https://cdn.tools.unlayer.com/image/placeholder.png',
        altText: '',
        width: '100%',
        align: 'center',
        autoWidth: true,
        padding: { top: 0, left: 0, right: 0, bottom: 0 },
      })
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  drag(ref);

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
      <ImageIcon sx={{ fontSize: "28px", mb: 1, color: '#6d7882' }} />
      <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 500, color: '#6d7882' }}>
        Image
      </Typography>
    </Box>
  );
};

export default ImageWidget;