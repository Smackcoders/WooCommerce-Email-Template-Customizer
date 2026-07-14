import React, { useState } from 'react';
import {
    Box,
    Typography,
    TextField,
    Select,
    MenuItem,
    FormControl,
    Button,
    CircularProgress,
    Stack,
    InputLabel
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import axios from 'axios';

interface AIAssistantProps {
    onInsertText?: (text: string) => void;
    onInsertImage?: (imageUrl: string) => void;
    currentContent?: string;
    mode: 'text' | 'image';
}

export const AIAssistant: React.FC<AIAssistantProps> = ({ onInsertText, onInsertImage, currentContent, mode }) => {
    const backendProviders = (window as any).emailCustomizerAjax?.ai_providers || {};

    const parsedProviders = React.useMemo(() => {
        const list: {id: string, name: string, models: {id: string, name: string}[]}[] = [];
        if (backendProviders && typeof backendProviders === 'object') {
            Object.keys(backendProviders).forEach(key => {
                const p = backendProviders[key];
                if (!p) return;
                
                const id = p.id || p.slug || key;
                const name = p.name || p.label || p.title || id;
                const modelsList: {id: string, name: string}[] = [];
                
                if (p.models && typeof p.models === 'object') {
                    // It might be an array of objects or a record string->string
                    Object.keys(p.models).forEach(mKey => {
                        const m = p.models[mKey];
                        if (typeof m === 'string') {
                            modelsList.push({ id: mKey, name: m });
                        } else if (typeof m === 'object' && m !== null) {
                            modelsList.push({ id: m.id || m.slug || mKey, name: m.name || m.label || m.title || mKey });
                        }
                    });
                }
                list.push({ id, name, models: modelsList });
            });
        }
        return list;
    }, [backendProviders]);

    const [provider, setProvider] = useState(mode === 'image' ? 'huggingface' : 'openai');
    const [textProvider, setTextProvider] = useState(parsedProviders.length > 0 ? parsedProviders[0].id : '');
    const [textModel, setTextModel] = useState((parsedProviders.length > 0 && parsedProviders[0].models.length > 0) ? parsedProviders[0].models[0].id : '');
    const [action, setAction] = useState('prompt');
    const [prompt, setPrompt] = useState('');
    const [tone, setTone] = useState('Professional');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState('');
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (parsedProviders.length > 0 && !textProvider) {
            setTextProvider(parsedProviders[0].id);
            if (parsedProviders[0].models.length > 0) {
                setTextModel(parsedProviders[0].models[0].id);
            }
        }
    }, [parsedProviders, textProvider]);

    const handleGenerate = async () => {
        setLoading(true);
        setError('');
        setResult('');

        try {
            const formData = new URLSearchParams();
            formData.append("_ajax_nonce", (window as any).emailCustomizerAjax.nonce);
            formData.append("provider", provider);

            if (mode === 'text') {
                formData.append("action", "wetc_generate_ai_content");
                formData.append("ai_provider", textProvider);
                formData.append("ai_model", textModel);
                formData.append("ai_action", action);
                formData.append("prompt", prompt);
                formData.append("context", currentContent || '');
                if (action === 'tone') {
                    formData.append("tone", tone);
                }
            } else {
                formData.append("action", "wetc_generate_ai_image");
                formData.append("prompt", prompt);
            }

            const response = await axios.post(
                (window as any).emailCustomizerAjax.ajax_url,
                formData,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );

            if (response.data.success) {
                if (mode === 'text') {
                    setResult(response.data.data.result);
                } else {
                    setResult(response.data.data.image_url);
                }
            } else {
                setError(response.data.data?.message || 'Error generating AI content');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleInsert = () => {
        if (!result) return;
        if (mode === 'text' && onInsertText) {
            onInsertText(result);
        } else if (mode === 'image' && onInsertImage) {
            onInsertImage(result);
        }
    };

    return (
        <Box sx={{ p: 2, bgcolor: '#fbfbfb' }}>
            <Stack spacing={2}>
                {mode === 'image' ? (
                    <Box>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Image AI Provider</InputLabel>
                            <Select
                                value={provider}
                                label="Image AI Provider"
                                onChange={(e) => setProvider(e.target.value)}
                                sx={{ fontSize: '12px', bgcolor: '#fff' }}
                                MenuProps={{
                                    sx: { zIndex: 999999 },
                                    PaperProps: {
                                        sx: {
                                            '& .MuiList-root': {
                                                p: '0 !important',
                                                m: '0 !important',
                                                '& ul': {
                                                    p: '0 !important',
                                                    m: '0 !important',
                                                    paddingInlineStart: '0 !important',
                                                    textIndent: '0 !important'
                                                },
                                                '& li': {
                                                    listStyleType: 'none !important',
                                                    m: '0 !important',
                                                    '&::before': { content: 'none !important' },
                                                    '&::after': { content: 'none !important' }
                                                }
                                            }
                                        }
                                    },
                                    MenuListProps: {
                                        disablePadding: true
                                    }
                                }}
                            >
                                <MenuItem value="huggingface" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Hugging Face</MenuItem>
                                <MenuItem value="pollinations" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Pollinations.ai</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                ) : (
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>AI Provider</InputLabel>
                            <Select
                                value={textProvider}
                                label="AI Provider"
                                onChange={(e) => {
                                    const newProviderId = e.target.value;
                                    setTextProvider(newProviderId);
                                    const selectedP = parsedProviders.find(p => p.id === newProviderId);
                                    if (selectedP && selectedP.models.length > 0) {
                                        setTextModel(selectedP.models[0].id);
                                    } else {
                                        setTextModel('');
                                    }
                                }}
                                sx={{ fontSize: '12px', bgcolor: '#fff' }}
                                MenuProps={{
                                    sx: { zIndex: 999999 },
                                    PaperProps: { sx: { maxHeight: 300, maxWidth: 280, '& .MuiList-root': { p: 0, m: 0 } } }
                                }}
                            >
                                {parsedProviders.length === 0 && (
                                    <MenuItem value="" sx={{ fontSize: '12px' }}>No Providers Found</MenuItem>
                                )}
                                {parsedProviders.map(p => (
                                    <MenuItem key={p.id} value={p.id} sx={{ fontSize: '12px' }}>{p.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Model</InputLabel>
                            <Select
                                value={textModel}
                                label="Model"
                                onChange={(e) => setTextModel(e.target.value)}
                                sx={{ fontSize: '12px', bgcolor: '#fff' }}
                                MenuProps={{
                                    sx: { zIndex: 999999 },
                                    PaperProps: { sx: { maxHeight: 300, maxWidth: 280, '& .MuiList-root': { p: 0, m: 0 } } }
                                }}
                            >
                                {(() => {
                                    const selectedP = parsedProviders.find(p => p.id === textProvider);
                                    if (!selectedP || selectedP.models.length === 0) {
                                        return <MenuItem value="" sx={{ fontSize: '12px' }}>Default</MenuItem>;
                                    }
                                    return selectedP.models.map(m => (
                                        <MenuItem key={m.id} value={m.id} sx={{ fontSize: '12px' }}>{m.name}</MenuItem>
                                    ));
                                })()}
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {mode === 'text' && (
                    <Box>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Action</InputLabel>
                            <Select
                                value={action}
                                label="Action"
                                onChange={(e) => setAction(e.target.value)}
                                sx={{ fontSize: '12px', bgcolor: '#fff' }}
                                MenuProps={{
                                    sx: { zIndex: 999999 },
                                    PaperProps: {
                                        sx: {
                                            '& .MuiList-root': {
                                                p: '0 !important',
                                                m: '0 !important',
                                                '& ul': {
                                                    p: '0 !important',
                                                    m: '0 !important',
                                                    paddingInlineStart: '0 !important',
                                                    textIndent: '0 !important'
                                                },
                                                '& li': {
                                                    listStyleType: 'none !important',
                                                    m: '0 !important',
                                                    '&::before': { content: 'none !important' },
                                                    '&::after': { content: 'none !important' }
                                                }
                                            }
                                        }
                                    },
                                    MenuListProps: {
                                        disablePadding: true
                                    }
                                }}
                            >
                                <MenuItem value="prompt" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Write from Prompt</MenuItem>
                                <MenuItem value="tone" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Change Tone</MenuItem>
                                <MenuItem value="summarize" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Summarize</MenuItem>
                                <MenuItem value="expand" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Expand</MenuItem>
                                <MenuItem value="correct" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Fix Formatting & Grammar</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {mode === 'text' && action === 'tone' && (
                    <Box>
                        <FormControl fullWidth size="small">
                            <InputLabel sx={{ fontSize: '12px' }}>Tone</InputLabel>
                            <Select
                                value={tone}
                                label="Tone"
                                onChange={(e) => setTone(e.target.value)}
                                sx={{ fontSize: '12px', bgcolor: '#fff' }}
                                MenuProps={{
                                    sx: { zIndex: 999999 },
                                    PaperProps: {
                                        sx: {
                                            '& .MuiList-root': {
                                                p: '0 !important',
                                                m: '0 !important',
                                                '& ul': {
                                                    p: '0 !important',
                                                    m: '0 !important',
                                                    paddingInlineStart: '0 !important',
                                                    textIndent: '0 !important'
                                                },
                                                '& li': {
                                                    listStyleType: 'none !important',
                                                    m: '0 !important',
                                                    '&::before': { content: 'none !important' },
                                                    '&::after': { content: 'none !important' }
                                                }
                                            }
                                        }
                                    },
                                    MenuListProps: {
                                        disablePadding: true
                                    }
                                }}
                            >
                                <MenuItem value="Professional" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Professional</MenuItem>
                                <MenuItem value="Friendly" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Friendly</MenuItem>
                                <MenuItem value="Urgent" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Urgent</MenuItem>
                                <MenuItem value="Persuasive" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Persuasive</MenuItem>
                                <MenuItem value="Humorous" sx={{ fontSize: '12px', m: '0 !important', px: '12px !important', py: '6px !important' }}>Humorous</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                )}

                {(action === 'prompt' || mode === 'image') && (
                    <Box>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                            placeholder={mode === 'image' ? "Describe the image you want to generate..." : "What do you want the AI to write about?"}
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            onKeyDown={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                            onKeyUp={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                            onKeyPress={(e) => { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); }}
                            InputProps={{ sx: { fontSize: '12px', bgcolor: '#fff' } }}
                        />
                    </Box>
                )}

                <Button
                    variant="contained"
                    fullWidth
                    onClick={handleGenerate}
                    disabled={loading || ((action === 'prompt' || mode === 'image') && !prompt)}
                    sx={{ bgcolor: '#3858e9', fontSize: '12px', textTransform: 'none', '&:hover': { bgcolor: '#2c46ba' } }}
                >
                    {loading ? <CircularProgress size={20} color="inherit" /> : 'Generate'}
                </Button>

                {error && (
                    <Typography color="error" sx={{ fontSize: '11px', mt: 1 }}>{error}</Typography>
                )}

                {result && (
                    <Box sx={{ mt: 2, p: 1.5, border: '1px solid #ddd', borderRadius: 1, bgcolor: '#fff' }}>
                        <Typography sx={{ fontSize: '12px', fontWeight: 600, mb: 1, color: '#333' }}>Result:</Typography>
                        {mode === 'image' ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', bgcolor: '#f5f5f5', borderRadius: 1, overflow: 'hidden', border: '1px solid #eee' }}>
                                <Box 
                                    component="img" 
                                    src={result} 
                                    alt="AI Generated" 
                                    sx={{ 
                                        maxWidth: '100%', 
                                        maxHeight: '300px', 
                                        display: 'block',
                                        objectFit: 'contain'
                                    }} 
                                />
                            </Box>
                        ) : (
                            <Box sx={{ fontSize: '11px', color: '#555', maxHeight: '150px', overflowY: 'auto', p: 1, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                                <div dangerouslySetInnerHTML={{ __html: result }} />
                            </Box>
                        )}
                        <Button
                            variant="outlined"
                            fullWidth
                            size="small"
                            onClick={handleInsert}
                            sx={{ mt: 2, fontSize: '11px', textTransform: 'none', borderColor: '#3858e9', color: '#3858e9' }}
                        >
                            Insert into Block
                        </Button>
                    </Box>
                )}
            </Stack>
        </Box>
    );
};
