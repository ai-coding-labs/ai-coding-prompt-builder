/**
 * Profile管理页面
 */

import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    Box,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    Avatar,
    Chip,
    TextField,
    InputAdornment,
    Fab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Alert,
    Menu,
    MenuItem,
    IconButton
} from '@mui/material';
import {
    Search as SearchIcon,
    Add as AddIcon,
    Delete as DeleteIcon,
    ContentCopy as CopyIcon,
    PlayArrow as LoadIcon,
    MoreVert as MoreVertIcon,
    Download as DownloadIcon,
    Upload as UploadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { Profile, DEFAULT_CATEGORIES } from '../types/profile';
import { profileManager } from '../utils/profileManager';

const ProfilesPage: React.FC = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [alert, setAlert] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null);
    const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = () => {
        const allProfiles = profileManager.getAllProfiles();
        setProfiles(allProfiles);
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

    const handleLoadProfile = (profile: Profile) => {
        // 设置为当前Profile并跳转到构建页面
        profileManager.setCurrentProfile(profile.id);
        navigate('/prompt');
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
        setDeleteDialogOpen(true);
        handleMenuClose();
    };

    const confirmDelete = () => {
        if (selectedProfile && !selectedProfile.isDefault) {
            profileManager.deleteProfile(selectedProfile.id);
            loadProfiles();
            showAlert('配置已删除', 'success');
        }
        setDeleteDialogOpen(false);
        setSelectedProfile(null);
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

    const getCategoryName = (category: string) => {
        const categoryInfo = DEFAULT_CATEGORIES.find(c => c.id === category);
        return categoryInfo ? categoryInfo.name : category;
    };

    const getCategoryColor = (category: string) => {
        const categoryInfo = DEFAULT_CATEGORIES.find(c => c.id === category);
        return categoryInfo ? categoryInfo.color : '#607D8B';
    };

    return (
        <Container maxWidth="lg">
            {alert && (
                <Alert severity={alert.severity} sx={{ mb: 2 }}>
                    {alert.message}
                </Alert>
            )}

            {/* 页面标题 */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'primary.main' }}>
                    我的Profile配置
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    管理您的提示词配置，针对不同场景使用专业的AI助手设置
                </Typography>
            </Box>

            {/* 搜索和过滤 */}
            <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                    size="small"
                    placeholder="搜索配置..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        )
                    }}
                    sx={{ minWidth: 250 }}
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
                    <option value="">全部分类</option>
                    {DEFAULT_CATEGORIES.map((category) => (
                        <option key={category.id} value={category.id}>
                            {category.name}
                        </option>
                    ))}
                </TextField>

                <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
                    <Button
                        startIcon={<DownloadIcon />}
                        onClick={handleExport}
                        size="small"
                        variant="outlined"
                    >
                        导出
                    </Button>
                    <Button
                        startIcon={<UploadIcon />}
                        component="label"
                        size="small"
                        variant="outlined"
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
            </Box>

            {/* Profile卡片网格 */}
            <Grid container spacing={3}>
                {filteredProfiles.map((profile) => (
                    <Grid item xs={12} sm={6} md={4} key={profile.id}>
                        <Card
                            sx={{
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'all 0.3s',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: 4
                                }
                            }}
                            onClick={() => handleLoadProfile(profile)}
                        >
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                                    <Avatar
                                        sx={{
                                            backgroundColor: profile.color || getCategoryColor(profile.category || 'custom'),
                                            width: 48,
                                            height: 48
                                        }}
                                    >
                                        {profile.icon || profile.name.charAt(0)}
                                    </Avatar>
                                    
                                    <IconButton
                                        size="small"
                                        onClick={(e) => handleMenuOpen(e, profile)}
                                    >
                                        <MoreVertIcon />
                                    </IconButton>
                                </Box>

                                <Typography variant="h6" gutterBottom noWrap>
                                    {profile.name}
                                    {profile.isDefault && (
                                        <Chip
                                            label="默认"
                                            size="small"
                                            sx={{ ml: 1, height: 20, fontSize: '0.7rem' }}
                                        />
                                    )}
                                </Typography>

                                {profile.description && (
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            mb: 2,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {profile.description}
                                    </Typography>
                                )}

                                <Box display="flex" alignItems="center" gap={1} mb={2}>
                                    <Chip
                                        label={getCategoryName(profile.category || 'custom')}
                                        size="small"
                                        sx={{
                                            backgroundColor: getCategoryColor(profile.category || 'custom'),
                                            color: 'white',
                                            fontSize: '0.7rem'
                                        }}
                                    />
                                </Box>

                                <Box display="flex" flexWrap="wrap" gap={0.5}>
                                    {profile.tags.slice(0, 3).map((tag) => (
                                        <Chip
                                            key={tag}
                                            label={tag}
                                            size="small"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.6rem' }}
                                        />
                                    ))}
                                    {profile.tags.length > 3 && (
                                        <Typography variant="caption" color="text.secondary">
                                            +{profile.tags.length - 3}
                                        </Typography>
                                    )}
                                </Box>
                            </CardContent>

                            <CardActions>
                                <Button
                                    size="small"
                                    startIcon={<LoadIcon />}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleLoadProfile(profile);
                                    }}
                                    fullWidth
                                    variant="contained"
                                >
                                    加载配置
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {filteredProfiles.length === 0 && (
                <Box textAlign="center" py={8}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                        没有找到匹配的配置
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        尝试调整搜索条件或创建新的配置
                    </Typography>
                </Box>
            )}

            {/* 添加按钮 */}
            <Fab
                color="primary"
                aria-label="add"
                sx={{ position: 'fixed', bottom: 24, right: 24 }}
                onClick={() => navigate('/prompt')}
            >
                <AddIcon />
            </Fab>

            {/* 右键菜单 */}
            <Menu
                anchorEl={menuAnchor}
                open={Boolean(menuAnchor)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => selectedProfile && handleLoadProfile(selectedProfile)}>
                    <LoadIcon sx={{ mr: 1 }} />
                    加载配置
                </MenuItem>
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

            {/* 删除确认对话框 */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle>确认删除</DialogTitle>
                <DialogContent>
                    <Typography>
                        确定要删除配置 "{selectedProfile?.name}" 吗？此操作不可撤销。
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>取消</Button>
                    <Button onClick={confirmDelete} color="error" variant="contained">
                        删除
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default ProfilesPage;
