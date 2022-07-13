import { Routes, Route, BrowserRouter } from 'react-router-dom';
import { useQuery } from "react-query";

import Title from './pages/home/Title';
import Error404 from './pages/home/Error404';
import Home from './pages/home/Home';
import CreateMeeting from './pages/meetingActions/CreateMeeting';
import Meeting from './pages/meeting/Meeting';
import { getUserDetails } from './utils/req';


function App () {
    const { status } = useQuery('user', getUserDetails);

    // to be replaced with better pages for loading...etc
    if (status === 'loading') {
        return <div id="vnet-home">working</div>
    } else if (status === 'error') {
        return <div id="vnet-home">An error occured</div>
    }

    return (
        <div id="vnet-home">
            <BrowserRouter>
                <Title />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/new-meeting/' element={<CreateMeeting />}/>
                    <Route path='/conf/:meetingCode/' element={<Meeting />}/>
                    <Route path='*' element={<Error404/>} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}
export default App;