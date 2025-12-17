import { User } from './src/models/index.js';

async function checkAdmin() {
    try {
        const admin = await User.findOne({ where: { email: 'admin@whitestar.cl' } });
        if (admin) {
            console.log('Admin user found:', admin.toJSON());
        } else {
            console.log('Admin user NOT found');
        }
    } catch (error) {
        console.error('Error checking admin:', error);
    }
}

checkAdmin();
