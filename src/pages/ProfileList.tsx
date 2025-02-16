// // src/pages/ProfileList.tsx
// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import {
//     Grid,
//     Card,
//     CardContent,
//     Typography,
//     TextField,
//     Button,
//     Pagination,
//     Select,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     Box
// } from '@mui/material';
// import { Home } from './Home';
//
// interface Profile {
//     id: string;
//     name: string;
//     lastUsed: Date;
// }
//
// const ProfileList: React.FC = () => {
//     const [profiles, setProfiles] = useState<Profile[]>(() => {
//         const saved = localStorage.getItem('profiles');
//         return saved ? JSON.parse(saved, (key, value) => key === 'lastUsed' ? new Date(value) : value) : [];
//     });
//     const [searchTerm, setSearchTerm] = useState('');
//     const [page, setPage] = useState(1);
//     const [itemsPerPage, setItemsPerPage] = useState(10);
//     const navigate = useNavigate();
//
//     useEffect(() => {
//         localStorage.setItem('profiles', JSON.stringify(profiles));
//     }, [profiles]);
//
//     const filteredProfiles = profiles
//         .filter(profile =>
//             profile.name.toLowerCase().includes(searchTerm.toLowerCase())
//         )
//         .sort((a, b) => b.lastUsed.getTime() - a.lastUsed.getTime());
//
//     const pageCount = Math.ceil(filteredProfiles.length / itemsPerPage);
//     const currentProfiles = filteredProfiles.slice(
//         (page - 1) * itemsPerPage,
//         page * itemsPerPage
//     );
//
//     const handleProfileClick = (id: string) => {
//         const updated = profiles.map(p =>
//             p.id === id ? {...p, lastUsed: new Date()} : p
//         );
//         setProfiles(updated);
//         navigate(`/profile/${id}`);
//     };
//
//     return (
//         <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
//             <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
//                 <TextField
//                     label="搜索Profile"
//                     variant="outlined"
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     sx={{ width: 300 }}
//                 />
//
//                 <FormControl sx={{ width: 120 }}>
//                     <InputLabel>每页数量</InputLabel>
//                     <Select
//                         value={itemsPerPage}
//                         label="每页数量"
//                         onChange={(e) => setItemsPerPage(Number(e.target.value))}
//                     >
//                         <MenuItem value={10}>10</MenuItem>
//                         <MenuItem value={20}>20</MenuItem>
//                         <MenuItem value={50}>50</MenuItem>
//                     </Select>
//                 </FormControl>
//             </Box>
//
//             <Grid container spacing={3}>
//                 {currentProfiles.map((profile) => (
//                     <Grid item xs={12} sm={6} md={4} key={profile.id}>
//                         <Card
//                             sx={{
//                                 cursor: 'pointer',
//                                 transition: 'transform 0.2s',
//                                 '&:hover': { transform: 'scale(1.02)' }
//                             }}
//                             onClick={() => handleProfileClick(profile.id)}
//                         >
//                             <CardContent>
//                                 <Typography variant="h6" gutterBottom>
//                                     {profile.name}
//                                 </Typography>
//                                 <Typography color="text.secondary">
//                                     上次使用: {profile.lastUsed.toLocaleString()}
//                                 </Typography>
//                             </CardContent>
//                         </Card>
//                     </Grid>
//                 ))}
//             </Grid>
//
//             <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
//                 <Pagination
//                     count={pageCount}
//                     page={page}
//                     onChange={(_, value) => setPage(value)}
//                     color="primary"
//                     showFirstButton
//                     showLastButton
//                 />
//             </Box>
//         </Box>
//     );
// };
//
// export default ProfileList;