"use client";

import PropTypes from "prop-types";
import Link from "next/link";
import Image from "next/image";

function SideBar() {
  return (
    <>
      <div className="bg-backHeader fixed text-center items-center top-0 left-0 h-screen w-16 m-0 flex flex-col shadow-lg">
        <SideBarIcon icon="🏠" text="Home" />
        <SideBarIcon icon="📁" text="Files" />
        <SideBarIcon icon="📊" text="Stats" />
        <SideBarIcon icon="📅" text="Calendar" />
        <SideBarIcon icon="🌙" text="Toggle Dark Mode" />
        <SideBarIcon
          icon="📖"
          onClick={() => alert("All is fine!!!")}
          text="Alert"
        />
      </div>
    </>
  );
}

export default SideBar;

interface SideBarIconProps {
  icon: string;
  text?: string;
  onClick?: () => void;
}

const SideBarIcon = ({
  icon,
  text = "tooltip 💡",
  onClick
}: SideBarIconProps) => {
  return (
    <div className="sidebar-icon group" onClick={onClick}>
      {icon}
      <span className="tooltip left-14 group-hover:scale-100">{text}</span>
    </div>
  );
};

SideBarIcon.propTypes = {
  icon: PropTypes.string.isRequired,
  text: PropTypes.string,
  onClick: PropTypes.func
};
