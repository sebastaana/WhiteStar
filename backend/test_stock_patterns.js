import axios from 'axios';

const API_URL = 'http://localhost:3001/api';
let token = '';

async function login() {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@whitestar.cl',
            password: 'password123'
        });
        token = response.data.token;
        console.log('Login successful');
    } catch (error) {
        console.error('Login failed:', error.response ? { status: error.response.status, data: error.response.data } : error.message);
        process.exit(1);
    }
}

async function createStockMovement(productId, quantity, type = 'salida') {
    try {
        await axios.post(`${API_URL}/stock/movements`, {
            product_id: productId,
            movement_type: type,
            quantity: quantity,
            reason: 'Test consumption pattern',
            notes: 'Automated test'
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Created ${type} movement for product ${productId}: ${quantity}`);
    } catch (error) {
        console.error(`Failed to create movement for product ${productId}:`, error.response?.data || error.message);
    }
}

async function getPatterns() {
    try {
        const response = await axios.get(`${API_URL}/stock/patterns`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('\nStock Patterns Analysis:');
        console.table(response.data.data);
        return response.data.data;
    } catch (error) {
        console.error('Failed to get patterns:', error.response?.data || error.message);
    }
}

async function getProducts() {
    console.log('Fetching products...');
    try {
        const response = await axios.get(`${API_URL}/products`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`Fetched ${response.data.products.length} products`);
        return response.data.products;
    } catch (error) {
        console.error('Failed to get products:', error.response?.data || error.message);
        return [];
    }
}

async function runTest() {
    await login();

    const products = await getProducts();
    if (products.length < 3) {
        console.error('Not enough products to run test');
        return;
    }

    const p1 = products[0].id;
    const p2 = products[1].id;
    const p3 = products[2].id;

    console.log(`Using products: ${p1}, ${p2}, ${p3}`);

    // Simulate consumption for product 1 (High consumption)
    await createStockMovement(p1, 50, 'salida');
    await createStockMovement(p1, 30, 'salida');

    // Simulate consumption for product 2 (Medium consumption)
    await createStockMovement(p2, 20, 'salida');

    // Simulate consumption for product 3 (Low consumption)
    await createStockMovement(p3, 5, 'salida');

    // Get and verify patterns
    const patterns = await getPatterns();

    if (patterns && patterns.length > 0) {
        const topProduct = patterns[0];
        if (topProduct.product_id === p1 && topProduct.total_consumed >= 80) {
            console.log('\nSUCCESS: Product 1 identified as top consumed product.');
        } else {
            console.error(`\nFAILURE: Product 1 (${p1}) should be top consumed. Found: ${topProduct.product_id}`);
        }
    } else {
        console.error('\nFAILURE: No patterns returned.');
    }
}

runTest();
