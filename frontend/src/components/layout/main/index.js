import Navbar from "../navbar";

function MainLayout(props) {
  return (
    <>
      <Navbar />
      <div className="main-layout">{props.children}</div>
    </>
  );
}

MainLayout.propTypes = {};

export default MainLayout;
