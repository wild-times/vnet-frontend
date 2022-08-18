import cleaner from './case';
import { appItems} from "../index";


export async function getUserDetails () {
    /* Get the details of the logged in user */
    const res = await fetch(appItems.userDetailsUrl, {method: 'GET'});
    const resJ = await res.json();
    if (!resJ.username) {
        throw new Error('Couldn\'t fetch details')
    }
    return cleaner(resJ);
}


export async function saveNewMeeting (meeting, token) {
    /* Sends a new meeting to the backend */
    const data = await fetch(appItems.createMeetingUrl, {
        method: "POST",
        body: JSON.stringify(meeting),
        headers: {
            "Authorization": `Token ${token}`,
            "Content-Type": "application/json"
        }
    });

    return cleaner(await data.json());
}


export async function fetchMeetings () {
    const data = await fetch(appItems.getMeetingsUrl, {method: "GET"});
    const { meetings } = await data.json();
    return meetings.map(cleaner);
}


export async function fetchMeeting (meetingId) {
    /* Fetch a meeting from the backend */
    const data = await fetch(`${appItems.getMeetingsUrl}${meetingId}/`, {method: "GET"});
    return cleaner(await data.json());
}