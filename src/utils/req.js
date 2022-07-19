import cleaner from './case';
import reqData from './wild';


export async function getUserDetails () {
    /* Get the details of the logged in user */
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

export async function saveNewMeeting (meeting) {
    /* Sends a new meeting to the backend */
    const data = await fetch(reqData.createMeetingUrl, {
        method: "POST",
        body: JSON.stringify(meeting),
        headers: {
            "Authorization": `Token ${reqData.authToken}`,
            "Content-Type": "application/json"
        }
    });

    return cleaner(await data.json());
}