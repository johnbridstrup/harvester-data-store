import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/auth/login';
import Home from '../pages/home';


const BaseRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default BaseRouter;