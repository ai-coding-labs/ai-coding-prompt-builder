// PromptTemplate.tsx
import {useEffect, useState, useRef} from 'react';
import MarkdownEditor from './MarkdownEditor';
import './PromptTemplate.css';
import {Button, TextField, Box, Dialog, DialogTitle, DialogContent, DialogActions, Alert} from '@mui/material';
import {useNavigate, useParams} from 'react-router-dom';
import SaveIcon from '@mui/icons-material/Save';
import { HistoryRecord } from '../types/history';
import { Profile } from '../types/profile';
import { profileManager } from '../utils/profileManager';
import ProfileSelector from '../components/ProfileSelector';
import ProfileManager from '../components/ProfileManager';

export default function PromptTemplate() {
    const {id} = useParams();
    const navigate = useNavigate();
    const markdownEditorRef = useRef<any>(null);

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

    // Profile相关状态
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [profileManagerOpen, setProfileManagerOpen] = useState(false);
    const [saveProfileDialogOpen, setSaveProfileDialogOpen] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [profileDescription, setProfileDescription] = useState('');
    const [saveAlert, setSaveAlert] = useState<{ message: string; severity: 'success' | 'error' } | null>(null);

    // 初始化当前Profile
    useEffect(() => {
        const profile = profileManager.getCurrentProfile();
        if (profile) {
            setCurrentProfile(profile);
            // 如果当前内容为空，加载Profile内容
            if (!roleContent && !ruleContent && !outputContent) {
                setRoleContent(profile.ruleContent);
                setRoleContent(profile.roleContent);
                setOutputContent(profile.outputContent);
            }
        }
    }, []);

    // 从历史记录加载数据的处理函数
    const handleLoadFromHistory = (record: HistoryRecord) => {
        setRoleContent(record.roleContent);
        setRuleContent(record.ruleContent);
        setOutputContent(record.outputContent);
        // 任务内容和文件会在MarkdownEditor中处理
    };

    // Profile切换处理函数
    const handleProfileChange = (profile: Profile) => {
        setCurrentProfile(profile);
        setRoleContent(profile.roleContent);
        setRuleContent(profile.ruleContent);
        setOutputContent(profile.outputContent);
    };

    // 保存Profile处理函数
    const handleSaveProfile = () => {
        // 如果当前有Profile，使用其名称作为默认值
        if (currentProfile) {
            setProfileName(currentProfile.name);
            setProfileDescription(currentProfile.description || '');
        } else {
            setProfileName('');
            setProfileDescription('');
        }
        setSaveProfileDialogOpen(true);
    };

    const confirmSaveProfile = () => {
        if (!profileName.trim()) {
            setSaveAlert({ message: '请输入配置名称', severity: 'error' });
            return;
        }

        try {
            const profile: Profile = {
                id: currentProfile?.id || `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: profileName.trim(),
                description: profileDescription.trim(),
                roleContent,
                ruleContent,
                outputContent,
                tags: ['自定义'],
                createdAt: currentProfile?.createdAt || Date.now(),
                updatedAt: Date.now(),
                category: 'custom'
            };

            profileManager.saveProfile(profile);
            setCurrentProfile(profile);
            setSaveProfileDialogOpen(false);
            setSaveAlert({ message: '配置保存成功', severity: 'success' });

            // 清除提示
            setTimeout(() => setSaveAlert(null), 3000);
        } catch (error) {
            setSaveAlert({ message: '保存失败', severity: 'error' });
        }
    };

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
                {/* 保存提示 */}
                {saveAlert && (
                    <Alert severity={saveAlert.severity} sx={{ mb: 2 }}>
                        {saveAlert.message}
                    </Alert>
                )}

                {/* Profile选择器和保存按钮 */}
                <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                    <ProfileSelector
                        currentProfile={currentProfile}
                        onProfileChange={handleProfileChange}
                        onManageProfiles={() => setProfileManagerOpen(true)}
                    />
                    <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={handleSaveProfile}
                        sx={{ ml: 'auto' }}
                    >
                        保存为Profile
                    </Button>
                </Box>

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
                    ref={markdownEditorRef}
                    ruleContent={ruleContent}
                    roleContent={roleContent}
                    outputContent={outputContent}
                    onLoadFromHistory={handleLoadFromHistory}
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

            {/* Profile管理对话框 */}
            <ProfileManager
                open={profileManagerOpen}
                onClose={() => setProfileManagerOpen(false)}
                onProfileChange={handleProfileChange}
            />

            {/* 保存Profile对话框 */}
            <Dialog open={saveProfileDialogOpen} onClose={() => setSaveProfileDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentProfile ? '更新Profile配置' : '保存为新Profile'}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="配置名称"
                        fullWidth
                        variant="outlined"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <TextField
                        margin="dense"
                        label="配置描述"
                        fullWidth
                        multiline
                        rows={3}
                        variant="outlined"
                        value={profileDescription}
                        onChange={(e) => setProfileDescription(e.target.value)}
                        placeholder="描述这个配置的用途和特点..."
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSaveProfileDialogOpen(false)}>
                        取消
                    </Button>
                    <Button onClick={confirmSaveProfile} variant="contained">
                        {currentProfile ? '更新' : '保存'}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}