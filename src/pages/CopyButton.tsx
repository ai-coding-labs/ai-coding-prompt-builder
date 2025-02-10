// CopyButton.tsx
import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

interface CopyButtonProps {
    content: string;
    files: Array<{ path: string; content: string }>;
}

const CopyButton: React.FC<CopyButtonProps> = ({ content, files }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' }>({
        text: '',
        severity: 'success',
    });

    const handleCopy = async () => {
        const filesContent = files.map(file =>
            `\`\`\`${file.path}\n${file.content}\n\`\`\``
        ).join('\n\n');

        const fullContent = `${content}\n\n# 相关参考文件：\n${filesContent}`;

        try {
            await navigator.clipboard.writeText(fullContent);
            setMessage({
                text: '内容已复制到剪贴板！',
                severity: 'success',
            });
            setOpen(true);
        } catch (err) {
            setMessage({
                text: '复制失败，请手动复制',
                severity: 'error',
            });
            setOpen(true);
        }
    };

    const handleClose = (event?: React.SyntheticEvent, reason?: string) => {
        if (reason === 'clickaway') {
            return;
        }
        setOpen(false);
    };

    return (
        <>
            <Button variant="contained" onClick={handleCopy}>
                构造提示词并复制到剪切板
            </Button>
            <Snackbar
                open={open}
                autoHideDuration={3000}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <Alert onClose={handleClose} severity={message.severity}>
                    {message.text}
                </Alert>
            </Snackbar>
        </>
    );
};

export default CopyButton;