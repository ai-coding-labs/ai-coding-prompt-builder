// MarkdownEditor.tsx
import React, {useEffect, useRef, useState} from 'react';
import FileUpload from './FileUpload';
import CopyButton from './CopyButton';
import {Prism as SyntaxHighlighter} from 'react-syntax-highlighter';
import {materialLight} from 'react-syntax-highlighter/dist/esm/styles/prism';
import {Box, Dialog, DialogContent, DialogTitle, IconButton, TextField, Typography, Button, Tooltip} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DeleteIcon from '@mui/icons-material/Delete';
import DeleteForever from '@mui/icons-material/DeleteForever';
import HistoryIcon from '@mui/icons-material/History';
import FilterListIcon from '@mui/icons-material/FilterList';
import SaveIcon from '@mui/icons-material/Save';
import './styles.css';
import { FileInfo } from '../types/types';
import { HistoryRecord, FileFilter, DEFAULT_FILE_FILTER } from '../types/history';
import { historyDB } from '../utils/indexedDB';
import { applyFileFilter, getFilterStats } from '../utils/fileFilter';
import HistoryPanel from '../components/HistoryPanel';
import FileFilterComponent from '../components/FileFilter';

interface MarkdownEditorProps {
    ruleContent: string;
    roleContent: string;
    outputContent: string;
    onLoadFromHistory?: (record: HistoryRecord) => void;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({ruleContent, roleContent, outputContent, onLoadFromHistory}) => {
    const [markdownContent, setMarkdownContent] = useState(() => {
        const saved = localStorage.getItem('markdownContent');
        return saved || '';
    });
    const [files, setFiles] = useState<FileInfo[]>(() => {
        const savedFiles = localStorage.getItem('uploadedFiles');
        return savedFiles ? JSON.parse(savedFiles) : [];
    });
    const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const previewContentRef = useRef<HTMLDivElement>(null);

    // 新增状态
    const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
    const [fileFilterOpen, setFileFilterOpen] = useState(false);
    const [fileFilter, setFileFilter] = useState<FileFilter>(() => {
        const saved = localStorage.getItem('fileFilter');
        return saved ? JSON.parse(saved) : DEFAULT_FILE_FILTER;
    });
    const [originalFiles, setOriginalFiles] = useState<FileInfo[]>([]);
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

    // 持久化markdown内容
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('markdownContent', markdownContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [markdownContent]);

    // 持久化上传文件
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('uploadedFiles', JSON.stringify(files));
        }, 500);
        return () => clearTimeout(timer);
    }, [files]);

    // 恢复滚动位置
    useEffect(() => {
        if (previewFile && previewContentRef.current) {
            const savedScrollTop = parseInt(
                localStorage.getItem(`scrollPosition:${previewFile.name}`) || '0',
                10
            );
            previewContentRef.current.scrollTop = savedScrollTop;
        }
    }, [previewFile]);

    // 持久化文件过滤器设置
    useEffect(() => {
        localStorage.setItem('fileFilter', JSON.stringify(fileFilter));
    }, [fileFilter]);

    const handleFilesUploaded = (newFiles: FileInfo[]) => {
        // 保存原始文件
        setOriginalFiles(newFiles);

        // 应用过滤器
        const filteredFiles = applyFileFilter(newFiles, fileFilter);

        setFiles(prev => {
            const updatedFiles = [...prev, ...filteredFiles];
            // 去重逻辑
            const uniqueFiles = updatedFiles.reduce((acc, current) => {
                if (!acc.some(file => file.path === current.path)) {
                    acc.push(current);
                }
                return acc;
            }, [] as FileInfo[]);
            return uniqueFiles;
        });
    };

    // 保存当前状态为历史记录
    const saveToHistory = async () => {
        if (!isDBInitialized) return;

        try {
            const record: HistoryRecord = {
                id: `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now(),
                title: `构造记录 ${new Date().toLocaleString('zh-CN')}`,
                description: '',
                roleContent,
                ruleContent,
                taskContent: markdownContent,
                outputContent,
                files,
                tags: [],
                version: 1
            };

            await historyDB.saveRecord(record);
            console.log('History record saved successfully');
        } catch (error) {
            console.error('Failed to save history record:', error);
        }
    };

    // 从历史记录加载
    const loadFromHistory = (record: HistoryRecord) => {
        setMarkdownContent(record.taskContent);
        setFiles(record.files);
        // 通知父组件更新其他内容
        if (onLoadFromHistory) {
            onLoadFromHistory(record);
        }
        console.log('Loaded from history:', record.title);
    };

    // 应用文件过滤器
    const applyFilter = (newFilter: FileFilter) => {
        setFileFilter(newFilter);
        if (originalFiles.length > 0) {
            const filteredFiles = applyFileFilter(originalFiles, newFilter);
            setFiles(filteredFiles);
        }
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
        setFiles(prev => {
            const newFiles = prev.filter((_, i) => i !== index);
            return newFiles;
        });
        if (previewFile?.name === files[index]?.name) {
            setIsDialogOpen(false);
        }
    };

    const handleClearAllFiles = () => {
        setFiles([]);
        setPreviewFile(null);
        setIsDialogOpen(false);
    };

    const CodePreview = ({content, language}: { content: string; language: string }) => (
        <SyntaxHighlighter
            language={language}
            style={materialLight}
            showLineNumbers
        >
            {content}
        </SyntaxHighlighter>
    );

    return (
        <div className="editor-container">
            <FileUpload onFilesUploaded={handleFilesUploaded}/>

            {/* 工具栏 */}
            <Box display="flex" gap={1} mb={2} flexWrap="wrap">
                <Tooltip title="查看构造历史">
                    <Button
                        startIcon={<HistoryIcon />}
                        onClick={() => setHistoryPanelOpen(true)}
                        variant="outlined"
                        size="small"
                    >
                        历史记录
                    </Button>
                </Tooltip>

                <Tooltip title="设置文件过滤条件">
                    <Button
                        startIcon={<FilterListIcon />}
                        onClick={() => setFileFilterOpen(true)}
                        variant="outlined"
                        size="small"
                    >
                        文件过滤
                    </Button>
                </Tooltip>

                <Tooltip title="保存当前构造到历史记录">
                    <Button
                        startIcon={<SaveIcon />}
                        onClick={saveToHistory}
                        variant="outlined"
                        size="small"
                        disabled={!isDBInitialized}
                    >
                        保存历史
                    </Button>
                </Tooltip>

                {originalFiles.length > 0 && originalFiles.length !== files.length && (
                    <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center', ml: 1 }}>
                        已过滤 {originalFiles.length - files.length} 个文件
                    </Typography>
                )}
            </Box>

            {files.length > 0 && (
                <div className="file-list">
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">已选择文件</Typography>
                        <IconButton
                            onClick={handleClearAllFiles}
                            color="error"
                            title="清空所有文件"
                        >
                            <DeleteForever/>
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
                                sx={{ml: 1}}
                            >
                                <DeleteIcon fontSize="small"/>
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
                        sx={{position: 'absolute', right: 8, top: 8}}
                    >
                        <CloseIcon/>
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
                    sx={{overflow: 'auto'}}
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
                <CopyButton
                    roleContent={roleContent}
                    ruleContent={ruleContent}
                    taskContent={markdownContent}
                    outputContent={outputContent}
                    files={files}
                />
            </div>

            {/* 历史记录面板 */}
            <HistoryPanel
                open={historyPanelOpen}
                onClose={() => setHistoryPanelOpen(false)}
                onLoadRecord={loadFromHistory}
            />

            {/* 文件过滤对话框 */}
            <FileFilterComponent
                open={fileFilterOpen}
                onClose={() => setFileFilterOpen(false)}
                filter={fileFilter}
                onFilterChange={applyFilter}
            />
        </div>
    );
};

export default MarkdownEditor;