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
    <div className="bg-gradient-to-r from-gray-800 via-gray-900 to-black text-white p-4 min-h-[calc(100vh-13vh)] md:min-h-[calc(100vh-13vh)] lg:min-h-[calc(100vh-12vh)] overflow-y-auto">
      {/* <h1 className="text-3xl font-bold mb-6">Feed</h1> */}
      {loading ? (
        <div className="flex justify-center items-center h-screen">
          <HamsterLoader />
        </div>
      ) : (
        <MasonryLayout pins={pins} />
      )}
    </div>
  );
}

export default Feed;
