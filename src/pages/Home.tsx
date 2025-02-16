// Home.tsx
import {useEffect, useState} from 'react';
import MarkdownEditor from './MarkdownEditor';
import './Home.css';
import {Button, TextField} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';

export default function Home() {

    const {id} = useParams();
    const navigate = useNavigate();

    const [ruleContent, setRuleContent] = useState(() => {
        const saved = localStorage.getItem('ruleContent');
        return saved || '';
    });

    const [roleContent, setRoleContent] = useState(() => {
        const saved = localStorage.getItem('roleContent');
        return saved || '';
    });

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('ruleContent', ruleContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [ruleContent]);

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('roleContent', roleContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [roleContent]);

    return (
        <div className="home-container">
            {/* 标题区域 */}
            <header className="home-header">
                <h1>AI辅助写代码提示词构造器</h1>
                <p>支持文件拖拽上传</p>
            </header>

            {/* 功能区域 */}
            <main className="editor-wrapper">

                <div className="role-input-section">
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={10}
                        value={roleContent}
                        onChange={(e) => setRoleContent(e.target.value)}
                        label="角色信息（Markdown格式）"
                        variant="outlined"
                        sx={{
                            marginBottom: 2,
                            '& .MuiInputBase-root': {
                                overflow: 'hidden',
                                transition: 'height 0.2s ease-out'
                            }
                        }}
                    />
                </div>

                <div className="rule-input-section">
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={10}
                        value={ruleContent}
                        onChange={(e) => setRuleContent(e.target.value)}
                        label="规则内容（Markdown格式）"
                        variant="outlined"
                        sx={{
                            marginBottom: 2,
                            '& .MuiInputBase-root': {
                                overflow: 'hidden',
                                transition: 'height 0.2s ease-out'
                            }
                        }}
                    />
                </div>

                <MarkdownEditor ruleContent={ruleContent} roleContent={roleContent}/>
            </main>

            {/* 底部信息 */}
            <footer className="home-footer">
                <p>使用 React 构建 © 2025</p>
            </footer>

            {id && (
                <Button
                    variant="contained"
                    onClick={() => navigate(-1)}
                    sx={{mt: 3, position: 'fixed', bottom: 20, right: 20}}
                >
                    返回列表
                </Button>
            )}
        </div>
    );
}
