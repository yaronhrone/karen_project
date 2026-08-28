import axios from "axios";
// Falls back to localhost for local dev (`npm start`); in production these
// must be set at build time via REACT_APP_* env vars (baked into the bundle -
// CRA cannot read them at runtime) to the server's real public address,
// since "localhost" from the browser's own perspective is the visitor's
// machine, not wherever this app is actually deployed.
const BASE_URL_PROTUCT = process.env.REACT_APP_ITEMS_API_URL || "http://localhost:8080/api/items";
const BASE_URL = process.env.REACT_APP_USERS_API_URL || "http://localhost:8081";


// users
const setAuthHeader = (token) => {
   
    localStorage.setItem("token", token);
    
}
const removeAuthHeader = () => {
    localStorage.removeItem("token");
}

const getAuthHeader = () => {
    const token = localStorage.getItem("token");

    
    return {    
            Authorization: `Bearer ${token}`
        };
    
}
export const logout = () => {
 removeAuthHeader();   
}
export const register = async (user) => {
    try {
    console.log(user.first_name + " from apiService");
    const {data} = await axios.post(`${BASE_URL}/users/register`, user);
    const token = data.jwt;
    setAuthHeader(token);
    return data;
    } catch (error) {
        console.log(error + " error from apiService");
        throw error;
    }
}
export const loging = async(Credentials) => {

    const {data} = await axios.post(`${BASE_URL}/authenticate`, Credentials);
    const token = data.jwt;

    setAuthHeader(token);

    return data;
}
export const loginWithGoogle = async (idToken) => {
    const { data } = await axios.post(`${BASE_URL}/authenticate/google`, { idToken });
    setAuthHeader(data.jwt);
    return data;
}


export const updateCurrentUser = (updatedCurrentUser) => {
    return axios.put(`${BASE_URL}/users`, updatedCurrentUser, { headers: getAuthHeader() });
}
export  const deltedUser = (email) => {
    return axios.delete(`${BASE_URL}/admin/delete-user/${email}`, { headers: getAuthHeader() });
}
export const fetchCurrentUser = () => {
    return axios.get(`${BASE_URL}/users`, { headers: getAuthHeader() });
}
export const fetchAllUsers = (page) => {
    return axios.get(`${BASE_URL}/admin/all-users/?page=${page}&size=5`, { headers: getAuthHeader() });
}

// items

export const getAllItems =  (page ) => {
    return axios.get(`${BASE_URL}/admin/all_items/?page=${page}&size=20`, { headers: getAuthHeader() });
}
export const getAllChocolate =  (page , size) => {
    return axios.get(`${BASE_URL_PROTUCT}/get_by_category/chocolate/?page=${page}&size=${size}`);
    
} 
export const getAllCake =  (page , size) => {
    return axios.get(`${BASE_URL_PROTUCT}/get_by_category/cake/?page=${page}&size=${size}`);
    
}
export const getAllCookie =  (page , size) => {
    return axios.get(`${BASE_URL_PROTUCT}/get_by_category/cookie/?page=${page}&size=${size}`);
    
}
export const getItemById =async (id) => {
    const {data} = await axios.get(`${BASE_URL_PROTUCT}/get-by-id/${id}`);
    return data;
}
export const getItemByName = async (name) => {
    console.log(name + " from apiService");
    
    const {data} = await axios.get(`${BASE_URL_PROTUCT}/${name}`);
    console.log(data + " from apiService");
    
    return data;
}
export const createItem = (formData) => {
  const result =  axios.post(`${BASE_URL}/admin/item`,formData,  {
  headers: {
      ...getAuthHeader(),
    }
});
return result;
}

export const updateItem = (item) => {
    console.log(item + " from apiService");
    
    return axios.put(`${BASE_URL}/admin/update_item`, item, { headers: getAuthHeader() });
}

export const deleteItemById = (id) => {
    return axios.delete(`${BASE_URL}/admin/delete_by_id/${id}`, { headers: getAuthHeader() });
}
export const deleteItemByName = (name) => {
    return axios.delete(`${BASE_URL}/admin/delete_by_name/${name}`, { headers: getAuthHeader() });
}
// favorite
export const addItemToFavorite =async (id) => {
    console.log("item id: " + id);
    return await axios.post(`${BASE_URL}/favorite/item/${id}`,null,{ headers: getAuthHeader() });
}

export const removeItemFromFavorite = (id) => {
    return axios.delete(`${BASE_URL}/favorite/item/${id}`,  { headers: getAuthHeader() });
}

export const getAllFavoriteItems = () => {
    return axios.get(`${BASE_URL}/favorite/item`, { headers: getAuthHeader() });
}
// order
export const addItemToOrder =  (id) => {
    return axios.post(`${BASE_URL}/order/${id}`, null, { headers: getAuthHeader() });
}
export const getAllOrderByEmail = (email) => {
    return axios.get(`${BASE_URL}/admin/order/${email}`, { headers: getAuthHeader() });
}
export const getAllOrders = () => {
    return axios.get(`${BASE_URL}/order`,{ headers: getAuthHeader() });
}
export const removeItemFromOredr = (id) => { 
    return axios.delete(`${BASE_URL}/order/item/${id}`, { headers: getAuthHeader() });
}
export const updateOrder = () => {
    return axios.put(`${BASE_URL}/order`,null, { headers: getAuthHeader() });
}
export const deleteOrderById = (id) => {
    return axios.delete(`${BASE_URL}/order/${id}` ,  { headers: getAuthHeader() })
}
// Keren's "active orders" inbox in Admin - orders already sent by a
// customer (RECEIVED/IN_PROGRESS) that still need her attention.
export const getActiveOrders = () => {
    return axios.get(`${BASE_URL}/admin/orders/active`, { headers: getAuthHeader() });
}
export const advanceOrderStatus = (orderId, status) => {
    return axios.put(`${BASE_URL}/admin/order/${orderId}/status?status=${status}`, null, { headers: getAuthHeader() });
}
// Bulk product import - see ItemImportService.java for the expected CSV
// columns (name, description, price, category, veg, image_url).
export const importItemsCsv = (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(`${BASE_URL}/admin/items/import`, formData, { headers: getAuthHeader() });
}