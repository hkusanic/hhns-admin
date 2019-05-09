/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table, Switch } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

@connect(({ kirtan }) => ({ kirtan }))
class KirtanList extends React.Component {
  state = {
    language: window.localStorage['app.settings.locale'] === '"en-US"',
  }

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'kirtan/GET_KIRTAN',
      page: 1,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.kirtan.isDeleted) {
      const { dispatch } = this.props
      dispatch({
        type: 'kirtan/GET_KIRTAN',
        page: 1,
      })
    }
    this.setState({
      language: window.localStorage['app.settings.locale'] === '"en-US"',
    })
  }

  handlePageChnage = page => {
    const { dispatch } = this.props

    dispatch({
      type: 'kirtan/GET_KIRTAN',
      page,
    })
  }

  deleteKirtan = uuid => {
    const { dispatch } = this.props
    console.log('uuid====????', uuid)
    dispatch({
      type: 'kirtan/DELETE_KIRTAN_BY_ID',
      uuid,
    })
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  hanldeRedirect = record => {
    const { history } = this.props
    history.push({
      pathname: '/kirtan/create',
      state: record.uuid,
    })
  }

  render() {
    const { kirtan } = this.props
    const { language } = this.state
    const { kirtans, totalKirtans } = kirtan
    const data = kirtans

    const columns = [
      {
        title: 'Title',
        dataIndex: language ? 'en.title' : 'ru.title',
        key: 'en.title',
        render: title => <span>{title}</span>,
      },
      {
        title: 'Event',
        dataIndex: language ? 'en.event' : 'ru.event',
        key: 'en.event',
      },
      {
        title: 'Type',
        dataIndex: 'type',
        key: 'type',
      },
      {
        title: 'Date',
        dataIndex: 'created_date',
        key: 'created_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link to={{ pathname: '/kirtan/create', state: { id: record.uuid, language } }}>
              <i className="fa fa-edit mr-2 editIcon" />
            </Link>
            <i
              className="fa fa-trash mr-2 closeIcon"
              onClick={() => {
                this.deleteKirtan(record.uuid)
              }}
            />
          </span>
        ),
      },
    ]

    return (
      <div>
        <Helmet title="Kirtan List" />
        <div className="card">
          <div className="card-header">
            <div className="utils__title">
              <strong>Kirtan List</strong>
              <Switch
                defaultChecked
                checkedChildren={language ? 'en' : 'ru'}
                unCheckedChildren={language ? 'en' : 'ru'}
                onChange={this.handleLanguage}
                className="toggle"
                style={{ width: '100px', marginLeft: '10px' }}
              />
            </div>
            <div className="card-body">
              <Table
                // eslint-disable-next-line no-unused-expressions
                rowClassName={record =>
                  record.translation_required === true ? 'NotTranslated' : 'translated'
                }
                onRow={record => {
                  return {
                    onDoubleClick: () => {
                      this.hanldeRedirect(record)
                    },
                  }
                }}
                className="utils__scrollTable"
                scroll={{ x: '100%' }}
                columns={columns}
                dataSource={data}
                pagination={{
                  pageSize: 20,
                  onChange: this.handlePageChnage,
                  total: totalKirtans,
                }}
              />
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default KirtanList
