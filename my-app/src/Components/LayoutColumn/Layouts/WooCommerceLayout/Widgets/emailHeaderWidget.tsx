import { Box, Typography } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import EmailIcon from '@mui/icons-material/Email';

const EmailHeaderWidget = () => {
    const ref = useRef<HTMLDivElement>(null);

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'content',
        item: { widgetType: 'emailHeader' },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
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
    backgroundColor: '#FFFFFF!important',
    border: '1px solid #e0e0e0',
    borderRadius: '3px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 16px',
    cursor: 'grab',
    opacity: isDragging ? 0.5 : 1,
    transition: 'all 0.2s',
    '&:hover': {
      borderColor: '#93003c',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    },
  }}
>
  <EmailIcon sx={{ fontSize: "28px", mb: 1, color: '#6d7882' }} />
  <Typography variant="caption" sx={{ fontSize: "11px", fontWeight: 500, color: '#6d7882', textAlign: 'right', lineHeight: 1.2 }}>
    Email Header
  </Typography>
</Box>
    );
};

export default EmailHeaderWidget;
