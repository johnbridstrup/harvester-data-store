import Navbar from "../navbar";

function MainLayout(props) {
  return (
    <>
      <Navbar />
      {props.children}
    </>
  );
}

MainLayout.propTypes = {};

export default MainLayout;
