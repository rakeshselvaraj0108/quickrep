'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface InteractiveCardProps {
  title: string;
  description: string;
  icon: string;
  children?: React.ReactNode;
  hover?: boolean;
}

const InteractiveCard: React.FC<InteractiveCardProps> = ({
  title,
  description,
  icon,
  children,
  hover = true,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      className="interactive-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={hover ? { y: -8, scale: 1.02 } : {}}
      transition={{ duration: 0.3 }}
    >
      <div className="card-glow"></div>
      
      <div className="card-header">
        <motion.div
          className="card-icon"
          animate={isHovered && hover ? { scale: 1.2, rotate: 5 } : { scale: 1, rotate: 0 }}
          transition={{ duration: 0.3 }}
        >
          {icon}
        </motion.div>
        <h3 className="card-title">{title}</h3>
      </div>

      <p className="card-description">{description}</p>

      {children && <div className="card-content">{children}</div>}

      {hover && (
        <motion.div
          className="card-arrow"
          animate={isHovered ? { x: 4 } : { x: 0 }}
          transition={{ duration: 0.3 }}
        >
          →
        </motion.div>
      )}
    </motion.div>
  );
};

export default InteractiveCard;
