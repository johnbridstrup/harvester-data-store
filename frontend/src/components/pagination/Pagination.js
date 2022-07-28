import { useState } from 'react';
import { InputLimit, PageItem, SpanLimit } from '../styled';

function Pagination(props) {
  const [limit, setLimit] = useState(20);
  const handleLimitChange = e => setLimit(e.target.value);
  return (
    <div>
      <section className="d-flex justify-content-center align-items-center">
        <nav aria-label="Page navigation example">
          <ul className="pagination mb-0">
            <li className="page-item">
              <a className="page-link disabled" href="#!" aria-label="Previous">
                <span aria-hidden="true">Previous</span>
              </a>
            </li>
            <li className="page-item">
              <a className="page-link" href="#!" aria-label="Next">
                <span aria-hidden="true">Next</span>
              </a>
            </li>
            <PageItem>
              <SpanLimit>Limit</SpanLimit>
              <InputLimit type="number" value={limit} onChange={handleLimitChange} />
            </PageItem>
          </ul>
        </nav>
      </section>
    </div>
  )
}




Pagination.propTypes = {};

export default Pagination;
