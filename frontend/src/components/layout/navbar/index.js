import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import Logo from '../../../assets/images/advanced_farm_logo_alpha.png';
import { logout } from '../../../features/auth/authSlice';


function Navbar(props) {
  const { user, isAuthenticated, token } = useSelector(state => state.auth);
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const res = await dispatch(logout({token}))
    if (res.type === "auth/logout/fulfilled") {
      // window.location.reload()
      console.log("user logged out")
    }
  }
  return (
    <nav className="navbar bg-light">
      <div className="container">
        <div className='navbar-brand'>
          <a className="" href="/">
            <img src={Logo} alt="logo" width="30" height="24" />
          </a>
          <Link to="/admin" className="admin-route">Admin</Link>
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
