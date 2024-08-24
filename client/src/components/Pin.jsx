import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { webSocketContext } from '../context/Websocket';
import { sidebarContext } from '../context/Sidebar';

const Pin = ({ pin }) => {
  const navigate = useNavigate();
  const {input, setInput} = useContext(webSocketContext)
  const {setIsOpen} = useContext(sidebarContext)
  const whiteColorFilter =
    "invert(100%) sepia(0%) saturate(7498%) hue-rotate(316deg) brightness(107%) contrast(106%)";

  const handleDownload = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(pin.url, {
        mode: 'cors',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${pin.prompt.substring(0, 40)}.webp` || 'download.webp';
        document.body.appendChild(link);
        link.click();

        // Clean up
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        console.error('Failed to download image:', response.statusText);
      }
    } catch (error) {
      console.error('Error downloading the image:', error);
    }
  };

  const handleShuffle = (e) => {
    e.preventDefault();
    setInput(`/imagine ${pin.prompt}`)
    setIsOpen(true)
    navigate('/chats');
  };

  return (
    <div className="relative group mx-1 my-2">
      <img
        src={pin.url}
        alt={`Pin ${pin.id}`}
        className="pin-image w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-black bg-opacity-50">
        <div className="flex flex-col space-y-4">
          <div onClick={handleDownload} className="text-white cursor-pointer">
            <img src="/assets/download.svg" alt="Download" className="w-10 h-10" style={{ filter: whiteColorFilter }} />
          </div>
          <div onClick={handleShuffle} className="text-white cursor-pointer">
            <img src="/assets/shuffle.svg" alt="Shuffle" className="w-10 h-10" style={{ filter: whiteColorFilter }} />
          </div>
          <div className="absolute bottom-2 right-2" onClick={()=>{
            console.log(JSON.stringify(pin))
            navigate(`/${pin.username}`)
          }}>
            <img
              src={pin.user.profilePicture || "/assets/anonymous.svg"}
              alt="Made by"
              className="w-12 h-12 rounded-full border-2 border-white cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pin;
