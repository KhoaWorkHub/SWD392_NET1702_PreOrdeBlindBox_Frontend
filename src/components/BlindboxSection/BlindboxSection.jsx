import { useState } from 'react';
import { Skeleton, Empty, Pagination } from 'antd';
import { RightOutlined, SearchOutlined } from '@ant-design/icons';
import useBlindbox from '../../hooks/useBlindbox';
import { useNavigate } from 'react-router-dom';
import './BlindboxSection.css'; // Import custom CSS

/**
 * BlindboxSection component for displaying blind boxes on the homepage
 * 
 * @returns {JSX.Element} The BlindboxSection component
 */
const BlindboxSection = () => {
  const navigate = useNavigate();
  const [searchValue, setSearchValue] = useState('');
  
  const { 
    blindboxData, 
    pagination, 
    loading, 
    error,
    changePage,
    searchByName,
    refetch,
  } = useBlindbox({
    size: 4, // Show 8 items per page on homepage
    sort: 'id,desc' // Sort by ID descending
  });

  const handleSearch = (e) => {
    e.preventDefault();
    searchByName(searchValue);
  };

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch(e);
    }
  };

  const handleViewDetails = (id) => {
    console.log("Navigating to details for box ID:", id);
    navigate(`/blindbox/${id}`);
  };

  const handleViewAllBlindboxes = () => {
    navigate('/blindbox');
  };

  return (
    <section className="blindbox-section">
      <div className="blindbox-container">
        {/* Section Header */}
        <div className="section-header">
          <div>
            <h2 className="section-title">All Blind Boxes</h2>
            <p className="section-subtitle">Discover our latest and most popular blind box collections</p>
          </div>
          
          <div className="search-container">
            <div className="search-box">
              <input
                type="text"
                className="search-input"
                placeholder="Search blind boxes"
                value={searchValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
              />
              <button className="search-button" onClick={handleSearch}>
                <SearchOutlined />
              </button>
            </div>
        
          </div>
        </div>

        {/* Divider with View All option */}
        <div className="divider-container">
          <div className="divider"></div>
          <button className="view-all-button" onClick={handleViewAllBlindboxes}>
            View All <RightOutlined className="view-all-icon" />
          </button>
        </div>

        {/* Error State */}
        {error && (
          <div className="error-state">
            <p className="error-message">{error}</p>
            <button className="error-button" onClick={() => refetch()}>Try Again</button>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="blindbox-grid">
            {[...Array(4)].map((_, index) => (
              <div key={`skeleton-${index}`} className="blindbox-card">
                <Skeleton active paragraph={{ rows: 3 }} />
              </div>
            ))}
          </div>
        ) : blindboxData && blindboxData.length > 0 ? (
          <>
            <div className="blindbox-grid">
              {blindboxData.map((blindbox) => (
                <div 
                  key={blindbox.id} 
                  className="blindbox-card" 
                  onClick={() => handleViewDetails(blindbox.id)}
                >
                  <div className="blindbox-image-container">
                    <img 
                      className="blindbox-image"
                      alt={blindbox.seriesName} 
                      src={
                        blindbox.seriesImageUrls && blindbox.seriesImageUrls.length > 0 
                          ? blindbox.seriesImageUrls[0] 
                          : "https://placehold.co/300x300"
                      }
                    />
                  </div>
                  <div className="blindbox-content">
                    <div className="blindbox-id">Series ID: {blindbox.id}</div>
                    <h3 className="blindbox-name">{blindbox.seriesName}</h3>
                    <div className="blindbox-price">
                      {Number(blindbox.boxPrice).toLocaleString()} ₫
                    </div>
                    {blindbox.active && <span className="badge badge-instock">In Stock</span>}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="pagination-container">
                <Pagination
                  current={pagination.current}
                  total={pagination.total}
                  pageSize={pagination.pageSize}
                  onChange={(page) => changePage(page)}
                  showSizeChanger={false}
                />
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <Empty 
              description={
                <div>
                  <h3 className="empty-title">No blind boxes found</h3>
                  <p className="empty-message">
                    {blindboxData === null 
                      ? "We couldn't retrieve your blind boxes. Please try again." 
                      : "No blind boxes match your current search. Try different keywords or browse our categories."}
                  </p>
                </div>
              }
            />
            <button className="refresh-button" onClick={() => refetch()}>
              Refresh
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlindboxSection;