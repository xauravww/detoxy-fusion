
import Masonry from 'react-masonry-css'; // Ensure correct import
import Pin from "./Pin";

const breakpointColumnsObj = {
  default: 4,
  3000: 6,
  2000: 5,
  1200: 3,
  1000: 2,
  500: 1
};

const MasonryLayout = ({ pins }) => {
  return (
    <div className="masonry-container">
      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="flex animate-slide-fwd"
        columnClassName="my-masonry-grid_column"
      >
        {pins.map((pin) => (
       <Pin key={pin._id} pin={pin} />
        ))}
      </Masonry>
    </div>
  );
};

export default MasonryLayout;
