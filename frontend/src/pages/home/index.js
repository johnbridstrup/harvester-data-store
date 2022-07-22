import LogoFull from '../../assets/images/logo_full.png';
import './styles.css';

function Home(props) {
  return (
    <div className='container home'>
      <div className="logo-container">
        <img src={LogoFull} alt="logo_full" className="logo-full" />
      </div>
      <div>Example Home Page</div>
    </div>
  )
}


Home.propTypes = {};

export default Home;
