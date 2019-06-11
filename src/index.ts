import {
  JupyterLab, JupyterLabPlugin, ILayoutRestorer
} from '@jupyterlab/application';
import {
  ICommandPalette, InstanceTracker
} from '@jupyterlab/apputils';
import {
  JSONExt
} from '@phosphor/coreutils';
import {
  Widget
} from '@phosphor/widgets';
import {
  Message
} from '@phosphor/messaging';

import '../style/index.css';

const API_URL = 'https://pokeapi.co/api/v2';

/**
 * Initialization data for the jupyterlab-pokedex extension.
 */
const extension: JupyterLabPlugin<void> = {
  id: 'jupyterlab-pokedex',
  autoStart: true,
  requires: [ ICommandPalette, ILayoutRestorer ],
  activate: activate
};

function activate(application: JupyterLab, palette: ICommandPalette, layoutRestorer: ILayoutRestorer) {
  let widget = new PokedexWidget();

  let tracker = new InstanceTracker<Widget>({ namespace: 'pokedex' });

  const command = 'pokedex:random';
  application.commands.addCommand(command, {
    label: 'Lookup random Pokemon in Pokedex',
    execute: () => {
      if (!widget) {
        widget = new PokedexWidget();
      }

      if (!tracker.has(widget)) {
        tracker.add(widget);
      }

      if (!widget.isAttached) {
        application.shell.addToMainArea(widget);
      }

      widget.update();
      application.shell.activateById(widget.id);
    }
  });

  palette.addItem({command, category: 'Pokedex'});
  
  layoutRestorer.restore(tracker, {
    command,
    args: () => JSONExt.emptyObject,
    name: () => 'pokedex',
  });

  console.log('JupyterLab extension jupyterlab-pokedex is activated!');
}

const MINIMUM_INDEX = 1;
const MAXIMUM_INDEX = 809;
class PokedexWidget extends Widget {
  constructor() {
    super();

    this.id = 'pokedex-jupyterlab';
    this.title.label = 'Pokedex';
    this.title.closable = true;
    this.addClass('jp-pokedexWidget');

    this.hName = document.createElement('h1');
    this.hName.className = 'jp-pokedexName';
    this.node.append(this.hName);
    this.dTypes = document.createElement('div');
    this.dTypes.className = 'jp-pokedexTypeContainer';
    this.node.append(this.dTypes);
    this.imgFront = document.createElement('img');
    this.imgFront.className = 'jp-pokedexImage';
    this.node.append(this.imgFront);
  }

  readonly hName: HTMLHeadElement;
  readonly imgFront: HTMLImageElement;
  readonly dTypes: HTMLDivElement;

  onUpdateRequest(message: Message): void {
    fetch(`${API_URL}/pokemon/${this.generateRandomIndex()}`)
      .then(response => {
        return response.json();
      })
      .then(data => {
        this.hName.innerText = `#${data['id']} - ${data['name']}`;
        this.imgFront.src = data['sprites']['front_default'];
        this.imgFront.alt = data['name'];
        this.populateTypeContainer(data['types']);
      })
      .catch(exception => console.error(exception));
  }

  populateTypeContainer(types: Array<any>) {
    types = types.sort((leftHandSide, rightHandSide) => leftHandSide.slot - rightHandSide.slot);
    let typeNames: Array<string> = types.map(type => type.type.name);

    this.dTypes.innerHTML = '';
    for (let name of typeNames) {
      const element = document.createElement('div');
      element.innerText = name;
      element.className = 'jp-pokedexTypeElement';
      this.dTypes.appendChild(element);
    }
  }

  generateRandomIndex(): number {
    return Math.round(Math.random() * (MAXIMUM_INDEX - MINIMUM_INDEX)) + MINIMUM_INDEX;
  }
}

export default extension;
