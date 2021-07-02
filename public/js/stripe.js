import axios from 'axios';
import {showAlert} from './alerts';
const stripe = new Stripe('pk_test_51IyJkoSECSG4LAV6dXkfETURL9v9ljbo2YeWrYaaki3VmeRy3Q0D3foy63w3p5W7AA8qlaY0DYnChmgA9xJMQTs700k3ocurkb');

export const bookTour = async tourId => {
    try{
    // 1) Get checkout sessionfrom API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session)

    // 2) Create checkout session + charge credit card
    await stripe.redirectToCheckout({
        sessionId: session.data.session.id
    });
    }catch(err) {
        showAlert('error', err);
    }
}