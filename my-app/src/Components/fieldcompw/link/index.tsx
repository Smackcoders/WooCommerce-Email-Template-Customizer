import React from 'react';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedBlockId } from '../../../Store/Slice/workspaceSlice';
import { RootState } from '../../../Store/store';

import { replaceDynamicVariables } from '../../utils/treeHelper';

interface LinkFieldComponentProps {
  blockId: string;
  columnIndex: number;
  isSelected: boolean;
  onClick: () => void;
  onWidgetClick: (e: React.MouseEvent) => void;
  widgetIndex: number;
  widgetData?: any;
}

const LinkFieldComponent: React.FC<LinkFieldComponentProps> = ({
  blockId,
  columnIndex,
  isSelected,
  onClick,
  onWidgetClick,
  widgetIndex,
  widgetData
}) => {
  const dispatch = useDispatch();
  const storeLinkOptions = useSelector((state: RootState) => state.workspace.linkEditorOptions);
  const previewMode = useSelector((state: RootState) => state.workspace.previewMode);

  const linkEditorOptions = widgetData?.contentData
    ? JSON.parse(widgetData.contentData)
    : storeLinkOptions;

  const handleClick = (e: React.MouseEvent) => {
    onWidgetClick(e);
    onClick();
    dispatch(setSelectedBlockId(blockId));

    if (!previewMode) {
      e.preventDefault();
    }
  };

  const {
    fontFamily,
    fontWeight,
    fontStyle,
    textDecoration,
    fontSize,
    color,
    lineHeight,
    letterSpace = 0,
    wordSpacing,
    textStroke,
    textShadow,
    blendMode,
    textAlign,
    textTransform,
    backgroundColor,
    backgroundImage,
    backgroundImageHover,
    backgroundColorHover,
    borderTopStyle,
    borderRightStyle,
    borderBottomStyle,
    borderLeftStyle,
    borderTopWidth,
    borderRightWidth,
    borderBottomWidth,
    borderLeftWidth,
    borderTopColor,
    borderRightColor,
    borderBottomColor,
    borderLeftColor,
    borderRadius,
    boxShadow,
    borderTypeHover,
    borderTopWidthHover,
    borderRightWidthHover,
    borderBottomWidthHover,
    borderLeftWidthHover,
    borderColorHover,
    borderRadiusHover,
    boxShadowHover,
    transitionDuration = 0.3,
    width,
    customWidth,
    height,
    underline,
  } = linkEditorOptions;

  const padding = linkEditorOptions.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const margin = linkEditorOptions.margin || { top: 0, right: 0, bottom: 0, left: 0 };

  const resolvedWidth = width === 'custom' 
    ? customWidth 
    : (width === 'Default' || !width) 
      ? 'auto' 
      : width;

  return (
    <Box
      component="span"
      onClick={handleClick}
      sx={{
        display: 'inline-block',
        textAlign: textAlign || 'left',
        width: resolvedWidth,
        height: height || 'auto',
        marginTop: `${margin.top}${linkEditorOptions.marginUnit || 'px'}`,
        marginRight: `${margin.right}${linkEditorOptions.marginUnit || 'px'}`,
        marginBottom: `${margin.bottom}${linkEditorOptions.marginUnit || 'px'}`,
        marginLeft: `${margin.left}${linkEditorOptions.marginUnit || 'px'}`,
        backgroundColor: backgroundColor || 'transparent',
        backgroundImage: (() => {
          const img = backgroundImage || linkEditorOptions.bgImage;
          if (!img) return undefined;
          if (img.includes('gradient')) return img;
          return `url("${img}")`;
        })(),
        backgroundSize: linkEditorOptions.backgroundSize || linkEditorOptions.bgSize || 'cover',
        backgroundPosition: linkEditorOptions.backgroundPosition || linkEditorOptions.bgPosition || 'center',
        backgroundRepeat: 'no-repeat',
        borderTopWidth: `${borderTopWidth || 0}px`,
        borderTopStyle: borderTopStyle || 'none',
        borderTopColor: borderTopColor || 'transparent',
        borderRightWidth: `${borderRightWidth || 0}px`,
        borderRightStyle: borderRightStyle || 'none',
        borderRightColor: borderRightColor || 'transparent',
        borderBottomWidth: `${borderBottomWidth || 0}px`,
        borderBottomStyle: borderBottomStyle || 'none',
        borderBottomColor: borderBottomColor || 'transparent',
        borderLeftWidth: `${borderLeftWidth || 0}px`,
        borderLeftStyle: borderLeftStyle || 'none',
        borderLeftColor: borderLeftColor || 'transparent',
        borderTopLeftRadius: typeof borderRadius === 'object' ? `${borderRadius?.top || 0}${linkEditorOptions.borderRadiusUnit || 'px'}` : `${borderRadius || 0}${linkEditorOptions.borderRadiusUnit || 'px'}`,
        borderTopRightRadius: typeof borderRadius === 'object' ? `${borderRadius?.right || 0}${linkEditorOptions.borderRadiusUnit || 'px'}` : `${borderRadius || 0}${linkEditorOptions.borderRadiusUnit || 'px'}`,
        borderBottomRightRadius: typeof borderRadius === 'object' ? `${borderRadius?.bottom || 0}${linkEditorOptions.borderRadiusUnit || 'px'}` : `${borderRadius || 0}${linkEditorOptions.borderRadiusUnit || 'px'}`,
        borderBottomLeftRadius: typeof borderRadius === 'object' ? `${borderRadius?.left || 0}${linkEditorOptions.borderRadiusUnit || 'px'}` : `${borderRadius || 0}${linkEditorOptions.borderRadiusUnit || 'px'}`,
        boxShadow: boxShadow || 'none',
        transition: `background-color ${transitionDuration}s ease, border ${transitionDuration}s ease, border-radius ${transitionDuration}s ease, box-shadow ${transitionDuration}s ease`,
        border: isSelected ? '2px dashed blue' : 'none',
        cursor: 'pointer',
        '&:hover': {
          ...(backgroundColorHover && { backgroundColor: backgroundColorHover }),
          ...(backgroundImageHover && {
            backgroundImage: backgroundImageHover.includes('gradient')
              ? backgroundImageHover
              : `url("${backgroundImageHover}")`
          }),
          ...(borderTypeHover && {
             borderTopStyle: borderTypeHover,
             borderRightStyle: borderTypeHover,
             borderBottomStyle: borderTypeHover,
             borderLeftStyle: borderTypeHover,
          }),
          ...(borderColorHover && {
             borderTopColor: borderColorHover,
             borderRightColor: borderColorHover,
             borderBottomColor: borderColorHover,
             borderLeftColor: borderColorHover,
          }),
          ...(borderTopWidthHover !== undefined && { borderTopWidth: `${borderTopWidthHover}px` }),
          ...(borderRightWidthHover !== undefined && { borderRightWidth: `${borderRightWidthHover}px` }),
          ...(borderBottomWidthHover !== undefined && { borderBottomWidth: `${borderBottomWidthHover}px` }),
          ...(borderLeftWidthHover !== undefined && { borderLeftWidth: `${borderLeftWidthHover}px` }),
          ...(borderRadiusHover !== undefined && {
             borderTopLeftRadius: typeof borderRadiusHover === 'object' ? `${borderRadiusHover?.top || 0}px` : `${borderRadiusHover || 0}px`,
             borderTopRightRadius: typeof borderRadiusHover === 'object' ? `${borderRadiusHover?.right || 0}px` : `${borderRadiusHover || 0}px`,
             borderBottomRightRadius: typeof borderRadiusHover === 'object' ? `${borderRadiusHover?.bottom || 0}px` : `${borderRadiusHover || 0}px`,
             borderBottomLeftRadius: typeof borderRadiusHover === 'object' ? `${borderRadiusHover?.left || 0}px` : `${borderRadiusHover || 0}px`,
          }),
          ...(boxShadowHover && { boxShadow: boxShadowHover }),
        },
      }}
    >
      <a
        href={replaceDynamicVariables(linkEditorOptions.url) || '#'}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          width: '100%',
          height: '100%',
          paddingTop: `${padding.top}${linkEditorOptions.paddingUnit || 'px'}`,
          paddingRight: `${padding.right}${linkEditorOptions.paddingUnit || 'px'}`,
          paddingBottom: `${padding.bottom}${linkEditorOptions.paddingUnit || 'px'}`,
          paddingLeft: `${padding.left}${linkEditorOptions.paddingUnit || 'px'}`,
          backgroundColor: 'transparent',
          cursor: 'pointer',
          textDecoration: textDecoration || (underline ? 'underline' : 'none'),
          fontFamily: fontFamily === 'global' ? 'inherit' : (fontFamily || 'inherit'),
          fontSize: `${fontSize || 14}px`,
          fontStyle: fontStyle || 'normal',
          lineHeight: lineHeight ? `${lineHeight}px` : undefined,
          letterSpacing: letterSpace !== undefined ? `${letterSpace}px` : undefined,
          wordSpacing: wordSpacing !== undefined ? `${wordSpacing}px` : undefined,
          textTransform: textTransform || 'none',
          color: color || '#007bff',
          fontWeight: fontWeight || 'normal',
          WebkitTextStroke: textStroke || undefined,
          textShadow: textShadow || undefined,
          mixBlendMode: (blendMode as any) || 'normal',
        }}
      >
        {replaceDynamicVariables(linkEditorOptions.text) || 'Click here'}
      </a>
    </Box>
  );
};

export default LinkFieldComponent;
