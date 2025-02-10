// MarkdownEditor.tsx
import React, { useEffect, useState } from 'react';
import FileUpload from './FileUpload';
import CopyButton from './CopyButton';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Box, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import './styles.css';

interface FileInfo {
    name: string;
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

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('markdownContent', markdownContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [markdownContent]);

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

    const CodePreview = ({ content, language }: { content: string; language: string }) => (
        <SyntaxHighlighter
            language={language}
            style={materialLight}
            showLineNumbers
        >
            {content}
        </SyntaxHighlighter>
    );

    const combinedContent = `# 角色\n${roleContent}\n\n# 任务\n${markdownContent}\n\n# 规则\n${ruleContent}`;

    return (
        <div className="editor-container">
            <FileUpload onFilesUploaded={handleFilesUploaded} />

            {files.length > 0 && (
                <div className="file-list">
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
                                    {file.name}
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
                    {previewFile?.name}
                    <IconButton
                        onClick={() => setIsDialogOpen(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
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
                    rows={10}
                    value={markdownContent}
                    onChange={(e) => setMarkdownContent(e.target.value)}
                    label="执行任务（Markdown格式）"
                    variant="outlined"
                    className="markdown-editor"
                />
            </div>

            <div className="copy-button-container">
                <CopyButton content={combinedContent} files={files} />
            </div>
        </div>
    );
};

export default MarkdownEditor;