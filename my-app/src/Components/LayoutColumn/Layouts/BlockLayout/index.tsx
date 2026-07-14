import React from 'react'
import { Box } from '@mui/material';
import RowWidget from './Widgets/rowWidget';
import ContainerWidget from './Widgets/containerWidget';
import GroupWidget from './Widgets/groupWidget';
import NestedContainerWidget from './Widgets/nestedContainerWidget';

export const blockLayoutWidgets = [
  { Component: RowWidget, name: 'Row' },
  { Component: ContainerWidget, name: 'Container' },
  { Component: NestedContainerWidget, name: 'Nested Divs' },
  { Component: GroupWidget, name: 'Group' },
];

const LayoutBlockLayout = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const filteredWidgets = blockLayoutWidgets.filter(widget =>
    !searchTerm || widget.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      sx={{
        width: "100%",
        p: 2,
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: 1,
      }}
    >
      {filteredWidgets.map(({ Component, name }) => (
        <Component key={name} />
      ))}
      {filteredWidgets.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1', p: 1, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
          No layout blocks found
        </Box>
      )}
    </Box>
  );
};

export default LayoutBlockLayout;