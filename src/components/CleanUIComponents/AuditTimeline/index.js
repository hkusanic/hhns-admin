/* eslint-disable */
import React from 'react'
import moment from 'moment'
import { Timeline } from 'antd'

const AuditTimeline = ({ audit }) => {
  if (!audit) {
    return <div className="mt-4 mb-4">No Audit is available</div>
  }
  audit = audit.reverse()

  return (
    <div className="mt-4">
      <Timeline>
        {audit &&
          audit.map((item, index) => {
            item = JSON.parse(item)
            return (
              <Timeline.Item key={index}>
                {/* {item.fullName}&nbsp;&nbsp;&nbsp; */}
                {item.email}&nbsp;&nbsp;&nbsp;
                {moment(item.dateTime, 'YYYYMMDDTHHmmssZ').format('h:mm a, MMMM Do YYYY')}
              </Timeline.Item>
            )
          })}
      </Timeline>
    </div>
  )
}

export default AuditTimeline
