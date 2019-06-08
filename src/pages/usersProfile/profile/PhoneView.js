import React, { Fragment, PureComponent } from 'react'
import { Input } from 'antd'
import './PhoneView.css'

class PhoneView extends PureComponent {
  render() {
    const { value, onChange } = this.props
    // eslint-disable-next-line prefer-const
    let values = ['', '']
    if (value) {
      // values = value.split('-');
      values[0] = value.substr(0, value.indexOf('-'))
      values[1] = value.substr(value.indexOf('-') + 1)
    }
    return (
      <Fragment>
        <Input
          className="area_code"
          value={values[0]}
          onChange={e => {
            onChange(`${e.target.value}-${values[1]}`)
          }}
          placeholder="Area Code"
        />
        <Input
          className="phone_number"
          onChange={e => {
            onChange(`${values[0]}-${e.target.value}`)
          }}
          value={values[1]}
          placeholder="Phone Number"
        />
      </Fragment>
    )
  }
}

export default PhoneView
