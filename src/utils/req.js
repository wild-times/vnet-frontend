import cleaner from './case';
import reqData from './wild';


export async function getUserDetailsWithCreds (username, password) {
    /* Temporary handling of user requests */
    const res = await fetch(reqData.userLogin, {
        method: 'POST',
        body: JSON.stringify({username, password}),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const resJ = await res.json();

    if (resJ.hasOwnProperty('success') && !resJ.success) {
        throw new Error('Couldn\'t fetch details')
    }

    return cleaner(resJ);
}


export async function getUserDetails (token) {
    /* Get the details of the logged in user */
    const res = await fetch(reqData.userDetailUrl, {
        method: 'GET',
        headers: {
            'Authorization': `Token ${token}`
        }
    });
    const resJ = await res.json();

    if (resJ.hasOwnProperty('success') && !resJ.success) {
        throw new Error('Couldn\'t fetch details')
    }

    return cleaner(resJ);
}


export async function saveNewMeeting (meeting, token) {
    /* Sends a new meeting to the backend */
    const data = await fetch(reqData.createMeetingUrl, {
        method: "POST",
        body: JSON.stringify(meeting),
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        }
    });

    return cleaner(await data.json());
}


export async function fetchMeetings (token) {
    const data = await fetch(reqData.getMeetingsUrl, {
        method: "GET",
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    const { meetings } = await data.json();
    return meetings.map(cleaner);
}


export async function fetchMeeting (meetingId, token) {
    /* Fetch a meeting from the backend */
    const data = await fetch(`${reqData.getMeetingsUrl}${meetingId}/`, {
        method: "GET",
        headers: {
            "Authorization": `Token ${token}`
        }
    });

    return cleaner(await data.json());
}