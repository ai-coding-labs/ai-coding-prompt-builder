// FileUpload.tsx
import React, {useState, useRef} from 'react';
import {FileInfo} from "../types/types.ts";
import { convertPDFToMarkdown, convertPDFResultToFileInfo, isPDFFile } from '../utils/pdfProcessor';
import { Alert, LinearProgress, Typography, Box } from '@mui/material';

interface FileUploadProps {
    onFilesUploaded: (files: FileInfo[]) => void;
}

const getFilesFromDirectory = async (directory: FileSystemDirectoryEntry): Promise<File[]> => {
    return new Promise((resolve) => {
        const files: File[] = [];
        const reader = directory.createReader();

        const readEntries = () => {
            reader.readEntries(async (entries) => {
                if (!entries.length) {
                    resolve(files);
                } else {
                    await Promise.all(entries.map(async (entry) => {
                        if (entry.isFile) {
                            await new Promise((fileResolve) => {
                                (entry as FileSystemFileEntry).file((file) => {
                                    const mappedFile = new File([file], entry.fullPath, {
                                        type: file.type,
                                        lastModified: file.lastModified
                                    });
                                    files.push(mappedFile);
                                    fileResolve(null);
                                });
                            });
                        } else if (entry.isDirectory) {
                            const subFiles = await getFilesFromDirectory(entry as FileSystemDirectoryEntry);
                            files.push(...subFiles);
                        }
                    }));
                    readEntries();
                }
            });
        };
        readEntries();
    });
};

const FileUpload: React.FC<FileUploadProps> = ({onFilesUploaded}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [isProcessingPDF, setIsProcessingPDF] = useState(false);
    const [processingStatus, setProcessingStatus] = useState<string>('');
    const [processingProgress, setProcessingProgress] = useState(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const readFileContent = async (file: File): Promise<FileInfo> => {
        // 检查是否为PDF文件
        if (isPDFFile(file)) {
            return await processPDFFile(file);
        }

        // 处理普通文本文件
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    path: file.webkitRelativePath || (file as any).path || file.name,
                    size: file.size,
                    extension: file.name.split('.').pop() || '',
                    content: e.target?.result as string
                });
            };
            reader.readAsText(file);
        });
    };

    const processPDFFile = async (file: File): Promise<FileInfo> => {
        setIsProcessingPDF(true);
        setProcessingStatus(`正在处理PDF文件: ${file.name}`);
        setProcessingProgress(0);

        try {
            // 模拟进度更新
            const progressInterval = setInterval(() => {
                setProcessingProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await convertPDFToMarkdown(file, {
                maxPages: 20,
                preserveFormatting: true,
                includeImages: false
            });

            clearInterval(progressInterval);
            setProcessingProgress(100);

            if (result.success) {
                setProcessingStatus(`PDF处理完成: ${result.metadata.processedPages}/${result.metadata.pages} 页`);
                setTimeout(() => {
                    setIsProcessingPDF(false);
                    setProcessingStatus('');
                    setProcessingProgress(0);
                }, 1500);

                return convertPDFResultToFileInfo(file, result);
            } else {
                throw new Error(result.error || 'PDF处理失败');
            }
        } catch (error) {
            setProcessingStatus(`PDF处理失败: ${error}`);
            setTimeout(() => {
                setIsProcessingPDF(false);
                setProcessingStatus('');
                setProcessingProgress(0);
            }, 3000);

            // 返回错误信息作为文件内容
            return {
                name: file.name.replace('.pdf', '_error.txt'),
                path: file.name,
                size: 0,
                extension: 'txt',
                content: `PDF处理失败: ${error}\n\n原文件: ${file.name}\n大小: ${file.size} bytes`
            };
        }
    };

    const processEntries = async (items: DataTransferItemList) => {
        const files: File[] = [];

        await Promise.all(Array.from(items).map(async (item) => {
            if (item.webkitGetAsEntry) {
                const entry = item.webkitGetAsEntry();
                if (entry?.isDirectory) {
                    const directoryFiles = await getFilesFromDirectory(entry as FileSystemDirectoryEntry);
                    files.push(...directoryFiles);
                } else if (entry?.isFile) {
                    const file = item.getAsFile();
                    if (file) files.push(file);
                }
            } else {
                const file = item.getAsFile();
                if (file) files.push(file);
            }
        }));

        return files;
    };

    const handleFileDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = await processEntries(e.dataTransfer.items);
        const processedFiles = await Promise.all(files.map(readFileContent));
        onFilesUploaded(processedFiles);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const processedFiles = await Promise.all(files.map(readFileContent));
        onFilesUploaded(processedFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div>
            <div
                className={`drop-zone ${isDragging ? 'dragging' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleFileDrop}
                onClick={!isProcessingPDF ? handleClick : undefined}
                style={{cursor: isProcessingPDF ? 'default' : 'pointer'}}
            >
                <input
                    type="file"
                    multiple
                    accept=".txt,.js,.ts,.jsx,.tsx,.py,.java,.cpp,.c,.h,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.clj,.html,.css,.scss,.sass,.less,.xml,.json,.yaml,.yml,.md,.sql,.sh,.bat,.ps1,.dockerfile,.gitignore,.env,.config,.ini,.toml,.lock,.pdf"
                    onChange={handleFileSelect}
                    className="file-input"
                    ref={fileInputRef}
                    disabled={isProcessingPDF}
                />
                <p>
                    拖放AI参考代码文件/文件夹到这里或点击此处选择
                    <br />
                    <small style={{ color: '#666', fontSize: '0.9em' }}>
                        支持代码文件和PDF文档（PDF将自动转换为Markdown）
                    </small>
                </p>
            </div>

            {/* PDF处理状态显示 */}
            {isProcessingPDF && (
                <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
                    <Typography variant="body2" color="primary" gutterBottom>
                        {processingStatus}
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={processingProgress}
                        sx={{ mb: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {processingProgress}% 完成
                    </Typography>
                </Box>
            )}
        </div>
    );
};

export default FileUpload;