// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import ProfileList from './pages/ProfileList';
import { AppBar, Toolbar, Container } from '@mui/material';

export default function App() {
    return (
        <Router>
            <AppBar position="static">
                <Toolbar>
                    <Link to="/" style={{ textDecoration: 'none', color: 'white', marginRight: 20 }}>
                        首页
                    </Link>
                    {/*<Link to="/profiles" style={{ textDecoration: 'none', color: 'white', marginRight: 20 }}>*/}
                    {/*    Profile列表*/}
                    {/*</Link>*/}
                    <Link to="/about" style={{ textDecoration: 'none', color: 'white' }}>
                        关于
                    </Link>
                </Toolbar>
            </AppBar>

            <Container maxWidth="xl" sx={{ mt: 3 }}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/profiles" element={<ProfileList />} />
                    <Route path="/profile/:id" element={<Home />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </Container>
        </Router>
    );
}