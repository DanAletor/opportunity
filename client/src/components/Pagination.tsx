interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const handlePrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (page !== currentPage) {
      onPageChange(page);
    }
  };

  const renderPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <li key={i} className={`page-item ${i === currentPage ? 'active' : ''}`}>
          <a className="page-link" href="#" onClick={handlePageClick(i)}>
            {i}
          </a>
        </li>
      );
    }
    return pages;
  };

  return (
    <div className="pagination-container">
      <nav aria-label="Opportunities pagination">
        <ul className="pagination">
          <li className="page-item">
            <a 
              className="page-link" 
              href="#" 
              aria-label="Previous"
              onClick={handlePrevious}
            >
              <i className="fas fa-chevron-left"></i>
            </a>
          </li>
          {renderPageNumbers()}
          <li className="page-item">
            <a 
              className="page-link" 
              href="#" 
              aria-label="Next"
              onClick={handleNext}
            >
              <i className="fas fa-chevron-right"></i>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
