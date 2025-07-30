/**
 * 历史记录面板组件
 * 显示和管理构造历史记录
 */

import React, { useState, useEffect } from 'react';
import {
    Drawer,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    TextField,
    Chip,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Divider,
    Menu,
    MenuItem
} from '@mui/material';
import {
    History as HistoryIcon,
    Search as SearchIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    Download as DownloadIcon,
    MoreVert as MoreVertIcon,
    Close as CloseIcon,
    Restore as RestoreIcon
} from '@mui/icons-material';
import { HistoryRecord, HistorySearchFilter } from '../types/history';
import { historyDB } from '../utils/indexedDB';

interface HistoryPanelProps {
    open: boolean;
    onClose: () => void;
    onLoadRecord: (record: HistoryRecord) => void;
}

const HistoryPanel: React.FC<HistoryPanelProps> = ({
    open,
    onClose,
    onLoadRecord
}) => {
    const [records, setRecords] = useState<HistoryRecord[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editTags, setEditTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    // 加载历史记录
    const loadRecords = async () => {
        setLoading(true);
        try {
            const filter: HistorySearchFilter = {
                keyword: searchKeyword || undefined,
                sortBy: 'timestamp',
                sortOrder: 'desc',
                limit: 50
            };
            const data = await historyDB.searchRecords(filter);
            setRecords(data);
        } catch (error) {
            console.error('Failed to load history records:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            loadRecords();
        }
    }, [open, searchKeyword]);

    // 格式化时间
    const formatTime = (timestamp: number): string => {
        return new Date(timestamp).toLocaleString('zh-CN');
    };

    // 打开编辑对话框
    const openEditDialog = (record: HistoryRecord) => {
        setSelectedRecord(record);
        setEditTitle(record.title);
        setEditDescription(record.description || '');
        setEditTags([...record.tags]);
        setEditDialogOpen(true);
        setMenuAnchor(null);
    };

    // 保存编辑
    const saveEdit = async () => {
        if (!selectedRecord) return;

        try {
            const updatedRecord: HistoryRecord = {
                ...selectedRecord,
                title: editTitle,
                description: editDescription,
                tags: editTags
            };
            
            await historyDB.saveRecord(updatedRecord);
            await loadRecords();
            setEditDialogOpen(false);
        } catch (error) {
            console.error('Failed to update record:', error);
        }
    };

    // 删除记录
    const deleteRecord = async () => {
        if (!selectedRecord) return;

        try {
            await historyDB.deleteRecord(selectedRecord.id);
            await loadRecords();
            setDeleteDialogOpen(false);
        } catch (error) {
            console.error('Failed to delete record:', error);
        }
    };

    // 加载记录到编辑器
    const loadRecord = (record: HistoryRecord) => {
        onLoadRecord(record);
        onClose();
    };

    // 添加标签
    const addTag = () => {
        if (newTag.trim() && !editTags.includes(newTag.trim())) {
            setEditTags([...editTags, newTag.trim()]);
            setNewTag('');
        }
    };

    // 移除标签
    const removeTag = (tag: string) => {
        setEditTags(editTags.filter(t => t !== tag));
    };

    // 导出数据
    const exportData = async () => {
        try {
            const allRecords = await historyDB.exportAll();
            const dataStr = JSON.stringify(allRecords, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const url = URL.createObjectURL(dataBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `prompt-history-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export data:', error);
        }
    };

    return (
        <>
            <Drawer
                anchor="right"
                open={open}
                onClose={onClose}
                sx={{ '& .MuiDrawer-paper': { width: 400 } }}
            >
                <Box sx={{ p: 2 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                            <HistoryIcon />
                            <Typography variant="h6">构造历史</Typography>
                        </Box>
                        <IconButton onClick={onClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* 搜索框 */}
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="搜索历史记录..."
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        InputProps={{
                            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        }}
                        sx={{ mb: 2 }}
                    />

                    {/* 操作按钮 */}
                    <Box display="flex" gap={1} mb={2}>
                        <Button
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={exportData}
                        >
                            导出
                        </Button>
                    </Box>

                    <Divider sx={{ mb: 2 }} />

                    {/* 历史记录列表 */}
                    {loading ? (
                        <Typography color="text.secondary" textAlign="center">
                            加载中...
                        </Typography>
                    ) : records.length === 0 ? (
                        <Alert severity="info">
                            暂无历史记录
                        </Alert>
                    ) : (
                        <List dense>
                            {records.map((record) => (
                                <ListItem
                                    key={record.id}
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        mb: 1,
                                        cursor: 'pointer',
                                        '&:hover': {
                                            bgcolor: 'action.hover'
                                        }
                                    }}
                                    onClick={() => loadRecord(record)}
                                >
                                    <ListItemText
                                        primary={
                                            <Typography variant="subtitle2" noWrap>
                                                {record.title}
                                            </Typography>
                                        }
                                        secondary={
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">
                                                    {formatTime(record.timestamp)}
                                                </Typography>
                                                {record.tags.length > 0 && (
                                                    <Box mt={0.5}>
                                                        {record.tags.slice(0, 2).map((tag) => (
                                                            <Chip
                                                                key={tag}
                                                                label={tag}
                                                                size="small"
                                                                sx={{ mr: 0.5, height: 16, fontSize: '0.7rem' }}
                                                            />
                                                        ))}
                                                        {record.tags.length > 2 && (
                                                            <Typography variant="caption" color="text.secondary">
                                                                +{record.tags.length - 2}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                )}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedRecord(record);
                                                setMenuAnchor(e.currentTarget);
                                            }}
                                        >
                                            <MoreVertIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </Box>
            </Drawer>

            {/* 右键菜单 */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={() => setMenuAnchor(null)}
            >
                <MenuItem onClick={() => selectedRecord && loadRecord(selectedRecord)}>
                    <RestoreIcon sx={{ mr: 1 }} />
                    加载记录
                </MenuItem>
                <MenuItem onClick={() => selectedRecord && openEditDialog(selectedRecord)}>
                    <EditIcon sx={{ mr: 1 }} />
                    编辑信息
                </MenuItem>
                <MenuItem 
                    onClick={() => {
                        setDeleteDialogOpen(true);
                        setMenuAnchor(null);
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <DeleteIcon sx={{ mr: 1 }} />
                    删除记录
                </MenuItem>
            </Menu>

            {/* 编辑对话框 */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>编辑历史记录</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="标题"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="描述"
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        margin="normal"
                        multiline
                        rows={3}
                    />
                    
                    <Box mt={2}>
                        <Typography variant="subtitle2" gutterBottom>标签</Typography>
                        <Box display="flex" gap={1} mb={1}>
                            <TextField
                                size="small"
                                label="添加标签"
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                            />
                            <Button onClick={addTag} variant="outlined" size="small">
                                添加
                            </Button>
                        </Box>
                        <Box display="flex" flexWrap="wrap" gap={1}>
                            {editTags.map((tag) => (
                                <Chip
                                    key={tag}
                                    label={tag}
                                    onDelete={() => removeTag(tag)}
                                    size="small"
                                />
                            ))}
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>取消</Button>
                    <Button onClick={saveEdit} variant="contained">保存</Button>
                </DialogActions>
            </Dialog>

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <Typography>
                        确定要删除历史记录 "{selectedRecord?.title}" 吗？此操作不可撤销。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
                    <Button onClick={deleteRecord} color="error" variant="contained">
                        删除
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default HistoryPanel;
