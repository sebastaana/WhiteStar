export const getImageUrl = (path) => {
    if (!path) return 'https://via.placeholder.com/400x400?text=No+Image';
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;

    // Asumimos que VITE_API_BASE_URL es http://localhost:3001/api
    // Queremos obtener http://localhost:3001
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
    const rootUrl = baseUrl.replace(/\/api\/?$/, '');

    // Asegurar que path empiece con /
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${rootUrl}${cleanPath}`;
};
