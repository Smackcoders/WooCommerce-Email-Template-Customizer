import { Box, Typography, IconButton } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../Store/store';
import {
  openEditor,
  defaultHeadingEditorOptions,
  updateWidgetContentData,
} from '../../../Store/Slice/workspaceSlice';
import { useRef } from 'react';
import { useDrop } from 'react-dnd';
import { replaceDynamicVariables } from '../../utils/treeHelper';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import { getWidgetComponent } from '../../utils/getWidgetComponent';

interface HeadingFieldComponentProps {
  blockId: string;
  columnIndex: number;
  onClick: (e?: React.MouseEvent) => void;
  onWidgetClick?: (e: React.MouseEvent) => void;
  widgetIndex: number;
  previewMode?: boolean;
  widgetData?: any;
  path?: Array<{ colIdx: number; childIdx: number }>;
}

const HeadingFieldComponent: React.FC<HeadingFieldComponentProps> = ({ blockId, columnIndex, onClick, onWidgetClick, widgetIndex, widgetData, previewMode, path = [] }) => {
  const dispatch = useDispatch();
  const contentRef = useRef<HTMLDivElement>(null);
  const selectedNestedPath = useSelector((state: RootState) => state.workspace.selectedNestedPath);
  const { selectedBlockForEditor, selectedColumnIndex, selectedSubElementId } = useSelector((state: RootState) => state.workspace);
  const isSelected = selectedBlockForEditor === blockId && selectedColumnIndex === columnIndex;
  const column = useSelector((state: RootState) =>
    state.workspace.blocks.find(block => block.id === blockId)?.columns[columnIndex]
  );
  const storeWidgetContent = column?.widgetContents[widgetIndex] || null;
  const finalContentData = widgetData ? widgetData.contentData : storeWidgetContent?.contentData;
  const headingContent = finalContentData
    ? { ...defaultHeadingEditorOptions, ...JSON.parse(finalContentData) }
    : defaultHeadingEditorOptions;

  // Ensure padding exists
  if (!headingContent.padding) {
    headingContent.padding = { top: 10, right: 10, bottom: 10, left: 10 };
  }

  // Ensure margin exists
  if (!headingContent.margin) {
    headingContent.margin = { top: 0, right: 0, bottom: 0, left: 0 };
  }

  const isCurrentSelection = (childIdx: number) => {
    if (!selectedNestedPath || selectedNestedPath.length !== path.length + 1) return false;
    for (let i = 0; i < path.length; i++) {
      if (selectedNestedPath[i].colIdx !== path[i].colIdx || selectedNestedPath[i].childIdx !== path[i].childIdx) return false;
    }
    const lastPart = selectedNestedPath[selectedNestedPath.length - 1];
    return lastPart.colIdx === -1 && lastPart.childIdx === childIdx;
  };

  const handleDeleteChild = (e: React.MouseEvent, childIndex: number) => {
    e.stopPropagation();
    const updatedChildren = (headingContent.children || []).filter((_: any, idx: number) => idx !== childIndex);
    const updatedData = { ...headingContent, children: updatedChildren };

    dispatch(updateWidgetContentData({
      blockId,
      columnIndex,
      widgetIndex,
      data: JSON.stringify(updatedData),
      nestedPath: path
    }));
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ['content'],
    canDrop: (item: any) => item.widgetType === 'link',
    drop: (item: any, monitor) => {
      if (monitor.didDrop()) return;
      const linkText = item.customData?.text || 'Click here';
      const linkUrl = item.customData?.url || '#';
      const linkColor = item.customData?.color || '#007bff';
      const underline = item.customData?.underline || false;
      
      const newChildData = {
        text: linkText,
        url: linkUrl,
        color: linkColor,
        underline,
        fontFamily: 'global',
        fontSize: headingContent.fontSize || 14,
        fontWeight: 'normal',
        widthAuto: true,
        display: 'inline-block',
      };

      const newChild = {
        id: `child_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        contentType: 'link',
        contentData: JSON.stringify(newChildData)
      };

      const updatedOptions = {
        ...headingContent,
        children: [...(headingContent.children || []), newChild]
      };
      
      dispatch(
        updateWidgetContentData({
          blockId,
          columnIndex,
          widgetIndex,
          data: JSON.stringify(updatedOptions),
          nestedPath: path
        })
      );
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  }), [headingContent, blockId, columnIndex, widgetIndex, dispatch, path]);

  drop(contentRef);

  const handleSelectTextField = (e?: React.MouseEvent) => {
    if (onWidgetClick && e) {
      onWidgetClick(e);
    } else if (onClick && e) {
      e.stopPropagation();
      onClick(e);
    } else {
      // Fallback for standalone usage if any
      if (!isSelected) {
        dispatch(openEditor({ blockId, columnIndex, widgetIndex }));
      }
    }
  };

  const { fontFamily, fontWeight, fontSize, color, textAlign, textTransform, lineHeight, letterSpace, content, backgroundColor, headingType, width, customWidth, height, display, justifyContent, alignItems, alignSelf, order, flexSize, position, zIndex } = headingContent;
  const padding = headingContent.padding || { top: 0, right: 0, bottom: 0, left: 0 };
  const margin = headingContent.margin || { top: 0, right: 0, bottom: 0, left: 0 };
  const hasContent = true;

  const resolvedDisplay = display || 'block';

  const customAttributes: Record<string, string> = {};
  if (headingContent.linkCustomAttributes) {
    const attributesArray = headingContent.linkCustomAttributes.split(',');
    attributesArray.forEach((attr: string) => {
      const [key, value] = attr.split('|');
      if (key && value) {
        customAttributes[key.trim()] = value.trim();
      }
    });
  }

  const resolvedWidth = width === 'custom' 
    ? customWidth 
    : (width === 'Default' || !width) 
      ? (resolvedDisplay === 'inline' || resolvedDisplay === 'inline-block' ? "auto" : "100%") 
      : width;

  return (
    <Box
      ref={contentRef}
      onClick={(e) => handleSelectTextField(e)}
      sx={{
        width: resolvedWidth,
        display: resolvedDisplay,
        backgroundColor: backgroundColor,
        backgroundImage: (() => {
          const img = headingContent.backgroundImage || headingContent.bgImage;
          if (!img) return undefined;
          if (img.includes('gradient')) return img;
          return `url("${img}")`;
        })(),
        backgroundSize: headingContent.backgroundSize || headingContent.bgSize || 'cover',
        backgroundPosition: headingContent.backgroundPosition || headingContent.bgPosition || 'center',
        backgroundRepeat: 'no-repeat',
        padding: `${padding.top}${headingContent.paddingUnit || 'px'} ${padding.right}${headingContent.paddingUnit || 'px'} ${padding.bottom}${headingContent.paddingUnit || 'px'} ${padding.left}${headingContent.paddingUnit || 'px'}`,
        margin: `${margin.top}${headingContent.marginUnit || 'px'} ${margin.right}${headingContent.marginUnit || 'px'} ${margin.bottom}${headingContent.marginUnit || 'px'} ${margin.left}${headingContent.marginUnit || 'px'}`,
        borderTopWidth: `${headingContent.borderTopWidth || 0}px`,
        borderTopStyle: headingContent.borderTopStyle || 'none',
        borderTopColor: headingContent.borderTopColor || 'transparent',
        borderRightWidth: `${headingContent.borderRightWidth || 0}px`,
        borderRightStyle: headingContent.borderRightStyle || 'none',
        borderRightColor: headingContent.borderRightColor || 'transparent',
        borderBottomWidth: `${headingContent.borderBottomWidth || 0}px`,
        borderBottomStyle: headingContent.borderBottomStyle || 'none',
        borderBottomColor: headingContent.borderBottomColor || 'transparent',
        borderLeftWidth: `${headingContent.borderLeftWidth || 0}px`,
        borderLeftStyle: headingContent.borderLeftStyle || 'none',
        borderLeftColor: headingContent.borderLeftColor || 'transparent',
        borderTopLeftRadius: typeof headingContent.borderRadius === 'object' ? `${headingContent.borderRadius?.top || 0}${headingContent.borderRadiusUnit || 'px'}` : `${headingContent.borderRadius || 0}${headingContent.borderRadiusUnit || 'px'}`,
        borderTopRightRadius: typeof headingContent.borderRadius === 'object' ? `${headingContent.borderRadius?.right || 0}${headingContent.borderRadiusUnit || 'px'}` : `${headingContent.borderRadius || 0}${headingContent.borderRadiusUnit || 'px'}`,
        borderBottomRightRadius: typeof headingContent.borderRadius === 'object' ? `${headingContent.borderRadius?.bottom || 0}${headingContent.borderRadiusUnit || 'px'}` : `${headingContent.borderRadius || 0}${headingContent.borderRadiusUnit || 'px'}`,
        borderBottomLeftRadius: typeof headingContent.borderRadius === 'object' ? `${headingContent.borderRadius?.left || 0}${headingContent.borderRadiusUnit || 'px'}` : `${headingContent.borderRadius || 0}${headingContent.borderRadiusUnit || 'px'}`,
        height: height || "auto",
        cursor: "pointer",
        boxSizing: "border-box",
        minHeight: "auto",
        justifyContent: justifyContent || "flex-start",
        alignItems: alignItems || "stretch",
        boxShadow: headingContent.boxShadow || 'none',
        transform: headingContent.transform || 'none',
        transition: `transform ${headingContent.transitionDuration ?? 0.3}s ease, background-color ${headingContent.transitionDuration ?? 0.3}s ease, border ${headingContent.transitionDuration ?? 0.3}s ease, border-radius ${headingContent.transitionDuration ?? 0.3}s ease, box-shadow ${headingContent.transitionDuration ?? 0.3}s ease`,
        border: isSelected && !selectedSubElementId ? '2px dashed blue' : (isOver ? '2px dashed green' : 'none'),
        ...(selectedSubElementId && {
          [`& #${selectedSubElementId}`]: {
            outline: '2px dashed orange',
            borderRadius: '2px',
            padding: '1px 2px',
            backgroundColor: '#f0f8ff',
          }
        }),
        '&:hover': {
          ...(headingContent.transformHover && { transform: headingContent.transformHover }),
          ...(headingContent.backgroundColorHover && { backgroundColor: headingContent.backgroundColorHover }),
          ...(headingContent.backgroundImageHover && {
            backgroundImage: headingContent.backgroundImageHover.includes('gradient')
              ? headingContent.backgroundImageHover
              : `url("${headingContent.backgroundImageHover}")`
          }),
          ...(headingContent.borderTypeHover && {
             borderTopStyle: headingContent.borderTypeHover,
             borderRightStyle: headingContent.borderTypeHover,
             borderBottomStyle: headingContent.borderTypeHover,
             borderLeftStyle: headingContent.borderTypeHover,
          }),
          ...(headingContent.borderColorHover && {
             borderTopColor: headingContent.borderColorHover,
             borderRightColor: headingContent.borderColorHover,
             borderBottomColor: headingContent.borderColorHover,
             borderLeftColor: headingContent.borderColorHover,
          }),
          ...(headingContent.borderTopWidthHover !== undefined && { borderTopWidth: `${headingContent.borderTopWidthHover}px` }),
          ...(headingContent.borderRightWidthHover !== undefined && { borderRightWidth: `${headingContent.borderRightWidthHover}px` }),
          ...(headingContent.borderBottomWidthHover !== undefined && { borderBottomWidth: `${headingContent.borderBottomWidthHover}px` }),
          ...(headingContent.borderLeftWidthHover !== undefined && { borderLeftWidth: `${headingContent.borderLeftWidthHover}px` }),
          ...(headingContent.borderRadiusHover !== undefined && {
             borderTopLeftRadius: typeof headingContent.borderRadiusHover === 'object' ? `${headingContent.borderRadiusHover?.top || 0}px` : `${headingContent.borderRadiusHover || 0}px`,
             borderTopRightRadius: typeof headingContent.borderRadiusHover === 'object' ? `${headingContent.borderRadiusHover?.right || 0}px` : `${headingContent.borderRadiusHover || 0}px`,
             borderBottomRightRadius: typeof headingContent.borderRadiusHover === 'object' ? `${headingContent.borderRadiusHover?.bottom || 0}px` : `${headingContent.borderRadiusHover || 0}px`,
             borderBottomLeftRadius: typeof headingContent.borderRadiusHover === 'object' ? `${headingContent.borderRadiusHover?.left || 0}px` : `${headingContent.borderRadiusHover || 0}px`,
          }),
          ...(headingContent.boxShadowHover && { boxShadow: headingContent.boxShadowHover }),
        },
      }}
    >
      {hasContent ? (
        <Typography
          variant={headingType === 'p' ? 'body1' : (headingType as any || "h1")}
          component={headingType || "h1"}
          sx={{
            fontFamily: fontFamily === "global" ? "inherit" : fontFamily,
            fontWeight: fontWeight,
            fontStyle: headingContent.fontStyle || 'normal',
            textDecoration: headingContent.textDecoration || 'none',
            fontSize: `${fontSize}px`,
            color: color,
            lineHeight: lineHeight ? `${lineHeight}px` : undefined,
            letterSpacing: `${letterSpace}px`,
            wordSpacing: headingContent.wordSpacing ? `${headingContent.wordSpacing}px` : undefined,
            textAlign: textAlign,
            textTransform: textTransform || 'none',
            WebkitTextStroke: headingContent.textStroke || undefined,
            textShadow: headingContent.textShadow || undefined,
            mixBlendMode: (headingContent.blendMode as any) || 'normal',
            transition: `color ${headingContent.transitionDuration ?? 0.3}s ease`,
            '&:hover': headingContent.hoverColor ? { color: headingContent.hoverColor } : {},
            width: (resolvedDisplay === 'inline' || resolvedDisplay === 'inline-block') ? "auto" : "100%",
            display: (resolvedDisplay === 'inline' || resolvedDisplay === 'inline-block') ? "inline-block" : "block",
            margin: 0,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}
        >
          <>
            {headingContent.link ? (
              <a 
                href={headingContent.link} 
                target={headingContent.linkTarget || "_blank"} 
                rel={headingContent.linkNoFollow ? "nofollow" : undefined}
                style={{ textDecoration: 'none', color: 'inherit', display: 'inline' }}
                {...customAttributes}
              >
                {replaceDynamicVariables(content) || "Type your heading here..."}
              </a>
            ) : (
              replaceDynamicVariables(content) || "Type your heading here..."
            )}
            {headingContent.children?.map((child: any, idx: number) => {
              const WidgetComponent = getWidgetComponent(child.contentType);
              if (!WidgetComponent) return null;
              const isChildSelected = isCurrentSelection(idx);
              const childPath = [...path, { colIdx: -1, childIdx: idx }];
              return (
                <span
                  key={child.id || idx}
                  style={{
                    position: 'relative',
                    display: 'inline-block',
                    marginLeft: '8px',
                    marginRight: '8px',
                    verticalAlign: 'middle',
                  }}
                >
                  <span style={{ pointerEvents: 'none' }}>
                    <WidgetComponent
                      blockId={blockId}
                      columnIndex={columnIndex}
                      widgetIndex={widgetIndex}
                      widgetData={child}
                      isSelected={isChildSelected}
                      path={childPath}
                      onClick={() => {}}
                      onWidgetClick={() => {}}
                    />
                  </span>
                  <span
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      cursor: 'pointer',
                      border: isChildSelected ? '1px dashed orange' : 'none',
                      zIndex: 2
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(openEditor({
                        blockId,
                        columnIndex,
                        contentType: child.contentType,
                        widgetIndex: widgetIndex,
                        nestedPath: childPath
                      }));
                    }}
                  />
                  {isChildSelected && (
                    <span
                      style={{
                        position: 'absolute',
                        right: -8,
                        top: -16,
                        backgroundColor: 'white',
                        borderRadius: '50%',
                        boxShadow: '0px 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 10,
                        cursor: 'pointer',
                        display: 'inline-flex'
                      }}
                    >
                      <IconButton size="small" style={{ padding: '2px' }} onClick={(e) => handleDeleteChild(e, idx)}>
                        <CloseIcon style={{ fontSize: '12px' }} color="error" />
                      </IconButton>
                    </span>
                  )}
                </span>
              );
            })}
          </>
        </Typography>
      ) : (
        <Box sx={{ color: "text.secondary", textAlign: "center", fontStyle: "italic" }}>
          No content here. Drag content from .
        </Box>
      )}
    </Box>
  );
}

export default HeadingFieldComponent;
