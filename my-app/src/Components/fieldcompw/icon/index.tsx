import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

import StarIcon from '@mui/icons-material/Star';
import FavoriteIcon from '@mui/icons-material/Favorite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import YouTubeIcon from '@mui/icons-material/YouTube';
import HomeIcon from '@mui/icons-material/Home';
import MailIcon from '@mui/icons-material/Mail';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';

interface IconFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
}

const IconFieldComponent: React.FC<IconFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();
  const previewMode = useSelector((state: RootState) => state.workspace.previewMode);

  const storeWidgetContent = useSelector((state: RootState) =>
    state.workspace.blocks.find((block) => block.id === blockId)?.columns[columnIndex]?.widgetContents[widgetIndex] || null
  );

  const widgetContent = widgetData || storeWidgetContent;
  const iconEditorOptions: any = widgetContent?.contentData
    ? { ...JSON.parse(widgetContent.contentData) }
    : {}; // fallback values handled later

  const getIconComponent = () => {
    switch (iconEditorOptions.iconType) {
      case 'star':
        return StarIcon;
      case 'heart':
        return FavoriteIcon;
      case 'check':
        return CheckCircleIcon;
      case 'info':
        return InfoIcon;
      case 'warning':
        return WarningIcon;
      case 'error':
        return ErrorIcon;
      case 'facebook':
        return FacebookIcon;
      case 'twitter':
        return TwitterIcon;
      case 'instagram':
        return InstagramIcon;
      case 'linkedin':
        return LinkedInIcon;
      case 'youtube':
        return YouTubeIcon;
      case 'home':
        return HomeIcon;
      case 'mail':
        return MailIcon;
      case 'phone':
        return PhoneIcon;
      case 'location':
        return LocationOnIcon;
      case 'calendar':
        return CalendarTodayIcon;
      case 'user':
        return PersonIcon;
      default:
        return StarIcon;
    }
  };

  const IconComponent = getIconComponent();

  const handleClick = (e: React.MouseEvent) => {
    if (onWidgetClick) {
      onWidgetClick(e);
    } else if (onClick) {
      e.stopPropagation();
      onClick(e);
    }

    if (previewMode && iconEditorOptions.link) {
      window.open(iconEditorOptions.link, '_blank');
    }
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        width: '100%',
        borderTopWidth: iconEditorOptions.borderTopWidth !== undefined ? (typeof iconEditorOptions.borderTopWidth === 'number' ? `${iconEditorOptions.borderTopWidth}px` : iconEditorOptions.borderTopWidth) : undefined,
        borderTopStyle: iconEditorOptions.borderTopStyle,
        borderTopColor: iconEditorOptions.borderTopColor,
        borderRightWidth: iconEditorOptions.borderRightWidth !== undefined ? (typeof iconEditorOptions.borderRightWidth === 'number' ? `${iconEditorOptions.borderRightWidth}px` : iconEditorOptions.borderRightWidth) : undefined,
        borderRightStyle: iconEditorOptions.borderRightStyle,
        borderRightColor: iconEditorOptions.borderRightColor,
        borderBottomWidth: iconEditorOptions.borderBottomWidth !== undefined ? (typeof iconEditorOptions.borderBottomWidth === 'number' ? `${iconEditorOptions.borderBottomWidth}px` : iconEditorOptions.borderBottomWidth) : undefined,
        borderBottomStyle: iconEditorOptions.borderBottomStyle,
        borderBottomColor: iconEditorOptions.borderBottomColor,
        borderLeftWidth: iconEditorOptions.borderLeftWidth !== undefined ? (typeof iconEditorOptions.borderLeftWidth === 'number' ? `${iconEditorOptions.borderLeftWidth}px` : iconEditorOptions.borderLeftWidth) : undefined,
        borderLeftStyle: iconEditorOptions.borderLeftStyle,
        borderLeftColor: iconEditorOptions.borderLeftColor,
        borderRadius: typeof iconEditorOptions.borderRadius === 'object' ? `${iconEditorOptions.borderRadius.top ?? 0}px ${iconEditorOptions.borderRadius.right ?? 0}px ${iconEditorOptions.borderRadius.bottom ?? 0}px ${iconEditorOptions.borderRadius.left ?? 0}px` : iconEditorOptions.borderRadius || '0px',
        paddingTop: `${iconEditorOptions.padding?.top !== undefined ? iconEditorOptions.padding.top : (iconEditorOptions.paddingTop || 0)}px`,
        paddingRight: `${iconEditorOptions.padding?.right !== undefined ? iconEditorOptions.padding.right : (iconEditorOptions.paddingRight || 0)}px`,
        paddingBottom: `${iconEditorOptions.padding?.bottom !== undefined ? iconEditorOptions.padding.bottom : (iconEditorOptions.paddingBottom || 0)}px`,
        paddingLeft: `${iconEditorOptions.padding?.left !== undefined ? iconEditorOptions.padding.left : (iconEditorOptions.paddingLeft || 0)}px`,
        marginTop: `${iconEditorOptions.margin?.top !== undefined ? iconEditorOptions.margin.top : (iconEditorOptions.marginTop || 0)}px`,
        marginRight: `${iconEditorOptions.margin?.right !== undefined ? iconEditorOptions.margin.right : (iconEditorOptions.marginRight || 0)}px`,
        marginBottom: `${iconEditorOptions.margin?.bottom !== undefined ? iconEditorOptions.margin.bottom : (iconEditorOptions.marginBottom || 0)}px`,
        marginLeft: `${iconEditorOptions.margin?.left !== undefined ? iconEditorOptions.margin.left : (iconEditorOptions.marginLeft || 0)}px`,
        cursor: iconEditorOptions.link ? 'pointer' : 'default',
        '&:hover': {
          opacity: 0.8,
        },
      }}
    >
      <Box sx={{ display: 'flex', width: '100%', justifyContent: iconEditorOptions.alignment === 'left' ? 'flex-start' : iconEditorOptions.alignment === 'center' ? 'center' : iconEditorOptions.alignment === 'right' ? 'flex-end' : iconEditorOptions.alignment === 'justify' ? 'space-between' : 'flex-start' }}>
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: iconEditorOptions.backgroundColor || iconEditorOptions.bgColor || 'transparent',
            backgroundImage: iconEditorOptions.backgroundImage || iconEditorOptions.bgImage ? `url("${iconEditorOptions.backgroundImage || iconEditorOptions.bgImage}")` : undefined,
            backgroundSize: iconEditorOptions.backgroundSize || iconEditorOptions.bgSize || 'cover',
            backgroundPosition: iconEditorOptions.backgroundPosition || iconEditorOptions.bgPosition || 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <IconComponent
            sx={{
              fontSize: iconEditorOptions.size || 24,
              width: iconEditorOptions.width ?? iconEditorOptions.size ?? 32,
              height: iconEditorOptions.height ?? iconEditorOptions.size ?? 32,
              color: iconEditorOptions.color || '#000000',
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default IconFieldComponent;