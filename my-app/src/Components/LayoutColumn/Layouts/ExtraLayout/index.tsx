import React from 'react'
import { Box } from '@mui/material';
import SocialFollowWidget from './Widgets/socialFollowWidget';
import VideoWidget from './Widgets/videoWidget';
import CountdownWidget from './Widgets/countdownWidget';
import PromoCodeWidget from './Widgets/promoCodeWidget';
import PriceWidget from './Widgets/priceWidget';

export const extraWidgets = [
  { Component: SocialFollowWidget, name: 'Social Follow' },
  { Component: VideoWidget, name: 'Video' },
  { Component: CountdownWidget, name: 'Countdown' },
  { Component: PromoCodeWidget, name: 'Promo Code' },
  { Component: PriceWidget, name: 'Price' },
];

const ExtraLayout = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const filteredWidgets = extraWidgets.filter(widget =>
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
          No extra blocks found
        </Box>
      )}
    </Box>
  );
};

export default ExtraLayout;