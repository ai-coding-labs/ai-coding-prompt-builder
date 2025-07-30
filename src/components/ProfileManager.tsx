/**
 * Profile管理对话框组件
 */

import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    Typography,
    Box,
    TextField,
    Chip,
    Avatar,
    Menu,
    MenuItem,
    Alert,
    Tabs,
    Tab
} from '@mui/material';
import {
    Edit as EditIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    MoreVert as MoreVertIcon,
    Add as AddIcon,
    Download as DownloadIcon,
    Upload as UploadIcon,
    Close as CloseIcon
} from '@mui/icons-material';
import { Profile, DEFAULT_CATEGORIES } from '../types/profile';
import { profileManager } from '../utils/profileManager';

interface ProfileManagerProps {
    open: boolean;
    onClose: () => void;
    onProfileChange?: (profile: Profile) => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`profile-tabpanel-${index}`}
            aria-labelledby={`profile-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
        </div>
    );
}

const ProfileManager: React.FC<ProfileManagerProps> = ({
    open,
    onClose,
    onProfileChange
}) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [tabValue, setTabValue] = useState(0);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);

    useEffect(() => {
        if (open) {
            loadProfiles();
        }
    }, [open]);

    const loadProfiles = () => {
        const allProfiles = profileManager.getAllProfiles();
        setProfiles(allProfiles);
    };

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, profile: Profile) => {
        event.stopPropagation();
        setSelectedProfile(profile);
        setMenuAnchor(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchor(null);
        setSelectedProfile(null);
    };

    const handleDuplicate = () => {
        if (selectedProfile) {
            const duplicated = profileManager.duplicateProfile(selectedProfile.id);
            if (duplicated) {
                loadProfiles();
                showAlert('配置已复制', 'success');
            }
        }
        handleMenuClose();
    };

    const handleDelete = () => {
        if (selectedProfile && !selectedProfile.isDefault) {
            if (window.confirm(`确定要删除配置 "${selectedProfile.name}" 吗？`)) {
                profileManager.deleteProfile(selectedProfile.id);
                loadProfiles();
                showAlert('配置已删除', 'success');
            }
        }
        handleMenuClose();
    };

    const handleExport = () => {
        try {
            const exportData = profileManager.exportProfiles();
            const blob = new Blob([exportData], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `profiles-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            URL.revokeObjectURL(url);
            showAlert('配置已导出', 'success');
        } catch (error) {
            showAlert('导出失败', 'error');
        }
    };

    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const content = e.target?.result as string;
                    const result = profileManager.importProfiles(content);
                    loadProfiles();
                    
                    if (result.success > 0) {
                        showAlert(`成功导入 ${result.success} 个配置`, 'success');
                    }
                    if (result.errors.length > 0) {
                        console.error('Import errors:', result.errors);
                        showAlert(`导入时出现 ${result.errors.length} 个错误`, 'error');
                    }
                } catch (error) {
                    showAlert('导入失败：文件格式错误', 'error');
                }
            };
            reader.readAsText(file);
        }
        // 重置input
        event.target.value = '';
    };

    const showAlert = (message: string, severity: 'success' | 'error' | 'info') => {
        setAlert({ message, severity });
        setTimeout(() => setAlert(null), 3000);
    };

    // 过滤Profile
    const filteredProfiles = profiles.filter(profile => {
        const matchesKeyword = !searchKeyword || 
            profile.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            (profile.description && profile.description.toLowerCase().includes(searchKeyword.toLowerCase()));
        
        const matchesCategory = !selectedCategory || profile.category === selectedCategory;
        
        return matchesKeyword && matchesCategory;
    });

    // 按分类分组
    const groupedProfiles = filteredProfiles.reduce((groups, profile) => {
        const category = profile.category || 'custom';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(profile);
        return groups;
    }, {} as Record<string, Profile[]>);

    const getCategoryName = (category: string) => {
        const categoryInfo = DEFAULT_CATEGORIES.find(c => c.id === category);
        return categoryInfo ? categoryInfo.name : category;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{ sx: { height: '80vh' } }}
        >
            <DialogTitle>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography variant="h6">配置管理</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>

            <DialogContent dividers>
                {alert && (
                    <Alert severity={alert.severity} sx={{ mb: 2 }}>
                        {alert.message}
                    </Alert>
                )}

                <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 2 }}>
                    <Tab label="配置列表" />
                    <Tab label="统计信息" />
                </Tabs>

                <TabPanel value={tabValue} index={0}>
                    {/* 搜索和过滤 */}
                    <Box display="flex" gap={2} mb={2}>
                        <TextField
                            size="small"
                            placeholder="搜索配置..."
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            sx={{ flex: 1 }}
                        />
                        <TextField
                            select
                            size="small"
                            label="分类"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            sx={{ minWidth: 120 }}
                            SelectProps={{ native: true }}
                        >
                            <option value="">全部</option>
                            {DEFAULT_CATEGORIES.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </TextField>
                    </Box>

                    {/* 操作按钮 */}
                    <Box display="flex" gap={1} mb={2}>
                        <Button
                            startIcon={<DownloadIcon />}
                            onClick={handleExport}
                            size="small"
                        >
                            导出
                        </Button>
                        <Button
                            startIcon={<UploadIcon />}
                            component="label"
                            size="small"
                        >
                            导入
                            <input
                                type="file"
                                accept=".json"
                                hidden
                                onChange={handleImport}
                            />
                        </Button>
                    </Box>

                    {/* Profile列表 */}
                    <List>
                        {Object.entries(groupedProfiles).map(([category, categoryProfiles]) => (
                            <Box key={category}>
                                <Typography
                                    variant="subtitle2"
                                    color="primary"
                                    sx={{ px: 2, py: 1, fontWeight: 600 }}
                                >
                                    {getCategoryName(category)}
                                </Typography>
                                
                                {categoryProfiles.map((profile) => (
                                    <ListItem
                                        key={profile.id}
                                        sx={{
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            borderRadius: 1,
                                            mb: 1,
                                            '&:hover': { backgroundColor: 'action.hover' }
                                        }}
                                    >
                                        <Avatar
                                            sx={{
                                                mr: 2,
                                                backgroundColor: profile.color || 'primary.main'
                                            }}
                                        >
                                            {profile.icon || profile.name.charAt(0)}
                                        </Avatar>
                                        
                                        <ListItemText
                                            primary={
                                                <Box display="flex" alignItems="center" gap={1}>
                                                    <Typography variant="subtitle1">
                                                        {profile.name}
                                                    </Typography>
                                                    {profile.isDefault && (
                                                        <Chip label="默认" size="small" />
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Box>
                                                    {profile.description && (
                                                        <Typography variant="body2" color="text.secondary">
                                                            {profile.description}
                                                        </Typography>
                                                    )}
                                                    <Box display="flex" gap={0.5} mt={0.5} flexWrap="wrap">
                                                        {profile.tags.map((tag) => (
                                                            <Chip
                                                                key={tag}
                                                                label={tag}
                                                                size="small"
                                                                sx={{ height: 20, fontSize: '0.7rem' }}
                                                            />
                                                        ))}
                                                    </Box>
                                                </Box>
                                            }
                                        />
                                        
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                onClick={(e) => handleMenuOpen(e, profile)}
                                                size="small"
                                            >
                                                <MoreVertIcon />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                            </Box>
                        ))}
                    </List>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>
                        配置统计
                    </Typography>
                    <Typography variant="body1">
                        总配置数: {profiles.length}
                    </Typography>
                    {/* 这里可以添加更多统计信息 */}
                </TabPanel>
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>关闭</Button>
            </DialogActions>

            {/* 右键菜单 */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={handleDuplicate}>
                    <CopyIcon sx={{ mr: 1 }} />
                    复制配置
                </MenuItem>
                {selectedProfile && !selectedProfile.isDefault && (
                    <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
                        <DeleteIcon sx={{ mr: 1 }} />
                        删除配置
                    </MenuItem>
                )}
            </Menu>
        </Dialog>
    );
};

export default ProfileManager;
