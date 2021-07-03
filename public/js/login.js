import axios from 'axios';
import {showAlert} from './alerts';

export const login = async (email, password) => {

   try{
        const res = await axios({           //refer for axios: https://www.npmjs.com/package/axios
            method: 'POST',
            url: '/api/v1/users/login',
            data: {
                email,
                password
            }
        });
        // const resStatus = JSON.stringify(res.data.status);
        // console.log(res.data.status);
        if(res.data.status === 'Success'){
            // console.log('You logged in successfully!! ');
            showAlert('success', 'Logged in successfully!');

            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        showAlert('success', 'Logged in successfully!');

            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
   }catch(err){
       console.log(err.response.data.message)
       showAlert('error', err.response.data.message);
   }
};

export const logout = async () => {
    try{
        const res = await axios({
            method: 'GET',
            url: '/api/v1/users/logout'
        });
        // to reload the page
        if(res.data.status === 'success') location.reload(true);
        
    } catch(err) {
        showAlert('error', 'Error logging out! Try again.');
    };
};
