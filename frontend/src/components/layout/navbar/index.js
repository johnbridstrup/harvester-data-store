import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/images/advanced_farm_logo_alpha.png';
import { logout } from '../../../features/auth/authSlice';


function Navbar(props) {
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const adminUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:8085/admin"

  const handleLogout = async () => {
    const res = await dispatch(logout({token}))
    if (res.type === "auth/logout/fulfilled") {
      window.location.reload();
    }
  }
  return (
    <nav className="navbar bg-light">
      <div className="container">
        <div className='navbar-brand'>
          <a className="" href="/">
            <img src={Logo} alt="logo" width="30" height="24" />
          </a>
          <a href={adminUrl} target="_blank" rel='noreferrer' className="admin-route">Admin</a>
        </div>
        <div>
          { user && user.username && <span className='username'>{user.username}</span> }
          { isAuthenticated ? <button onClick={handleLogout} className='btn btn-sm btn-warning'>Logout</button> : <Link to="/login" className='btn btn-sm btn-warning'>Login</Link> }
        </div>
      </div>
    </nav>
  )
}

Navbar.propTypes = {};

export default Navbar;
