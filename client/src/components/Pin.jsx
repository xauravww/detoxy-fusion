
const Pin = ({ pin }) => {

  return (
    <div className="relative group mx-1 my-2">
      <img
        src={pin.url}
        alt={`Pin ${pin.id}`}
        className="pin-image w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black bg-opacity-50">
        <div className="flex flex-col space-y-4">
          <a href="#" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* Download icon SVG */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
          </a>
          <a href="#" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* Share icon SVG */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 12l2 2 4-4 4 4 2-2" />
            </svg>
          </a>
          <a href="#" className="text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {/* View More icon SVG */}
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.5 4.5M15 14l4.5-4.5M4 6h16M4 10h16" />
            </svg>
          </a>
          <a href="#" className="absolute bottom-2 right-2">
            <img
              src={pin.user.profilePicture || "/assets/anonymous.svg"}
              alt="Made by"
              className="w-12 h-12 rounded-full border-2 border-white"
            />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Pin;
