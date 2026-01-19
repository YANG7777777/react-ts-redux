import {Route, Routes} from 'react-router-dom';
import HomePage from '../pages/Home/index.tsx'

const AppRoutes = () => (
    <Routes>
        <Route path="/home" element={<HomePage />} />
    </Routes>
);

export default AppRoutes;
