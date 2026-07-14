import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react'
import { useDrag } from 'react-dnd';

const ShoppingAddressWidget = () => {
  const dragRef = useRef<HTMLDivElement>(null);
    
      const [{ isDragging }, drag] = useDrag(() => ({
        type: 'content',
        item: {
          widgetType: 'shoppingAddress',
          initialContent: 'Click me',
        },
        collect: (monitor) => ({
          isDragging: monitor.isDragging(),
        }),
      }));
    
      useEffect(() => {
        if (dragRef.current) {
          drag(dragRef.current);
        }
      }, [dragRef, drag]);
  return (
    <Box ref={dragRef}
      sx={{
        backgroundColor: '#eef2f7',
        border: '1px solid #ccc',
        borderRadius: 1,
        paddingY:4,
        m: 0,
        textAlign: 'center',
        width: '90px',
        height: '50px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        cursor:"grab"
      }}
    >
      <Typography variant="h6" sx={{fontSize:"12px"}} color="textSecondary">
        🛒
      </Typography>
      <Typography variant="subtitle2" sx={{fontSize:"8px"}}  color="textSecondary">
        shopping Address
      </Typography>
    </Box>
  );
}

export default ShoppingAddressWidget