// FileUpload.tsx
import React, {useState, useRef} from 'react';
import {FileInfo} from "../types/types.ts";

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const readFileContent = async (file: File): Promise<FileInfo> => {
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
        <div
            className={`drop-zone ${isDragging ? 'dragging' : ''}`}
            onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleFileDrop}
            onClick={handleClick}
            style={{cursor: 'pointer'}}
        >
            <input
                type="file"
                multiple
                // webkitdirectory=""
                onChange={handleFileSelect}
                className="file-input"
                ref={fileInputRef}
            />
            <p>拖放AI参考代码文件/文件夹到这里或点击此处选择（参考上下文越完整，AI推理结果越好）</p>
        </div>
    );
};

export default FileUpload;