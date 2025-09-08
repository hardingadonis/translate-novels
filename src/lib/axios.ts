import axios from 'axios';

// Create a shared axios instance with 20 minutes timeout (1,200,000 milliseconds)
const axiosInstance = axios.create({
	timeout: 1200000, // 20 minutes
});

export default axiosInstance;
