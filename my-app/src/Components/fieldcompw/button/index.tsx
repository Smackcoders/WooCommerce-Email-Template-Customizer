import { Button, Box } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../../Store/store';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { useRef, useEffect, useCallback } from 'react';
import { ButtonEditorOptions, defaultButtonEditorOptions } from '../../../Store/Slice/workspaceSlice';

import { replaceDynamicVariables } from '../../utils/treeHelper';

const getBorderStyles = (content: any): React.CSSProperties => {
  const styles: React.CSSProperties = {};

  if (content.borderStyle) {
    styles.borderStyle = content.borderStyle;
  } else {
    if (content.borderTopStyle) styles.borderTopStyle = content.borderTopStyle;
    if (content.borderRightStyle) styles.borderRightStyle = content.borderRightStyle;
    if (content.borderBottomStyle) styles.borderBottomStyle = content.borderBottomStyle;
    if (content.borderLeftStyle) styles.borderLeftStyle = content.borderLeftStyle;
  }

  if (content.borderWidth !== undefined) {
    styles.borderWidth = typeof content.borderWidth === 'number' ? `${content.borderWidth}px` : content.borderWidth;
  } else {
    if (content.borderTopWidth !== undefined) styles.borderTopWidth = typeof content.borderTopWidth === 'number' ? `${content.borderTopWidth}px` : content.borderTopWidth;
    if (content.borderRightWidth !== undefined) styles.borderRightWidth = typeof content.borderRightWidth === 'number' ? `${content.borderRightWidth}px` : content.borderRightWidth;
    if (content.borderBottomWidth !== undefined) styles.borderBottomWidth = typeof content.borderBottomWidth === 'number' ? `${content.borderBottomWidth}px` : content.borderBottomWidth;
    if (content.borderLeftWidth !== undefined) styles.borderLeftWidth = typeof content.borderLeftWidth === 'number' ? `${content.borderLeftWidth}px` : content.borderLeftWidth;
  }

  if (content.borderColor) {
    styles.borderColor = content.borderColor;
  } else {
    if (content.borderTopColor) styles.borderTopColor = content.borderTopColor;
    if (content.borderRightColor) styles.borderRightColor = content.borderRightColor;
    if (content.borderBottomColor) styles.borderBottomColor = content.borderBottomColor;
    if (content.borderLeftColor) styles.borderLeftColor = content.borderLeftColor;
  }

  const hasAnyBorderStyle = !!(styles.borderStyle || styles.borderTopStyle || styles.borderRightStyle || styles.borderBottomStyle || styles.borderLeftStyle);
  if (hasAnyBorderStyle) {
    if (!styles.borderWidth && !styles.borderTopWidth && !styles.borderRightWidth && !styles.borderBottomWidth && !styles.borderLeftWidth) {
      styles.borderWidth = '1px';
    }
    if (!styles.borderColor && !styles.borderTopColor && !styles.borderRightColor && !styles.borderBottomColor && !styles.borderLeftColor) {
      styles.borderColor = '#dddddd';
    }
  }

  const rawRadius = content.borderRadius;
  if (rawRadius !== undefined) {
    if (typeof rawRadius === 'object' && rawRadius !== null) {
      const top = rawRadius.top ?? rawRadius.topLeft ?? 0;
      const right = rawRadius.right ?? rawRadius.topRight ?? 0;
      const bottom = rawRadius.bottom ?? rawRadius.bottomRight ?? 0;
      const left = rawRadius.left ?? rawRadius.bottomLeft ?? 0;
      styles.borderRadius = `${top}px ${right}px ${bottom}px ${left}px`;
    } else {
      styles.borderRadius = typeof rawRadius === 'number' ? `${rawRadius}px` : rawRadius;
    }
  }

  return styles;
};

interface ButtonFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
}

const ButtonFieldComponent: React.FC<ButtonFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null);

  const storeWidgetContent = useSelector((state: RootState) =>
    state.workspace.blocks.find((block) => block.id === blockId)?.columns[columnIndex]?.widgetContents[widgetIndex] || null
  );

  const widgetContent = widgetData || storeWidgetContent;
  const buttonData: ButtonEditorOptions | null = widgetContent?.contentData
    ? { ...defaultButtonEditorOptions, ...JSON.parse(widgetContent.contentData) }
    : defaultButtonEditorOptions;

  const buttonContent = replaceDynamicVariables(buttonData?.text) || 'Button';
  const bgColor = buttonData?.bgColor || '#1976d2';
  const textColor = buttonData?.textColor || '#ffffff';
  const fontFamily = buttonData?.fontFamily === 'global' ? 'inherit' : buttonData?.fontFamily;
  const fontSize = buttonData?.fontSize || 14;
  const fontWeight = buttonData?.fontWeight || '400';
  const textAlign = buttonData?.textAlign || 'center';
  const fontStyle = buttonData?.fontStyle || 'normal';
  const lineHeight = buttonData?.lineHeight;
  const letterSpacing = buttonData?.letterSpacing ?? buttonData?.letterSpace;
  const textTransform = buttonData?.textTransform || 'none';
  let finalWidth: string | undefined = undefined;

  // Ensure padding exists
  const padding = buttonData?.padding || { top: 0, right: 0, bottom: 0, left: 0 };

  const borderRadius = buttonData?.borderRadius || { topLeft: 4, topRight: 4, bottomRight: 4, bottomLeft: 4 };
  const margin = buttonData?.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const urlDisabled = buttonData?.urlDisabled || false;
  const url = buttonData?.url || '#';



  const formatLength = (val: string | number | undefined) => {
    if (val === undefined || val === '') return undefined;
    if (typeof val === 'number') return `${val}px`;
    if (/^\d+$/.test(String(val))) return `${val}px`;
    return String(val);
  };
  const finalHeight = formatLength(buttonData?.height) || 'auto';

  if (buttonData?.widthAuto === false && buttonData?.width !== undefined) {
    if (typeof buttonData.width === 'string') {
      finalWidth = formatLength(buttonData.width);
    } else {
      finalWidth = `${buttonData.width}%`;
    }
  } else if (typeof buttonData?.width === 'string' && buttonData?.width !== '') {
    finalWidth = formatLength(buttonData.width);
  }

  return (
    <Box
      ref={contentRef}
      display="flex"
      justifyContent={
        textAlign === 'left'
          ? 'flex-start'
          : textAlign === 'right'
            ? 'flex-end'
            : 'center'
      }
      alignItems="center"
      height="auto"
      width="100%"
      paddingTop={`${padding.top}px`}
      paddingRight={`${padding.right}px`}
      paddingBottom={`${padding.bottom}px`}
      paddingLeft={`${padding.left}px`}
      marginTop={`${margin.top}px`}
      marginRight={`${margin.right}px`}
      marginBottom={`${margin.bottom}px`}
      marginLeft={`${margin.left}px`}
      onClick={(e) => {
        e.stopPropagation();
        if (onWidgetClick) {
          onWidgetClick(e);
        } else if (onClick) {
          onClick(e as any);
        }
      }}
      sx={{
        cursor: 'pointer',
        "&:hover": {
          border: "1px solid green",
        },
      }}
    >
      <Button
        variant="contained"
        disabled={urlDisabled}
        href={urlDisabled ? undefined : replaceDynamicVariables(url)}
        sx={{
          backgroundColor: bgColor,
          backgroundImage: buttonData?.backgroundImage || buttonData?.bgImage ? `url("${buttonData.backgroundImage || buttonData.bgImage}")` : undefined,
          backgroundSize: buttonData?.backgroundSize || buttonData?.bgSize || 'cover',
          backgroundPosition: buttonData?.backgroundPosition || buttonData?.bgPosition || 'center',
          backgroundRepeat: 'no-repeat',
          color: textColor,
          fontFamily: fontFamily || 'inherit',
          fontSize: `${fontSize}px`,
          fontWeight: fontWeight,
          lineHeight: lineHeight ? `${lineHeight}px` : undefined,
          fontStyle: fontStyle,
          letterSpacing: letterSpacing !== undefined ? `${letterSpacing}px` : undefined,
          textTransform,
          textAlign: textAlign,
          width: finalWidth,
          height: finalHeight,
          minWidth: '64px',
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          borderRadius: `${borderRadius?.topLeft ?? 4}px ${borderRadius?.topRight ?? 4}px ${borderRadius?.bottomRight ?? 4}px ${borderRadius?.bottomLeft ?? 4}px`,
          ...getBorderStyles(buttonData),
          '&:hover': {
            backgroundColor: bgColor,
            opacity: urlDisabled ? 1 : 0.9,
          },
          '&.Mui-disabled': {
            backgroundColor: bgColor,
            color: textColor,
            opacity: 0.7,
          },
          transition: 'all 0.2s ease',
        }}
      >
        {buttonContent}
      </Button>
    </Box>
  );
};

export default ButtonFieldComponent;
