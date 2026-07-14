import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

import { defaultPriceEditorOptions } from '../../../Store/Slice/workspaceSlice';

interface PriceFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any; // Add widgetData prop
}

const PriceFieldComponent: React.FC<PriceFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();

  const { priceEditorOptions: storePriceOptions } = useSelector((state: RootState) => state.workspace);


  let priceEditorOptions = storePriceOptions;

  if (widgetData && widgetData.contentData) {
    try {
      priceEditorOptions = JSON.parse(widgetData.contentData);
    } catch (e) {
      console.error("Error parsing price data", e);
    }
  }

  const formatPrice = () => {
    const amountNum = parseFloat(String(priceEditorOptions.amount || '99.99'));
    if (isNaN(amountNum)) return '0.00';

    let decimals = 2;
    if (priceEditorOptions.decimals !== undefined && priceEditorOptions.decimals !== null) {
      decimals = Number(priceEditorOptions.decimals);
    }


    if (priceEditorOptions.showDecimals === false) {
      decimals = 0;
    }

    const amountVal = amountNum.toFixed(decimals);

    if (priceEditorOptions.showCurrencySymbol !== false) {
      return `${priceEditorOptions.currencySymbol ?? '$'}${amountVal}`;
    }
    return amountVal;
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
        border: 'none',
        borderRadius: '4px',
        padding: '16px',
        position: 'relative',
        backgroundColor: isSelected ? '#f0f8ff' : 'transparent',
      }}
    >
      <Typography variant="body1" sx={{ mb: 1, color: '#666' }}>
        {priceEditorOptions.label || 'Price'}
      </Typography>
      <Typography
        variant="h3"
        sx={{
          fontWeight: 'bold',
          color: '#007bff',
          display: 'flex',
          alignItems: 'baseline',
        }}
      >
        {formatPrice()}
        <Typography
          component="span"
          variant="body1"
          sx={{
            ml: 1,
            color: '#666',
            fontSize: '0.8em',
          }}
        >
          {priceEditorOptions.showCurrencyCode !== false ? (priceEditorOptions.currency || 'USD') : ''}
        </Typography>
      </Typography>
    </Box>
  );
};

export default PriceFieldComponent;