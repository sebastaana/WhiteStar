import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

async function test() {
    try {
        // 1. Login
        console.log('Logging in...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'atencion1@whitestar.cl',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Login successful. Token obtained.');

        const headers = { Authorization: `Bearer ${token}` };

        // 2. Get Complaints
        console.log('\nFetching complaints...');
        const complaintsRes = await axios.get(`${API_URL}/complaints`, { headers });
        console.log(`Complaints found: ${complaintsRes.data.data.length}`);
        if (complaintsRes.data.data.length > 0) {
            console.log('Sample complaint:', complaintsRes.data.data[0].subject);
        } else {
            console.log('WARNING: No complaints found.');
        }

        // 3. Search Customers (Empty query for recent)
        console.log('\nSearching customers (empty query)...');
        const customersRes = await axios.get(`${API_URL}/customer-service/customers/search`, { headers });
        console.log(`Customers found: ${customersRes.data.data.length}`);
        if (customersRes.data.data.length > 0) {
            console.log('Sample customer:', customersRes.data.data[0].first_name);
        } else {
            console.log('WARNING: No customers found.');
        }

        // 4. Search Orders
        console.log('\nSearching orders...');
        const ordersRes = await axios.get(`${API_URL}/customer-service/orders/search`, { headers });
        console.log(`Orders found: ${ordersRes.data.data.length}`);

    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

test();
