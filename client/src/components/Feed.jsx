import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import MasonryLayout from "./MasonryLayout";
import { sidebarContext } from "../context/Sidebar";
import HamsterLoader from './Loader/HamsterLoader';

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
    <div className="fixed top-[13vh] lg:top-[12vh] left-0 w-full h-[calc(100vh-13vh)] lg:h-[calc(100vh-12vh)] bg-gradient-to-r from-gray-800 via-gray-900 to-black overflow-hidden z-40 flex flex-col">
      {/* <h1 className="text-3xl font-bold mb-6">Feed</h1> */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center items-center flex-grow text-white"><HamsterLoader /></div>
        ) : (
          <MasonryLayout pins={pins} />
        )}
      </div>
    </div>
  );
}

export default Feed;
