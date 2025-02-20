/**
 * 提示词构造工具函数
 * 包含提示词拼接和Token计算相关逻辑
 */

import { FileInfo } from "../types/types.ts";

// 生成完整提示词内容（优化核心算法）
export const generatePrompt = (
    roleContent: string,
    ruleContent: string,
    taskContent: string,
    outputContent: string,
    files: FileInfo[]
): string => {
    const contentSections = [
        `# 角色\n${roleContent.trim()}`,
        `# 规则\n${ruleContent.trim()}`,
        `# 任务\n${taskContent.trim()}`,
        `# 输出格式\n${outputContent.trim()}`
    ].filter(section => section.split('\n')[1]?.trim().length > 0);

    const fileSections = files
        .filter(file => file.content.trim().length > 0)
        .map(file => `\`\`\`${file.path}\n${file.content.trim()}\n\`\`\``);

    return [...contentSections, ...fileSections]
        .filter(section => section.length > 0)
        .join('\n\n');
};

// 增强型Token计算（保持向后兼容）
export const calculateTokenCount = (
    roleContent: string,
    ruleContent: string,
    taskContent: string,
    outputContent: string,
    files: FileInfo[]
): number => {
    const mergedContent = [
        roleContent.trim(),
        ruleContent.trim(),
        taskContent.trim(),
        outputContent.trim(),
        ...files.map(f => f.content.trim())
    ].join('\n\n');

    return Math.ceil(mergedContent.replace(/[\r\n]/g, '').length / 3.5);
};

// 优化显示格式化（支持国际化扩展）
export const formatTokenCount = (count: number): string => {
    const formatWithUnit = (value: number, unit: string) =>
        `${value.toFixed(1).replace(/\.0+$/, '')}${unit}`;

    return count >= 10000 ? formatWithUnit(count / 10000, '万') :
        count >= 1000  ? formatWithUnit(count / 1000, 'k') :
            count.toString();
};

// 新增质量验证函数
export const validatePromptStructure = (prompt: string): boolean => {
    const requiredSections = ['# 角色', '# 规则', '# 任务'];
    return requiredSections.every(section => prompt.includes(section));
};