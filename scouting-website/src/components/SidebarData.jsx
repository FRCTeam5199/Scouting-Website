import React from 'react';
import * as FaIcons from 'react-icons/fa';
import * as AiIcons from 'react-icons/ai';
import * as IoIcons from 'react-icons/io';
import * as ImIcons from 'react-icons/im';
import * as PiIcons from 'react-icons/pi';

// Pages on the menu bar
export const SidebarData = [
  {
    title: 'Home',
    path: '/',
    icon: <AiIcons.AiFillHome />,
    cName: 'nav-text'
  },
  {
    title: 'Stand Scouting',
    path: '/stand-scouting',
    icon: <IoIcons.IoIosPaper />,
    cName: 'nav-text'
  },
  {
    title: 'Pit Scouting',
    path: '/pit-scouting',
    icon: <FaIcons.FaWrench />,
    cName: 'nav-text'
  },
  {
    title: 'Analytics',
    path: '/analytics',
    icon: <ImIcons.ImStatsBars />,
    cName: 'nav-text'
  },
  // {
  //   title: 'Rankings',
  //   path: '/rankings',
  //   icon: <PiIcons.PiRankingBold />,
  //   cName: 'nav-text'
  // },
  // {
  //   title: 'Settings',
  //   path: '/settings',
  //   icon: <FaIcons.FaCog />,
  //   cName: 'nav-text'
  // },
];