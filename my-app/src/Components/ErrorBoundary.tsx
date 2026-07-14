import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Typography } from '@mui/material';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <Box style={{ padding: 20, border: '5px solid red', backgroundColor: '#fff0f0' }}>
                    <Typography variant="h4" color="error">Something went wrong.</Typography>
                    <Typography variant="body1" style={{ whiteSpace: 'pre-wrap' }}>
                        {this.state.error?.toString()}
                    </Typography>
                </Box>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
