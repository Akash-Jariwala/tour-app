import axios from 'axios'
import { showAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {

   try{
        const res = await axios({           //refer for axios: https://www.npmjs.com/package/axios
            method: 'POST',
            url: '/api/v1/users/signup',
            data: {
                name,
                email,
                password,
                passwordConfirm
            }
        });
        // const resStatus = JSON.stringify(res.data.status);
        // console.log(res.data.status);        
        if(res.data.status === 'Success'){
            // console.log('You signed up successfully!! ');
            showAlert('success', 'Signed Up successfully!');

            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
        }
        showAlert('success', 'Signed up successfully!');

            window.setTimeout(() => {
                location.assign('/');
            }, 1500);
   }catch(err){
       console.log(err.response.data.message)
       showAlert('error', err.response.data.message);
   }
};