import React, {useEffect, useState} from "react";
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import StarIcon from '@mui/icons-material/Star';
import QQIcon from '@mui/icons-material/QuestionAnswer';
import MessageIcon from '@mui/icons-material/Message';
import wechatQR from '../assets/cc11001100-weixin.png';
import qqQR from '../assets/qq-group-qrcode.jpg';

export default function About() {
    const [stars, setStars] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStars = async () => {
            try {
                const response = await fetch('https://api.github.com/repos/llm-sec/ai-coding-prompt-builder');
                if (!response.ok) throw new Error('Failed to fetch');
                const data = await response.json();
                setStars(data.stargazers_count);
            } catch (error) {
                console.error('Error fetching stars:', error);
                setStars(0); // 设置默认值保证显示
            } finally {
                setLoading(false);
            }
        };
        fetchStars();
    }, []);
    return (
        <Box sx={{
            maxWidth: 800,
            mx: 'auto',
            p: 4,
            background: 'linear-gradient(to bottom right, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: 4,
            boxShadow: 3
        }}>
            <Typography variant="h3" gutterBottom sx={{
                fontWeight: 800,
                color: 'primary.main',
                textAlign: 'center',
                mb: 4,
                textShadow: '1px 1px 2px rgba(0,0,0,0.1)'
            }}>
                🎯 关于项目
            </Typography>

            <Grid container spacing={4} sx={{mb: 4}}>
                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 3,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1
                    }}>
                        <Typography variant="h5" gutterBottom sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 2
                        }}>
                            🚀 项目信息
                        </Typography>
                        <Typography paragraph sx={{
                            color: 'text.secondary',
                            lineHeight: 1.7
                        }}>
                            这是一个基于大模型的AI编程提示词构建工具，帮助开发者更高效地创建和管理编程提示词。
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            mt: 3
                        }}>
                            <Button
                                variant="contained"
                                href="https://github.com/llm-sec/ai-coding-prompt-builder"
                                target="_blank"
                                sx={{
                                    textTransform: 'none',
                                    px: 3,
                                    py: 1,
                                    borderRadius: 20,
                                    bgcolor: 'primary.main',
                                    '&:hover': {bgcolor: 'primary.dark'},
                                    minWidth: 180 // 确保有足够空间显示
                                }}
                            >
                                <Box sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    position: 'relative'
                                }}>
                                    <span>GitHub 仓库</span>
                                    <Box sx={{
                                        ml: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5
                                    }}>
                                        {loading ? (
                                            <CircularProgress size={20} sx={{color: 'white'}}/>
                                        ) : (
                                            <>
                                                <StarIcon fontSize="small" sx={{color: 'gold'}}/>
                                                <span>{stars ?? 0}</span>
                                            </>
                                        )}
                                    </Box>
                                </Box>
                            </Button>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Box sx={{
                        p: 3,
                        backgroundColor: 'background.paper',
                        borderRadius: 2,
                        boxShadow: 1
                    }}>
                        <Typography variant="h5" gutterBottom sx={{
                            fontWeight: 600,
                            color: 'text.primary',
                            mb: 2
                        }}>
                            👨💻 作者信息
                        </Typography>
                        <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            p: 2,
                            backgroundColor: 'action.hover',
                            borderRadius: 2
                        }}>
                            <Avatar
                                src="https://avatars.githubusercontent.com/CC11001100"
                                sx={{
                                    width: 64,
                                    height: 64,
                                    boxShadow: 2
                                }}
                            />
                            <Box>
                                <Typography variant="body1" sx={{fontWeight: 500}}>
                                    CC11001100
                                </Typography>
                                <Link
                                    href="https://github.com/CC11001100"
                                    target="_blank"
                                    sx={{
                                        textDecoration: 'none',
                                        color: 'secondary.main',
                                        '&:hover': {
                                            textDecoration: 'underline'
                                        }
                                    }}
                                >
                                    @GitHub 主页
                                </Link>
                            </Box>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            <Box sx={{
                p: 3,
                backgroundColor: 'background.paper',
                borderRadius: 2,
                boxShadow: 1
            }}>
                <Typography variant="h5" gutterBottom sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 3
                }}>
                    🤖 AI社区
                </Typography>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}>
                            <MessageIcon sx={{fontSize: 40, color: '#09b83e', mb: 2}}/>
                            <Typography variant="h6" gutterBottom>
                                微信交流群
                            </Typography>
                            <img
                                src={wechatQR}
                                alt="微信二维码"
                                style={{
                                    width: 200,
                                    height: 280,
                                    margin: '0 auto 16px',
                                    display: 'block',
                                    borderRadius: 8
                                }}
                            />
                            <Typography variant="body2" color="text.secondary">
                                扫码添加好友，备注"大模型"申请入群
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} md={6}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            textAlign: 'center'
                        }}>
                            <QQIcon sx={{fontSize: 40, color: '#12b7f5', mb: 2}}/>
                            <Typography variant="h6" gutterBottom>
                                QQ交流群
                            </Typography>
                            <img
                                src={qqQR}
                                alt="QQ群二维码"
                                style={{
                                    width: 200,
                                    height: 350,
                                    margin: '0 auto 16px',
                                    display: 'block',
                                    borderRadius: 8
                                }}
                            />
                            <Button
                                variant="contained"
                                href="https://qm.qq.com/q/pYBa99j1e2"
                                target="_blank"
                                sx={{
                                    mt: 1,
                                    borderRadius: 20,
                                    px: 4,
                                    bgcolor: '#12b7f5',
                                    '&:hover': {bgcolor: '#0f9cd3'}
                                }}
                            >
                                一键加群
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Box>

            <Typography variant="caption" display="block" sx={{
                mt: 4,
                color: 'text.secondary',
                textAlign: 'center',
                fontSize: 12
            }}>
                Built with React {React.version} • {new Date().getFullYear()}
            </Typography>
        </Box>
    );
}