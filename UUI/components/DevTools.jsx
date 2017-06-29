import React from 'react';
import DockMonitor from 'redux-devtools-dock-monitor';
import LogMonitor from 'redux-devtools-log-monitor';
import { createDevTools } from 'redux-devtools';

export default createDevTools(
  <DockMonitor
    toggleVisibilityKey="ctrl-s"
    changePositionKey="ctrl-q"
    defaultPosition="left"
    defaultIsVisible={false}
    defaultSize={0.33}
  >
    <LogMonitor theme="tomorrow" preserveScrollTop={false} />
  </DockMonitor>
);
