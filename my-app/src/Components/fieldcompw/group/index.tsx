import React from 'react';
import { Box, Typography } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';
import { getSpacingStyle } from '../../utils/treeHelper';

interface GroupFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
}

const GroupFieldComponent: React.FC<GroupFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex
}) => {
  const dispatch = useDispatch();
  const { blocks } = useSelector((state: RootState) => state.workspace);
  const block = blocks.find((b) => b.id === blockId);
  const column = block?.columns[columnIndex];
  const widget = column?.widgetContents[widgetIndex];

  if (!widget) return null;

  const content = widget.contentData
    ? JSON.parse(widget.contentData)
    : { elements: [], spacing: 10, alignment: 'left', direction: 'row' }; // Default fallback

  const getContainerStyles = () => {
    const direction = content.direction || 'row';
    const alignment = content.alignment || 'left';
    const spacing = content.spacing !== undefined ? content.spacing : 10;

    const styles: any = {
      display: 'flex',
      flexDirection: direction,
      gap: `${spacing}px`,
      flexWrap: 'wrap',
      minHeight: 'auto'
    };

    if (alignment === 'space-between') {
      styles.justifyContent = 'space-between';
      styles.alignItems = direction === 'column' ? 'stretch' : 'center';
    } else {
      const map: Record<string, string> = {
        left: 'flex-start',
        center: 'center',
        right: 'flex-end'
      };

      const alignValue = map[alignment] || 'flex-start';

      if (direction === 'row') {
        styles.justifyContent = alignValue;
        styles.alignItems = 'center';
      } else {
        styles.alignItems = alignValue;
        styles.justifyContent = 'flex-start';
      }
    }

    return styles;
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
        width: content.width || '100%',
        border: '1px solid #ddd',
        borderRadius: '4px',
        padding: getSpacingStyle(content.padding, '0px'),
        margin: getSpacingStyle(content.margin, '0px'),
        position: 'relative',
        backgroundColor: content.backgroundColor || content.bgColor || 'transparent',
        color: content.color || content.textColor || 'inherit',
        fontSize: content.fontSize ? `${content.fontSize}px` : 'inherit',
        fontFamily: content.fontFamily && content.fontFamily !== 'inherit' ? content.fontFamily : 'inherit',
      }}
    >
      <Box
        sx={getContainerStyles()}
      >
        {(content.elements || []).map((element: any, index: number) => {
          const text = typeof element === 'string' ? element : element.text;
          return (
            <Box
              key={index}
              sx={{
                backgroundColor: 'transparent',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                padding: '8px 16px',
                minWidth: '80px',
                textAlign: 'center',
                fontSize: 'inherit',
                color: 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                cursor: 'pointer'
              }}
            >
              <Typography variant="body2" sx={{ color: 'inherit', fontSize: 'inherit' }}>{text}</Typography>
            </Box>
          )
        })}

      </Box>
    </Box>
  );
};

export default GroupFieldComponent;