import axios from 'axios'
import * as dotenv from 'dotenv'

dotenv.config({ path: __dirname + "/../.env.local" });
dotenv.config({ path: __dirname + "/../.env" });
dotenv.config();

const BASE_URL = process.env.BASEURL

export const request_helper = {
    request: (method, path, data,headers) => {
        return axios({
            url: BASE_URL + path,
            method: method,
            data: data,
            headers:headers
        })
    }

}
