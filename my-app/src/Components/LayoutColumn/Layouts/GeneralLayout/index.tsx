
import { Box } from '@mui/material';
import DraggableLayout from './DraggableLayout';

export const layoutOptions = [1, 2, 3, 4];

const GeneralLayout = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const filteredOptions = layoutOptions.filter(col =>
    !searchTerm ||
    `${col} Column`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    'layout'.includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 2 }}>
      {filteredOptions.map((col) => (
        <DraggableLayout key={col} columns={col} />
      ))}
      {filteredOptions.length === 0 && (
        <Box sx={{ p: 1, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
          No layouts found
        </Box>
      )}
    </Box>
  );
};

export default GeneralLayout;
