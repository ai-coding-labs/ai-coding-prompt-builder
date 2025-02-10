// FileUpload.tsx
import React, {useState} from 'react';
import {FileInfo} from "../types/types.ts";

interface FileUploadProps {
    onFilesUploaded: (files: FileInfo[]) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({onFilesUploaded}) => {
    const [isDragging, setIsDragging] = useState(false);

    const readFileContent = async (file: File): Promise<FileInfo> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                resolve({
                    name: file.name,
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
        >
            <input
                type="file"
                multiple
                onChange={handleFileSelect}
                className="file-input"
            />
            <p>拖放文件到这里或点击选择文件</p>
        </div>
    );
};

export default FileUpload;