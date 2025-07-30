/**
 * 历史记录相关类型定义
 */

import { FileInfo } from './types';

// 历史记录数据结构
export interface HistoryRecord {
    id: string;
    timestamp: number;
    title: string;
    description?: string;
    roleContent: string;
    ruleContent: string;
    taskContent: string;
    outputContent: string;
    files: FileInfo[];
    tags: string[];
    version: number; // 用于数据版本控制
}

// 文件过滤条件
export interface FileFilter {
    // 允许的文件扩展名（如 ['.ts', '.js', '.tsx']）
    allowedExtensions: string[];
    // 最大文件大小（字节）
    maxFileSize: number;
    // 排除的文件名模式（正则表达式字符串）
    excludePatterns: string[];
    // 包含的文件名模式（正则表达式字符串）
    includePatterns: string[];
    // 是否排除空文件
    excludeEmptyFiles: boolean;
    // 是否排除二进制文件
    excludeBinaryFiles: boolean;
}

// 历史记录搜索条件
export interface HistorySearchFilter {
    keyword?: string;
    tags?: string[];
    dateRange?: {
        start: number;
        end: number;
    };
    sortBy: 'timestamp' | 'title';
    sortOrder: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

// 历史记录统计信息
export interface HistoryStats {
    totalRecords: number;
    totalSize: number; // 总数据大小（字节）
    oldestRecord?: number; // 最早记录时间戳
    newestRecord?: number; // 最新记录时间戳
    mostUsedTags: Array<{ tag: string; count: number }>;
}

// 导出/导入数据格式
export interface HistoryExportData {
    version: string;
    exportTime: number;
    records: HistoryRecord[];
    metadata: {
        totalRecords: number;
        exportedBy: string;
    };
}

// 默认文件过滤配置
export const DEFAULT_FILE_FILTER: FileFilter = {
    allowedExtensions: [
        '.ts', '.tsx', '.js', '.jsx', '.vue', '.py', '.java', '.cpp', '.c', '.h',
        '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.clj',
        '.html', '.css', '.scss', '.sass', '.less', '.xml', '.json', '.yaml', '.yml',
        '.md', '.txt', '.sql', '.sh', '.bat', '.ps1', '.dockerfile', '.gitignore',
        '.env', '.config', '.ini', '.toml', '.lock'
    ],
    maxFileSize: 1024 * 1024, // 1MB
    excludePatterns: [
        'node_modules',
        '\\.git',
        'dist',
        'build',
        'coverage',
        '\\.DS_Store',
        'Thumbs\\.db',
        '\\.log$',
        '\\.tmp$',
        '\\.cache'
    ],
    includePatterns: [],
    excludeEmptyFiles: true,
    excludeBinaryFiles: true
};
