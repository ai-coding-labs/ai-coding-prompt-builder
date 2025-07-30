/**
 * PDF处理工具
 * 将PDF文件转换为Markdown格式
 */

import * as pdfjsLib from 'pdfjs-dist';
import { FileInfo } from '../types/types';

// 设置PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export interface PDFProcessingOptions {
    maxPages?: number; // 最大处理页数
    includeImages?: boolean; // 是否包含图片描述
    preserveFormatting?: boolean; // 是否保持格式
}

export interface PDFProcessingResult {
    success: boolean;
    content: string;
    metadata: {
        title?: string;
        author?: string;
        subject?: string;
        creator?: string;
        producer?: string;
        creationDate?: Date;
        modificationDate?: Date;
        pages: number;
        processedPages: number;
    };
    error?: string;
}

/**
 * 将PDF文件转换为Markdown
 */
export async function convertPDFToMarkdown(
    file: File,
    options: PDFProcessingOptions = {}
): Promise<PDFProcessingResult> {
    const {
        maxPages = 50,
        includeImages = false,
        preserveFormatting = true
    } = options;

    try {
        // 读取PDF文件
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        
        // 获取PDF元数据
        const metadata = await pdf.getMetadata();
        const info = metadata.info as any;
        
        const totalPages = pdf.numPages;
        const pagesToProcess = Math.min(totalPages, maxPages);
        
        let markdownContent = '';
        
        // 添加文档头部信息
        markdownContent += `# ${info.Title || file.name.replace('.pdf', '')}\n\n`;
        
        if (info.Author) {
            markdownContent += `**作者**: ${info.Author}\n\n`;
        }
        
        if (info.Subject) {
            markdownContent += `**主题**: ${info.Subject}\n\n`;
        }
        
        if (info.CreationDate) {
            markdownContent += `**创建时间**: ${new Date(info.CreationDate).toLocaleString()}\n\n`;
        }
        
        markdownContent += `**页数**: ${totalPages} 页${pagesToProcess < totalPages ? ` (已处理前 ${pagesToProcess} 页)` : ''}\n\n`;
        markdownContent += '---\n\n';
        
        // 处理每一页
        for (let pageNum = 1; pageNum <= pagesToProcess; pageNum++) {
            try {
                const page = await pdf.getPage(pageNum);
                const textContent = await page.getTextContent();
                
                // 添加页面标题
                if (pagesToProcess > 1) {
                    markdownContent += `## 第 ${pageNum} 页\n\n`;
                }
                
                // 提取文本内容
                const pageText = extractTextFromPage(textContent, preserveFormatting);
                
                if (pageText.trim()) {
                    markdownContent += pageText + '\n\n';
                } else {
                    markdownContent += '*[此页面无文本内容]*\n\n';
                }
                
                // 处理图片（如果启用）
                if (includeImages) {
                    const imageInfo = await extractImageInfo(page);
                    if (imageInfo.length > 0) {
                        markdownContent += '### 图片信息\n\n';
                        imageInfo.forEach((img, index) => {
                            markdownContent += `- 图片 ${index + 1}: ${img.width}x${img.height}px\n`;
                        });
                        markdownContent += '\n';
                    }
                }
                
            } catch (pageError) {
                console.error(`Error processing page ${pageNum}:`, pageError);
                markdownContent += `*[第 ${pageNum} 页处理失败]*\n\n`;
            }
        }
        
        // 添加处理信息
        if (pagesToProcess < totalPages) {
            markdownContent += '---\n\n';
            markdownContent += `*注意: 此PDF共有 ${totalPages} 页，为了性能考虑，只处理了前 ${pagesToProcess} 页。*\n`;
        }
        
        return {
            success: true,
            content: markdownContent,
            metadata: {
                title: info.Title,
                author: info.Author,
                subject: info.Subject,
                creator: info.Creator,
                producer: info.Producer,
                creationDate: info.CreationDate ? new Date(info.CreationDate) : undefined,
                modificationDate: info.ModDate ? new Date(info.ModDate) : undefined,
                pages: totalPages,
                processedPages: pagesToProcess
            }
        };
        
    } catch (error) {
        console.error('PDF processing error:', error);
        return {
            success: false,
            content: '',
            metadata: {
                pages: 0,
                processedPages: 0
            },
            error: error instanceof Error ? error.message : 'PDF处理失败'
        };
    }
}

/**
 * 从页面文本内容中提取文本
 */
function extractTextFromPage(textContent: any, preserveFormatting: boolean): string {
    const textItems = textContent.items;
    
    if (!preserveFormatting) {
        // 简单模式：直接连接所有文本
        return textItems.map((item: any) => item.str).join(' ').trim();
    }
    
    // 格式化模式：尝试保持原有的布局
    let result = '';
    let currentLine = '';
    let lastY = -1;
    let lastX = -1;
    
    for (const item of textItems) {
        const { str, transform } = item;
        const x = transform[4];
        const y = transform[5];
        
        // 检查是否是新行
        if (lastY !== -1 && Math.abs(y - lastY) > 5) {
            // 新行
            if (currentLine.trim()) {
                result += currentLine.trim() + '\n';
            }
            currentLine = str;
        } else {
            // 同一行，检查是否需要添加空格
            if (lastX !== -1 && x - lastX > 10) {
                currentLine += ' ';
            }
            currentLine += str;
        }
        
        lastX = x + (str.length * 6); // 估算文本宽度
        lastY = y;
    }
    
    // 添加最后一行
    if (currentLine.trim()) {
        result += currentLine.trim() + '\n';
    }
    
    // 清理和格式化文本
    return cleanupText(result);
}

/**
 * 清理和格式化文本
 */
function cleanupText(text: string): string {
    return text
        // 移除多余的空行
        .replace(/\n\s*\n\s*\n/g, '\n\n')
        // 移除行首尾空格
        .split('\n')
        .map(line => line.trim())
        .join('\n')
        // 移除开头和结尾的空行
        .trim();
}

/**
 * 提取页面中的图片信息
 */
async function extractImageInfo(page: any): Promise<Array<{ width: number; height: number }>> {
    try {
        const ops = await page.getOperatorList();
        const images: Array<{ width: number; height: number }> = [];
        
        for (let i = 0; i < ops.fnArray.length; i++) {
            if (ops.fnArray[i] === pdfjsLib.OPS.paintImageXObject) {
                // 这里可以提取图片信息，但需要更复杂的处理
                // 暂时返回占位符信息
                images.push({ width: 100, height: 100 });
            }
        }
        
        return images;
    } catch (error) {
        console.error('Error extracting image info:', error);
        return [];
    }
}

/**
 * 将PDF处理结果转换为FileInfo格式
 */
export function convertPDFResultToFileInfo(
    originalFile: File,
    result: PDFProcessingResult
): FileInfo {
    const fileName = originalFile.name.replace('.pdf', '.md');
    
    return {
        name: fileName,
        path: fileName,
        size: new Blob([result.content]).size,
        extension: 'md',
        content: result.content
    };
}

/**
 * 检查文件是否为PDF
 */
export function isPDFFile(file: File): boolean {
    return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}
