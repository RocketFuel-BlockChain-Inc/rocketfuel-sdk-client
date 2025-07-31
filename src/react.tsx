import React, { useEffect, useRef } from 'react';
import { ContainerId } from './utils/constants';
import type { SDKConfig } from './index';
import { RKFLPlugin } from './RkflPlugin';
interface RocketfuelButtonProps {
  config: SDKConfig;
  uuid: string;
}
export const RocketfuelButton: React.FC<RocketfuelButtonProps> = ({ config, uuid }) => {
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      const sdk = new RKFLPlugin(config);
      sdk.init();
      sdk.prepareOrder(uuid);
      initialized.current = true;
    }
  }, [config, uuid]);

  return <div id={config.plugins[0]?.containerId || ContainerId} />;
};
