// Home.tsx
import { Container, Grid, Card, CardContent, Typography, Button, Box, useTheme } from '@mui/material';
import { Link } from 'react-router-dom';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import MessageIcon from '@mui/icons-material/Message';
import QQIcon from '@mui/icons-material/QuestionAnswer';
import { styled } from '@mui/system';
import './Home.css';
import wechatQR from '../assets/cc11001100-weixin.png';
import qqQR from '../assets/qq-group-qrcode.jpg';

// 修复后的FeatureCard样式组件
const FeatureCard = styled(Card)(({ theme }) => ({
    height: '100%',
    position: 'relative',
    overflow: 'visible',
    background: theme.palette.background.default, // 使用更安全的背景属性
    borderRadius: '20px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: '0 24px 48px -12px rgba(0, 0, 0, 0.18)',
        '&::before': {
            opacity: 1
        }
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        inset: 0,
        borderRadius: '20px',
        padding: '2px',
        background: 'linear-gradient(135deg, rgba(41, 128, 185, 0.2) 0%, rgba(142, 68, 173, 0.2) 100%)',
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        opacity: 0,
        transition: 'opacity 0.3s'
    }
}));

export default function Home() {
    const theme = useTheme();

    return (
        <Container maxWidth="lg" sx={{ py: 8 }}>
            {/* 主标题 */}
            <Box sx={{
                textAlign: 'center',
                mb: 10,
                position: 'relative',
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '120px',
                    height: '4px',
                    background: theme.palette.primary.main,
                    borderRadius: '2px'
                }
            }}>
                <Typography variant="h2" component="h1" sx={{
                    fontWeight: 800,
                    mb: 3,
                    background: 'linear-gradient(45deg, #2c3e50 30%, #3498db 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    lineHeight: 1.2
                }}>
                    AI代码提示词智能构建平台
                </Typography>
                <Typography variant="h5" sx={{
                    color: 'text.secondary',
                    maxWidth: 800,
                    mx: 'auto',
                    fontSize: { xs: '1.2rem', md: '1.5rem' },
                    lineHeight: 1.6
                }}>
                    重新定义代码上下文的精准界定与提示词构建体验
                </Typography>
            </Box>

            {/* 功能卡片 */}
            <Grid container spacing={4} sx={{ mb: 8 }}>
                <Grid item xs={12} md={6}>
                    <FeatureCard>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                color: theme.palette.primary.main
                            }}>
                                <RocketLaunchIcon sx={{
                                    fontSize: 40,
                                    mr: 2,
                                    color: theme.palette.secondary.main
                                }} />
                                <Typography variant="h5" sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    突破文件上传限制
                                </Typography>
                            </Box>
                            <Typography color="text.secondary" sx={{
                                mb: 2,
                                fontSize: '1.1rem'
                            }}>
                                彻底解决传统方案的文件处理痛点，我们提供：
                            </Typography>
                            <Box component="ul" sx={{
                                pl: 3,
                                mb: 0,
                                '& li': {
                                    position: 'relative',
                                    pl: 3,
                                    mb: 2,
                                    fontSize: '1.05rem',
                                    '&::before': {
                                        content: '"✓"',
                                        position: 'absolute',
                                        left: 0,
                                        color: theme.palette.success.main,
                                        fontWeight: 700
                                    }
                                }
                            }}>
                                <li>支持任意代码文件后缀（.js/.ts/.py/.java等）</li>
                                <li>智能识别非标准扩展名文件</li>
                                <li>多文件拖拽批量上传</li>
                                <li>实时内容解析与结构预览</li>
                            </Box>
                        </CardContent>
                    </FeatureCard>
                </Grid>

                <Grid item xs={12} md={6}>
                    <FeatureCard>
                        <CardContent sx={{ p: 4 }}>
                            <Box sx={{
                                display: 'flex',
                                alignItems: 'center',
                                mb: 3,
                                color: theme.palette.primary.main
                            }}>
                                <TrackChangesIcon sx={{
                                    fontSize: 40,
                                    mr: 2,
                                    color: theme.palette.secondary.main
                                }} />
                                <Typography variant="h5" sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(45deg, #2c3e50 0%, #3498db 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    智能上下文分析
                                </Typography>
                            </Box>
                            <Typography color="text.secondary" sx={{
                                mb: 2,
                                fontSize: '1.1rem'
                            }}>
                                超越传统工具的上下文处理能力：
                            </Typography>
                            <Box component="ul" sx={{
                                pl: 3,
                                mb: 0,
                                '& li': {
                                    position: 'relative',
                                    pl: 3,
                                    mb: 2,
                                    fontSize: '1.05rem',
                                    '&::before': {
                                        content: '"✧"',
                                        position: 'absolute',
                                        left: 0,
                                        color: theme.palette.warning.main
                                    }
                                }
                            }}>
                                <li>多维度代码关联分析</li>
                                <li>智能代码片段划分算法</li>
                                <li>上下文敏感度动态调节</li>
                                <li>人工辅助精调机制</li>
                            </Box>
                        </CardContent>
                    </FeatureCard>
                </Grid>
            </Grid>

            {/* 社区交流区域 */}
            <Box sx={{
                mb: 8,
                p: 4,
                backgroundColor: 'background.paper',
                borderRadius: 4,
                boxShadow: 1
            }}>
                <Typography variant="h4" gutterBottom sx={{
                    fontWeight: 700,
                    color: 'primary.main',
                    textAlign: 'center',
                    mb: 4
                }}>
                    🤖 加入AI社区
                </Typography>
                <Typography variant="body1" sx={{
                    textAlign: 'center',
                    color: 'text.secondary',
                    mb: 4,
                    fontSize: '1.1rem'
                }}>
                    与更多AI开发者交流经验，获取最新技术动态和使用技巧
                </Typography>

                <Grid container spacing={4} justifyContent="center">
                    <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            textAlign: 'center',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3
                            }
                        }}>
                            <MessageIcon sx={{fontSize: 40, color: '#09b83e', mb: 2}}/>
                            <Typography variant="h6" gutterBottom>
                                微信交流群
                            </Typography>
                            <img
                                src={wechatQR}
                                alt="微信二维码"
                                style={{
                                    width: 150,
                                    height: 210,
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

                    <Grid item xs={12} sm={6} md={4}>
                        <Box sx={{
                            p: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            textAlign: 'center',
                            transition: 'all 0.3s',
                            '&:hover': {
                                transform: 'translateY(-4px)',
                                boxShadow: 3
                            }
                        }}>
                            <QQIcon sx={{fontSize: 40, color: '#12b7f5', mb: 2}}/>
                            <Typography variant="h6" gutterBottom>
                                QQ交流群
                            </Typography>
                            <img
                                src={qqQR}
                                alt="QQ群二维码"
                                style={{
                                    width: 150,
                                    height: 200,
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

            {/* CTA区域 */}
            <Box sx={{
                textAlign: 'center',
                p: 8,
                borderRadius: 4,
                background: 'linear-gradient(135deg, rgba(41, 128, 185, 0.05) 0%, rgba(142, 68, 173, 0.05) 100%)',
                position: 'relative',
                overflow: 'hidden',
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: '200px',
                    height: '200px',
                    background: 'radial-gradient(rgba(41, 128, 185, 0.1) 0%, transparent 70%)'
                }
            }}>
                <Typography variant="h4" sx={{
                    mb: 3,
                    fontWeight: 700,
                    color: theme.palette.primary.dark
                }}>
                    立即体验智能代码助手
                </Typography>
                <Button
                    component={Link}
                    to="/prompt"
                    variant="contained"
                    size="large"
                    sx={{
                        px: 6,
                        py: 2,
                        fontSize: '1.1rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(45deg, #2980b9 0%, #8e44ad 100%)',
                        boxShadow: '0 8px 24px -6px rgba(41, 128, 185, 0.3)',
                        transition: 'transform 0.3s',
                        '&:hover': {
                            transform: 'scale(1.05)',
                            boxShadow: '0 12px 32px -6px rgba(41, 128, 185, 0.4)'
                        }
                    }}
                >
                    开始构建 →
                </Button>
            </Box>
        </Container>
    );
}