import { useEffect, useState } from 'react';
import { Card, Row, Col, Input, Button, Select, Skeleton, Empty, Pagination, Breadcrumb, Divider, Tag } from 'antd';
import { SearchOutlined, FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, HomeOutlined } from '@ant-design/icons';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useBlindbox from '../../hooks/useBlindbox';

const { Option } = Select;

/**
 * BlindboxPage component for displaying the full blind box catalog
 * 
 * @returns {JSX.Element} The BlindboxPage component
 */
const BlindboxPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Get query params
  const initialParams = {
    seriesName: searchParams.get('seriesName') || '',
    sort: searchParams.get('sort') || 'id,desc', // Use id instead of createdDate
    page: parseInt(searchParams.get('page') || '0'),
    size: parseInt(searchParams.get('size') || '12'),
  };
  
  const [filters, setFilters] = useState({
    search: initialParams.seriesName,
    sortField: initialParams.sort.split(',')[0],
    sortDirection: initialParams.sort.split(',')[1],
  });
  
  const [filtersVisible, setFiltersVisible] = useState(false);
  
  // Use our custom hook to fetch and manage blindbox data
  const { 
    blindboxData, 
    pagination, 
    loading, 
    error,
    changePage,
    changePageSize,
    changeSort,
    searchByName,
    refetch,
  } = useBlindbox(initialParams);

  // Update URL when params change
  useEffect(() => {
    const newParams = new URLSearchParams();
    
    if (filters.search) newParams.set('seriesName', filters.search);
    newParams.set('sort', `${filters.sortField},${filters.sortDirection}`);
    newParams.set('page', pagination.current - 1);
    newParams.set('size', pagination.pageSize);
    
    setSearchParams(newParams);
  }, [filters, pagination, setSearchParams]);

  const handleSearch = () => {
    searchByName(filters.search);
  };

  const handleSortChange = (value) => {
    const [field, direction] = value.split(',');
    setFilters({
      ...filters,
      sortField: field,
      sortDirection: direction,
    });
    changeSort(field, direction);
  };

  const handleViewDetails = (id) => {
    navigate(`/blindbox/${id}`);
  };

  const toggleFilters = () => {
    setFiltersVisible(!filtersVisible);
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      sortField: 'id',
      sortDirection: 'desc',
    });
    
    // Reset search parameters and refetch data
    const resetParams = {
      page: 0,
      size: pagination.pageSize,
      sort: 'id,desc',
    };
    
    searchByName('');
    changeSort('id', 'desc');
    changePage(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <Breadcrumb.Item>
          <Link to="/">
            <HomeOutlined /> Home
          </Link>
        </Breadcrumb.Item>
        <Breadcrumb.Item>All Blind Boxes</Breadcrumb.Item>
      </Breadcrumb>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">All Blind Boxes</h1>
          <p className="text-gray-500 mt-1">
            Discover our collection of unique blind box series
          </p>
        </div>
        
        {/* Mobile filter toggle */}
        <Button 
          type="default"
          icon={<FilterOutlined />}
          onClick={toggleFilters}
          className="mt-4 md:hidden"
        >
          Filters
        </Button>
      </div>
      
      {/* Search and Filter Bar */}
      <div className={`transition-all duration-300 overflow-hidden mb-6 ${filtersVisible || window.innerWidth >= 768 ? 'max-h-80' : 'max-h-0 md:max-h-80'}`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Input */}
            <div className="flex-1">
              <Input
                placeholder="Search blind boxes"
                prefix={<SearchOutlined className="text-gray-400" />}
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                onPressEnter={handleSearch}
                allowClear
                className="w-full"
              />
            </div>
            
            {/* Sort Dropdown */}
            <div className="min-w-[200px]">
              <Select
                placeholder="Sort by"
                value={`${filters.sortField},${filters.sortDirection}`}
                onChange={handleSortChange}
                className="w-full"
              >
                <Option value="id,desc">Newest First</Option>
                <Option value="id,asc">Oldest First</Option>
                <Option value="seriesName,asc">Name (A-Z)</Option>
                <Option value="seriesName,desc">Name (Z-A)</Option>
                <Option value="boxPrice,asc">Price (Low to High)</Option>
                <Option value="boxPrice,desc">Price (High to Low)</Option>
              </Select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                type="primary" 
                onClick={handleSearch}
                icon={<SearchOutlined />}
                className="bg-black hover:bg-gray-800"
              >
                Search
              </Button>
              <Button onClick={clearFilters}>Clear</Button>
            </div>
          </div>
          
          {/* Active filters */}
          {(filters.search || filters.sortField !== 'createdDate' || filters.sortDirection !== 'desc') && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="text-gray-500">Active filters:</span>
              {filters.search && (
                <Tag closable onClose={() => setFilters({ ...filters, search: '' })}>
                  Search: {filters.search}
                </Tag>
              )}
                              <Tag closable onClose={() => handleSortChange('id,desc')}>
                Sort: {filters.sortField === 'id' ? 'ID' : 
                       filters.sortField === 'seriesName' ? 'Name' : 
                       filters.sortField === 'boxPrice' ? 'Price' : filters.sortField}
                {' '}
                {filters.sortDirection === 'asc' ? <SortAscendingOutlined /> : <SortDescendingOutlined />}
              </Tag>
            </div>
          )}
        </div>
      </div>
      
      {/* Results count & Pagination settings */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <p className="text-gray-500">
          Showing {blindboxData.length > 0 ? (pagination.current - 1) * pagination.pageSize + 1 : 0}-
          {Math.min(pagination.current * pagination.pageSize, pagination.total)} of {pagination.total} items
        </p>
        
        <div className="flex items-center mt-4 md:mt-0">
          <span className="mr-2 text-gray-500">Show:</span>
          <Select
            value={pagination.pageSize.toString()}
            onChange={(value) => changePageSize(parseInt(value))}
            className="w-20"
          >
            <Option value="12">12</Option>
            <Option value="24">24</Option>
            <Option value="48">48</Option>
          </Select>
        </div>
      </div>
      
      {/* Error display */}
      {error && (
          <Button 
            type="link" 
            onClick={() => refetch()}
          >
          </Button>
      )}
      
      {/* Blindbox Grid */}
      {loading ? (
        <Row gutter={[24, 24]}>
          {[...Array(pagination.pageSize)].map((_, index) => (
            <Col xs={24} sm={12} md={8} lg={6} key={`skeleton-${index}`}>
              <Card className="h-full">
                <Skeleton active avatar paragraph={{ rows: 2 }} />
              </Card>
            </Col>
          ))}
        </Row>
      ) : blindboxData.length > 0 ? (
        <>
          <Row gutter={[24, 24]}>
            {blindboxData.map((blindbox) => (
              <Col xs={24} sm={12} md={8} lg={6} key={blindbox.id}>
                <Card 
                  hoverable
                  cover={
                    <div className="p-4 bg-gray-50 h-64 flex items-center justify-center">
                      <img 
                        alt={blindbox.seriesName} 
                        src={blindbox.thumbnailUrl || "https://placehold.co/300x300"}
                        className="h-full object-contain"
                      />
                    </div>
                  }
                  bodyStyle={{ padding: "12px" }}
                  bordered={false}
                  className="shadow-sm hover:shadow-md transition-shadow h-full"
                  onClick={() => handleViewDetails(blindbox.id)}
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {new Date(blindbox.releaseDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm font-medium mb-2 line-clamp-2 h-10">
                    {blindbox.seriesName}
                  </div>
                  {blindbox.stock <= 5 && blindbox.stock > 0 && (
                    <div className="text-orange-500 text-xs mb-1">
                      Only {blindbox.stock} left in stock!
                    </div>
                  )}
                  {blindbox.stock === 0 && (
                    <div className="text-red-500 text-xs mb-1">
                      Out of stock
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      {blindbox.packagePrice?.toLocaleString()} ₫
                    </div>
                    <Button 
                      type="text" 
                      shape="circle"
                      icon={<img src="https://placehold.co/16x16" alt="Wishlist" className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add wishlist functionality here
                      }}
                    />
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
          
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <Pagination
                current={pagination.current}
                total={pagination.total}
                pageSize={pagination.pageSize}
                onChange={(page) => changePage(page - 1)} // Convert one-based to zero-based
                showQuickJumper
                showSizeChanger={false}
              />
            </div>
          )}
        </>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <Empty 
            description={
              <span>
                No blind boxes found
                {filters.search && (
                  <span> matching "<strong>{filters.search}</strong>"</span>
                )}
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
          {(filters.search || filters.sortField !== 'createdDate' || filters.sortDirection !== 'desc') && (
            <Button 
              onClick={clearFilters}
              className="mt-4"
            >
              Clear filters and try again
            </Button>
          )}
        </div>
      )}
      
      {/* Additional information */}
      <Divider className="my-12" />
      
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">About Our Blind Boxes</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Premium Quality</h3>
            <p className="text-gray-600">Each blind box is crafted with the highest quality materials and attention to detail.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Limited Editions</h3>
            <p className="text-gray-600">Many of our series are produced in limited quantities, making them collectible and valuable.</p>
          </div>
          <div className="bg-gray-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Artist Collaborations</h3>
            <p className="text-gray-600">We partner with renowned artists and designers to create unique and distinctive series.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlindboxPage;