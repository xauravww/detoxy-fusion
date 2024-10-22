import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { webSocketContext } from "../context/Websocket";
import { sidebarContext } from "../context/Sidebar";
import imgNotFound from "/assets/img_not_found.jpg";

const Pin = ({ pin }) => {
  const navigate = useNavigate();
  const { input, setInput } = useContext(webSocketContext);
  const { setIsOpen } = useContext(sidebarContext);
  const [imageSrc, setImageSrc] = useState(pin?.url || imgNotFound); // State for image source
  const whiteColorFilter =
    "invert(100%) sepia(0%) saturate(7498%) hue-rotate(316deg) brightness(107%) contrast(106%)";

  useEffect(() => {
    const img = new Image();
    img.src = pin?.url || ""; // Image URL to check
    img.onload = () => setImageSrc(pin.url); // If valid, use the image URL
    img.onerror = () => setImageSrc(imgNotFound); // If invalid, use the fallback image
  }, [pin.url]);

  const handleDownload = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(pin.url, { mode: "cors" });
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          `${pin.prompt.substring(0, 40)}.webp` || "download.webp";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download image:", response.statusText);
      }
    } catch (error) {
      console.error("Error downloading the image:", error);
    }
  };

  const handleShuffle = (e) => {
    e.preventDefault();
    setInput(`/gen ${pin.prompt}`);
    setIsOpen(true);
    navigate("/chats");
  };

  return (
    <div className="relative group mx-1 my-2">
      <img
        src={imageSrc}
        alt={`Pin ${pin?.id}`}
        className="pin-image w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black bg-opacity-50">
        <div className="flex flex-col items-center space-y-2">
          <div onClick={handleDownload} className="text-white cursor-pointer">
            <img
              src="/assets/download.svg"
              alt="Download"
              className="w-10 h-10"
              style={{ filter: whiteColorFilter }}
            />
          </div>
          <div onClick={handleShuffle} className="text-white cursor-pointer">
            <img
              src="/assets/shuffle.svg"
              alt="Shuffle"
              className="w-10 h-10"
              style={{ filter: whiteColorFilter }}
            />
          </div>
          <div className="flex flex-col">
            <div className="flex flex-col justify-center items-center">
              <img
                src={pin?.user?.profilePicture || "/assets/anonymous.svg"}
                alt="Made by"
                className="w-12 h-12 rounded-full border-2 border-white cursor-pointer"
                onClick={() => {
                  console.log(JSON.stringify(pin));
                  navigate(`/${pin?.username}`);
                }}
              />
              <p className="text-white ml-2">{pin?.createdAt.split("T")[0]}</p>{" "}
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pin;
