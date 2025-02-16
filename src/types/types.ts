// types/types.ts
export interface FileInfo {
    name: string;
    path: string; // 添加 path 属性
    size: number;
    extension: string;
    content: string;
}