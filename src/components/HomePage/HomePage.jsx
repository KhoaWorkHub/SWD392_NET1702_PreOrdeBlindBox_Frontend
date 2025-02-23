
export const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
    <h1 className="text-2xl font-bold mb-4">Welcome to POP MART</h1>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Add your homepage content here */}
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">New Arrivals</h2>
        <p>Check out our latest collections</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Popular Series</h2>
        <p>Discover fan favorites</p>
      </div>
      <div className="bg-gray-100 p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Limited Editions</h2>
        <p>Get them while they last</p>
      </div>
    </div>
  </div>
  )
}
