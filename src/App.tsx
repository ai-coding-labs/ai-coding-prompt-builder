// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import PromptTemplate from './pages/PromptTemplate';
import About from './pages/About';
import { AppBar, Toolbar, Container } from '@mui/material';

export default function App() {
    return (
        <Router basename="/ai-coding-prompt-builder">
            <AppBar position="static">
                <Toolbar sx={{ gap: 3 }}>
                    <Link to="/" style={{ textDecoration: 'none', color: 'white' }}>
                        首页
                    </Link>
                    <Link to="/prompt" style={{ textDecoration: 'none', color: 'white' }}>
                        提示词构建
                    </Link>
                    <Link to="/about" style={{ textDecoration: 'none', color: 'white' }}>
                        关于我们
                    </Link>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 3 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/prompt" element={<PromptTemplate />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Container>
        </Router>
    );
}