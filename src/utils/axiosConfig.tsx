import { loadStorage } from "./storage";

const getConfig = async () => {
    const userDetails = await loadStorage("userDetails");

    const config = {
        headers: {
            'authorization': userDetails.jwt
        }
    };

    return config;
}

export { getConfig };