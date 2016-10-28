import React from 'react'


/**
    Higher order component that connects a component to one or several stores.
    
    :param ComposedComponent:
        The component to enhance.
    :param stores:
        Either the store to connect, or an array of stores to connect.
    :param storesHandler:
        A function (props) => object that takes the component props and
        returns the new props to get from the store(s).
    
    .. code-block:: js
        import StoreConnector from 'StoreConnector'

        const MyComponentWithStore = StoreConnector(
            class MyComponent extends React.Component {
                // can access this.props.val
            },
            SomeStore, (props) => ({val: SomeStore.getVal(props.id)})
        )
 */
export default (ComposedComponent, stores, storesHandler) => class extends React.Component {
    constructor(props) {
        super(props)
        this.state = storesHandler(this.props)

        this.handleStoreChange = this.handleStoreChange.bind(this)
    }

    componentDidMount() {
        let stores_ = (stores instanceof Array)
            ? stores
            : [stores]

        stores_.map((store) => {
            store.setMaxListeners(store.getMaxListeners() + 1)
            store.addChangeListener(this.handleStoreChange)
        })
    }

    componentWillUnmount() {
        let stores_ = (stores instanceof Array)
            ? stores
            : [stores]

        stores_.map((store) => {
            store.removeChangeListener(this.handleStoreChange)
            store.setMaxListeners(Math.max(store.getMaxListeners() - 1, store.defaultMaxListeners))
        })
    }

    componentWillReceiveProps(props) {
        this.setState(storesHandler(props))
    }

    handleStoreChange() {
        this.setState(storesHandler(this.props))
    }

    render() {
        return <ComposedComponent {...this.props} {...this.state} />
    }
}
