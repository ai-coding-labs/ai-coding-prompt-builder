// MarkdownEditor.tsx
import React, { useEffect, useState, useRef } from 'react';
import FileUpload from './FileUpload';
import CopyButton from './CopyButton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForever from '@mui/icons-material/DeleteForever';
import './styles.css';

interface FileInfo {
    name: string;
    path: string;
    size: number;
    extension: string;
    content: string;
}

interface MarkdownEditorProps {
    ruleContent: string;
    roleContent: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ ruleContent, roleContent }) => {
    const [markdownContent, setMarkdownContent] = useState(() => {
        const saved = localStorage.getItem('markdownContent');
        return saved || '';
    });
    const [files, setFiles] = useState<FileInfo[]>([]);
    const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const previewContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('markdownContent', markdownContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [markdownContent]);

    useEffect(() => {
        if (previewFile && previewContentRef.current) {
            const savedScrollTop = parseInt(
                localStorage.getItem(`scrollPosition:${previewFile.name}`) || '0',
                10
            );
            previewContentRef.current.scrollTop = savedScrollTop;
        }
    }, [previewFile]);

    const handleFilesUploaded = (newFiles: FileInfo[]) => {
        setFiles(prev => [...prev, ...newFiles]);
    };

    const formatFileSize = (bytes: number) => {
        const units = ['B', 'KB', 'MB', 'GB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        return `${size.toFixed(2)} ${units[unitIndex]}`;
    };

    const handleDeleteFile = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        if (previewFile?.name === files[index]?.name) {
            setIsDialogOpen(false);
        }
    };

    const handleClearAllFiles = () => {
        setFiles([]);
        setPreviewFile(null);
        setIsDialogOpen(false);
    };

    const CodePreview = ({ content, language }: { content: string; language: string }) => (
        <SyntaxHighlighter
            language={language}
            style={materialLight}
            showLineNumbers
        >
            {content}
        </SyntaxHighlighter>
    );

    const combinedContent = `# 角色\n${roleContent}\n\n# 规则\n${ruleContent}\n\n# 任务\n${markdownContent}`;

    return (
        <div className="editor-container">
            <FileUpload onFilesUploaded={handleFilesUploaded} />

            {files.length > 0 && (
                <div className="file-list">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">已上传文件</Typography>
                        <IconButton
                            onClick={handleClearAllFiles}
                            color="error"
                            title="清空所有文件"
                        >
                            <DeleteForever />
                        </IconButton>
                    </Box>
                    {files.map((file, index) => (
                        <div
                            key={index}
                            className="file-item"
                        >
                            <div
                                className="file-info"
                                onClick={() => {
                                    setPreviewFile(file);
                                    setIsDialogOpen(true);
                                }}
                            >
                                <Typography variant="subtitle1">
                                    {file.path}
                                </Typography>
                                <Typography variant="caption">
                                    {formatFileSize(file.size)} - {file.extension}
                                </Typography>
                            </div>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteFile(index);
                                }}
                                size="small"
                                sx={{ ml: 1 }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </div>
                    ))}
                </div>
            )}

            <Dialog
                open={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    {previewFile?.path}
                    <IconButton
                        onClick={() => setIsDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent
                    dividers
                    ref={previewContentRef}
                    onScroll={(e) => {
                        if (previewFile) {
                            const scrollTop = e.currentTarget.scrollTop;
                            localStorage.setItem(`scrollPosition:${previewFile.name}`, scrollTop.toString());
                        }
                    }}
                    sx={{ overflow: 'auto' }}
                >
                    {previewFile && (
                        <CodePreview
                            content={previewFile.content}
                            language={previewFile.extension}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <div className="editor-area">
                <TextField
                    fullWidth
                    multiline
                    minRows={10}
                    maxRows={20}
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    label="执行任务（Markdown格式）"
                    variant="outlined"
                    className="markdown-editor"
                    sx={{
                        '& .MuiInputBase-root': {
                            overflow: 'hidden',
                            transition: 'height 0.2s ease-out'
                        }
                    }}
                />
            </div>

            <div className="copy-button-container">
                <CopyButton content={combinedContent} files={files} />
            </div>
        </div>
    );
};

export default MarkdownEditor;