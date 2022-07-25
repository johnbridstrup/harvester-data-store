import { Link } from 'react-router-dom';
import MainLayout from '../../components/layout/main';
import './styles.css';

function Home(props) {
  return (
    <MainLayout>
      <div className='container'>
        <div className='welcome-brand'>
          <h2>Welcome to HDS</h2>
        </div>
        <div>
          <Link to={"/errorreports"} className="btn btn-md btn-primary">Error Reports</Link>
        </div>
      </div>
    </MainLayout>
  )
}


Home.propTypes = {};

export default Home;
