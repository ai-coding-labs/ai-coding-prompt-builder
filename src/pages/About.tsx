import React, { useState } from "react";
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import CloseIcon from '@mui/icons-material/Close';

export default function About() {
    const [openWeChat, setOpenWeChat] = useState(false);

    return (
        <div className="page-container">
            <h1>About Page</h1>
            <p>This is the about page description</p>
            <p>Built with React {React.version}</p>

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <Button
                    variant="contained"
                    color="primary"
                    href="https://github.com/your-repo"
                    target="_blank"
                >
                    GitHub Repository
                </Button>
                <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenWeChat(true)}
                >
                    Join WeChat Group
                </Button>
            </div>

            <Dialog open={openWeChat} onClose={() => setOpenWeChat(false)}>
                <DialogTitle>
                    Scan QR Code
                    <CloseIcon
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '8px',
                            cursor: 'pointer'
                        }}
                        onClick={() => setOpenWeChat(false)}
                    />
                </DialogTitle>
                <DialogContent>
                    <img
                        src="/wechat-qr.png"
                        alt="WeChat QR Code"
                        style={{ width: '256px', height: '256px' }}
                    />
                    <p>Scan the QR code to join the technical exchange group.</p>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenWeChat(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}