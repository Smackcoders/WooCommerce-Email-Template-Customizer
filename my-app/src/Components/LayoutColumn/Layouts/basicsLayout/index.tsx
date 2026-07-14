import { Box } from '@mui/material';
import ButtonWidget from './Widgets/buttonWidget';
import DividerWidget from './Widgets/dividerWidget';
import HeadingWidget from './Widgets/headingWidget';
import IconWidget from './Widgets/iconWidget';
import ImageWidget from './Widgets/imageWidget';
import LinkWidget from './Widgets/linkWidget';
import SpacerWidget from './Widgets/spacerWidget';
import TextWidget from './Widgets/textWidget';
import SocialIconsWidget from './Widgets/socialIconsWidget';
import TableWidget from './Widgets/tableWidget';
import EmailHeaderWidget from '../WooCommerceLayout/Widgets/emailHeaderWidget';

export const basicsWidgets = [
  { Component: ButtonWidget, name: 'Button' },
  { Component: HeadingWidget, name: 'Heading' },
  { Component: IconWidget, name: 'Icon' },
  { Component: TextWidget, name: 'Text' },
  { Component: ImageWidget, name: 'Image' },
  { Component: LinkWidget, name: 'Link' },
  { Component: SpacerWidget, name: 'Spacer' },
  { Component: DividerWidget, name: 'Divider' },
  { Component: TableWidget, name: 'Table' },
  { Component: SocialIconsWidget, name: 'Social Icons' },
  { Component: EmailHeaderWidget, name: 'Email Header' },
];

const MainLayout = ({ searchTerm = '' }: { searchTerm?: string }) => {
  const filteredWidgets = basicsWidgets.filter(widget =>
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
      {filteredWidgets.map(({ Component, name }, index) => (
        <Component key={name} />
      ))}
      {filteredWidgets.length === 0 && (
        <Box sx={{ gridColumn: '1 / -1', p: 1, textAlign: 'center', color: 'text.secondary', fontSize: '14px' }}>
          No blocks found
        </Box>
      )}
    </Box>
  );
};

export default MainLayout;