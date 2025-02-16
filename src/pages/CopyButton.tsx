import React, {useMemo, useState} from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {FileInfo} from "../types/types.ts";

interface CopyButtonProps {
    content: string;
    files: FileInfo[];
}

const formatTokenCount = (count: number): string => {
    if (count >= 10000) {
        return `${(count / 10000).toFixed(1).replace(/\.0$/, '')}万`;
    }
    if (count >= 1000) {
        return `${(count / 1000).toFixed(1).replace(/\.0$/, '')}k`;
    }
    return count.toString();
};

const CopyButton: React.FC<CopyButtonProps> = ({content, files}) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState<{ text: string; severity: 'success' | 'error' }>({
        text: '',
        severity: 'success',
    });

    const tokenCount = useMemo(() => {
        const filesContent = files.map(file =>
            `\`\`\`${file.path}\n${file.content}\n\`\`\``
        ).join('\n\n');
        const totalContent = `${content}\n\n${filesContent}`;
        // 使用近似算法：1个token约等于4个字符
        return Math.ceil(totalContent.length / 4);
    }, [content, files]);

    const formattedToken = useMemo(() => formatTokenCount(tokenCount), [tokenCount]);

    const handleCopy = async () => {
        const filesContent = files.map(file =>
            `\`\`\`${file.path}\n${file.content}\n\`\`\``
        ).join('\n\n');

        try {
            await navigator.clipboard.writeText(`${content}\n\n${filesContent}`);
            setMessage({text: '内容已复制!', severity: 'success'});
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
                sx={{
                    mt: 3,
                    fontSize: '1.1rem',
                    padding: '12px 24px',
                    width: '100%'
                }}>
                构造提示词并复制到剪切板 (约 {formattedToken} Tokens)
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