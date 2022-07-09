import React from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';

import Title from './pages/home/Title';
import Error404 from './pages/home/Error404';
import Home from './pages/home/Home';
import CreateMeeting from './pages/meetingActions/CreateMeeting';


function App () {
    return (
        <div id="vnet-home">
            <BrowserRouter>
                <Title />
                <Routes>
                    <Route path='/' element={<Home />} />
                    <Route path='/new-meeting/' element={<CreateMeeting />}/>
                    <Route path='*' element={<Error404/>} />
                </Routes>
            </BrowserRouter>
        </div>
    )
}
export default App;