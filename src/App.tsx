// src/App.tsx
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ThemeProvider, createTheme, AppBar, Toolbar, Container, styled } from '@mui/material';
import Home from './pages/Home';
import PromptTemplate from './pages/PromptTemplate';
import About from './pages/About';

// 创建自定义主题
const theme = createTheme({
    palette: {
        background: {
            default: '#ffffff', // 添加默认背景色
            paper: '#f5f5f5'    // 修复paper背景色
        },
        primary: {
            main: '#1976d2',
            dark: '#004ba0'
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)' // 确保文本主色存在
        },
        action: {
            hover: 'rgba(25, 118, 210, 0.04)' // 补充hover状态颜色
        }
    },
    components: {
        MuiAppBar: {
            styleOverrides: {
                colorDefault: {
                    backgroundColor: '#ffffff' // 确保AppBar背景色
                }
            }
        }
    }
});

const StyledLink = styled(Link)(({ theme }) => ({
    textDecoration: 'none',
    color: theme.palette.text.primary,
    position: 'relative',
    padding: '8px 16px',
    borderRadius: '8px',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    '&::before': {
        content: '""',
        position: 'absolute',
        bottom: 0,
        left: '50%',
        width: '0',
        height: '3px',
        backgroundColor: theme.palette.primary.main,
        transform: 'translateX(-50%)',
        transition: 'width 0.3s ease',
    },
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
        color: theme.palette.primary.dark,
        '&::before': {
            width: '100%'
        }
    },
    '&.active': {
        color: theme.palette.primary.main,
        fontWeight: 600,
        '&::before': {
            width: '100%',
            backgroundColor: theme.palette.primary.main
        }
    }
}));

function NavLinks() {
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === path;
        return location.pathname.startsWith(path);
    };

    return (
        <Toolbar sx={{ gap: 1 }}>
            <StyledLink to="/" className={isActive('/') ? 'active' : ''}>
                首页
            </StyledLink>
            <StyledLink to="/prompt" className={isActive('/prompt') ? 'active' : ''}>
                提示词构建
            </StyledLink>
            <StyledLink to="/about" className={isActive('/about') ? 'active' : ''}>
                关于我们
            </StyledLink>
        </Toolbar>
    );
}

function MainApp() {
    return (
        <Router basename="/ai-coding-prompt-builder">
            <AppBar
                position="static"
                color="default"
                sx={{
                    bgcolor: 'background.paper',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
                }}
            >
                <NavLinks />
            </AppBar>

            <Container maxWidth="xl" sx={{
                mt: 3,
                minHeight: 'calc(100vh - 128px)',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/prompt" element={<PromptTemplate />} />
                    <Route path="/about" element={<About />} />
                    {/* 添加404回退路由 */}
                    <Route path="*" element={<Home />} />
                </Routes>

                <footer style={{
                    marginTop: 'auto',
                    padding: '32px 0',
                    textAlign: 'center',
                    color: '#4a4a4a',
                    borderTop: '1px solid rgba(0, 0, 0, 0.12)',
                    background: 'linear-gradient(145deg, #f8f9fa 0%, #f1f3f5 100%)'
                }}>
                    <p style={{
                        fontSize: '0.9rem',
                        letterSpacing: '0.8px',
                        color: '#6c757d',
                        margin: 0
                    }}>
                        🚀 用技术创造价值 © 2025 AI代码助手
                    </p>
                </footer>
            </Container>
        </Router>
    );
}

export default function App() {
    return (
        <ThemeProvider theme={theme}>
            <MainApp />
        </ThemeProvider>
    );
}