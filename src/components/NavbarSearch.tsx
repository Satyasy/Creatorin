import React from 'react';
import { Navbar } from './Navbar';

type NavbarSearchProps = Omit<React.ComponentProps<typeof Navbar>, 'showSearch'>;

export const NavbarSearch: React.FC<NavbarSearchProps> = (props) => (
  <Navbar {...props} showSearch />
);
