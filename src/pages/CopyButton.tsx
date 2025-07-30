import React, {useMemo, useState, useEffect} from 'react';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import {FileInfo} from "../types/types.ts";
import {keyframes} from '@mui/system';
import {calculateTokenCount, formatTokenCount, generatePrompt} from "../utils/promptBuilder";
import {HistoryRecord} from "../types/history";
import {historyDB} from "../utils/indexedDB";

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
    const [isDBInitialized, setIsDBInitialized] = useState(false);

    // 初始化IndexedDB
    useEffect(() => {
        const initDB = async () => {
            try {
                await historyDB.init();
                setIsDBInitialized(true);
            } catch (error) {
                console.error('Failed to initialize IndexedDB:', error);
            }
        };
        initDB();
    }, []);

    const tokenCount = useMemo(() =>
            calculateTokenCount(roleContent, ruleContent, taskContent, outputContent, files),
        [roleContent, ruleContent, taskContent, outputContent, files]
    );

    const formattedToken = useMemo(() =>
            formatTokenCount(tokenCount),
        [tokenCount]);

    // 自动保存历史记录
    const saveToHistory = async () => {
        if (!isDBInitialized) return;

        try {
            const record: HistoryRecord = {
                id: `copy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                title: `复制记录 ${new Date().toLocaleString('zh-CN')}`,
                description: '通过复制按钮自动保存的历史记录',
                roleContent,
                ruleContent,
                taskContent,
                outputContent,
                files,
                tags: ['自动保存', '复制'],
                version: 1
            };

            await historyDB.saveRecord(record);
            console.log('History record saved automatically on copy');
        } catch (error) {
            console.error('Failed to save history record on copy:', error);
        }
    };

    const handleCopy = async () => {
        try {
            const promptText = generatePrompt(roleContent, ruleContent, taskContent, outputContent, files);
            await navigator.clipboard.writeText(promptText);

            // 复制成功后自动保存历史记录
            await saveToHistory();

            setMessage({text: '复制成功，已自动保存到历史记录', severity: 'success'});
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