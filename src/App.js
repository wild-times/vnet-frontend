import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useQuery } from "react-query";
import Title from './pages/home/Title';
import Error404 from './pages/home/Error404';
import Home from './pages/home/Home';
import CreateMeeting from './pages/meetingActions/CreateMeeting';
import Meeting from './pages/meeting/Meeting';
import LoadingScreen from "./pages/home/LoadingScreen";
import { getUserDetails } from './utils/req';


export default function App () {
    const { status, data } = useQuery('user', () => getUserDetails(), {
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
            <BrowserRouter basename='/meet/'>
                <Title user={data} />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/new-meeting/' element={<CreateMeeting token={data['authToken']} />}/>
                    <Route path='/conf/:meetingCode/' element={<Meeting />}/>
                    <Route path='*' element={<Error404/>} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}