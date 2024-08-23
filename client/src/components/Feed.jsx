import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import MasonryLayout from "./MasonryLayout";
import { sidebarContext } from "../context/Sidebar";

const Feed = () => {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const {setIsLastScreenClosed  } =
    useContext(sidebarContext);

  useEffect(() => {
    // Fetch data from the backend
    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/posts`)
      .then((response) => {
        setPins(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching pins:", error);
        setLoading(false); // Set loading to false even if there's an error
      });
      setIsLastScreenClosed(false)
  }, []);

  return (
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white p-4 min-h-screen h-[calc(100vh-11vh)] md:h-[calc(100vh-11vh)] lg:h-[calc(100vh-10vh)] overflow-y-scroll">
      {/* <h1 className="text-3xl font-bold mb-6">Feed</h1> */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Render skeletons while loading */}
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-700 h-64 w-full rounded-md mb-4"></div>
              <div className="bg-gray-700 h-4 w-3/4 rounded-md mb-2"></div>
              <div className="bg-gray-700 h-4 w-1/2 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : (
        <MasonryLayout pins={pins} />
      )}
    </div>
  );
}

export default Feed;
