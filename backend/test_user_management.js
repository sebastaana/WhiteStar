import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function testUserManagement() {
    try {
        // 1. Login as Admin
        console.log('Logging in as Admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@whitestar.cl',
            password: 'password123'
        });
        const token = loginRes.data.token;
        const headers = { Authorization: `Bearer ${token}` };
        console.log('✅ Admin logged in.');

        // 2. Get a user to edit (e.g., the first client)
        const usersRes = await axios.get(`${API_URL}/users`, { headers });
        const targetUser = usersRes.data.users.find(u => u.Role.name === 'Cliente');

        if (!targetUser) {
            console.log('❌ No client user found to test.');
            return;
        }
        console.log(`Target user: ${targetUser.email} (ID: ${targetUser.id})`);

        // 3. Update details
        console.log('Updating user details...');
        const updateRes = await axios.put(`${API_URL}/users/${targetUser.id}`, {
            first_name: 'UpdatedName',
            last_name: 'UpdatedLast'
        }, { headers });
        console.log('Update response:', updateRes.data.success ? 'OK' : 'FAIL');

        // 4. Suspend user
        console.log('Suspending user...');
        const suspendRes = await axios.put(`${API_URL}/users/${targetUser.id}/status`, {
            is_active: false
        }, { headers });
        console.log('Suspend response:', suspendRes.data.success ? 'OK' : 'FAIL');
        console.log('New Status:', suspendRes.data.user.is_active);

        // 5. Reactivate user
        console.log('Reactivating user...');
        const activateRes = await axios.put(`${API_URL}/users/${targetUser.id}/status`, {
            is_active: true
        }, { headers });
        console.log('Activate response:', activateRes.data.success ? 'OK' : 'FAIL');
        console.log('New Status:', activateRes.data.user.is_active);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testUserManagement();
