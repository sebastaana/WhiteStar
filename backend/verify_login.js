import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function verifyLogin() {
    try {
        console.log('Attempting login with admin@whitestar.cl ...');
        const res = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@whitestar.cl',
            password: 'password123'
        });

        if (res.data.success) {
            console.log('✅ Login SUCCESSFUL!');
            console.log('User:', res.data.user);
            console.log('Token obtained.');
        }
    } catch (error) {
        console.error('❌ Login FAILED:', error.response?.data || error.message);
    }
}

verifyLogin();
