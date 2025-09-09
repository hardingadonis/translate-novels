import axios from 'axios';

const axiosInstance = axios.create({
	timeout: 1200000,
});

export default axiosInstance;
