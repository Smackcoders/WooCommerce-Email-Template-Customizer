import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  ToggleButton,
  ToggleButtonGroup,
  IconButton,
  Tooltip,
  Stack,
  Divider,
  InputLabel,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormatAlignLeftIcon from "@mui/icons-material/FormatAlignLeft";
import FormatAlignCenterIcon from "@mui/icons-material/FormatAlignCenter";
import FormatAlignRightIcon from "@mui/icons-material/FormatAlignRight";
import FormatAlignJustifyIcon from "@mui/icons-material/FormatAlignJustify";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../../../Store/store";
import {
  deleteColumnContent,
  closeEditor,
  updateTextEditorOptions,
} from "../../../../../Store/Slice/workspaceSlice";

// No imports needed here for ClassicEditor or plugins
import { PlaceholderSelect } from "../../../../utils/PlaceholderSelect";
import { IconInsertSelect } from "../../../../utils/IconInsertSelect";
import { SocialIconInsertSelect } from "../../../../utils/SocialIconInsertSelect";
import ColorPicker from "../../../../utils/ColorPicker";
import { TextEditorOptions } from "../../../../../Store/Slice/workspaceSlice";
import { FONT_FAMILIES } from "../../../../../Constants/StyleConstants";

import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import { AIAssistant } from "../../../../utils/AIAssistant";
import { StyleTabContent, AdvancedTabContent } from "../../../../utils/SharedStyleTab";

const TextWidgetEditor = () => {
  const dispatch = useDispatch();
  const { selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex, textEditorOptions } = useSelector(
    (state: RootState) => state.workspace
  );

  const {
    fontFamily,
    fontSize,
    fontWeight,
    fontStyle,
    color,
    textAlign,
    lineHeight,
    letterSpace,
    padding = { top: 0, left: 0, right: 0, bottom: 0 },
    backgroundColor,
    content,
  } = textEditorOptions;

  const [editorContent, setEditorContent] = useState(content);
  const isInitializingRef = useRef(false);
  const editorId = useMemo(() => `text-editor-${Math.random().toString(36).substr(2, 9)}`, []);

  const optionsRef = useRef(textEditorOptions);
  useEffect(() => {
    optionsRef.current = textEditorOptions;
  }, [textEditorOptions]);

  const updateData = useCallback((newData: Partial<TextEditorOptions>) => {
    dispatch(updateTextEditorOptions(newData));
  }, [dispatch]);

  const debouncedUpdate = useMemo(() => {
    let timeoutId: any;
    return (newData: Partial<TextEditorOptions>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updateData(newData), 50);
    };
  }, [updateData]);

  useEffect(() => {
    setEditorContent(content);
    if ((window as any).tinymce) {
      const editor = (window as any).tinymce.get(editorId);
      if (editor && editor.getContent() !== content) {
        if (!editor.hasFocus()) {
          editor.setContent(content || "");
        }
      }
    }
  }, [content, editorId]);

  // Handle Editor Initialization from Global wp.editor Object
  useEffect(() => {
    let intervalId: any;

    const initEditor = () => {
      const wp = (window as any).wp;
      if (!wp || !wp.editor || isInitializingRef.current) {
        return;
      }

      // Check if already initialized
      if ((window as any).tinymce && (window as any).tinymce.get(editorId)) {
        return;
      }

      isInitializingRef.current = true;

      wp.editor.initialize(editorId, {
        tinymce: {
          wpautop: true,
          toolbar1: 'formatselect bold italic underline bullist numlist alignleft aligncenter alignright link unlink undo redo',
          toolbar2: '',
          toolbar3: '',
          toolbar4: '',
          setup: function (editor: any) {
            editor.on('change keyup input NodeChange ExecCommand', function () {
              const data = editor.getContent();
              setEditorContent(data);
              debouncedUpdate({ content: data });
            });
            editor.on('init', function () {
              editor.setContent(optionsRef.current.content || "");
            });
          }
        },
        quicktags: true,
        mediaButtons: false,
      });

      isInitializingRef.current = false;
    };

    // Check immediately
    initEditor();

    // Poll if wp.editor not found immediately
    if (!(window as any).wp || !(window as any).wp.editor) {
      intervalId = setInterval(() => {
        if ((window as any).wp && (window as any).wp.editor) {
          initEditor();
          clearInterval(intervalId);
        }
      }, 500);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
      const wp = (window as any).wp;
      if (wp && wp.editor) {
        wp.editor.remove(editorId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editorId]);

  const handleCloseEditor = useCallback(() => {
    dispatch(closeEditor());
  }, [dispatch]);

  const handleDeleteContent = useCallback(() => {
    if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
      dispatch(
        deleteColumnContent({
          blockId: selectedBlockForEditor,
          columnIndex: selectedColumnIndex,
          widgetIndex: selectedWidgetIndex,
        })
      );
    }
  }, [dispatch, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex]);

  const handlePlaceholderSelect = (placeholder: string) => {
    if ((window as any).tinymce) {
      const editor = (window as any).tinymce.get(editorId);
      if (editor) {
        editor.execCommand('mceInsertContent', false, placeholder);
      }
    }
  };

  const handleIconSelect = (icon: string) => {
    if ((window as any).tinymce) {
      const editor = (window as any).tinymce.get(editorId);
      if (editor) {
        editor.execCommand('mceInsertContent', false, icon + ' ');
      }
    }
  };

  const handleSocialIconSelect = (iconHtml: string) => {
    if ((window as any).tinymce) {
      const editor = (window as any).tinymce.get(editorId);
      if (editor) {
        editor.execCommand('mceInsertContent', false, iconHtml);
      }
    }
  };

  const handleInsertAIContent = (text: string) => {
    if ((window as any).tinymce) {
      const editor = (window as any).tinymce.get(editorId);
      if (editor) {
        editor.execCommand('mceInsertContent', false, text);
      }
    }
  };

  const tabs = [
    {
      label: 'Content',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <Box className="ck-content">
            {/* Shortcodes Row */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Dynamic Data</Typography>
              <PlaceholderSelect onSelect={handlePlaceholderSelect} />
            </Box>

            {/* Icons Row */}
            <Box mb={2} display="flex" gap={2}>
              <Box flex={1}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Normal</Typography>
                <IconInsertSelect onSelect={handleIconSelect} label="" />
              </Box>
              <Box flex={1}>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 0.5 }}>Social</Typography>
                <SocialIconInsertSelect onSelect={handleSocialIconSelect} label="" />
              </Box>
            </Box>

            <textarea id={editorId} style={{ width: '100%', height: '250px' }} />

            <Box mt={3}>
              <Accordion disableGutters elevation={0} sx={{ border: '1px solid #eee', '&:before': { display: 'none' } }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: '#f9f9f9', minHeight: '40px', '& .MuiAccordionSummary-content': { my: 1 } }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <AutoAwesomeIcon sx={{ fontSize: '16px', color: '#3858e9' }} />
                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#3858e9' }}>AI Assistant</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2 }}>
                  <AIAssistant
                    mode="text"
                    onInsertText={handleInsertAIContent}
                    currentContent={editorContent}
                  />
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        </Box>
      )
    },
    {
      label: 'Style',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <StyleTabContent subStyles={textEditorOptions} onUpdate={debouncedUpdate} showTypography={true} />
        </Box>
      )
    },
    {
      label: 'Advanced',
      content: (
        <Box sx={{ p: 2, bgcolor: '#fff' }}>
          <AdvancedTabContent subStyles={textEditorOptions} onUpdate={debouncedUpdate} />
        </Box>
      )
    }
  ];

  return (
    <WidgetEditorWrapper
      title="Text"
      description="Customize text content and style."
      onClose={handleCloseEditor}
      onDelete={handleDeleteContent}
      tabs={tabs}
    />
  );
};


export default TextWidgetEditor;