// PromptTemplate.tsx
import {useEffect, useState} from 'react';
import MarkdownEditor from './MarkdownEditor';
import './PromptTemplate.css';
import {Button, TextField} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';

export default function PromptTemplate() {
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

    const [outputContent, setOutputContent] = useState(() => {
        const saved = localStorage.getItem('outputContent');
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

    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('outputContent', outputContent);
        }, 500);
        return () => clearTimeout(timer);
    }, [outputContent]);

    return (
        <div className="template-container">
            <header className="template-header">
                <h1>AI辅助写代码提示词构造器</h1>
                <p>支持文件拖拽上传</p>
            </header>

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
                        sx={{marginBottom: 2}}
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
                        sx={{marginBottom: 2}}
                    />
                </div>

                <div className="output-input-section">
                    <TextField
                        fullWidth
                        multiline
                        minRows={4}
                        maxRows={10}
                        value={outputContent}
                        onChange={(e) => setOutputContent(e.target.value)}
                        label="输出结果（Markdown格式）"
                        variant="outlined"
                        sx={{marginBottom: 2}}
                    />
                </div>

                <MarkdownEditor
                    ruleContent={ruleContent}
                    roleContent={roleContent}
                    outputContent={outputContent}
                />
            </main>

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