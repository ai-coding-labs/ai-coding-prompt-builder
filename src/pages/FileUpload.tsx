// FileUpload.tsx
import React, {useState, useRef} from 'react';
import {FileInfo} from "../types/types.ts";

interface FileUploadProps {
    onFilesUploaded: (files: FileInfo[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({onFilesUploaded}) => {
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const readFileContent = async (file: File): Promise<FileInfo> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
                    path: (file as any).path || file.name, // 获取完整路径
                    size: file.size,
                    extension: file.name.split('.').pop() || '',
                    content: e.target?.result as string
                });
            };
            reader.readAsText(file);
        });
    };

    const handleFileDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const files = Array.from(e.dataTransfer.files);
        const processedFiles = await Promise.all(files.map(readFileContent));
        onFilesUploaded(processedFiles);
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const processedFiles = await Promise.all(files.map(readFileContent));
        onFilesUploaded(processedFiles);
        // 清空input值以允许重复选择相同文件
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
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
                onChange={handleFileSelect}
                className="file-input"
                ref={fileInputRef}
            />
            <p>拖放AI参考代码文件到这里或点击此处选择文件（参考上下文越完整，AI推理结果越好）</p>
        </div>
    );
};

export default FileUpload;