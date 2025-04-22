import axios from "axios";

const instance = axios.create({
//  baseURL: "https://api-zhbjnbok5q-uc.a.run.app/",

  baseURL: "http://127.0.0.1:5011/a4point-system-21004/us-central1/api",
});
export default instance;
