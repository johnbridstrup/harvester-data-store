import "./styles.css";

function NotFound() {
  return (
    <div className="not-found">
      <div>
        <h2 className="display-4">404 Not Found</h2>
        <p>
          Looks like you found a glitch in the matrix.{" "}
          <a href="/">Go Back Home</a>
        </p>
      </div>
    </div>
  );
}

export default NotFound;
