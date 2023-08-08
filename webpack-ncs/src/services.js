import axios from 'axios';
export const handleRequest = async () => {
  const res = await axios.get('/kubecube/proxy/api/v1/cube/clusters/info');
}