import React from 'react';
import {
  Box,
  IconButton,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Button,
  Popover,
  Typography,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import DesktopWindowsIcon from '@mui/icons-material/DesktopWindows';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import TabletMacIcon from '@mui/icons-material/TabletMac';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import EditIcon from '@mui/icons-material/Edit';
import LayersIcon from '@mui/icons-material/Layers';
import HistoryIcon from '@mui/icons-material/History';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import NotesIcon from '@mui/icons-material/Notes';

import TableRowsIcon from '@mui/icons-material/TableRows';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import CropFreeIcon from '@mui/icons-material/CropFree';
import TextFormatIcon from '@mui/icons-material/TextFormat';
import TitleIcon from '@mui/icons-material/Title';
import ImageIcon from '@mui/icons-material/Image';
import ButtonIcon from '@mui/icons-material/SmartButton';
import DividerIcon from '@mui/icons-material/HorizontalRule';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import FileCopyIcon from '@mui/icons-material/FileCopy';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';


import { useDispatch, useSelector } from 'react-redux';
import {
  undo, redo, setPreviewMode, setBlocks, setSelectedBlockId,
  closeEditor, openEditor, setViewportMode,
  copyBlock, renameBlock, deleteBlock, copyColumnContent, deleteColumnContent,
  pasteSubElementStyle, resetSubElementStyle, addColumnContent, copyWidget, pasteCopiedWidget
} from '../../../Store/Slice/workspaceSlice';
import WallpaperIcon from '@mui/icons-material/Wallpaper';
import { buildBlockTree, TreeItem } from '../../utils/treeHelper';

const WorkspaceTop = () => {
  const dispatch = useDispatch();
  const {
    blocks,
    previewMode,
    past,
    future,
    bodyStyle,
    viewportMode,
    selectedBlockForEditor,
    selectedColumnIndex,
    selectedWidgetIndex,
    selectedNestedPath,
    selectedSubElementId
  } = useSelector((state: any) => state.workspace);

  const lastScrolledNodeIdRef = React.useRef<string | null>(null);

  const [structureAnchorEl, setStructureAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [contextMenu, setContextMenu] = React.useState<{
    mouseX: number;
    mouseY: number;
    node: TreeItem;
  } | null>(null);

  const [renameDialogOpen, setRenameDialogOpen] = React.useState(false);
  const [nodeToRename, setNodeToRename] = React.useState<TreeItem | null>(null);
  const [newName, setNewName] = React.useState('');

  const handleContextMenu = (event: React.MouseEvent, node: TreeItem) => {
    event.preventDefault();
    event.stopPropagation();
    setContextMenu({
      mouseX: event.clientX - 2,
      mouseY: event.clientY - 4,
      node,
    });
  };

  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  const getNodeName = (node: TreeItem) => {
    if (node.type === 'block') return 'Section';
    if (node.type === 'column') return 'Column';
    return node.name;
  };

  const renderShortcut = (text: string) => (
    <Typography sx={{ fontSize: '10px', color: '#94a3b8', ml: 'auto', pl: 2 }}>
      {text}
    </Typography>
  );

  const footerOrderSections = ['social', 'address', 'contact', 'legal', 'copyright'];
  const footerSectionBySubElement: Record<string, string> = {
    footer_social: 'social',
    footer_address: 'address',
    footer_contact: 'contact',
    footer_legal: 'legal',
    footer_privacy_link: 'legal',
    footer_terms_link: 'legal',
    footer_copyright: 'copyright',
  };

  const getEmailFooterSection = (node: TreeItem) => {
    if (node.type !== 'sub_element' || node.contentType !== 'emailFooter' || !node.subElementId) return null;
    return footerSectionBySubElement[node.subElementId] || null;
  };

  const normalizeFooterOrder = (order: any) => {
    if (!Array.isArray(order)) return footerOrderSections;
    return [
      ...order.filter((section: string) => footerOrderSections.includes(section)),
      ...footerOrderSections.filter(section => !order.includes(section)),
    ];
  };

  const getFooterOrderForNode = (node: TreeItem) => {
    const block = blocks.find((b: any) => b.id === node.blockId);
    const column = block?.columns[node.columnIndex ?? -1];
    const widget = column?.widgetContents[node.rootWidgetIndex ?? -1];
    if (!widget || widget.contentType !== 'emailFooter') return footerOrderSections;
    try {
      const data = JSON.parse(widget.contentData || '{}');
      return normalizeFooterOrder(data.footerOrder);
    } catch (err) {
      return footerOrderSections;
    }
  };

  const canMoveEmailFooterSection = (node: TreeItem, direction: 'up' | 'down') => {
    const section = getEmailFooterSection(node);
    if (!section) return false;
    const order = getFooterOrderForNode(node);
    const index = order.indexOf(section);
    return direction === 'up' ? index > 0 : index !== -1 && index < order.length - 1;
  };

  const handleMoveEmailFooterSection = (node: TreeItem, direction: 'up' | 'down') => {
    const section = getEmailFooterSection(node);
    if (!section) return;

    const nextBlocks = JSON.parse(JSON.stringify(blocks));
    const block = nextBlocks.find((b: any) => b.id === node.blockId);
    const column = block?.columns[node.columnIndex ?? -1];
    const widget = column?.widgetContents[node.rootWidgetIndex ?? -1];
    if (!widget || widget.contentType !== 'emailFooter') return;

    let data: any = {};
    try {
      data = JSON.parse(widget.contentData || '{}');
    } catch (err) {
      data = {};
    }

    const order = normalizeFooterOrder(data.footerOrder);
    const currentIndex = order.indexOf(section);
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= order.length) return;

    const nextOrder = [...order];
    [nextOrder[currentIndex], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[currentIndex]];
    data.footerOrder = nextOrder;
    widget.contentData = JSON.stringify(data);

    dispatch(setBlocks(nextBlocks));
    handleCloseContextMenu();
  };

  const handleNodeSelect = (node: TreeItem) => {
    if (node.type === 'block') {
      dispatch(openEditor({
        blockId: node.blockId || null,
        columnIndex: null,
        widgetIndex: null,
        contentType: null
      }));
    } else if (node.type === 'column') {
      dispatch(openEditor({
        blockId: node.blockId || null,
        columnIndex: node.columnIndex !== undefined ? node.columnIndex : null,
        widgetIndex: null,
        contentType: null
      }));
    } else if (node.type === 'widget') {
      dispatch(openEditor({
        blockId: node.blockId || null,
        columnIndex: node.columnIndex !== undefined ? node.columnIndex : null,
        widgetIndex: node.rootWidgetIndex,
        contentType: node.contentType as any,
        nestedPath: node.path,
        selectedSubElementId: null
      }));
    } else if (node.type === 'sub_element') {
      dispatch(openEditor({
        blockId: node.blockId || null,
        columnIndex: node.columnIndex !== undefined ? node.columnIndex : null,
        widgetIndex: node.rootWidgetIndex,
        contentType: node.contentType as any,
        nestedPath: node.path,
        selectedSubElementId: node.subElementId
      }));
    }

    // Auto-scroll the layout editor canvas to the selected element
    setTimeout(() => {
      if (node.id) {
        const el = document.getElementById(node.id);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  };

  const handleCopyNode = (node: TreeItem) => {
    if (node.type === 'block') {
      const block = blocks.find((b: any) => b.id === node.blockId);
      if (block) {
        (window as any).woomailerBlockClipboard = block;
        (window as any).woomailerWidgetClipboard = null;
      }
    } else if (node.type === 'widget') {
      const block = blocks.find((b: any) => b.id === node.blockId);
      const col = block?.columns[node.columnIndex!];
      let widget: any = null;
      if (node.path && node.path.length > 0) {
        const rootWidget = col?.widgetContents[node.rootWidgetIndex!];
        if (rootWidget) {
          const getNestedWidget = (w: any, path: any[]): any => {
            if (path.length === 0) return w;
            const [head, ...tail] = path;
            try {
              const data = JSON.parse(w.contentData || '{}');
              if (head.colIdx === -1) {
                const child = data.children?.[head.childIdx];
                return getNestedWidget(child, tail);
              } else {
                const child = data.columnsData?.[head.colIdx]?.children?.[head.childIdx];
                return getNestedWidget(child, tail);
              }
            } catch (e) {
              return null;
            }
          };
          widget = getNestedWidget(rootWidget, node.path);
        }
      } else {
        widget = col?.widgetContents[node.rootWidgetIndex!];
      }
      if (widget) {
        (window as any).woomailerWidgetClipboard = widget;
        (window as any).woomailerBlockClipboard = null;
        dispatch(copyWidget({ contentType: widget.contentType, contentData: widget.contentData || '' }));
      }
    } else if (node.type === 'sub_element') {
      const block = blocks.find((b: any) => b.id === node.blockId);
      const col = block?.columns[node.columnIndex!];
      const widget = col?.widgetContents[node.rootWidgetIndex!];
      if (widget && widget.contentData) {
        try {
          const parsed = JSON.parse(widget.contentData);
          const styles = parsed.subStyles?.[node.subElementId!] || {};
          (window as any).woomailerStyleClipboard = {
            subElementId: node.subElementId!,
            styles
          };
        } catch (err) {}
      }
    }
    handleCloseContextMenu();
  };

  const handlePasteNode = (node: TreeItem) => {
    if (node.type === 'block') {
      if ((window as any).woomailerBlockClipboard) {
        const cloned = JSON.parse(JSON.stringify((window as any).woomailerBlockClipboard));
        cloned.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        cloned.columns = cloned.columns.map((c: any) => ({
          ...c,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        }));
        dispatch(setBlocks([...blocks, cloned]));
      } else if ((window as any).woomailerWidgetClipboard) {
        const w = (window as any).woomailerWidgetClipboard;
        dispatch(addColumnContent({
          blockId: node.blockId!,
          columnIndex: 0,
          contentType: w.contentType,
          contentData: w.contentData
        }));
      }
    } else if (node.type === 'column' || node.type === 'widget') {
      if ((window as any).woomailerBlockClipboard) {
        const block = (window as any).woomailerBlockClipboard;
        const isSingleColumn = block.columns.length === 1;

        if (isSingleColumn) {
          const containerData = {
            maxWidth: '100%',
            backgroundColor: block.style?.bgColor || 'transparent',
            padding: block.style?.padding || { top: 0, right: 0, bottom: 0, left: 0 },
            border: {
              width: block.style?.borderTopSize || 0,
              style: block.style?.borderStyle || 'solid',
              color: block.style?.borderTopColor || '#dddddd',
              radius: 0
            },
            children: block.columns[0].widgetContents || [],
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            flexWrap: 'nowrap',
            gap: 10,
            borderRadius: 0
          };
          dispatch(addColumnContent({
            blockId: node.blockId!,
            columnIndex: node.columnIndex !== undefined ? node.columnIndex : 0,
            contentType: 'container',
            contentData: JSON.stringify(containerData)
          }));
        } else {
          const rowData = {
            backgroundColor: block.style?.bgColor || 'transparent',
            columns: block.columns.length,
            gap: 20,
            columnsData: block.columns.map((col: any) => ({
              id: `col_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
              children: col.widgetContents || []
            }))
          };
          dispatch(addColumnContent({
            blockId: node.blockId!,
            columnIndex: node.columnIndex !== undefined ? node.columnIndex : 0,
            contentType: 'row',
            contentData: JSON.stringify(rowData)
          }));
        }
      } else if ((window as any).woomailerWidgetClipboard) {
        const w = (window as any).woomailerWidgetClipboard;
        const isContainer = node.type === 'widget' && (node.contentType === 'container' || node.contentType === 'row' || node.name === 'CONTAINER');

        if (isContainer) {
          dispatch(pasteCopiedWidget({
            blockId: node.blockId!,
            columnIndex: node.columnIndex !== undefined ? node.columnIndex : 0,
            widgetIndex: node.rootWidgetIndex!,
            nestedPath: node.path || [],
            insertInside: true
          }));
        } else if (node.type === 'widget') {
          dispatch(pasteCopiedWidget({
            blockId: node.blockId!,
            columnIndex: node.columnIndex !== undefined ? node.columnIndex : 0,
            widgetIndex: node.rootWidgetIndex!,
            nestedPath: node.path || null,
            insertInside: false
          }));
        } else {
          dispatch(addColumnContent({
            blockId: node.blockId!,
            columnIndex: node.columnIndex !== undefined ? node.columnIndex : 0,
            contentType: w.contentType,
            contentData: w.contentData
          }));
        }
      }
    }
    handleCloseContextMenu();
  };

  const handlePasteStyle = (node: TreeItem) => {
    if (node.type === 'sub_element' && (window as any).woomailerStyleClipboard) {
      dispatch(pasteSubElementStyle({
        blockId: node.blockId!,
        columnIndex: node.columnIndex!,
        widgetIndex: node.rootWidgetIndex!,
        subElementId: node.subElementId!,
        styles: (window as any).woomailerStyleClipboard.styles
      }));
    }
    handleCloseContextMenu();
  };

  const handleResetStyle = (node: TreeItem) => {
    if (node.type === 'sub_element') {
      dispatch(resetSubElementStyle({
        blockId: node.blockId!,
        columnIndex: node.columnIndex!,
        widgetIndex: node.rootWidgetIndex!,
        subElementId: node.subElementId!
      }));
    }
    handleCloseContextMenu();
  };

  const handleDuplicateNode = (node: TreeItem) => {
    if (node.type === 'block') {
      dispatch(copyBlock(node.blockId || null));
    } else if (node.type === 'widget') {
      dispatch(copyColumnContent({
        blockId: node.blockId!,
        columnIndex: node.columnIndex!,
        widgetIndex: node.rootWidgetIndex!
      }));
    }
    handleCloseContextMenu();
  };

  const handleOpenRenameDialog = (node: TreeItem) => {
    setNodeToRename(node);
    setNewName(node.name);
    setRenameDialogOpen(true);
    handleCloseContextMenu();
  };

  const handleRenameConfirm = () => {
    if (nodeToRename && nodeToRename.type === 'block' && newName.trim()) {
      dispatch(renameBlock({
        id: nodeToRename.blockId!,
        name: newName.trim()
      }));
    }
    setRenameDialogOpen(false);
    setNodeToRename(null);
  };

  const handleDeleteNode = (node: TreeItem) => {
    if (node.type === 'block') {
      dispatch(deleteBlock(node.blockId || null));
    } else if (node.type === 'widget') {
      dispatch(deleteColumnContent({
        blockId: node.blockId!,
        columnIndex: node.columnIndex!,
        widgetIndex: node.rootWidgetIndex!
      }));
    }
    handleCloseContextMenu();
  };

  const handleViewChange = (newView: 'desktop' | 'tablet' | 'mobile') => {
    dispatch(setViewportMode(newView));
  };

  const handlePreviewClick = () => {
    dispatch(setPreviewMode(!previewMode));
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  const handleClearCanvas = () => {
    if (window.confirm("Are you sure you want to clear the canvas?")) {
      dispatch(setBlocks([]));
    }
  };

  const handleBack = () => {
    if (window.confirm("Go back to template list? Unsaved changes may be lost.")) {
      window.location.href = 'admin.php?page=posts_list_table';
    }
  };

  const isNodeSelected = (node: TreeItem) => {
    if (node.type === 'block') {
      return selectedBlockForEditor === node.blockId && selectedColumnIndex === null;
    }
    if (node.type === 'column') {
      return selectedBlockForEditor === node.blockId && selectedColumnIndex === node.columnIndex && selectedWidgetIndex === null;
    }
    if (node.type === 'widget') {
      if (selectedBlockForEditor !== node.blockId) return false;
      if (selectedColumnIndex !== node.columnIndex) return false;
      if (selectedWidgetIndex !== node.rootWidgetIndex) return false;
      
      const pathA = node.path || [];
      const pathB = selectedNestedPath || [];
      if (pathA.length !== pathB.length) return false;
      for (let i = 0; i < pathA.length; i++) {
        if (pathA[i].colIdx !== pathB[i].colIdx || pathA[i].childIdx !== pathB[i].childIdx) {
          return false;
        }
      }
      // Active when no sub-element is selected, OR when the auto-selected outer_container is active
      // (meaning the user clicked this widget node directly)
      return selectedSubElementId === null || selectedSubElementId === 'outer_container';
    }
    if (node.type === 'sub_element') {
      if (selectedBlockForEditor !== node.blockId) return false;
      if (selectedColumnIndex !== node.columnIndex) return false;
      if (selectedWidgetIndex !== node.rootWidgetIndex) return false;
      
      const pathA = node.path || [];
      const pathB = selectedNestedPath || [];
      if (pathA.length !== pathB.length) return false;
      for (let i = 0; i < pathA.length; i++) {
        if (pathA[i].colIdx !== pathB[i].colIdx || pathA[i].childIdx !== pathB[i].childIdx) {
          return false;
        }
      }
      return selectedSubElementId === node.subElementId;
    }
    return false;
  };

  const getNodeIcon = (node: TreeItem) => {
    if (node.type === 'block') return <TableRowsIcon sx={{ fontSize: 13, color: '#6d7882' }} />;
    if (node.type === 'column') return <ViewColumnIcon sx={{ fontSize: 13, color: '#6d7882' }} />;
    
    const name = node.name.toLowerCase();
    const contentType = node.contentType?.toLowerCase();

    if (name === 'container' || contentType === 'container') return <CropFreeIcon sx={{ fontSize: 13, color: '#6d7882' }} />;
    
    if (name === 'heading' || contentType === 'heading') {
      if (node.headingType === 'p') return <NotesIcon sx={{ fontSize: 13, color: '#1976d2' }} />;
      if (node.headingType === 'span') return <TextFormatIcon sx={{ fontSize: 13, color: '#1976d2' }} />;
      return <TitleIcon sx={{ fontSize: 13, color: '#1976d2' }} />;
    }
    
    if (name === 'text' || contentType === 'text' || name === 'paragraph') return <NotesIcon sx={{ fontSize: 13, color: '#2e7d32' }} />;
    if (name === 'image' || contentType === 'image') return <ImageIcon sx={{ fontSize: 13, color: '#ed6c02' }} />;
    if (name === 'button' || contentType === 'button') return <ButtonIcon sx={{ fontSize: 13, color: '#9c27b0' }} />;
    if (name === 'divider' || contentType === 'divider') return <DividerIcon sx={{ fontSize: 13, color: '#757575' }} />;
    if (name.includes('link') || contentType?.includes('link') || node.subElementId?.toLowerCase().includes('link')) return <LinkIcon sx={{ fontSize: 13, color: '#1976d2' }} />;
    
    return <LayersIcon sx={{ fontSize: 13, color: '#1976d2' }} />;
  };

  const [expandedNodes, setExpandedNodes] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const isExpanded = (nodeId: string) => !!expandedNodes[nodeId];

  // WooCommerce widget types that use sub-element style editors
  const wooWidgetTypes = [
    'billingAddress', 'shippingAddress', 'orderItems', 'taxBilling', 'emailHeader',
    'emailFooter', 'ctaButton', 'relatedProducts', 'orderSubtotal', 'orderTotal',
    'shippingMethod', 'paymentMethod', 'customerNote', 'contact', 'productDetails'
  ];

  const renderNode = (node: TreeItem, depth: number) => {
    const active = isNodeSelected(node);
    const hasChildren = node.children && node.children.length > 0;
    const collapsed = !isExpanded(node.id);

    return (
      <Box key={node.id} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Box
          ref={(el: HTMLDivElement | null) => {
            if (el && active && lastScrolledNodeIdRef.current !== node.id) {
              lastScrolledNodeIdRef.current = node.id;
              el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
          }}
          onClick={(e) => {
            handleNodeSelect(node);
            if (hasChildren && collapsed) {
              setExpandedNodes(prev => ({ ...prev, [node.id]: true }));
            }
          }}
          onDoubleClick={(e) => {
            if (node.type === 'block') {
              e.stopPropagation();
              handleOpenRenameDialog(node);
            } else if (hasChildren) {
              e.stopPropagation();
              toggleExpand(node.id, e);
            }
          }}
          onContextMenu={(e) => handleContextMenu(e, node)}
          sx={{
            pl: depth * 1.5 + 0.5,
            py: 0.5,
            pr: 1,
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            borderRadius: '4px',
            color: active ? '#1976d2' : '#495157',
            bgcolor: active ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            fontWeight: active ? 700 : 500,
            fontSize: '11px',
            letterSpacing: '0.5px',
            height: '28px',
            '&:hover': {
              bgcolor: 'rgba(0, 0, 0, 0.04)',
              color: '#1976d2'
            }
          }}
        >
          {hasChildren ? (
            <IconButton 
              size="small" 
              onClick={(e) => toggleExpand(node.id, e)}
              sx={{ p: 0, mr: 0.5, color: '#999', '&:hover': { color: '#1976d2' } }}
            >
              {collapsed ? (
                <KeyboardArrowRightIcon sx={{ fontSize: 14 }} />
              ) : (
                <KeyboardArrowDownIcon sx={{ fontSize: 14 }} />
              )}
            </IconButton>
          ) : (
            <Box sx={{ width: 20 }} />
          )}

          {getNodeIcon(node)}
          <Typography sx={{ ml: 1, fontSize: '11px', fontWeight: 'inherit', letterSpacing: 'inherit', textTransform: 'inherit', flexGrow: 1 }}>
            {node.name}
          </Typography>
          {node.type === 'block' && (
            <IconButton 
              size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRenameDialog(node);
              }}
              title="Rename block"
              sx={{ p: 0.2, color: '#94a3b8', opacity: 0.6, '&:hover': { color: '#1976d2', opacity: 1 } }}
            >
              <DriveFileRenameOutlineIcon sx={{ fontSize: 13 }} />
            </IconButton>
          )}
        </Box>
        
        {hasChildren && !collapsed && (
          <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.2 }}>
            {node.children!.map(child => renderNode(child, depth + 1))}
          </Box>
        )}
      </Box>
    );
  };

  const treeNodes = blocks.map((block: any) => buildBlockTree(block));

  return (
    <Box
      sx={{
        height: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        width: "100%",
        backgroundColor: '#fff',
        borderBottom: '1px solid #e0e0e0',
        position: 'relative',
        zIndex: 100,
        boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Tooltip title="Back to List" placement="right">
          <IconButton 
            size="small" 
            onClick={handleBack} 
            sx={{ 
              color: '#444', 
              '&:hover': { bgcolor: '#f5f5f5' },
              transition: 'all 0.2s'
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        {/* Viewport Controls */}
        <Box sx={{
          bgcolor: '#1e1e1e',
          borderRadius: '10px',
          p: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
        }}>
          {[
            { id: 'desktop', icon: <DesktopWindowsIcon sx={{ fontSize: 18 }} />, title: 'Desktop' },
            { id: 'tablet', icon: <TabletMacIcon sx={{ fontSize: 18 }} />, title: 'Tablet' },
            { id: 'mobile', icon: <PhoneIphoneIcon sx={{ fontSize: 18 }} />, title: 'Mobile' }
          ].map((view) => (
            <Tooltip key={view.id} title={view.title}>
              <IconButton
                size="small"
                onClick={() => handleViewChange(view.id as any)}
                sx={{
                  color: viewportMode === view.id ? '#fff' : '#999',
                  borderRadius: '7px',
                  padding: '6px 10px',
                  position: 'relative',
                  backgroundColor: viewportMode === view.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  transition: 'all 0.2s ease',
                  '&:hover': { 
                    color: '#fff',
                    backgroundColor: 'rgba(255,255,255,0.15)'
                  },
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '3px',
                    left: '25%',
                    right: '25%',
                    height: '2px',
                    backgroundColor: '#fff',
                    borderRadius: '2px',
                    transform: viewportMode === view.id ? 'scaleX(1)' : 'scaleX(0)',
                    transition: 'transform 0.2s ease-in-out',
                    opacity: viewportMode === view.id ? 1 : 0
                  }
                }}
              >
                {view.icon}
              </IconButton>
            </Tooltip>
          ))}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
        <Tooltip title="Undo" placement="bottom">
          <span>
            <IconButton
              size="small"
              onClick={handleUndo}
              disabled={!past || past.length === 0}
              sx={{ color: '#444', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <UndoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Redo" placement="bottom">
          <span>
            <IconButton
              size="small"
              onClick={handleRedo}
              disabled={!future || future.length === 0}
              sx={{ color: '#444', '&:hover': { bgcolor: '#f5f5f5' } }}
            >
              <RedoIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </span>
        </Tooltip>
        <Box sx={{ width: '1px', height: '20px', bgcolor: '#e0e0e0', mx: 0.5 }} />
        <Tooltip title={previewMode ? "Exit Preview" : "Preview"} placement="bottom">
          <IconButton 
            size="small" 
            onClick={handlePreviewClick} 
            sx={{ 
              color: previewMode ? '#1976d2' : '#444',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <VisibilityIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Canvas" placement="bottom">
          <IconButton 
            size="small" 
            onClick={handleClearCanvas} 
            sx={{ 
              color: '#444', 
              '&:hover': { color: '#d32f2f', bgcolor: '#fff5f5' } 
            }}
          >
            <DeleteIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>

        <Tooltip title="Structure" placement="bottom">
          <IconButton
            size="small"
            onClick={(e) => setStructureAnchorEl(structureAnchorEl ? null : e.currentTarget)}
            sx={{
              color: Boolean(structureAnchorEl) ? '#1976d2' : '#444',
              '&:hover': { bgcolor: '#f5f5f5' }
            }}
          >
            <LayersIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
        <Tooltip title="History" placement="bottom">
          <IconButton
            size="small"
            onClick={() => setHistoryOpen(prev => !prev)}
            sx={{ color: historyOpen ? '#1976d2' : '#444', '&:hover': { bgcolor: '#f5f5f5' } }}
          >
            <HistoryIcon sx={{ fontSize: 20 }} />
          </IconButton>
        </Tooltip>
      </Box>

      {Boolean(structureAnchorEl) && (
        <Box
          sx={{
            position: 'absolute',
            top: '52px',
            right: '16px',
            width: 320,
            maxHeight: '420px',
            borderRadius: '8px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            zIndex: 9999999,
            border: '1px solid #e0e0e0',
          }}
        >
          {/* Structure Header */}
          <Box sx={{ p: 1.5, borderBottom: '1px solid #e7e9eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fdfdfd' }}>
            <Box display="flex" alignItems="center" gap={0.75}>
              <LayersIcon sx={{ fontSize: 16, color: '#1976d2' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>Structure</Typography>
            </Box>
            <IconButton size="small" onClick={() => setStructureAnchorEl(null)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          
          {/* Structure Tree */}
          <Box sx={{ p: 1.5, flex: 1, overflowY: 'auto', bgcolor: '#fff', minHeight: '150px' }}>
            {treeNodes.length > 0 ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                {treeNodes.map((node: TreeItem) => renderNode(node, 0))}
              </Box>
            ) : (
              <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', textAlign: 'center', mt: 4 }}>
                No layout blocks on canvas
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {historyOpen && (
        <Box
          sx={{
            position: 'absolute',
            top: '52px',
            right: '16px',
            width: 240,
            maxHeight: '360px',
            borderRadius: '8px',
            boxShadow: '0px 8px 24px rgba(0,0,0,0.12)',
            display: 'flex',
            flexDirection: 'column',
            bgcolor: '#fff',
            zIndex: 9999999,
            border: '1px solid #e0e0e0',
          }}
        >
          <Box sx={{ p: 1.5, borderBottom: '1px solid #e7e9eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fdfdfd' }}>
            <Box display="flex" alignItems="center" gap={0.75}>
              <HistoryIcon sx={{ fontSize: 16, color: '#1976d2' }} />
              <Typography sx={{ fontWeight: 600, fontSize: '14px', color: '#333' }}>History</Typography>
            </Box>
            <IconButton size="small" onClick={() => setHistoryOpen(false)}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
          <Box sx={{ flex: 1, overflowY: 'auto', p: 1 }}>
            {past.length === 0 && future.length === 0 ? (
              <Typography sx={{ fontSize: '12px', color: '#888', fontStyle: 'italic', textAlign: 'center', mt: 2 }}>
                No history yet
              </Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                {future.slice().reverse().map((_: any, i: number) => (
                  <Box
                    key={`future-${i}`}
                    onClick={() => { for (let j = 0; j <= i; j++) dispatch(redo()); }}
                    sx={{
                      px: 1.5, py: 0.75, borderRadius: '4px', cursor: 'pointer',
                      fontSize: '12px', color: '#94a3b8', bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      '&:hover': { bgcolor: '#e2e8f0', color: '#334155' }
                    }}
                  >
                    State {past.length + (future.length - i)} (redo {i + 1}×)
                  </Box>
                ))}
                <Box
                  sx={{
                    px: 1.5, py: 0.75, borderRadius: '4px',
                    fontSize: '12px', color: '#fff', bgcolor: '#1976d2',
                    border: '1px solid #1565c0', fontWeight: 600,
                  }}
                >
                  Current State ({past.length + 1})
                </Box>
                {past.slice().reverse().map((_: any, i: number) => (
                  <Box
                    key={`past-${i}`}
                    onClick={() => { for (let j = 0; j <= i; j++) dispatch(undo()); }}
                    sx={{
                      px: 1.5, py: 0.75, borderRadius: '4px', cursor: 'pointer',
                      fontSize: '12px', color: '#64748b', bgcolor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      '&:hover': { bgcolor: '#e2e8f0', color: '#334155' }
                    }}
                  >
                    State {past.length - i} (undo {i + 1}×)
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Box sx={{ p: 1.5, borderTop: '1px solid #e7e9eb', display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" fullWidth disabled={past.length === 0} onClick={handleUndo}
              sx={{ fontSize: '11px', textTransform: 'none', borderColor: '#e2e8f0', color: '#495157' }}>
              Undo
            </Button>
            <Button size="small" variant="outlined" fullWidth disabled={future.length === 0} onClick={handleRedo}
              sx={{ fontSize: '11px', textTransform: 'none', borderColor: '#e2e8f0', color: '#495157' }}>
              Redo
            </Button>
          </Box>
        </Box>
      )}

      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        sx={{ zIndex: 10000000 }}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        PaperProps={{
          sx: {
            minWidth: 180,
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            border: '1px solid #e2e8f0',
            py: 0.5,
            zIndex: 10000000
          }
        }}
      >
        {contextMenu && (() => {
          const node = contextMenu.node;
          const isBlock = node.type === 'block';
          const isColumn = node.type === 'column';
          const isWidget = node.type === 'widget';
          const isSubElement = node.type === 'sub_element';
          const emailFooterSection = getEmailFooterSection(node);

          // Determine what is in the clipboard
          const hasBlockInClipboard = !!(window as any).woomailerBlockClipboard;
          const hasWidgetInClipboard = !!(window as any).woomailerWidgetClipboard;
          const hasStyleInClipboard = !!(window as any).woomailerStyleClipboard;

          return (
            <>
              {/* Edit Option */}
              <MenuItem
                onClick={() => {
                  handleNodeSelect(contextMenu.node);
                  handleCloseContextMenu();
                }}
                sx={{
                  fontSize: '12px',
                  py: 1,
                  px: 1.5,
                  color: '#334155',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  '&:hover': { bgcolor: '#f1f5f9' }
                }}
              >
                <EditIcon sx={{ fontSize: 16, color: '#64748b' }} />
                <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>
                  Edit {getNodeName(contextMenu.node)}
                </Typography>
              </MenuItem>

              {/* Select Parent Option (for widgets and sub-elements) */}
              {(isWidget || isSubElement || isColumn) && (() => {
                let parentNode: TreeItem | null = null;
                const allNodes: TreeItem[] = [];
                const flattenTree = (n: TreeItem) => { allNodes.push(n); n.children?.forEach(flattenTree); };
                treeNodes.forEach(flattenTree);

                if (isSubElement) {
                  parentNode = allNodes.find(n =>
                    n.type === 'widget' &&
                    n.blockId === node.blockId &&
                    n.columnIndex === node.columnIndex &&
                    n.rootWidgetIndex === node.rootWidgetIndex
                  ) || null;
                } else if (isWidget) {
                  parentNode = allNodes.find(n =>
                    n.type === 'column' &&
                    n.blockId === node.blockId &&
                    n.columnIndex === node.columnIndex
                  ) || null;
                } else if (isColumn) {
                  parentNode = allNodes.find(n => n.type === 'block' && n.blockId === node.blockId) || null;
                }

                return parentNode ? (
                  <MenuItem
                    onClick={() => { handleNodeSelect(parentNode!); handleCloseContextMenu(); }}
                    sx={{
                      fontSize: '12px', py: 1, px: 1.5, color: '#334155',
                      display: 'flex', alignItems: 'center', gap: 1,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  >
                    <KeyboardArrowUpIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '12px' }}>Select Parent</Typography>
                  </MenuItem>
                ) : null;
              })()}

              {emailFooterSection && (
                <>
                  <MenuItem
                    disabled={!canMoveEmailFooterSection(contextMenu.node, 'up')}
                    onClick={() => handleMoveEmailFooterSection(contextMenu.node, 'up')}
                    sx={{
                      fontSize: '12px',
                      py: 1,
                      px: 1.5,
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  >
                    <KeyboardArrowUpIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '12px' }}>Move Up</Typography>
                  </MenuItem>
                  <MenuItem
                    disabled={!canMoveEmailFooterSection(contextMenu.node, 'down')}
                    onClick={() => handleMoveEmailFooterSection(contextMenu.node, 'down')}
                    sx={{
                      fontSize: '12px',
                      py: 1,
                      px: 1.5,
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      '&:hover': { bgcolor: '#f1f5f9' }
                    }}
                  >
                    <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#64748b' }} />
                    <Typography sx={{ fontSize: '12px' }}>Move Down</Typography>
                  </MenuItem>
                </>
              )}

              {/* Duplicate Option (only for blocks and widgets) */}
              {(isBlock || isWidget) && (
                <MenuItem 
                  onClick={() => handleDuplicateNode(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <FileCopyIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Duplicate</Typography>
                  {renderShortcut('Ctrl+D')}
                </MenuItem>
              )}

              {/* Copy Option (for blocks, widgets, and sub_elements) */}
              {(isBlock || isWidget || isSubElement) && (
                <MenuItem 
                  onClick={() => handleCopyNode(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <ContentCopyIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Copy</Typography>
                  {renderShortcut('Ctrl+C')}
                </MenuItem>
              )}

              {/* Paste Option (only for blocks, columns, widgets) */}
              {(isBlock || isColumn || isWidget) && (
                <MenuItem 
                  disabled={!(hasBlockInClipboard || hasWidgetInClipboard)}
                  onClick={() => handlePasteNode(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <ContentPasteIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Paste</Typography>
                  {renderShortcut('Ctrl+V')}
                </MenuItem>
              )}

              {/* Paste Style Option (only for sub_elements) */}
              {isSubElement && (
                <MenuItem 
                  disabled={!hasStyleInClipboard}
                  onClick={() => handlePasteStyle(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <ContentPasteIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Paste Style</Typography>
                  {renderShortcut('Ctrl+Shift+V')}
                </MenuItem>
              )}

              {/* Reset Style Option (only for sub_elements) */}
              {isSubElement && (
                <MenuItem 
                  onClick={() => handleResetStyle(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <RestartAltIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Reset Style</Typography>
                </MenuItem>
              )}

              {/* Rename Option (only for blocks) */}
              {isBlock && (
                <MenuItem 
                  onClick={() => handleOpenRenameDialog(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#334155',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderTop: '1px solid #f1f5f9',
                    mt: 0.5,
                    '&:hover': { bgcolor: '#f1f5f9' }
                  }}
                >
                  <DriveFileRenameOutlineIcon sx={{ fontSize: 16, color: '#64748b' }} />
                  <Typography sx={{ fontSize: '12px' }}>Rename</Typography>
                </MenuItem>
              )}

              {/* Delete Option (only for blocks and widgets) */}
              {(isBlock || isWidget) && (
                <MenuItem 
                  onClick={() => handleDeleteNode(contextMenu.node)}
                  sx={{
                    fontSize: '12px',
                    py: 1,
                    px: 1.5,
                    color: '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    borderTop: '1px solid #f1f5f9',
                    mt: 0.5,
                    '&:hover': { bgcolor: '#fef2f2' }
                  }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                  <Typography sx={{ fontSize: '12px', fontWeight: 500 }}>Delete</Typography>
                  {renderShortcut('Del')}
                </MenuItem>
              )}
            </>
          );
        })()}
      </Menu>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onClose={() => setRenameDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600 }}>Rename Component</DialogTitle>
        <DialogContent sx={{ pt: '10px !important' }}>
          <TextField
            autoFocus
            fullWidth
            size="small"
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleRenameConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setRenameDialogOpen(false)} sx={{ textTransform: 'none', color: '#64748b' }}>
            Cancel
          </Button>
          <Button onClick={handleRenameConfirm} variant="contained" sx={{ textTransform: 'none', bgcolor: '#1976d2' }}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};






// import EditIcon from '@mui/icons-material/Edit';
// import ImageIcon from '@mui/icons-material/Image';
// import CodeIcon from '@mui/icons-material/Code';
// import DataObjectIcon from '@mui/icons-material/DataObject';

export default WorkspaceTop;


{/* <Tooltip title="Edit" placement="top">
          <IconButton size="small">
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Image" placement="top">
          <IconButton size="small">
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Code" placement="top">
          <IconButton size="small">
            <CodeIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="JSON" placement="top">
          <IconButton size="small">
            <DataObjectIcon fontSize="small" />
          </IconButton>
        </Tooltip> */}
