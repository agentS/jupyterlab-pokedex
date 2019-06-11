# jupyterlab-pokedex

Quickly lookup random Pokedex entries from Jupyter Lab.
![Demo image showing the pokedex entry of Masquerain](img/demo.png)

## Prerequisites

* JupyterLab

## Installation

```bash
jupyter labextension install @agents/jupyterlab-pokedex
```

## Development

For a development install (requires npm version 4 or later), do the following in the repository directory:

```bash
npm install
npm run build
jupyter labextension link .
```

To rebuild the package and the JupyterLab app:

```bash
npm run build
jupyter lab build
```

