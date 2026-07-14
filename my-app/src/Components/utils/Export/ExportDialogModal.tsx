import React, { useState } from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  Button,
  Paper,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

interface ExportDialogModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'html' | 'json') => void;
  content: string;
  format: 'html' | 'json';
}

const ExportDialogModal: React.FC<ExportDialogModalProps> = ({
  open,
  onClose,
  onExport,
  content,
  format,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyToClipboard = async () => {
    if (!content) {
      alert('Please generate export content first');
      return;
    }

    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    if (!content) {
      alert('Please generate export content first');
      return;
    }

    const filename = `email-template-${Date.now()}.${format === 'json' ? 'json' : 'html'}`;
    const mime = format === 'json' ? "application/json" : "text/html";

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Modal open={open} onClose={onClose} sx={{ zIndex: 9999999 }}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '90%',
          maxWidth: 800,
          maxHeight: '90vh',
          bgcolor: 'background.paper',
          borderRadius: 2,
          boxShadow: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 3,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f5f5f5',
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            Export Templates
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Content */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 3 }}>
          {/* Export Format Selection */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Export as
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={format === 'html' ? 'contained' : 'outlined'}
                onClick={() => onExport('html')}
                sx={{ flex: 1, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
              >
                Export as HTML
              </Button>
              <Button
                variant={format === 'json' ? 'contained' : 'outlined'}
                onClick={() => onExport('json')}
                sx={{ flex: 1, py: 1.5, textTransform: 'none', fontWeight: 'bold' }}
              >
                Export as JSON
              </Button>
            </Box>
          </Box>

          {/* Output Preview */}
          {content && (
            <>
              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  {format.toUpperCase()} Output
                </Typography>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    bgcolor: '#1e1e1e',
                    color: '#d4d4d4',
                    fontFamily: 'monospace',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    overflow: 'auto',
                    maxHeight: '300px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {content.substring(0, 1000)}
                  {content.length > 1000 && '...'}
                </Paper>
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 1, display: 'block' }}>
                  Showing first 1000 characters of {content.length} total
                </Typography>
              </Box>

              {/* Features List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  {format === 'html' ? 'HTML' : 'JSON'} Export Features:
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {format === 'html' ? (
                    <>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ CSP-safe with no external dependencies
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Responsive design with mobile breakpoints
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Semantic HTML5 markup
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Inline-styles for email compatibility
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Rich text formatting preserved
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Print-friendly styles included
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Structured schema with versioning
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Complete metadata included
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Automatic validation
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Widget type categorization
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'success.main' }}>
                        ✓ Complete page structure representation
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Footer with Action Buttons */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
            bgcolor: '#f5f5f5',
          }}
        >
          <Button
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyToClipboard}
            disabled={!content}
            variant="outlined"
            size="small"
          >
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button onClick={onClose} variant="outlined" size="small">
              Close
            </Button>
            <Button
              startIcon={<DownloadIcon />}
              onClick={handleDownload}
              disabled={!content}
              variant="contained"
              size="small"
            >
              Download
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
};

export default ExportDialogModal;