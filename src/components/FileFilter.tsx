/**
 * 文件过滤组件
 * 用于设置文件上传的过滤条件
 */

import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControlLabel,
    Switch,
    Chip,
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    InputAdornment,
    Alert
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import { FileFilter, DEFAULT_FILE_FILTER } from '../types/history';

interface FileFilterProps {
    open: boolean;
    onClose: () => void;
    filter: FileFilter;
    onFilterChange: (filter: FileFilter) => void;
}

const FileFilterComponent: React.FC<FileFilterProps> = ({
    open,
    onClose,
    filter,
    onFilterChange
}) => {
    const [localFilter, setLocalFilter] = useState<FileFilter>(filter);
    const [newExtension, setNewExtension] = useState('');
    const [newExcludePattern, setNewExcludePattern] = useState('');
    const [newIncludePattern, setNewIncludePattern] = useState('');

    const handleSave = () => {
        onFilterChange(localFilter);
        onClose();
    };

    const handleReset = () => {
        setLocalFilter(DEFAULT_FILE_FILTER);
    };

    const addExtension = () => {
        if (newExtension.trim()) {
            const ext = newExtension.startsWith('.') ? newExtension : `.${newExtension}`;
            if (!localFilter.allowedExtensions.includes(ext)) {
                setLocalFilter({
                    ...localFilter,
                    allowedExtensions: [...localFilter.allowedExtensions, ext]
                });
            }
            setNewExtension('');
        }
    };

    const removeExtension = (ext: string) => {
        setLocalFilter({
            ...localFilter,
            allowedExtensions: localFilter.allowedExtensions.filter(e => e !== ext)
        });
    };

    const addExcludePattern = () => {
        if (newExcludePattern.trim() && !localFilter.excludePatterns.includes(newExcludePattern)) {
            setLocalFilter({
                ...localFilter,
                excludePatterns: [...localFilter.excludePatterns, newExcludePattern]
            });
            setNewExcludePattern('');
        }
    };

    const removeExcludePattern = (pattern: string) => {
        setLocalFilter({
            ...localFilter,
            excludePatterns: localFilter.excludePatterns.filter(p => p !== pattern)
        });
    };

    const addIncludePattern = () => {
        if (newIncludePattern.trim() && !localFilter.includePatterns.includes(newIncludePattern)) {
            setLocalFilter({
                ...localFilter,
                includePatterns: [...localFilter.includePatterns, newIncludePattern]
            });
            setNewIncludePattern('');
        }
    };

    const removeIncludePattern = (pattern: string) => {
        setLocalFilter({
            ...localFilter,
            includePatterns: localFilter.includePatterns.filter(p => p !== pattern)
        });
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <FilterListIcon />
                    文件过滤设置
                </Box>
            </DialogTitle>
            
            <DialogContent dividers>
                <Alert severity="info" sx={{ mb: 2 }}>
                    设置文件上传的过滤条件，帮助您只上传需要的文件类型。
                </Alert>

                {/* 基本设置 */}
                <Accordion defaultExpanded>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">基本设置</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                label="最大文件大小"
                                type="number"
                                value={localFilter.maxFileSize}
                                onChange={(e) => setLocalFilter({
                                    ...localFilter,
                                    maxFileSize: parseInt(e.target.value) || 0
                                })}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            字节 ({formatFileSize(localFilter.maxFileSize)})
                                        </InputAdornment>
                                    )
                                }}
                                helperText="设置单个文件的最大大小限制"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={localFilter.excludeEmptyFiles}
                                        onChange={(e) => setLocalFilter({
                                            ...localFilter,
                                            excludeEmptyFiles: e.target.checked
                                        })}
                                    />
                                }
                                label="排除空文件"
                            />
                            
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={localFilter.excludeBinaryFiles}
                                        onChange={(e) => setLocalFilter({
                                            ...localFilter,
                                            excludeBinaryFiles: e.target.checked
                                        })}
                                    />
                                }
                                label="排除二进制文件"
                            />
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* 文件扩展名 */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">允许的文件扩展名</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" gap={1}>
                                <TextField
                                    size="small"
                                    label="添加扩展名"
                                    value={newExtension}
                                    onChange={(e) => setNewExtension(e.target.value)}
                                    placeholder="例如: .ts, .js, .py"
                                    onKeyPress={(e) => e.key === 'Enter' && addExtension()}
                                />
                                <Button onClick={addExtension} variant="outlined">
                                    添加
                                </Button>
                            </Box>
                            
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {localFilter.allowedExtensions.map((ext) => (
                                    <Chip
                                        key={ext}
                                        label={ext}
                                        onDelete={() => removeExtension(ext)}
                                        size="small"
                                    />
                                ))}
                            </Box>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* 排除模式 */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">排除模式</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" gap={1}>
                                <TextField
                                    size="small"
                                    label="添加排除模式"
                                    value={newExcludePattern}
                                    onChange={(e) => setNewExcludePattern(e.target.value)}
                                    placeholder="例如: node_modules, \.git, \.log$"
                                    onKeyPress={(e) => e.key === 'Enter' && addExcludePattern()}
                                />
                                <Button onClick={addExcludePattern} variant="outlined">
                                    添加
                                </Button>
                            </Box>
                            
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {localFilter.excludePatterns.map((pattern) => (
                                    <Chip
                                        key={pattern}
                                        label={pattern}
                                        onDelete={() => removeExcludePattern(pattern)}
                                        size="small"
                                        color="secondary"
                                    />
                                ))}
                            </Box>
                            
                            <Typography variant="caption" color="textSecondary">
                                支持正则表达式。用于排除不需要的文件或目录。
                            </Typography>
                        </Box>
                    </AccordionDetails>
                </Accordion>

                {/* 包含模式 */}
                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h6">包含模式（可选）</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <Box display="flex" gap={1}>
                                <TextField
                                    size="small"
                                    label="添加包含模式"
                                    value={newIncludePattern}
                                    onChange={(e) => setNewIncludePattern(e.target.value)}
                                    placeholder="例如: src/, components/"
                                    onKeyPress={(e) => e.key === 'Enter' && addIncludePattern()}
                                />
                                <Button onClick={addIncludePattern} variant="outlined">
                                    添加
                                </Button>
                            </Box>
                            
                            <Box display="flex" flexWrap="wrap" gap={1}>
                                {localFilter.includePatterns.map((pattern) => (
                                    <Chip
                                        key={pattern}
                                        label={pattern}
                                        onDelete={() => removeIncludePattern(pattern)}
                                        size="small"
                                        color="primary"
                                    />
                                ))}
                            </Box>
                            
                            <Typography variant="caption" color="textSecondary">
                                如果设置了包含模式，只有匹配的文件才会被包含。留空表示包含所有文件。
                            </Typography>
                        </Box>
                    </AccordionDetails>
                </Accordion>
            </DialogContent>
            
            <DialogActions>
                <Button onClick={handleReset} color="secondary">
                    重置为默认
                </Button>
                <Button onClick={onClose}>
                    取消
                </Button>
                <Button onClick={handleSave} variant="contained">
                    保存设置
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default FileFilterComponent;
