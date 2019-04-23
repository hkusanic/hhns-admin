/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import { Table } from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'

@connect(({ kirtan }) => ({ kirtan }))
class KirtanList extends React.Component {
  state = {}

  componentDidMount() {
    const { dispatch } = this.props
    dispatch({
      type: 'kirtan/GET_KIRTAN',
      page: 1,
    })
  }

  handlePageChnage = page => {
    const { dispatch } = this.props

    dispatch({
      type: 'kirtan/GET_KIRTAN',
      page,
    })
  }

  deleteLecture = uuid => {
    const { dispatch } = this.props
    console.log('uuid====????', uuid)
    dispatch({
      type: 'kirtan/DELETE_KIRTAN',
      uuid,
    })
  }

  render() {
    const { kirtan } = this.props
    const { kirtans, totalKirtans } = kirtan
    const data = kirtans

    const columns = [
      {
        title: 'Title',
        dataIndex: 'en.title',
        key: 'en.title',
        render: title => <span>{title}</span>,
      },
      {
        title: 'Need Translation',
        dataIndex: 'translation_required',
        key: 'translation_required',
        render: type => <span>{`${type}`}</span>,
      },
      {
        title: 'Event',
        dataIndex: 'en.event',
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
        title: 'Publish Date',
        dataIndex: 'published_date',
        key: 'published_date',
        render: date => <span>{`${new Date(date).toDateString()}`}</span>,
      },
      {
        title: 'Action',
        key: 'action',
        render: record => (
          <span>
            <Link to={{ pathname: '/kirtan/create', state: record.uuid }}>
              <i className="fa fa-edit mr-2" />
            </Link>
            <i
              className="fa fa-trash mr-2"
              onClick={() => {
                this.deleteLecture(record.uuid)
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
            </div>
            <div className="card-body">
              <Table
                // eslint-disable-next-line no-unused-expressions
                rowClassName={record =>
                  record.translation_required === true ? 'NotTranslated' : 'translated'
                }
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
