import React, { useRef, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { Box, Typography } from '@mui/material';

interface Props {
  columns: number;
}


const DraggableLayout: React.FC<Props> = ({ columns }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'layout',
    item: { columns },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  useEffect(() => {
    if (ref.current) drag(ref.current);
  }, [ref, drag]);

  return (
    <div ref={ref}>
      <Box
        sx={{
          display: 'flex',
          border: '1px solid #e0e0e0',
          borderRadius: '3px',
          height: 40,
          mb: 1,
          cursor: 'grab',
          opacity: isDragging ? 0.5 : 1,
          bgcolor: '#fff',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#93003c',
            boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          }
        }}
      >
        {Array.from({ length: columns }).map((_, index) => (
          <Box
            key={index}
            sx={{
              flex: 1,
              borderLeft: index > 0 ? '1px solid #e0e0e0' : 'none',
              background: 'transparent',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography variant="caption" sx={{ fontSize: '10px', color: '#666', fontWeight: 500 }}>
              {`${Math.floor(100 / columns)}%`}
            </Typography>
          </Box>
        ))}
      </Box>
    </div>
  );
};

export default DraggableLayout;