/**
 * Profile选择器组件
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Menu,
    MenuItem,
    Typography,
    Avatar,
    Divider,
    ListItemIcon,
    ListItemText,
    Chip
} from '@mui/material';
import {
    ExpandMore as ExpandMoreIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import { Profile } from '../types/profile';
import { profileManager } from '../utils/profileManager';

interface ProfileSelectorProps {
    currentProfile: Profile | null;
    onProfileChange: (profile: Profile) => void;
    onManageProfiles: () => void;
}

const ProfileSelector: React.FC<ProfileSelectorProps> = ({
    currentProfile,
    onProfileChange,
    onManageProfiles
}) => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const open = Boolean(anchorEl);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = () => {
        const allProfiles = profileManager.getAllProfiles();
        setProfiles(allProfiles);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleProfileSelect = (profile: Profile) => {
        onProfileChange(profile);
        profileManager.setCurrentProfile(profile.id);
        handleClose();
    };

    const handleManageProfiles = () => {
        onManageProfiles();
        handleClose();
    };

    // 按分类分组Profile
    const groupedProfiles = profiles.reduce((groups, profile) => {
        const category = profile.category || 'custom';
        if (!groups[category]) {
            groups[category] = [];
        }
        groups[category].push(profile);
        return groups;
    }, {} as Record<string, Profile[]>);

    const getCategoryName = (category: string) => {
        const categoryMap: Record<string, string> = {
            development: '开发编程',
            review: '代码审查',
            debug: '调试修复',
            architecture: '架构设计',
            custom: '自定义'
        };
        return categoryMap[category] || category;
    };

    return (
        <Box>
            <Button
                onClick={handleClick}
                endIcon={<ExpandMoreIcon />}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    backgroundColor: 'background.paper',
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    }
                }}
            >
                {currentProfile ? (
                    <>
                        <Avatar
                            sx={{
                                width: 24,
                                height: 24,
                                fontSize: '0.8rem',
                                backgroundColor: currentProfile.color || 'primary.main'
                            }}
                        >
                            {currentProfile.icon || currentProfile.name.charAt(0)}
                        </Avatar>
                        <Box sx={{ textAlign: 'left', minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }} noWrap>
                                {currentProfile.name}
                            </Typography>
                            {currentProfile.description && (
                                <Typography variant="caption" color="text.secondary" noWrap>
                                    {currentProfile.description}
                                </Typography>
                            )}
                        </Box>
                    </>
                ) : (
                    <Typography variant="body2">选择配置</Typography>
                )}
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                PaperProps={{
                    sx: {
                        width: 320,
                        maxHeight: 400,
                        overflow: 'auto'
                    }
                }}
                transformOrigin={{ horizontal: 'left', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
            >
                {Object.entries(groupedProfiles).map(([category, categoryProfiles]) => (
                    <Box key={category}>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 2,
                                py: 1,
                                display: 'block',
                                color: 'text.secondary',
                                fontWeight: 600,
                                textTransform: 'uppercase'
                            }}
                        >
                            {getCategoryName(category)}
                        </Typography>
                        
                        {categoryProfiles.map((profile) => (
                            <MenuItem
                                key={profile.id}
                                onClick={() => handleProfileSelect(profile)}
                                selected={currentProfile?.id === profile.id}
                                sx={{ px: 2, py: 1 }}
                            >
                                <ListItemIcon sx={{ minWidth: 36 }}>
                                    <Avatar
                                        sx={{
                                            width: 28,
                                            height: 28,
                                            fontSize: '0.8rem',
                                            backgroundColor: profile.color || 'primary.main'
                                        }}
                                    >
                                        {profile.icon || profile.name.charAt(0)}
                                    </Avatar>
                                </ListItemIcon>
                                
                                <ListItemText
                                    primary={
                                        <Box display="flex" alignItems="center" gap={1}>
                                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                                                {profile.name}
                                            </Typography>
                                            {profile.isDefault && (
                                                <Chip
                                                    label="默认"
                                                    size="small"
                                                    sx={{ height: 16, fontSize: '0.6rem' }}
                                                />
                                            )}
                                        </Box>
                                    }
                                    secondary={
                                        <Box>
                                            {profile.description && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{ display: 'block', mb: 0.5 }}
                                                >
                                                    {profile.description}
                                                </Typography>
                                            )}
                                            {profile.tags.length > 0 && (
                                                <Box display="flex" gap={0.5} flexWrap="wrap">
                                                    {profile.tags.slice(0, 3).map((tag) => (
                                                        <Chip
                                                            key={tag}
                                                            label={tag}
                                                            size="small"
                                                            sx={{
                                                                height: 16,
                                                                fontSize: '0.6rem',
                                                                backgroundColor: 'action.hover'
                                                            }}
                                                        />
                                                    ))}
                                                    {profile.tags.length > 3 && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            +{profile.tags.length - 3}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            )}
                                        </Box>
                                    }
                                />
                            </MenuItem>
                        ))}
                        
                        <Divider sx={{ my: 1 }} />
                    </Box>
                ))}

                <MenuItem onClick={handleManageProfiles} sx={{ px: 2, py: 1.5 }}>
                    <ListItemIcon>
                        <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText primary="管理配置" />
                </MenuItem>
            </Menu>
        </Box>
    );
};

export default ProfileSelector;
