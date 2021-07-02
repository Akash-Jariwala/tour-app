import axios from 'axios';
import { showAlert } from './alerts';

export const updateSettings = async (data, type) => {
    try{
        const url = type === 'password' ? 'http://127.0.0.1:4000/api/v1/users/updateMyPassword' : 'http://127.0.0.1:4000/api/v1/users/updateMe';

        const res = await axios({
            method: 'PATCH',
            url,
            data
        });

        if(res.data.status === 'success' || res.data.status === 'Success') {
            showAlert('success', `${type.toUpperCase()} updated successfully`);
        }
    }catch (err){
        showAlert('error', err.response.data.message);
    }
};
