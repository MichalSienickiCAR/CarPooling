import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Container,
    Paper,
    Stack,
    TextField,
    Typography,
    Avatar,
    IconButton,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Switch,
    FormControlLabel,
    LinearProgress,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { PhotoCamera, ArrowBack, Save as SaveIcon, Logout, AddCircleOutline } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useFormik } from 'formik';
import * as yup from 'yup';
import { authService, UserProfile as IUserProfile } from '../services/api';

const validationSchema = yup.object({
    first_name: yup.string(),
    last_name: yup.string(),
    email: yup.string().email('Nieprawidłowy email').required('Email jest wymagany'),
    phone_number: yup.string(),
    preferred_role: yup.string().oneOf(['driver', 'passenger', 'both']),
    notifications_enabled: yup.boolean(),
});

export const UserProfile: React.FC = () => {
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const formik = useFormik({
        initialValues: {
            first_name: '',
            last_name: '',
            email: '',
            phone_number: '',
            preferred_role: 'both',
            username: '',
            notifications_enabled: true,
        },
        validationSchema,
        onSubmit: async (values) => {
            setSaving(true);
            try {
                const formData = new FormData();
                formData.append('first_name', values.first_name);
                formData.append('last_name', values.last_name);
                formData.append('email', values.email);
                formData.append('phone_number', values.phone_number);
                formData.append('preferred_role', values.preferred_role);
                formData.append('notifications_enabled', values.notifications_enabled.toString());

                if (selectedFile) {
                    formData.append('avatar', selectedFile);
                }

                await authService.updateUserProfile(formData);
                enqueueSnackbar('Profil zaktualizowany pomyślnie!', { variant: 'success' });
            } catch (error) {
                console.error('Update error:', error);
                enqueueSnackbar('Nie udało się zaktualizować profilu.', { variant: 'error' });
            } finally {
                setSaving(false);
            }
        },
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const profile = await authService.getUserProfile();
                formik.setValues({
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    email: profile.email || '',
                    phone_number: profile.phone_number || '',
                    preferred_role: profile.preferred_role,
                    username: profile.username,
                    notifications_enabled: profile.notifications_enabled ?? true,
                });
                if (profile.avatar) {
                    setAvatarPreview(profile.avatar);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
                enqueueSnackbar('Błąd pobierania profilu', { variant: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
            <Box mb={4} display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
                        <ArrowBack />
                    </IconButton>
                    <Typography variant="h4" fontWeight="bold">Edytuj Profil</Typography>
                </Box>
                <Button color="inherit" onClick={handleLogout} startIcon={<Logout />}>
                    Wyloguj
                </Button>
            </Box>

            <Paper elevation={0} sx={{ p: { xs: 3, md: 6 }, borderRadius: '40px', bgcolor: '#f5f5f5' }}>
                {(() => {
                    const hasAvatar = Boolean(avatarPreview);
                    const hasFirstName = Boolean(formik.values.first_name?.trim());
                    const hasLastName = Boolean(formik.values.last_name?.trim());
                    const hasEmail = Boolean(formik.values.email?.trim());
                    const hasPhone = Boolean(formik.values.phone_number?.trim());
                    const filled = [hasAvatar, hasFirstName, hasLastName, hasEmail, hasPhone].filter(Boolean).length;
                    const percent = Math.round((filled / 5) * 100);
                    const missing: { label: string }[] = [];
                    if (!hasAvatar) missing.push({ label: 'Dodaj zdjęcie profilowe' });
                    if (!hasFirstName) missing.push({ label: 'Podaj imię' });
                    if (!hasLastName) missing.push({ label: 'Podaj nazwisko' });
                    if (!hasEmail) missing.push({ label: 'Podaj adres e-mail' });
                    if (!hasPhone) missing.push({ label: 'Podaj numer telefonu' });
                    return (
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="subtitle1" fontWeight="bold" color="textSecondary" gutterBottom>
                                Profil uzupełniony w {percent}%
                            </Typography>
                            <LinearProgress variant="determinate" value={percent} sx={{ height: 8, borderRadius: 4, mb: 2 }} />
                            {missing.length > 0 && (
                                <>
                                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1, mb: 0.5 }}>Brakujące elementy:</Typography>
                                    <List dense disablePadding>
                                        {missing.map((item, i) => (
                                            <ListItem key={i} disablePadding sx={{ py: 0 }}>
                                                <ListItemIcon sx={{ minWidth: 32 }}>
                                                    <AddCircleOutline fontSize="small" color="action" />
                                                </ListItemIcon>
                                                <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                                            </ListItem>
                                        ))}
                                    </List>
                                </>
                            )}
                        </Box>
                    );
                })()}
                <Box component="form" onSubmit={formik.handleSubmit}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={6}>
                        {/* Sekcja Avatara */}
                        <Box sx={{ width: { xs: '100%', md: '30%' }, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box position="relative">
                                <Avatar
                                    src={avatarPreview || undefined}
                                    sx={{ width: 150, height: 150, mb: 2, border: '4px solid #fff', boxShadow: '0 4px 14px rgba(0,0,0,0.1)' }}
                                >
                                    {!avatarPreview && formik.values.username[0]?.toUpperCase()}
                                </Avatar>
                                <input
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    id="icon-button-file"
                                    type="file"
                                    onChange={handleFileChange}
                                />
                                <label htmlFor="icon-button-file">
                                    <IconButton color="primary" aria-label="upload picture" component="span" sx={{ position: 'absolute', bottom: 10, right: 10, bgcolor: 'white', '&:hover': { bgcolor: '#f5f5f5' } }}>
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="h6" gutterBottom>{formik.values.username}</Typography>
                            <Typography variant="body2" color="textSecondary">{formik.values.email}</Typography>
                        </Box>

                        {/* Sekcja Danych */}
                        <Box sx={{ width: { xs: '100%', md: '70%' } }}>
                            <Stack spacing={3}>
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        fullWidth
                                        label="Imię"
                                        name="first_name"
                                        value={formik.values.first_name}
                                        onChange={formik.handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Nazwisko"
                                        name="last_name"
                                        value={formik.values.last_name}
                                        onChange={formik.handleChange}
                                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
                                    />
                                </Stack>

                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    value={formik.values.email}
                                    onChange={formik.handleChange}
                                    error={formik.touched.email && Boolean(formik.errors.email)}
                                    helperText={formik.touched.email && formik.errors.email}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
                                />

                                <TextField
                                    fullWidth
                                    label="Numer Telefonu"
                                    name="phone_number"
                                    value={formik.values.phone_number}
                                    onChange={formik.handleChange}
                                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', bgcolor: 'white' } }}
                                />

                                <FormControl fullWidth>
                                    <InputLabel>Preferowana Rola</InputLabel>
                                    <Select
                                        name="preferred_role"
                                        value={formik.values.preferred_role}
                                        label="Preferowana Rola"
                                        onChange={formik.handleChange}
                                        sx={{ borderRadius: '20px', bgcolor: 'white' }}
                                    >
                                        <MenuItem value="passenger">Pasażer</MenuItem>
                                        <MenuItem value="driver">Kierowca</MenuItem>
                                        <MenuItem value="both">Oba (Kierowca i Pasażer)</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formik.values.notifications_enabled}
                                            onChange={(e) => formik.setFieldValue('notifications_enabled', e.target.checked)}
                                            name="notifications_enabled"
                                            color="primary"
                                        />
                                    }
                                    label={
                                        <Box>
                                            <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                Powiadomienia systemowe
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Otrzymuj powiadomienia Windows o nowych przejazdach i rezerwacjach
                                            </Typography>
                                        </Box>
                                    }
                                    sx={{ 
                                        bgcolor: 'white', 
                                        borderRadius: '20px', 
                                        px: 2, 
                                        py: 1,
                                        width: '100%',
                                        m: 0,
                                        alignItems: 'flex-start'
                                    }}
                                />

                                <Button
                                    type="submit"
                                    variant="contained"
                                    size="large"
                                    startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                    disabled={saving}
                                    sx={{ py: 1.5, mt: 2, borderRadius: '30px', bgcolor: '#c62828', '&:hover': { bgcolor: '#b71c1c' } }}
                                >
                                    {saving ? 'Zapisywanie...' : 'Zapisz Zmiany'}
                                </Button>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Paper>
        </Container>
    );
};
