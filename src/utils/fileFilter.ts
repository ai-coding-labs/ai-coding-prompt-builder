/**
 * 文件过滤工具函数
 * 根据过滤条件筛选文件
 */

import { FileInfo } from '../types/types';
import { FileFilter } from '../types/history';

// 检查文件是否为二进制文件
export const isBinaryFile = (content: string): boolean => {
    // 检查是否包含null字符或大量非打印字符
    const nullCharCount = (content.match(/\0/g) || []).length;
    if (nullCharCount > 0) return true;

    // 检查非打印字符的比例
    const nonPrintableCount = (content.match(/[\x00-\x08\x0E-\x1F\x7F-\xFF]/g) || []).length;
    const ratio = nonPrintableCount / content.length;
    
    return ratio > 0.3; // 如果超过30%是非打印字符，认为是二进制文件
};

// 检查文件扩展名是否被允许
export const isAllowedExtension = (fileName: string, allowedExtensions: string[]): boolean => {
    if (allowedExtensions.length === 0) return true;
    
    const extension = '.' + fileName.split('.').pop()?.toLowerCase();
    return allowedExtensions.some(ext => ext.toLowerCase() === extension);
};

// 检查文件路径是否匹配排除模式
export const matchesExcludePattern = (filePath: string, excludePatterns: string[]): boolean => {
    return excludePatterns.some(pattern => {
        try {
            const regex = new RegExp(pattern, 'i');
            return regex.test(filePath);
        } catch (error) {
            // 如果正则表达式无效，使用简单的字符串匹配
            return filePath.toLowerCase().includes(pattern.toLowerCase());
        }
    });
};

// 检查文件路径是否匹配包含模式
export const matchesIncludePattern = (filePath: string, includePatterns: string[]): boolean => {
    if (includePatterns.length === 0) return true;
    
    return includePatterns.some(pattern => {
        try {
            const regex = new RegExp(pattern, 'i');
            return regex.test(filePath);
        } catch (error) {
            // 如果正则表达式无效，使用简单的字符串匹配
            return filePath.toLowerCase().includes(pattern.toLowerCase());
        }
    });
};

// 应用文件过滤器
export const applyFileFilter = (files: FileInfo[], filter: FileFilter): FileInfo[] => {
    return files.filter(file => {
        // 检查文件大小
        if (file.size > filter.maxFileSize) {
            return false;
        }

        // 检查是否排除空文件
        if (filter.excludeEmptyFiles && file.content.trim().length === 0) {
            return false;
        }

        // 检查是否排除二进制文件
        if (filter.excludeBinaryFiles && isBinaryFile(file.content)) {
            return false;
        }

        // 检查文件扩展名
        if (!isAllowedExtension(file.name, filter.allowedExtensions)) {
            return false;
        }

        // 检查排除模式
        if (matchesExcludePattern(file.path, filter.excludePatterns)) {
            return false;
        }

        // 检查包含模式
        if (!matchesIncludePattern(file.path, filter.includePatterns)) {
            return false;
        }

        return true;
    });
};

// 获取过滤统计信息
export const getFilterStats = (originalFiles: FileInfo[], filteredFiles: FileInfo[]) => {
    const originalCount = originalFiles.length;
    const filteredCount = filteredFiles.length;
    const excludedCount = originalCount - filteredCount;
    
    const originalSize = originalFiles.reduce((sum, file) => sum + file.size, 0);
    const filteredSize = filteredFiles.reduce((sum, file) => sum + file.size, 0);
    const excludedSize = originalSize - filteredSize;

    return {
        originalCount,
        filteredCount,
        excludedCount,
        originalSize,
        filteredSize,
        excludedSize,
        exclusionRate: originalCount > 0 ? (excludedCount / originalCount) * 100 : 0
    };
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// 获取文件类型统计
export const getFileTypeStats = (files: FileInfo[]) => {
    const stats = new Map<string, { count: number; size: number }>();
    
    files.forEach(file => {
        const extension = file.extension || 'unknown';
        const current = stats.get(extension) || { count: 0, size: 0 };
        stats.set(extension, {
            count: current.count + 1,
            size: current.size + file.size
        });
    });

    return Array.from(stats.entries())
        .map(([extension, data]) => ({
            extension,
            count: data.count,
            size: data.size,
            formattedSize: formatFileSize(data.size)
        }))
        .sort((a, b) => b.count - a.count);
};
