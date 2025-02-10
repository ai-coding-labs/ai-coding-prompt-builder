// Home.tsx
import { useState, useEffect } from 'react';
import MarkdownEditor from './MarkdownEditor';
import './Home.css';
import { TextField } from '@mui/material';

export default function Home() {
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
                <h1>任务</h1>
                <p>支持文件拖拽上传与内容合并复制</p>
            </header>

            {/* 功能区域 */}
            <main className="editor-wrapper">

                <div className="role-input-section">
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={roleContent}
                        onChange={(e) => setRoleContent(e.target.value)}
                        label="角色信息（Markdown格式）"
                        variant="outlined"
                        sx={{marginBottom: 2}}
                    />
                </div>

                <div className="rule-input-section">
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={ruleContent}
                        onChange={(e) => setRuleContent(e.target.value)}
                        label="规则内容（Markdown格式）"
                        variant="outlined"
                        sx={{marginBottom: 2}}
                    />
                </div>

                <MarkdownEditor ruleContent={ruleContent} roleContent={roleContent}/>
            </main>

            {/* 底部信息 */}
            <footer className="home-footer">
                <p>使用 React 构建 © 2024</p>
            </footer>
        </div>
    );
}