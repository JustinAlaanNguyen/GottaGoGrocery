import React, { useState, useEffect, useRef } from "react";
import { Box } from "@chakra-ui/react";
import { motion, AnimatePresence } from "framer-motion";

const MotionBox = motion(Box);

const PhoneVideoPlayer: React.FC = () => {
  const videos = ["/video1.mp4", "/video2.mp4", "/video3.mp4", "/video4.mp4"];
  const [currentVideo, setCurrentVideo] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Handle video end → fade → next video
  const handleVideoEnd = () => {
    setIsFading(true); // start fade to white
    setTimeout(() => {
      setCurrentVideo((prev) => (prev + 1) % videos.length); // next video
      setIsFading(false); // fade back in
    }, 1000); // fade duration
  };

  // Restart video playback when currentVideo changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
    }
  }, [currentVideo]);

  return (
    <Box
      position="relative"
      w="100%"
      h="100%"
      bg="black" // phone background
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      {/* 🟦 Top "bezel" */}
      <Box w="100%" h="120px" bg="black" flexShrink={0} />

      {/* 🎥 Active Video */}
      <Box flex="1" w="100%" position="relative">
        <video
          key={currentVideo}
          ref={videoRef}
          src={videos[currentVideo]}
          autoPlay
          playsInline
          muted
          onEnded={handleVideoEnd}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain", // keeps full video visible
            transform: "scale(0.89)", // zoom out a bit
            backgroundColor: "black",
          }}
        />
      </Box>

      {/* 🟦 Bottom "bezel" */}
      <Box w="100%" h="40px" bg="black" flexShrink={0} />

      {/* ⚪ Fade Overlay */}
      <AnimatePresence>
        {isFading && (
          <MotionBox
            position="absolute"
            top={0}
            left={0}
            w="100%"
            h="100%"
            bg="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            zIndex={10}
          />
        )}
      </AnimatePresence>
    </Box>
  );
};

export default PhoneVideoPlayer;
