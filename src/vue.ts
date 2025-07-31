import { defineComponent, onMounted, h } from 'vue';
import { ContainerId } from './utils/constants';
import type { SDKConfig } from './index';
import { RKFLPlugin } from './index';

export const RocketfuelButton = defineComponent({
  name: 'RocketfuelButton',
  props: {
    config: {
      type: Object as () => SDKConfig,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    onMounted(() => {
      const sdk = new RKFLPlugin(props.config);
      sdk.init();
      sdk.prepareOrder(props.uuid);
    });

    return () => h('div', { id: props.config.plugins[0]?.containerId || ContainerId });
  },
});
