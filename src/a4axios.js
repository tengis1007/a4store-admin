import axios from "axios";

const instance = axios.create({
  baseURL: "https://a4api-zhbjnbok5q-uc.a.run.app/",
  // baseURL: "http://127.0.0.1:5004/a4youandme-store/us-central1/a4api",
  
});
export default instance;
