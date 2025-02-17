// Home.tsx
import { Container, Grid, Card, CardContent, Typography, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import './Home.css';

export default function Home() {
    return (
        <Container maxWidth="lg" className="home-container">
            {/* 主标题 */}
            <div className="hero-section">
                <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mt: 8 }}>
                    AI代码提示词智能构建平台
                </Typography>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 6 }}>
                    重新定义代码上下文的精准界定与提示词构建体验
                </Typography>
            </div>

            {/* 问题解决卡片 */}
            <Grid container spacing={4} sx={{ mb: 8 }}>
                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', p: 2 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                                🚀 突破文件上传限制
                            </Typography>
                            <Typography color="text.secondary">
                                当前多数Deepseek R1解决方案缺乏便捷的文件上传支持，导致构建提示词时需要手动处理多个文件内容。我们的平台提供：
                            </Typography>
                            <ul className="feature-list">
                                <li>多文件拖拽上传支持</li>
                                <li>自动内容解析与整合</li>
                                <li>可视化文件结构预览</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                    <Card elevation={3} sx={{ height: '100%', p: 2 }}>
                        <CardContent>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'medium' }}>
                                🎯 精准上下文界定
                            </Typography>
                            <Typography color="text.secondary">
                                解决传统AI编程工具（如Cursor）在代码上下文识别中的痛点：
                            </Typography>
                            <ul className="feature-list">
                                <li>智能代码片段划分</li>
                                <li>多维度上下文关联分析</li>
                                <li>人工辅助精调机制</li>
                            </ul>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* 操作引导 */}
            <div className="cta-section">
                <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                    立即体验智能提示词构建
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
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #1976d2 30%, #004ba0 90%)'
                    }}
                >
                    开始创建
                </Button>
            </div>
        </Container>
    );
}