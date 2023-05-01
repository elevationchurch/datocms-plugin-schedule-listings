import { RenderFieldExtensionCtx, connect } from 'datocms-plugin-sdk';
import { render } from './utils/render';
import Listing from './entrypoints/Plugin';
import 'datocms-react-ui/styles.css';

connect({
  manualFieldExtensions: () => {
    return [
      {
        id: 'scheduleListings',
        name: 'Schedule Listings',
        type: 'editor',
        fieldTypes: ['json'],
        configurable: false,
      },
    ];
  },

  renderFieldExtension(fieldExtensionId: string, ctx: RenderFieldExtensionCtx) {
    switch (fieldExtensionId) {
      case 'scheduleListings':
        return render(<Listing ctx={ctx} />);
    }
  },
});
