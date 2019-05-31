import React, { Component } from 'react'
import { Table } from 'antd'
import { Link, withRouter } from 'react-router-dom'
import renderHTML from 'react-render-html'

const columns = [
  {
    title: 'Rounds',
    dataIndex: 'rounds',
    render: text => (text ? renderHTML(text) : ''),
  },
  {
    title: 'Reading',
    dataIndex: 'reading',
    render: text => (text ? renderHTML(text) : ''),
  },
  {
    title: 'Time Rising',
    dataIndex: 'time_rising',
    render: text => (text ? renderHTML(text) : ''),
  },
  {
    title: 'Action',
    key: 'action',
    render: record => (
      <span>
        <Link
          to={{
            pathname: '/sadhana/add',
            state: { uuid: record.itemIndex },
          }}
        >
          <i className="fa fa-edit mr-2 editIcon" />
        </Link>
      </span>
    ),
  },
]

const dummyData = [
  {
    rounds: '20',
    reading: '10',
    time_rising: '10:00',
  },
  {
    rounds: '30',
    reading: '15',
    time_rising: '12:00',
  },
  {
    rounds: '50',
    reading: '30',
    time_rising: '20:00',
  },
]

class SadhanaSheets extends Component {
  render() {
    return (
      <Table
        rowKey={record => record.uuid}
        rowClassName={record =>
          record.translation_required === true ? 'NotTranslated' : 'translated'
        }
        className="utils__scrollTable"
        scroll={{ x: '100%' }}
        columns={columns}
        dataSource={dummyData}
        // pagination={paginationConfig}
      />
    )
  }
}

export default withRouter(SadhanaSheets)
