import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Box, TextField, Typography, Switch, FormControlLabel, Stack, Divider, IconButton, Tooltip } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../../../../Store/store';
import { updateEmailFooterEditorOptions, closeEditor, deleteColumnContent } from '../../../../../Store/Slice/workspaceSlice';
import CommonStylingControls from '../../../../utils/CommonStylingControls';
import { PlaceholderSelect } from '../../../../utils/PlaceholderSelect';
import WidgetEditorWrapper from "../../../../utils/WidgetEditorWrapper";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import PinterestIcon from "@mui/icons-material/Pinterest";
import YouTubeIcon from "@mui/icons-material/YouTube";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import RedditIcon from "@mui/icons-material/Reddit";
import MailIcon from "@mui/icons-material/Mail";
import GitHubIcon from "@mui/icons-material/GitHub";
import TelegramIcon from "@mui/icons-material/Telegram";
import DeleteIcon from "@mui/icons-material/Delete";

const socialIconsMap: any = {
    facebook: { icon: <FacebookIcon />, fallback: "f", color: "#3b5998" },
    twitter: { icon: <TwitterIcon />, fallback: "x", color: "#1DA1F2" },
    linkedin: { icon: <LinkedInIcon />, fallback: "l", color: "#0077B5" },
    instagram: { icon: <InstagramIcon />, fallback: "i", color: "#E1306C" },
    pinterest: { icon: <PinterestIcon />, fallback: "p", color: "#Bd081C" },
    youtube: { icon: <YouTubeIcon />, fallback: "y", color: "#FF0000" },
    whatsapp: { icon: <WhatsAppIcon />, fallback: "w", color: "#25D366" },
    reddit: { icon: <RedditIcon />, fallback: "r", color: "#FF4500" },
    github: { icon: <GitHubIcon />, fallback: "g", color: "#181717" },
    telegram: { icon: <TelegramIcon />, fallback: "t", color: "#0088CC" },
    envelope: { icon: <MailIcon />, fallback: "e", color: "#0072C6" },
};

const EmailFooterWidgetEditor: React.FC = () => {
    const dispatch = useDispatch();
    const { emailFooterEditorOptions, selectedBlockForEditor, selectedColumnIndex, selectedWidgetIndex } = useSelector((state: RootState) => state.workspace);

    const handleChange = (field: string, value: any) => {
        dispatch(updateEmailFooterEditorOptions({ [field]: value }));
    };

    const handleCloseEditor = () => {
        dispatch(closeEditor());
    };

    const handleDeleteContent = () => {
        if (selectedBlockForEditor && selectedColumnIndex !== null && selectedWidgetIndex !== null) {
            dispatch(
                deleteColumnContent({
                    blockId: selectedBlockForEditor,
                    columnIndex: selectedColumnIndex,
                    widgetIndex: selectedWidgetIndex,
                })
            );
        }
    };

    const addedIcons = {
        icons: (emailFooterEditorOptions?.socialIcons?.icons || []) as string[],
        urls: (emailFooterEditorOptions?.socialIcons?.urls || []) as string[],
    };


    const handleAddIcon = (key: string) => {
        if (!addedIcons.icons.includes(key)) {
            const newIcons = [...addedIcons.icons, key];
            const newUrls = [...addedIcons.urls, `https://${key}.com`];
            handleChange('socialIcons', { icons: newIcons, urls: newUrls });
        }
    };

    const handleDeleteIcon = (key: string) => {
        const index = addedIcons.icons.indexOf(key);
        if (index > -1) {
            const newIcons = addedIcons.icons.filter((_, i) => i !== index);
            const newUrls = addedIcons.urls.filter((_, i) => i !== index);
            handleChange('socialIcons', { icons: newIcons, urls: newUrls });
        }
    };

    const handleUrlChange = (key: string, value: string) => {
        const index = addedIcons.icons.indexOf(key);
        if (index > -1) {
            const newUrls = [...addedIcons.urls];
            newUrls[index] = value;
            handleChange('socialIcons', { icons: addedIcons.icons, urls: newUrls });
        }
    };

    // CKEditor Logic
    // wp.editor Logic
    const isInitializingRef = useRef(false);
    const editorId = useMemo(() => `footer-editor-${Math.random().toString(36).substr(2, 9)}`, []);

    // Initial value ref to prevent loop
    const copyrightText = emailFooterEditorOptions?.copyrightText || '';
    const copyrightRef = useRef(copyrightText);

    useEffect(() => {
        copyrightRef.current = copyrightText;
    }, [copyrightText]);

    useEffect(() => {
        // Don't initialize if hidden to avoid 0-height rendering issues
        if (emailFooterEditorOptions?.showCopyright === false) {
            return;
        }

        let intervalId: any;

        const initEditor = () => {
            const wp = (window as any).wp;
            if (!wp || !wp.editor || isInitializingRef.current) {
                return;
            }

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
                            handleChange('copyrightText', data);
                        });
                        editor.on('init', function () {
                            editor.setContent(copyrightRef.current || "");
                        });
                    }
                },
                quicktags: true,
                mediaButtons: false,
            });

            isInitializingRef.current = false;
        };

        initEditor();

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
    }, [emailFooterEditorOptions?.showCopyright, editorId]);

    // Update editor content if redux state changes externally (e.g. undo/redo)
    useEffect(() => {
        if ((window as any).tinymce) {
            const editor = (window as any).tinymce.get(editorId);
            if (editor && editor.getContent() !== copyrightText) {
                if (!editor.hasFocus()) {
                    editor.setContent(copyrightText || "");
                }
            }
        }
    }, [copyrightText, editorId]);


    const handlePlaceholderSelect = (field: string) => (placeholder: string) => {
        if (field === 'copyrightText' && (window as any).tinymce) {
            const editor = (window as any).tinymce.get(editorId);
            if (editor) {
                editor.execCommand('mceInsertContent', false, placeholder);
            }
            return;
        }

        const currentValue = (emailFooterEditorOptions as any)[field] || '';
        // If the field is just a placeholder or empty, replace it. Otherwise append.
        if (!currentValue || currentValue.startsWith('{{')) {
            handleChange(field, placeholder);
        } else {
            handleChange(field, currentValue + ' ' + placeholder);
        }
    };

    const tabs = [
        {
            label: 'General & Social',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={2}>
                        <FormControlLabel
                            control={<Switch size="small" checked={emailFooterEditorOptions?.showSocialMedia !== false} onChange={(e) => handleChange('showSocialMedia', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Social Media</Typography>}
                            sx={{ ml: 0 }}
                        />
                        {emailFooterEditorOptions?.showSocialMedia !== false && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontSize: '13px', color: '#666', mb: 1, fontWeight: 600 }}>Social Icons</Typography>
                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mb: 1.5 }}>
                                    {Object.keys(socialIconsMap)
                                        .filter((key) => !addedIcons.icons.includes(key))
                                        .map((key) => (
                                            <Tooltip title={`Add ${key}`} key={key}>
                                                <Box
                                                    onClick={() => handleAddIcon(key)}
                                                    sx={{
                                                        width: 28, height: 28,
                                                        borderRadius: "4px",
                                                        border: '1px solid #e0e0e0',
                                                        display: "flex", justifyContent: "center", alignItems: "center",
                                                        cursor: "pointer", bgcolor: '#f9f9f9',
                                                        "&:hover": { bgcolor: '#fff', borderColor: socialIconsMap[key].color }
                                                    }}
                                                >
                                                    {React.cloneElement(socialIconsMap[key].icon, { sx: { width: 16, height: 16, color: socialIconsMap[key].color } })}
                                                </Box>
                                            </Tooltip>
                                        ))}
                                </Box>
                                <Stack spacing={1}>
                                    {addedIcons.icons.map((key, index) => (
                                        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1, border: '1px solid #e7e9eb', p: '4px 8px', borderRadius: '4px' }}>
                                            {socialIconsMap[key]?.icon ? React.cloneElement(socialIconsMap[key].icon, { sx: { width: 18, height: 18, color: socialIconsMap[key].color } }) : null}
                                            <TextField
                                                size="small"
                                                fullWidth
                                                variant="standard"
                                                value={addedIcons.urls[index] || ''}
                                                onChange={(e) => handleUrlChange(key, e.target.value)}
                                                InputProps={{ disableUnderline: true, sx: { fontSize: '11px' } }}
                                            />
                                            <IconButton size="small" onClick={() => handleDeleteIcon(key)} sx={{ p: 0.2 }}>
                                                <DeleteIcon sx={{ fontSize: '16px', color: '#d32f2f' }} />
                                            </IconButton>
                                        </Box>
                                    ))}
                                </Stack>
                            </Box>
                        )}
                        <Divider />
                        <FormControlLabel
                            control={<Switch size="small" checked={emailFooterEditorOptions?.showAddress !== false} onChange={(e) => handleChange('showAddress', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Address</Typography>}
                            sx={{ ml: 0 }}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={emailFooterEditorOptions?.showContact !== false} onChange={(e) => handleChange('showContact', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Contact Info</Typography>}
                            sx={{ ml: 0 }}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={emailFooterEditorOptions?.showLegal !== false} onChange={(e) => handleChange('showLegal', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Legal Section</Typography>}
                            sx={{ ml: 0 }}
                        />
                        <FormControlLabel
                            control={<Switch size="small" checked={emailFooterEditorOptions?.showCopyright !== false} onChange={(e) => handleChange('showCopyright', e.target.checked)} />}
                            label={<Typography sx={{ fontSize: '11px', color: '#495157' }}>Show Copyright Text</Typography>}
                            sx={{ ml: 0 }}
                        />
                    </Stack>
                </Box>
            )
        },
        {
            label: 'Content Data',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={3}>
                        {emailFooterEditorOptions?.showAddress !== false && (
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>STORE ADDRESS</Typography>
                                <TextField
                                    fullWidth
                                    size="small"
                                    value={emailFooterEditorOptions?.storeAddress || ''}
                                    onChange={(e) => handleChange('storeAddress', e.target.value)}
                                    multiline
                                    rows={2}
                                    InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }}
                                    sx={{ mb: 1 }}
                                />
                                <PlaceholderSelect onSelect={handlePlaceholderSelect('storeAddress')} />
                            </Box>
                        )}

                        {emailFooterEditorOptions?.showContact !== false && (
                            <>
                                <Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>CONTACT EMAIL</Typography>
                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Label</Typography>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.emailLabel || ''} onChange={(e) => handleChange('emailLabel', e.target.value)} placeholder="e.g. Email:" InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Value</Typography>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.contactEmail || ''} onChange={(e) => handleChange('contactEmail', e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} sx={{ mb: 1 }} />
                                            <PlaceholderSelect onSelect={handlePlaceholderSelect('contactEmail')} />
                                        </Box>
                                    </Stack>
                                </Box>

                                <Box>
                                    <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>CONTACT PHONE</Typography>
                                    <Stack spacing={1.5}>
                                        <Box>
                                            <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Label</Typography>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.phoneLabel || ''} onChange={(e) => handleChange('phoneLabel', e.target.value)} placeholder="e.g. Phone:" InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                        </Box>
                                        <Box>
                                            <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5 }}>Value</Typography>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.contactPhone || ''} onChange={(e) => handleChange('contactPhone', e.target.value)} InputProps={{ sx: { fontSize: '11px', bgcolor: '#f9f9f9' } }} />
                                        </Box>
                                    </Stack>
                                </Box>
                            </>
                        )}

                        {emailFooterEditorOptions?.showLegal !== false && (
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>LEGAL LINKS</Typography>
                                <Stack spacing={2} sx={{ p: 1.5, border: '1px solid #e7e9eb', borderRadius: '4px' }}>
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5, fontWeight: 700 }}>Privacy Policy</Typography>
                                        <Stack spacing={1}>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.privacyLinkText || ''} onChange={(e) => handleChange('privacyLinkText', e.target.value)} placeholder="Label" InputProps={{ sx: { fontSize: '11px' } }} />
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.privacyLinkUrl || ''} onChange={(e) => handleChange('privacyLinkUrl', e.target.value)} placeholder="URL" InputProps={{ sx: { fontSize: '11px' } }} />
                                        </Stack>
                                    </Box>
                                    <Divider />
                                    <Box>
                                        <Typography sx={{ fontSize: '13px', color: '#666', mb: 0.5, fontWeight: 700 }}>Terms & Conditions</Typography>
                                        <Stack spacing={1}>
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.termsLinkText || ''} onChange={(e) => handleChange('termsLinkText', e.target.value)} placeholder="Label" InputProps={{ sx: { fontSize: '11px' } }} />
                                            <TextField fullWidth size="small" value={emailFooterEditorOptions?.termsLinkUrl || ''} onChange={(e) => handleChange('termsLinkUrl', e.target.value)} placeholder="URL" InputProps={{ sx: { fontSize: '11px' } }} />
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Box>
                        )}

                        {emailFooterEditorOptions?.showCopyright !== false && (
                            <Box>
                                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>COPYRIGHT</Typography>
                                <Box sx={{
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    mt: 1,
                                    mb: 1,
                                    bgcolor: '#fff',
                                    '& .ck-editor__editable': {
                                        minHeight: '120px',
                                        padding: '10px'
                                    }
                                }}>
                                    <textarea id={editorId} style={{ width: '100%', height: '120px' }} />
                                </Box>
                                <PlaceholderSelect onSelect={handlePlaceholderSelect('copyrightText')} />
                            </Box>
                        )}
                    </Stack>
                </Box>
            )
        },
        {
            label: 'Style',
            content: (
                <Box sx={{ p: 2, bgcolor: '#fff' }}>
                    <Stack spacing={2.5}>
                        <CommonStylingControls
                            options={emailFooterEditorOptions}
                            onUpdate={(updatedOptions) => dispatch(updateEmailFooterEditorOptions(updatedOptions))}
                            showMargin={true}
                        />
                        <Box>
                            <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#555', mb: 1 }}>Link Color</Typography>
                            <TextField
                                fullWidth
                                type="color"
                                size="small"
                                value={emailFooterEditorOptions?.linkColor === 'transparent' ? '#4CAF50' : (emailFooterEditorOptions?.linkColor || '#4CAF50')}
                                onChange={(e) => handleChange('linkColor', e.target.value)}
                                sx={{
                                    '& .MuiInputBase-input': { padding: 0, height: '35px', cursor: 'pointer', border: 'none', bgcolor: 'transparent' },
                                    '& .MuiOutlinedInput-notchedOutline': { border: '1px solid #ddd' }
                                }}
                            />
                        </Box>
                    </Stack>
                </Box>
            )
        }
    ];

    return (
        <WidgetEditorWrapper
            title="Email Footer"
            description="Customize your email footer branding and links."
            onClose={handleCloseEditor}
            onDelete={handleDeleteContent}
            tabs={tabs}
        />
    );
};

export default EmailFooterWidgetEditor;
