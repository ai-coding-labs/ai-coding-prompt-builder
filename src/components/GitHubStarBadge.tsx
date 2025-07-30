/**
 * GitHub Star徽标组件
 * 显示仓库的star数量，支持缓存和点击跳转
 */

import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Typography,
    Tooltip,
    CircularProgress
} from '@mui/material';
import {
    Star as StarIcon,
    GitHub as GitHubIcon
} from '@mui/icons-material';

interface GitHubStarBadgeProps {
    owner: string;
    repo: string;
    className?: string;
}

interface GitHubRepoData {
    stargazers_count: number;
    html_url: string;
    full_name: string;
}

interface CachedData {
    data: GitHubRepoData;
    timestamp: number;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30分钟缓存
const CACHE_KEY_PREFIX = 'github_star_cache_';

const GitHubStarBadge: React.FC<GitHubStarBadgeProps> = ({
    owner,
    repo,
    className
}) => {
    const [starCount, setStarCount] = useState<number | null>(null);
    const [repoUrl, setRepoUrl] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const cacheKey = `${CACHE_KEY_PREFIX}${owner}_${repo}`;

    // 从缓存获取数据
    const getCachedData = (): GitHubRepoData | null => {
        try {
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsedCache: CachedData = JSON.parse(cached);
                const now = Date.now();
                
                // 检查缓存是否过期
                if (now - parsedCache.timestamp < CACHE_DURATION) {
                    return parsedCache.data;
                } else {
                    // 清除过期缓存
                    localStorage.removeItem(cacheKey);
                }
            }
        } catch (error) {
            console.error('Error reading cache:', error);
            localStorage.removeItem(cacheKey);
        }
        return null;
    };

    // 保存数据到缓存
    const setCachedData = (data: GitHubRepoData) => {
        try {
            const cacheData: CachedData = {
                data,
                timestamp: Date.now()
            };
            localStorage.setItem(cacheKey, JSON.stringify(cacheData));
        } catch (error) {
            console.error('Error saving cache:', error);
        }
    };

    // 获取GitHub仓库信息
    const fetchRepoData = async (): Promise<GitHubRepoData> => {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
        
        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }
        
        return response.json();
    };

    // 格式化star数量
    const formatStarCount = (count: number): string => {
        if (count >= 1000) {
            return `${(count / 1000).toFixed(1)}k`;
        }
        return count.toString();
    };

    // 加载数据
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            setError(null);

            try {
                // 首先尝试从缓存获取
                const cachedData = getCachedData();
                if (cachedData) {
                    setStarCount(cachedData.stargazers_count);
                    setRepoUrl(cachedData.html_url);
                    setLoading(false);
                    return;
                }

                // 缓存未命中，从API获取
                const repoData = await fetchRepoData();
                setStarCount(repoData.stargazers_count);
                setRepoUrl(repoData.html_url);
                
                // 保存到缓存
                setCachedData(repoData);
                
            } catch (err) {
                console.error('Error fetching GitHub data:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch data');
                
                // 如果API失败，尝试使用过期的缓存数据
                const cachedData = getCachedData();
                if (cachedData) {
                    setStarCount(cachedData.stargazers_count);
                    setRepoUrl(cachedData.html_url);
                    setError(null);
                }
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [owner, repo]);

    // 点击处理
    const handleClick = () => {
        if (repoUrl) {
            window.open(repoUrl, '_blank', 'noopener,noreferrer');
        }
    };

    // 加载状态
    if (loading) {
        return (
            <Box
                className={className}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider'
                }}
            >
                <GitHubIcon sx={{ fontSize: 20 }} />
                <CircularProgress size={16} />
            </Box>
        );
    }

    // 错误状态
    if (error && starCount === null) {
        return (
            <Tooltip title={`Error: ${error}`}>
                <Box
                    className={className}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 2,
                        py: 1,
                        borderRadius: 2,
                        bgcolor: 'error.light',
                        color: 'error.contrastText',
                        cursor: 'pointer'
                    }}
                    onClick={handleClick}
                >
                    <GitHubIcon sx={{ fontSize: 20 }} />
                    <Typography variant="caption">Error</Typography>
                </Box>
            </Tooltip>
        );
    }

    // 正常显示
    return (
        <Tooltip title={`Star this project on GitHub (${starCount} stars)`}>
            <Button
                className={className}
                onClick={handleClick}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    px: 2,
                    py: 1,
                    borderRadius: 2,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'divider',
                    color: 'text.primary',
                    textTransform: 'none',
                    minWidth: 'auto',
                    '&:hover': {
                        bgcolor: 'action.hover',
                        borderColor: 'primary.main',
                        transform: 'translateY(-1px)',
                        boxShadow: 2
                    },
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <GitHubIcon sx={{ fontSize: 20 }} />
                <StarIcon sx={{ fontSize: 16, color: '#ffd700' }} />
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {starCount !== null ? formatStarCount(starCount) : '0'}
                </Typography>
                {error && (
                    <Typography variant="caption" sx={{ color: 'warning.main', ml: 0.5 }}>
                        (cached)
                    </Typography>
                )}
            </Button>
        </Tooltip>
    );
};

export default GitHubStarBadge;
