import { useRef, useEffect, useState } from "react";
import DraggableWidgetWrapper from "./DraggableWidgetWrapper";
import { useDrop } from "react-dnd";
import { useSelector, useDispatch } from "react-redux";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip,
} from "@mui/material";
import { RootState } from "../../../Store/store";
import {
  addBlock,
  copyBlock,
  deleteBlock,
  setSelectedBlockId,
  openEditor,
  closeEditor,
  addColumnContent,
  defaultSocialIconsEditorOptions,
  reorderBlocks,
  Column,
  DroppedBlock,
  WidgetContentType,
  defaultButtonEditorOptions,
  defaultTextEditorOptions,
  defaultHeadingEditorOptions,
  defaultTaxBillingEditorOptions,
  setBlocks,
  defaultDividerEditorOptions,
  defaultSelectEditorOptions,
  defaultOrderSubtotalEditorOptions,
  defaultOrderTotalEditorOptions,
  defaultShippingMethodEditorOptions,
  defaultPaymentMethodEditorOptions,
  defaultCustomerNoteEditorOptions,
  defaultEmailHeaderEditorOptions,
  defaultEmailFooterEditorOptions,
  defaultPriceEditorOptions,
  defaultContactEditorOptions,
  defaultProductDetailsEditorOptions,
  moveColumnContent,
} from "../../../Store/Slice/workspaceSlice";
import { getViewportWidth } from "../../utils/viewportWidths";
import AddIcon from "@mui/icons-material/Add";
import ContentCopyTwoToneIcon from "@mui/icons-material/ContentCopyTwoTone";
import DeleteOutlineTwoToneIcon from "@mui/icons-material/DeleteOutlineTwoTone";
import EditIcon from '@mui/icons-material/Edit';

import { getWidgetComponent, regenerateIds } from "../../utils/getWidgetComponent";
import { useDrag, useDragLayer } from "react-dnd";
import axios from "axios";
import { ajaxUrl } from "../../../Constants/Constants";

interface BlockItem {
  id: string;
  index: number;
}

interface WorkspaceAreaProps {
  previewMode?: boolean;
}

const WorkspaceArea = ({
  previewMode = false,
}: WorkspaceAreaProps) => {
  const dispatch = useDispatch();
  const { blocks, selectedBlockId, viewportMode, bodyStyle } = useSelector(
    (state: RootState) => state.workspace
  );

  useEffect(() => {
    console.log("Renderer Version: EXACT_REPLICA_V1 (Height fixed)");
  }, []);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState<string | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isLayoutSelectorOpen, setIsLayoutSelectorOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const [, dropLayout] = useDrop(() => ({
    accept: "layout",
    drop: (item: { columns: number }, monitor) => {
      if (monitor.didDrop()) return;
      if (!previewMode) {
        dispatch(addBlock({ columns: item.columns }));
      }
    },
  }), [previewMode, dispatch]);

  useEffect(() => {
    if (dropRef.current) dropLayout(dropRef.current);
  }, [dropLayout]);


  const canvasWidth = getViewportWidth(viewportMode);
  const stackColumns = viewportMode === "mobile";

  useEffect(() => {
    if (!window.emailCustomizerAjax) {
      // console.error("emailCustomizerAjax is undefined");
      return;
    }

    const templateId = new URLSearchParams(window.location.search).get("id");
    if (!templateId) {
      return;
    }

    const fetchTemplateData = async () => {
      setIsLoading(true);
      try {
        const formData = new URLSearchParams();
        formData.append("action", "get_email_template_json");
        formData.append("template_id", templateId);
        formData.append("_ajax_nonce", window.emailCustomizerAjax.nonce);

        const response = await axios.post(
          window.emailCustomizerAjax.ajax_url,
          formData,
          {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          }
        );

        if (response.data.success && response.data.data?.json_data) {
          try {
            let parsedBlocks: DroppedBlock[] = JSON.parse(response.data.data.json_data || '[]');

            if (parsedBlocks.length > 0) {
              parsedBlocks = parsedBlocks.map(block => {
                const firstCol = block.columns[0];
                const firstColContent = firstCol?.widgetContents?.[0];

                if (firstColContent && firstColContent.contentType && ['section', 'row', 'container'].includes(firstColContent.contentType) && block.columns.length > 1) {
                  const hasExtraEmptyCols = block.columns.slice(1).every(col => col.widgetContents.length === 0);
                  if (hasExtraEmptyCols) {
                    return {
                      ...block,
                      columns: [firstCol]
                    };
                  }
                }
                return block;
              });

              parsedBlocks = parsedBlocks.filter(block => {
                return !block.columns.every(col => col.widgetContents.length === 0);
              });
            }

            dispatch(setBlocks(parsedBlocks));
            sessionStorage.setItem("templateJsonData", response.data.data.json_data);
          } catch (parseError: any) {
            console.error("Error parsing template JSON data:", parseError);
          }
        }
      } catch (error: any) {
        console.error("AJAX Error:", error.message || error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplateData();
  }, [dispatch]);

  const handleClickOutside = (e: any) => {
    if (previewMode) return;

    // Intercept link clicks in the editor to prevent accidental redirection
    const linkElement = e.target.closest("a");
    if (linkElement) {
      e.preventDefault();
    }

    const clickedInsideBlock = e.target.closest(".block");
    const clickedInsideEditor = e.target.closest(".layout-editor-widget");
    if (!clickedInsideBlock && !clickedInsideEditor) {
      dispatch(setSelectedBlockId(null));
      dispatch(openEditor({ blockId: null, columnIndex: null, widgetIndex: null, contentType: null }));
    }
  };

  const handleBlockClick = (id: string) => {
    if (previewMode) return;
    dispatch(setSelectedBlockId(id));
    dispatch(openEditor({ blockId: id, columnIndex: null }));
  };

  const handleDelete = (id: string) => {
    if (previewMode) return;
    dispatch(deleteBlock(id));
  };

  const handleCopy = (id: string) => {
    if (previewMode) return;
    dispatch(copyBlock(id));
  };

  const handleAddLayout = (columns: number) => {
    dispatch(addBlock({ columns }));
    setIsLayoutSelectorOpen(false);
  };

  return (
    <Box
      ref={dropRef}
      onClick={(e) => {
        // Deselect if clicking on the background (Outer workspace)
        if (e.target === e.currentTarget && !previewMode) {
          dispatch(setSelectedBlockId(null));
          dispatch(openEditor({ blockId: null, columnIndex: null, widgetIndex: null, contentType: null }));
        }
      }}
      onClickCapture={handleClickOutside}
      sx={{
        width: "100%",
        minHeight: "100%",
        backgroundColor: "#f5f7f9",
        overflow: "visible",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "24px 16px",
        boxSizing: "border-box",
        position: "relative",
      }}
    >
      {/* Loading Spinner Overlay */}
      {isLoading && (
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(245, 247, 249, 0.85)',
            zIndex: 9999,
            gap: 2,
          }}
        >
          <CircularProgress size={40} thickness={4} sx={{ color: '#2196F3' }} />
          <Typography sx={{ fontSize: '13px', color: '#666', fontWeight: 500 }}>
            Loading template...
          </Typography>
        </Box>
      )}



      {/* Viewport Mode Banner */}
      {!previewMode && viewportMode !== 'desktop' && (
        <Box sx={{
          width: '100%',
          maxWidth: `${canvasWidth}px`,
          margin: '0 auto 8px',
          py: 0.5,
          px: 1.5,
          bgcolor: viewportMode === 'mobile' ? '#e3f2fd' : '#f3e5f5',
          border: `1px solid ${viewportMode === 'mobile' ? '#90caf9' : '#ce93d8'}`,
          borderRadius: '6px',
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}>
          <Box component="span" sx={{ fontSize: '13px', lineHeight: 1 }}>
            {viewportMode === 'mobile' ? '📱' : '📟'}
          </Box>
          <Box sx={{ fontSize: '11px', fontWeight: 600, color: viewportMode === 'mobile' ? '#1565c0' : '#6a1b9a' }}>
            {viewportMode === 'mobile' ? 'Mobile View' : 'Tablet View'} — {canvasWidth}px wide
          </Box>
          <Box sx={{ fontSize: '10px', color: '#888', ml: 'auto', fontStyle: 'italic' }}>
            Editing styles applies to all devices
          </Box>
        </Box>
      )}

      {/* Area 2: The Colored Background Section */}
      <Box
        sx={{
          width: "100%",
          maxWidth: `${canvasWidth}px`,
          margin: "0 auto",
          backgroundColor: bodyStyle?.backgroundColor || "#ffffff",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "24px 16px",
          minHeight: "fit-content",
          position: "relative",
          flexShrink: 0,
          borderRadius: "2px",
          boxSizing: "border-box",
        }}
      >

        {/* Background Button - Aligned with the layout */}
        {!previewMode && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, pr: '8px' }}>
            <Button
              variant="contained"
              size="small"
              startIcon={<EditIcon sx={{ fontSize: 16 }} />}
              onClick={(e) => {
                e.stopPropagation();
                dispatch(setSelectedBlockId(null));
                dispatch(openEditor({
                  blockId: null, columnIndex: null, widgetIndex: null, contentType: null
                }));
              }}
              sx={{
                textTransform: 'none',
                boxShadow: 'none',
                color: '#333',
                backgroundColor: '#ebebeb',
                borderRadius: '4px',
                height: '32px',
                border: '1px solid #ccc',
                '&:hover': {
                  backgroundColor: '#dadada',
                  boxShadow: 'none',
                }
              }}
            >
              Background
            </Button>
          </Box>
        )}

        {/* Area 1: The White Email Layout (600px) */}
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            backgroundSize: "cover",
            backgroundColor: "#ffffff",
            margin: "0 auto",
            minHeight: "auto",
            height: "auto",
            flexShrink: 0,
            boxShadow: "none",
            border: "none",
            display: "flex",
            flexDirection: "column",
            transition: "all 0.3s ease",
            boxSizing: "border-box",
            position: "relative",
            overflow: "hidden",
            minWidth: 0,
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget && !previewMode) {
              dispatch(setSelectedBlockId(null));
              dispatch(openEditor({ blockId: null, columnIndex: null, widgetIndex: null, contentType: null }));
            }
          }}
        >
          {/* Email Content Area */}
          <Box sx={{
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            padding: "8px",
            boxSizing: 'border-box',
            overflowX: 'auto',
            overflowY: 'visible',
            WebkitOverflowScrolling: 'touch',
          }}>
            {blocks.length === 0 && !previewMode && !isLayoutSelectorOpen && (
              <Box
                sx={{
                  border: "1px dashed #cccccc",
                  borderRadius: "4px",
                  padding: 2,
                  textAlign: "center",
                  color: "#999",
                  fontSize: "14px",
                  width: "100%",
                  minHeight: "120px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "transparent",
                  boxSizing: 'border-box',
                  cursor: "pointer"
                }}
                onClick={() => setIsLayoutSelectorOpen(true)}
              >
                <Box
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsLayoutSelectorOpen(true);
                  }}
                  sx={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: '#666', // Darker gray for contrast
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: '#444',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <AddIcon sx={{ color: '#fff', fontSize: 20 }} />
                </Box>
                <Typography sx={{ mt: 1 }}>Add Layout</Typography>
              </Box>
            )}

            {blocks.map((block, index) => (
              <Block
                key={block.id}
                block={block}
                index={index}
                handleBlockClick={handleBlockClick}
                handleCopy={handleCopy}
                handleDelete={handleDelete}
                selectedBlockId={selectedBlockId}
                stackColumns={stackColumns}
                viewportMode={viewportMode}
                previewMode={previewMode}
              />
            ))}

            {isLayoutSelectorOpen && (
              <>
                <Box
                  onClick={() => setIsLayoutSelectorOpen(false)}
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 9,
                    cursor: 'default'
                  }}
                />
                <Box
                  sx={{
                    mt: 2,
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: '#fff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '4px',
                    padding: '15px 25px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    gap: '30px',
                    position: 'relative',
                    zIndex: 10,
                    width: 'fit-content',
                    margin: '20px auto'
                  }}
                >
                  {[1, 2, 3, 4].map((cols) => (
                    <Box
                      key={cols}
                      onClick={() => handleAddLayout(cols)}
                      sx={{
                        display: "flex",
                        gap: "2px",
                        cursor: "pointer",
                        width: "70px", // Fixed total width for all options
                        height: "45px",
                        transition: "opacity 0.2s",
                        opacity: 0.8,
                        "&:hover": {
                          opacity: 1
                        }
                      }}
                    >
                      {Array.from({ length: cols }).map((_, i) => (
                        <Box
                          key={i}
                          className="col-block"
                          sx={{
                            flex: 1, // Divide the 70px width equally
                            height: "100%",
                            backgroundColor: "#5e6266",
                            borderRadius: "2px"
                          }}
                        />
                      ))}
                    </Box>
                  ))}
                </Box>
              </>
            )}

          </Box>
        </Box> {/* End Area 1: White Box */}

        {blocks.length > 0 && !previewMode && !isLayoutSelectorOpen && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            mt: 2
          }}>
            <Tooltip title="Add Layout">
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLayoutSelectorOpen(true);
                }}
                sx={{
                  width: '32px',
                  height: '32px',
                  backgroundColor: '#666', // Darker gray for contrast
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: '#444',
                    transform: 'scale(1.1)'
                  }
                }}
              >
                <AddIcon sx={{ color: '#fff', fontSize: 20 }} />
              </Box>
            </Tooltip>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default WorkspaceArea;

// Block Component
interface BlockProps {
  block: DroppedBlock;
  index: number;
  handleBlockClick: (id: string) => void;
  handleCopy: (id: string) => void;
  handleDelete: (id: string) => void;
  selectedBlockId: string | null;
  stackColumns: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
  previewMode: boolean;
}

const Block = ({
  block,
  index,
  handleBlockClick,
  handleCopy,
  handleDelete,
  selectedBlockId,
  stackColumns,
  viewportMode,
  previewMode,
}: BlockProps) => {
  const dispatch = useDispatch();
  const ref = useRef<HTMLDivElement>(null);

  const { isDraggingGlobal } = useDragLayer((monitor) => ({
    isDraggingGlobal: monitor.isDragging(),
  }));

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "block",
    item: { id: block.id, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "block",
    hover: (item: BlockItem, monitor) => {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = (clientOffset as any).y - hoverBoundingRect.top;



      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      dispatch(reorderBlocks({ sourceId: item.id, targetId: block.id }));

      item.index = hoverIndex;
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  useEffect(() => {
    if (ref.current) {
      drag(drop(ref.current));
    }
  }, [drag, drop]);

  return (
    <Box
      ref={ref}
      className="block"
      id={block.id}
      onClick={(e) => {
        e.stopPropagation();
        if (!previewMode) {
          handleBlockClick(block.id);
        }
      }}
      sx={{
        display: "flex",
        flexDirection: stackColumns ? "column" : "row",
        maxWidth: "100%",
        minWidth: 0,
        margin: previewMode ? "0" : "0 auto",
        width: "100%",
        boxSizing: "border-box",
        cursor: previewMode ? "default" : "pointer",
        opacity: isDragging ? 0.5 : 1,
        zIndex: (selectedBlockId === block.id || isDragging) ? 2 : 1,
        overflow: "visible", // Ensure actions at top-right are visible
        flexShrink: 0, // Ensure blocks don't collapse
        // Using pseudo-element overlay for guaranteed visibility
        position: "relative",
        boxShadow: "none",
        outline: "none",
        "&::after": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 10,
          border: (selectedBlockId === block.id && !previewMode) ? "1px solid #2196F3" : "none",
        },
        "&:hover": {
          zIndex: 2,
          "&::after": {
            border: (!previewMode && !isDraggingGlobal) ? "1px solid #2196F3" : undefined,
          },
          ".action-btn": {
            display: (!previewMode && !isDraggingGlobal) ? "block" : "none",
          },
        },
      }}
    >
      {block.columns.map((column, i) => (
        <ColumnDropTarget
          key={column.id || i}
          block={block}
          column={column}
          columnIndex={i}
          stackColumns={stackColumns}
          previewMode={previewMode}
          viewportMode={viewportMode}
        />
      ))}

      {
        !previewMode && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: -70, // Float left into Area 1 (Colored section)
              display: "flex",
              justifyContent: "left",
              width: 70,
              backgroundColor: "transparent",
              zIndex: 11,
            }}
          >
            <Tooltip title="duplicate" placement="bottom">
              <ContentCopyTwoToneIcon
                sx={{
                  padding: "4px 8px",
                  fontSize: 34,
                  background: "transparent",
                  borderRadius: "50%",
                  transition: "0.2s ease",
                  "&:hover": {
                    background: "#3d3d3d",
                    color: "#fff",
                  },
                  display: selectedBlockId === block.id ? "block" : "none",
                }}
                className="action-btn"
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopy(block.id);
                }}
              />
            </Tooltip>

            <Tooltip title="delete" placement="bottom">
              <DeleteOutlineTwoToneIcon
                fontSize="medium"
                className="action-btn"
                sx={{
                  padding: "3px 6px",
                  fontSize: 34,
                  background: "transparent",
                  transition: "0.2s ease",
                  borderRadius: "50%",
                  "&:hover": {
                    background: "#e12c05",
                    color: "#fff",
                  },
                  display: selectedBlockId === block.id ? "block" : "none",
                }}
                color="primary"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(block.id);
                }}
              />
            </Tooltip>
          </Box>
        )
      }
    </Box >
  );
};

// Column Component
interface ColumnDropTargetProps {
  block: DroppedBlock;
  column: Column;
  columnIndex: number;
  stackColumns: boolean;
  previewMode: boolean;
  viewportMode: 'desktop' | 'tablet' | 'mobile';
}

const ColumnDropTarget = ({
  block,
  column,
  columnIndex,
  stackColumns,
  previewMode,
  viewportMode,
}: ColumnDropTargetProps) => {
  const dispatch = useDispatch();
  const columnRef = useRef<HTMLDivElement>(null);
  const {
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedContentType,
    selectedWidgetIndex,
    selectedSubElementId,
  } = useSelector((state: RootState) => state.workspace);
  const isSelected =
    selectedBlockForEditor === block.id && selectedColumnIndex === columnIndex;

  const buildDroppedContentData = (item: {
    widgetType: WidgetContentType;
    initialContent?: string;
    customData?: any;
  }) => {
    if (item.customData) {
      return JSON.stringify(regenerateIds(item.customData));
    }
    if (item.widgetType === "image") {
      return item.initialContent || "";
    }
    if (item.widgetType === "container") {
      return JSON.stringify({
        maxWidth: '800px',
        width: '100%',
        height: 'auto',
        backgroundColor: '#ffffff',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { width: 1, style: 'solid', color: '#dddddd', radius: 4 },
        children: [],
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch',
        flexWrap: 'nowrap',
        gap: 10,
        borderRadius: 4
      });
    }
    if (item.widgetType === "row") {
      return JSON.stringify({
        backgroundColor: 'transparent',
        columns: 2,
        gap: 20,
        columnsData: Array(2).fill(0).map((_, i) => ({ id: `col_${i}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, children: [] }))
      });
    }
    if (item.widgetType === "emailHeader") return JSON.stringify(defaultEmailHeaderEditorOptions);
    if (item.widgetType === "emailFooter") return JSON.stringify(defaultEmailFooterEditorOptions);
    if (item.widgetType === "price") return JSON.stringify(defaultPriceEditorOptions);
    if (item.widgetType === "section") {
      return JSON.stringify({
        backgroundColor: '#f5f5f5',
        padding: { top: 0, right: 0, bottom: 0, left: 0 },
        margin: { top: 0, right: 0, bottom: 0, left: 0 },
        border: { width: 1, style: 'solid', color: '#dddddd', radius: 0 },
        children: []
      });
    }
    if (item.widgetType === "taxBilling") return JSON.stringify(defaultTaxBillingEditorOptions);
    if (item.widgetType === "orderSubtotal") return JSON.stringify(defaultOrderSubtotalEditorOptions);
    if (item.widgetType === "orderTotal") return JSON.stringify(defaultOrderTotalEditorOptions);
    if (item.widgetType === "shippingMethod") return JSON.stringify(defaultShippingMethodEditorOptions);
    if (item.widgetType === "paymentMethod") return JSON.stringify(defaultPaymentMethodEditorOptions);
    if (item.widgetType === "customerNote") return JSON.stringify(defaultCustomerNoteEditorOptions);
    if (item.widgetType === "contact") return JSON.stringify(defaultContactEditorOptions);
    if (item.widgetType === "productDetails") return JSON.stringify(defaultProductDetailsEditorOptions);
    return JSON.stringify({});
  };

  const insertDroppedWidget = (item: {
    widgetType: WidgetContentType;
    initialContent?: string;
    customData?: any;
  }, insertIndex?: number) => {
    dispatch(
      addColumnContent({
        blockId: block.id,
        columnIndex,
        contentType: item.widgetType,
        contentData: buildDroppedContentData(item),
        insertIndex,
      })
    );
  };

  const [{ isOver, isOverCurrent, canDrop }, drop] = useDrop(() => ({
    accept: ["content", "layout", "WIDGET"],
    drop: (item: {
      widgetType: WidgetContentType;
      initialContent?: string;
      customData?: any;
      type?: string;
      index?: number;
      blockId?: string;
      columnIndex?: number;
      sourceBlockId?: string;
      sourceColumnIndex?: number;
    }, monitor) => {
      if (monitor.didDrop()) {
        return;
      }
      if (previewMode) return;
      if (item.type === 'WIDGET') {
        const sourceBlockId = item.sourceBlockId || item.blockId;
        const sourceColumnIndex = item.sourceColumnIndex ?? item.columnIndex;
        if (!sourceBlockId || sourceColumnIndex === undefined || typeof item.index !== 'number') return;
        dispatch(moveColumnContent({
          sourceBlockId,
          sourceColumnIndex,
          sourceIndex: item.index,
          targetBlockId: block.id,
          targetColumnIndex: columnIndex,
          targetIndex: column.widgetContents.length,
        }));
        return;
      }
      insertDroppedWidget(item);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      canDrop: monitor.canDrop(),
    }),
  }), [block.id, columnIndex, previewMode, dispatch]);

  useEffect(() => {
    if (columnRef.current) {
      drop(columnRef.current);
    }
  }, [columnRef, drop]);

  // Map textAlign to flex alignItems
  const alignItemsMap: Record<string, string> = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
    justify: 'stretch'
  };
  const alignItems = alignItemsMap[column.style.textAlign || 'left'] || 'flex-start';

  const renderContent = () => {
    if (column.widgetContents.length === 0) {
      return (
        <Box sx={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
          <Typography
            sx={{
              fontSize: "14px",
              color: "#999",
              textAlign: "center",
              width: "100%",
              padding: "20px",
              border: "1px dashed #ccc",
              boxSizing: "border-box"
            }}
          >
            Drag Content Here
          </Typography>
          {isOverCurrent && !previewMode && (
            <Box sx={{ position: 'absolute', top: '50%', left: '8px', right: '8px', height: '4px', backgroundColor: '#000000', borderRadius: '2px', zIndex: 10, transform: 'translateY(-50%)' }} />
          )}
        </Box>
      );

    }

    return column.widgetContents.map((widget, index) => {
      const handleWidgetClick =
        (contentType: WidgetContentType, widgetIndex: number) =>
          (e: React.MouseEvent) => {
            e.stopPropagation();
            dispatch(setSelectedBlockId(block.id)); // Ensure block is also selected
            dispatch(
              openEditor({
                blockId: block.id,
                columnIndex,
                contentType,
                widgetIndex,
                selectedSubElementId: null
              })
            );
          };

      const defaultOnClick = () => {
        // No-op for default clicks
      };

      const isWidgetSelected =
        isSelected &&
        selectedContentType === widget.contentType &&
        selectedWidgetIndex === index &&
        (selectedSubElementId === null || selectedSubElementId === 'outer_container');

      const WidgetComponent = getWidgetComponent(widget.contentType || '');

      let activeWidget = widget;
      if (viewportMode === 'mobile') {
        try {
          const data = JSON.parse(widget.contentData || '{}');
          if (data.mobileStyles) {
            const merged = { ...data, ...data.mobileStyles };
            activeWidget = { ...widget, contentData: JSON.stringify(merged) };
          }
        } catch (e) {
          // ignore JSON parse errors
        }
      }

      const commonProps = {
        key: index,
        blockId: block.id,
        columnIndex: columnIndex,
        widgetIndex: index,
        isSelected: isWidgetSelected,
        onClick: defaultOnClick,
        onWidgetClick: handleWidgetClick(activeWidget.contentType, index),
        widgetData: activeWidget
      };

      return (
        <DraggableWidgetWrapper
          key={index}
          blockId={block.id}
          columnIndex={columnIndex}
          widgetIndex={index}
          isSelected={isWidgetSelected}
          previewMode={previewMode}
          onWidgetClick={handleWidgetClick(activeWidget.contentType, index)}
          alignItems={alignItems}
          onInsertWidget={insertDroppedWidget}
        >
          {WidgetComponent && (
            <WidgetComponent

              blockId={block.id}
              columnIndex={columnIndex}
              widgetIndex={index}
              isSelected={isWidgetSelected}
              onClick={defaultOnClick}
              onWidgetClick={handleWidgetClick(activeWidget.contentType, index)}
              widgetData={activeWidget}
              previewMode={previewMode}
            />
          )}
        </DraggableWidgetWrapper>
      );
    });
  };

  const columnDisplayHeight =
    column.widgetContents.length === 0
      ? 100 // Keep empty columns tall for easy dragging
      : 0; // Minimum floor for filled columns

  // Calculate correct column width based on number of columns
  const columnWidth = 100 / block.columns.length;

  // Build inline styles object
  if (!previewMode) {

  }
  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    flex: stackColumns ? '1 1 auto' : '1 1 0',
    minWidth: 0,
    maxWidth: '100%',
    verticalAlign: 'top',
    width: stackColumns ? '100%' : `${columnWidth}%`,
    backgroundColor: column.style.bgColor,
    backgroundImage: (column.style as any).bgImage ? `url(${(column.style as any).bgImage})` : undefined,
    backgroundSize: (column.style as any).bgSize || 'cover',
    backgroundPosition: (column.style as any).bgPosition || 'center',
    backgroundRepeat: (column.style as any).bgRepeat || 'no-repeat',
    backgroundAttachment: (column.style as any).bgAttachment || 'scroll',
    borderTop: `${column.style.borderTopSize || 0}px ${column.style.borderStyle || 'solid'} ${column.style.borderTopColor || 'transparent'}`,
    borderBottom: `${column.style.borderBottomSize || 0}px ${column.style.borderStyle || 'solid'} ${column.style.borderBottomColor || 'transparent'}`,
    borderLeft: `${column.style.borderLeftSize || 0}px ${column.style.borderStyle || 'solid'} ${column.style.borderLeftColor || 'transparent'}`,
    borderRight: `${column.style.borderRightSize || 0}px ${column.style.borderStyle || 'solid'} ${column.style.borderRightColor || 'transparent'}`,
    paddingTop: `${column.style.padding?.top ?? 0}px`,
    paddingRight: `${column.style.padding?.right ?? 0}px`,
    paddingBottom: `${column.style.padding?.bottom ?? 0}px`,
    paddingLeft: `${column.style.padding?.left ?? 0}px`,
    textAlign: (column.style.textAlign as any) || 'left',
    borderTopLeftRadius: column.style.borderRadius ? `${column.style.borderRadius.top}px` : undefined,
    borderTopRightRadius: column.style.borderRadius ? `${column.style.borderRadius.right}px` : undefined,
    borderBottomRightRadius: column.style.borderRadius ? `${column.style.borderRadius.bottom}px` : undefined,
    borderBottomLeftRadius: column.style.borderRadius ? `${column.style.borderRadius.left}px` : undefined,
    marginTop: column.style.margin ? `${column.style.margin.top}px` : undefined,
    marginRight: column.style.margin ? `${column.style.margin.right}px` : undefined,
    marginBottom: column.style.margin ? `${column.style.margin.bottom}px` : undefined,
    marginLeft: column.style.margin ? `${column.style.margin.left}px` : undefined,
    minHeight: `${columnDisplayHeight}px`,
    height: 'auto', // Always auto to prevent clipping
  };

  return (
    <Box
      ref={columnRef}
      className="droppable-column"
      id={`${block.id}_col_${columnIndex}`}
      onClick={(e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        dispatch(setSelectedBlockId(block.id));
        dispatch(
          openEditor({ blockId: block.id, columnIndex, contentType: null })
        );
      }}
      sx={{
        ...columnStyle,
        '&:hover .column-handle': {
          display: 'flex !important',
        }
      }}
    >
      {!previewMode && (
        <Box
          className="column-handle"
          sx={{
            display: 'none', // Default hidden, overridden by parent hover
            position: 'absolute',
            top: 0,
            left: 0,
            bgcolor: '#2196F3',
            color: '#fff',
            fontSize: '10px',
            padding: '2px 6px',
            zIndex: 15,
            cursor: 'pointer',
            borderBottomRightRadius: '4px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={(e) => {
            e.stopPropagation();
            dispatch(setSelectedBlockId(block.id));
            dispatch(
              openEditor({ blockId: block.id, columnIndex, contentType: null })
            );
          }}
        >
          Column
        </Box>
      )}
      <Box sx={{
        display: column.widgetContents.length ? 'block' : 'flex',
        flexDirection: column.widgetContents.length ? undefined : 'column',
        alignItems: column.widgetContents.length ? undefined : alignItems,
        justifyContent: column.widgetContents.length ? undefined : 'center',
        gap: '0px',
        minHeight: `${columnDisplayHeight}px`,
        width: '100%',
        maxWidth: '100%',
        minWidth: 0,
        overflow: 'hidden',
      }}>
        {renderContent()}
        {!previewMode && isOverCurrent && canDrop && column.widgetContents.length > 0 && (
          <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', bgcolor: '#000000', borderRadius: '2px', zIndex: 10 }} />
        )}
      </Box>
    </Box>
  );
};
