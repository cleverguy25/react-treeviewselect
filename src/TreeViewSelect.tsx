import classNames from "classNames";
import * as PropTypes from "prop-types";
import * as React from "react";

export interface ITreeViewSelectProps<T> {
    disabled?: boolean;
    defaultCollapsed?: number;
    className?: string;
    style?: any;
    selectedItem: T;
    item: T;
    renderSelectedItem(item: T): JSX.Element;
    getChildren(item: T): T[];
    getParent(item: T): T;
    getKey(item: T): any;
    renderItem(item: T): JSX.Element;
    onSelectedItemChange(item: T): void;
}

export interface ITreeViewSelectState<T> {
    isOpen: boolean;
    highlightItem: T;
    highlightItemIndex: number;
    selectedItem: T;
    maxCount?: number;
    collapsed: { [key: string]: boolean };
    flattenedItems: T[];
}

interface IRenderData {
    index: number;
}

export class TreeViewSelect<T> extends React.Component<ITreeViewSelectProps<T>, ITreeViewSelectState<T>> {
    public static propTypes = {
        disabled: PropTypes.bool,
        defaultCollapsed: PropTypes.number,
        className: PropTypes.string,
        style: PropTypes.object,
        selectedItem: PropTypes.object,
        item: PropTypes.object,
        renderSelectedItem: PropTypes.func,
        getChildren: PropTypes.func,
        getParent: PropTypes.func,
        getKey: PropTypes.func,
        renderItem: PropTypes.func,
        onSelectedItemChange: PropTypes.func,
    };

    constructor(props: ITreeViewSelectProps<T>) {
        super(props);

        this.state = {
            isOpen: false,
            selectedItem: props.selectedItem,
            highlightItem: props.selectedItem,
            highlightItemIndex: 0,
            collapsed: {},
            flattenedItems: [],
        };

        this.toggle = this.toggle.bind(this);
        this.onKeyDown = this.onKeyDown.bind(this);
        this.onClick = this.onClick.bind(this);
        this.handleItemClick = this.handleItemClick.bind(this);
    }

    public render() {
        const classes = classNames(
            this.props.className,
            "treeviewselect",
            {
                show: this.state.isOpen,
            });

        return <div
            className={classes}
            style={this.props.style}
            onKeyDown={this.onKeyDown}
        >
            {this.renderToggle()}
            {this.renderDropdown()}
        </div>;
    }

    public componentWillMount() {
        const { item } = this.props;
        const { highlightItem } = this.state;
        const highlightKey = this.props.getKey(this.state.highlightItem);
        const flattenedItems = this.flattenItems(item);
        const highlightItemIndex = this.findHighlightIndex(flattenedItems, highlightKey);
        this.setState((prevState: ITreeViewSelectState<T>) => {
            const collapsed = this.uncollapse(highlightItem, prevState);
            return { flattenedItems, highlightItemIndex, collapsed };
        });
    }

    private findHighlightIndex(items: T[], highlightKey: string) {
        for (let i = 0; i < items.length; i++) {
            const child = items[i];
            const childKey = this.props.getKey(child);
            if (childKey === highlightKey) {
                return i;
            }
        }

        return 0;
    }
    private flattenItems(item: T): T[] {
        const itemArray: T[] = [];
        itemArray.push(item);
        const children = this.props.getChildren(item);
        for (const child of children) {
            const childArray = this.flattenItems(child);
            itemArray.push(...childArray);
        }

        return itemArray;
    }

    private renderToggle() {
        const propsAny = this.props as any;
        const ariaLabel = propsAny["aria-label"] || "Toggle Dropdown";

        const classes = classNames(
            "treeviewselect-toggle",
            {
                active: this.state.isOpen,
            });

        return <button
            className={classes}
            onClick={this.onClick}
            aria-haspopup="true"
            aria-expanded={this.state.isOpen}
        >
            {this.props.renderSelectedItem(this.state.highlightItem)}
        </button>;
    }

    private renderDropdown() {
        const hightlightKey = this.props.getKey(this.state.highlightItem);
        return <div
            aria-hidden={!this.state.isOpen}
            role="menu"
            className={"treeviewselect-dropdown"}
            tabIndex={-1}
        >
            {this.renderItems(this.props.item, { index: -1 }, 0, [], hightlightKey)}
        </div >;
    }

    private renderItems(item: T, data: IRenderData, depth: number, path: number[], highlightKey: any): JSX.Element {
        data.index++;
        const currentIndex = data.index;
        const newPath: number[] = [];
        Object.assign(newPath, path);
        newPath.push(data.index);

        const children = this.props.getChildren(item);
        let className = "";
        const key = this.props.getKey(item);
        let isHighlighted = false;
        if (key === highlightKey) {
            isHighlighted = true;
            className = "treeview-highlighted";
        }

        if (children.length === 0) {
            return this.renderLeafItem(key, className, depth + 1, item, currentIndex);
        }

        let arrowClassName = "treeview-arrow";
        let childrenClassName = "";
        let collapsed = this.state.collapsed[key];
        collapsed = collapsed === undefined ? (depth >= this.props.defaultCollapsed) : collapsed;
        if (collapsed) {
            arrowClassName += " treeview-arrow-collapsed";
            childrenClassName = "treeview-children-collapsed";
        }

        const arrow = (
            <div
                className={arrowClassName}
                onClick={(event: any) => this.handleArrowClick(key, event)}
            />
        );

        const classes = classNames("treeview-item", { "treeview-highlighted": isHighlighted });
        return <div key={key}>
            <div
                style={{ paddingLeft: `${depth}.5rem` }}
                className={classes}
                onClick={(event) => this.handleItemClick(item, currentIndex, event)}
            >
                {arrow}
                {this.props.renderItem(item)}
            </div>
            <div className={childrenClassName}>
                {children.map((childItem: T) => this.renderItems(childItem, data, depth + 1, newPath, highlightKey))}
            </div>
        </div>;
    }

    private renderLeafItem(key: any, className: string, depth: number, item: T, index: number) {
        return <div
            key={key}
            className={className}
            style={{ paddingLeft: `${depth}.5rem` }}
            onClick={(event) => this.handleItemClick(item, index, event)}
        >
            {this.props.renderItem(item)}
        </div>;
    }

    private handleItemClick(item: T, index: number, event: any) {
        event.stopPropagation();
        this.props.onSelectedItemChange(item);
        this.setState({ highlightItemIndex: index, highlightItem: item, selectedItem: item, isOpen: false });
    }

    private handleArrowClick(key: any, event: any) {
        event.stopPropagation();
        this.setState((prevState: ITreeViewSelectState<T>) => {
            const collapsed = prevState.collapsed[key];
            const newCollapsed: { [key: string]: boolean } = {};
            Object.assign(newCollapsed, prevState.collapsed);
            newCollapsed[key] = !collapsed;
            return { collapsed: newCollapsed };
        });
    }

    private onClick(event: any) {
        if (this.props.disabled) {
            event.preventDefault();
            return;
        }

        this.toggle();
    }

    private copyCollapsed(prevState: ITreeViewSelectState<T>) {
        const newCollapsed: { [key: string]: boolean } = {};
        Object.assign(newCollapsed, prevState.collapsed);
        return newCollapsed;
    }

    private uncollapse(item: T, prevState: ITreeViewSelectState<T>) {
        const newCollapsed = this.copyCollapsed(prevState);
        const rootKey = this.props.getKey(this.props.item);
        const itemKey = this.props.getKey(item);
        if (itemKey === rootKey) {
            return newCollapsed;
        }

        let parent = this.props.getParent(item);
        let key = this.props.getKey(parent);
        while (key !== rootKey) {
            newCollapsed[key] = false;
            parent = this.props.getParent(parent);
            key = this.props.getKey(parent);
        }

        return newCollapsed;
    }

    private setCollapsed(prevState: ITreeViewSelectState<T>, item: T, value: boolean) {
        const key = this.props.getKey(item);
        const collapsed = this.copyCollapsed(prevState);
        collapsed[key] = value;
        return { collapsed };
    }

    private moveHighlight(prevState: ITreeViewSelectState<T>, newIndex: number) {
        const newItem = prevState.flattenedItems[newIndex];
        const collapsed = this.uncollapse(newItem, prevState);

        let selectedItem = prevState.selectedItem;
        if (prevState.isOpen === false) {
            selectedItem = newItem;
            this.props.onSelectedItemChange(newItem);
        }

        return { highlightItemIndex: newIndex, highlightItem: newItem, collapsed, selectedItem };
    }

    private onKeyDown(event: any) {
        switch (event.key) {
            case "ArrowDown":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    const newIndex = prevState.highlightItemIndex + 1;
                    if (newIndex < prevState.flattenedItems.length) {
                        return this.moveHighlight(prevState, newIndex);
                    }

                    return null;
                });
                break;
            case "ArrowUp":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    const newIndex = prevState.highlightItemIndex - 1;
                    if (newIndex >= 0) {
                        return this.moveHighlight(prevState, newIndex);
                    }

                    return null;
                });
                break;
            case "ArrowLeft":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    return this.setCollapsed(prevState, prevState.highlightItem, true);
                });
                break;
            case "ArrowRight":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    return this.setCollapsed(prevState, prevState.highlightItem, false);
                });
                break;
            case "Enter":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    const newItem = prevState.highlightItem;
                    this.props.onSelectedItemChange(newItem);
                    return { selectedItem: newItem };
                });
                break;
            case "Escape":
                this.setState((prevState: ITreeViewSelectState<T>) => {
                    const key = this.props.getKey(prevState.selectedItem);
                    const index = this.findHighlightIndex(prevState.flattenedItems, key);
                    return { highlightItemIndex: index, highlightItem: prevState.selectedItem };
                });
                break;
        }
    }

    private toggle() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }
}
