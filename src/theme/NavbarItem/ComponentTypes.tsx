/**
 * Custom Navbar Item Types
 * Extends Docusaurus navbar with custom auth button
 */

import ComponentTypes from '@theme-original/NavbarItem/ComponentTypes';
import NavbarAuthButton from '../../components/auth/NavbarAuthButton';

export default {
  ...ComponentTypes,
  'custom-authButton': NavbarAuthButton,
};
