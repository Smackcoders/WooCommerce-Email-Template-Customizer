import React, { useState } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';

interface PromoCodeFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
}

const PromoCodeFieldComponent: React.FC<PromoCodeFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex
}) => {
  const dispatch = useDispatch();
  const { promoCodeEditorOptions } = useSelector((state: RootState) => state.workspace);
  const [copied, setCopied] = useState(false);

  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(promoCodeEditorOptions.code || 'SAVE20');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      onClick={(e) => {
        e.stopPropagation();
        onWidgetClick(e);
        onClick();
        dispatch(setSelectedBlockId(blockId));
      }}
      sx={{
        width: '100%',
        border: `2px solid ${promoCodeEditorOptions.borderColor || '#ffeaa7'}`,
        borderRadius: '8px',
        backgroundColor: promoCodeEditorOptions.backgroundColor || '#fff3cd',
        color: promoCodeEditorOptions.textColor || '#856404',
        padding: '20px',
        position: 'relative',
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
        {promoCodeEditorOptions.title || 'Special Offer!'}
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        {promoCodeEditorOptions.description || 'Use this code to get 20% off your purchase!'}
      </Typography>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '8px 16px',
          mb: 2,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: 'bold',
            letterSpacing: '2px',
            color: '#333',
            mr: 2,
          }}
        >
          {promoCodeEditorOptions.code || 'SAVE20'}
        </Typography>
        <IconButton
          onClick={handleCopyClick}
          size="small"
          sx={{
            backgroundColor: '#007bff',
            color: '#fff',
            '&:hover': {
              backgroundColor: '#0056b3',
            },
          }}
        >
          {copied ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
        </IconButton>
      </Box>
      {copied && (
        <Typography variant="caption" sx={{ color: '#28a745', display: 'block', mb: 1 }}>
          Copied to clipboard!
        </Typography>
      )}
      <Typography variant="caption" sx={{ display: 'block', color: '#666' }}>
        Valid until: {promoCodeEditorOptions.validUntil || 'December 31, 2024'}
      </Typography>
    </Box>
  );
};

export default PromoCodeFieldComponent;