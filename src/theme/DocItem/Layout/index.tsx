/**
 * DocItem/Layout - Passthrough wrapper
 * Simply forwards to the original layout without modifications
 * PersonalizeButton is now injected via DocItem/Content instead
 */

import React from 'react';
import DocItemLayout from '@theme-original/DocItem/Layout';
import type DocItemLayoutType from '@theme/DocItem/Layout';
import type { WrapperProps } from '@docusaurus/types';

type Props = WrapperProps<typeof DocItemLayoutType>;

export default function DocItemLayoutWrapper(props: Props): JSX.Element {
  return <DocItemLayout {...props} />;
}
