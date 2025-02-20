import React, {useMemo, useState} from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {FileInfo} from "../types/types.ts";
import {keyframes} from '@mui/system';
import {calculateTokenCount, formatTokenCount, generatePrompt} from "../utils/promptBuilder";

interface CopyButtonProps {
    roleContent: string;
    ruleContent: string;
    taskContent: string;
    outputContent: string;
    files: FileInfo[];
}

const breathAnimation = keyframes`
    0% {
        background-position: 0% 50%;
        opacity: 0.8;
    }
    50% {
        background-position: 100% 50%;
        opacity: 1;
    }
    100% {
        background-position: 0% 50%;
        opacity: 0.8;
    }
`;

const CopyButton: React.FC<CopyButtonProps> = ({
                                                   roleContent,
                                                   ruleContent,
                                                   taskContent,
                                                   outputContent,
                                                   files
                                               }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' }>({
        text: '',
        severity: 'success',
    });

    const tokenCount = useMemo(() =>
            calculateTokenCount(roleContent, ruleContent, taskContent, outputContent, files),
        [roleContent, ruleContent, taskContent, outputContent, files]
    );

    const formattedToken = useMemo(() =>
            formatTokenCount(tokenCount),
        [tokenCount]);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(
                generatePrompt(roleContent, ruleContent, taskContent, outputContent, files)
            );
        } catch {
            setMessage({text: '复制失败', severity: 'error'});
        }
        setOpen(true);
    };

    return (
        <>
            <Button
                variant="contained"
                onClick={handleCopy}
                sx={theme => ({
                    mt: 3,
                    fontSize: '1.1rem',
                    padding: '12px 24px',
                    width: '100%',
                    position: 'relative',
                    overflow: 'hidden',
                    '&::before': tokenCount >= 10000 ? {
                        content: '""',
                        position: 'absolute',
                        top: '-4px',
                        left: '-4px',
                        right: '-4px',
                        bottom: '-4px',
                        background: `linear-gradient(45deg, 
                            rgba(255, 80, 80, 0.8) 0%, 
                            rgba(255, 120, 120, 0.6) 50%, 
                            rgba(255, 80, 80, 0.8) 100%)`,
                        borderRadius: 'inherit',
                        animation: `${breathAnimation} 2s infinite ease-in-out`,
                        zIndex: 1,
                    } : {},
                    '& .MuiButton-contained': {
                        position: 'relative',
                        zIndex: 2
                    },
                    '&:hover': {
                        backgroundColor: tokenCount >= 10000
                            ? theme.palette.error.light
                            : theme.palette.primary.dark
                    }
                })}
            >
                <span style={{position: 'relative', zIndex: 2}}>
                    构造提示词并复制到剪切板 (约 {formattedToken} Tokens)
                </span>
            </Button>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={() => setOpen(false)}
                anchorOrigin={{vertical: 'top', horizontal: 'center'}}>
                <Alert severity={message.severity}>
                    {message.text}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CopyButton;