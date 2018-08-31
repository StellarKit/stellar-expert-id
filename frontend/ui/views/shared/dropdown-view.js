import React from 'react'
import PropTypes from 'prop-types'

class Dropdown extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            listOpen: false
        }
        this.handleClickOutside = this.handleClickOutside.bind(this)
    }

    static propTypes = {
        list: PropTypes.arrayOf(PropTypes.shape({
            value: PropTypes.string.isRequired,
            title: PropTypes.string
        })).isRequired,
        onChange: PropTypes.func.isRequired,
        value: PropTypes.string
    }

    componentDidMount() {
        document.addEventListener('click', this.handleClickOutside)
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.handleClickOutside)
    }

    handleClickOutside() {
        this.setState({listOpen: false})
    }

    toggleList() {
        this.setState(prevState => ({
            listOpen: !prevState.listOpen
        }))
    }

    select(item) {
        const {onChange} = this.props
        onChange && onChange(item)
    }

    get selectedItem() {
        const {list, value} = this.props
        return list.find(item => item.value === value) || list[0]
    }

    render() {
        const {list} = this.props,
            {listOpen} = this.state,
            selectedItem = this.selectedItem
        return (
            <div className="dd-wrapper">
                <div className="dd-header" onClick={() => this.toggleList()}>
                    <a href="#" className="dd-header-title">{selectedItem.title || selectedItem.value}</a>
                    <a href="#" className={`fa ${listOpen ? 'fa-angle-up' : 'fa-angle-down'}`}/>
                </div>
                <ul className="dd-list">
                    {list.map(item => {
                        return <li className="dd-list-item" key={item.id || item.value}
                                   onClick={e => this.select(item)}>
                            <a href="#" className={item === selectedItem ? 'selected' : ''}
                               onClick={e => this.select(item)}>
                                {item.title || item.value}
                            </a>
                        </li>
                    })}
                </ul>
            </div>
        )
    }
}

export default Dropdown