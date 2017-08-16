# react-treeviewselect
A react based select control where the drop down is a tree view.

React/JS is not my first language, so open to suggestions for improvements as I have not seen a useful version of this control elsewhere, so I want this to be robust.

## Features

* Attempts to be [WAI-ARIA compliant](https://rawgit.com/w3c/aria-practices/master/aria-practices-DeletedSectionsArchive.html#autocomplete) compliant although not thoroughly tested.  Support for ARIA attributes and keyboard interactions.  Issues welcome
* Mobile friendly
* Full control over item rendering.
* Can use with any structure, as it uses callbacks for composing tree.
* Typescript typings.

## Installation

```shell
yarn add react-treeviewselect
```

or

```shell
npm install react-treeviewselect --save
```

## Basic Usage

```js
import { TreeViewSelect } from "react-treeviewselect";

function renderManagerLink(manager) {
    return <span
        key={manager.id}
    >
        {manager.name}
    </span>;
}

function renderSelectedManager(manager) {
    return <div className="d-inline-block">{manager.name}</div>;
}

function getChildren(item) {
    return item.reports;
}

function getParent(item) {
    return item.manager;
}

function getKey(item) {
    return item.id;
}

function onSelectedItemChange(item: IManager) {
    console.log(item.name);
}

class Example extends React.Component {
  constructor(props) {
        super(props);

        this.state = {};
        this.onSelectedItemChange = this.onSelectedItemChange.bind(this);
    }

  render() {

    return (
      <TreeViewSelect
                        style={{ width: "20rem" }}
                        defaultCollapsed={1}
                        renderSelectedItem={renderSelectedManager}
                        selectedItem={manager}
                        item={hierarchy.manager}
                        getChildren={getChildren}
                        getParent={getParent}
                        getKey={getKey}
                        renderItem={renderManagerLink}
                        onSelectedItemChange={onSelectedItemChange}
                    />
    );
  }
}
```

## Props

| Prop | Type | Required | Description |
| :--- | :--- | :---: | :--- |
| `className` | String | | Set a class name for outer TreeViewSelect element. |
| `style` | Object | | Sets a style for TreeViewSelect, can be useful to set a fixed width. |
| `defaultCollapsed` | Number | | Use this to define what level should default to collapsed.  Can be useful for big trees to keep just the first few levels open by default. |
| `renderSelectedItem` | Function | ✓ | How do we render the selected item. |
| `selectedItem` | Object | ✓ | Currently selected item. |
| `item` | Object | ✓ | Root node of the tree. |
| `getChildren` | Function | ✓ | Used on a node to get the children.  This allows a flexible data structure as input. |
| `getParent` | Function | ✓ | Get parent for an item.  This is used to make sure that selected items are not collapsed. |
| `getKey` | Function | ✓ | Get the key for a node.  Used for item equivalency as well as for React key. |
| `renderItem` | Function | ✓ | Used to render an item in the treeview. |
| `onSelectedItemChange` | Function | ✓ | Callback when the selected item changes. |


## License

[MIT](https://github.com/cleverguy25/react-treeviewselect/blob/master/LICENSE)
