import { BrowserRouter, Routes, Route } from 'react-router-dom';
import NotFound from '../pages/404';
import Login from '../pages/auth/login';
import Home from '../pages/home';
import { RequireUser, UserAuth } from '../utils/guards';


const BaseRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<RequireUser><Home /></RequireUser>} />
        <Route path='/login' element={<UserAuth><Login /></UserAuth>} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default BaseRouter;