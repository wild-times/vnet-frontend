import cleaner from './case';
import reqData from './wild';


export async function getUserDetails () {
    const res = await fetch(reqData.userDetailUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${reqData.authToken}`
        }
    });
    const resJ = await res.json();

    if (resJ.hasOwnProperty('success') && !resJ.success) {
        throw new Error('Couldn\'t fetch details')
    }

    return cleaner(resJ.details);
}