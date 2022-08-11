import { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useQuery } from "react-query";

import Title from './pages/home/Title';
import Error404 from './pages/home/Error404';
import Home from './pages/home/Home';
import CreateMeeting from './pages/meetingActions/CreateMeeting';
import Meeting from './pages/meeting/Meeting';
import LoadingScreen from "./pages/home/LoadingScreen";
import { getUserDetails, getUserDetailsWithCreds } from './utils/req';


function App (props) {
    const { token: userToken } = props;
    const { status, data } = useQuery('user', () => getUserDetails(userToken), {
        refetchOnWindowFocus: false
    });

    const displayDiv = (() => {
        if (status === 'loading') {
            return <LoadingScreen message='Getting user details' />;
        } else if (status === 'error') {
            return <h1 className="center-mix">An error occurred fetching user details</h1>;
        }
    })();

    if (displayDiv) {
        return (
            <BrowserRouter id='vnet-home'>
                <Title/>
                { displayDiv }
            </BrowserRouter>
        )
    }

    return (
        <div id="vnet-home">
            <BrowserRouter>
                <Title user={data} />
                <Routes>
                    <Route path='/' element={<Home token={userToken} />} />
                    <Route path='/new-meeting/' element={<CreateMeeting token={userToken} />}/>
                    <Route path='/conf/:meetingCode/' element={<Meeting token={userToken} />}/>
                    <Route path='*' element={<Error404/>} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}


export default function DevApp () {
    /* Handle user authentication in development */
    const [token, setToken] = useState(null);

    const loginEvent = (event_) => {
        event_.preventDefault();
        const f = new FormData(event_.target);
        getUserDetailsWithCreds(f.get('username'), f.get('password')).then((data) => {
            setToken(data['details']['authToken']);
        }).catch(e => console.error(e, "NOT THROUGH"));
    };

    if (token) {
        return <App token={token} />
    }
    return (
        <div>
            <form onSubmit={loginEvent}>
                <h2>You need to login first</h2>

                <div>
                    <label htmlFor="us">Enter username</label>
                    <input type="text" name='username' id='us' required={true}/>
                </div>

                <div>
                    <label htmlFor="pwd">Enter password</label>
                    <input type="password" name='password' id='pwd' required={true}/>
                </div>

                <input type="submit" value='login'/>
            </form>
        </div>
    )
}