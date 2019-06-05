/* eslint-disable react/no-unused-state */
import React, { Component, Fragment } from 'react'
import { Form, Input, Select, Button, Upload } from 'antd'
import { withRouter } from 'react-router-dom'
import './BasicProfile.css'

const FormItem = Form.Item
const { Option } = Select

const AvatarView = ({ avatar }) => (
  <Fragment>
    <div className="avatar">
      <img src={avatar} alt="avatar" className="avatar_img" />
    </div>
    <Upload fileList={[]}>
      <div className="button_view">
        <Button disabled icon="upload">
          Change avatar
        </Button>
      </div>
    </Upload>
  </Fragment>
)

@Form.create()
class BasicProfile extends Component {
  state = {
    user: {},
    language: '',
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.userDetails !== prevState.user) {
      return {
        user: nextProps.userDetails,
        language: nextProps.userDetails.language,
      }
    }
    return null
  }

  getAvatarURL = () => {
    const url = 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
    return url
  }

  handleLanguageChange = language => {
    this.setState({
      language,
    })
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props

    const { user } = this.state

    let { language } = this.state

    if (language === 'en') {
      language = 'English'
    }

    if (language === 'ru') {
      language = 'Russian'
    }

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 nameDiv">
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="First Name">
                    <Input
                      value={user && user.name && `${user.name.first}`}
                      placeholder="First Name"
                      disabled
                    />
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Last Name">
                    <Input
                      placeholder="Last Name"
                      value={user && user.name && `${user.name.last}`}
                      disabled
                    />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="Email">
                    <Input value={user.email} placeholder="Email" disabled />
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Nickname">
                    {getFieldDecorator('nickName', {
                      rules: [
                        {
                          required: true,
                          message: 'Please input your Nickname!',
                        },
                      ],
                    })(<Input placeholder="Nickname" disabled />)}
                  </FormItem>
                </div>
              </div>
            </div>

            <div className="col-lg-4 imageDiv">
              <AvatarView avatar={this.getAvatarURL()} />
              {/* <br />
                  <br />
                  <br />
                  <br />
                  <br /> */}
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Timezone">
                <Select
                  value={user.timeZone}
                  style={{ maxWidth: 220 }}
                  placeholder="Timezone"
                  disabled
                >
                  {/* <Option value="China">China</Option> */}
                </Select>
              </FormItem>
            </div>

            <div className="col-lg-8">
              <FormItem label="Phone Number">
                {/* <PhoneView value={data.mobileNumber} /> */}
                <Input
                  type="number"
                  value={user.mobileNumber}
                  placeholder="Mobile Number"
                  disabled
                />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Language">
                <Select
                  id="product-edit-colors"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select Language"
                  optionFilterProp="children"
                  disabled
                  value={language}
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  <Option
                    onClick={() => {
                      this.handleLanguageChange('English')
                    }}
                    value="English"
                  >
                    English
                  </Option>
                  <Option
                    onClick={() => {
                      this.handleLanguageChange('Russian')
                    }}
                    value="Russian"
                  >
                    Russian
                  </Option>
                </Select>
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <FormItem label="Street Name">
                <Input placeholder="Street Name" name="streetName" disabled />
              </FormItem>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-12">
              <FormItem label="Landmark (Optional)">
                <Input placeholder="Landmark" name="landmark" disabled />
              </FormItem>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-4">
              <FormItem label="City">
                {getFieldDecorator('city', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your city name!',
                    },
                  ],
                })(<Input placeholder="City Name" disabled />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="Postal Code">
                {getFieldDecorator('postalCode', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your postal Code!',
                    },
                  ],
                })(<Input type="number" placeholder="Postal Code" disabled />)}
              </FormItem>
            </div>

            <div className="col-lg-4">
              <FormItem label="Country">
                <Select
                  value={user.countryCode}
                  style={{ maxWidth: 220 }}
                  disabled
                  placeholder="Country Name"
                >
                  <Option value="en">EN</Option>
                  <Option value="ru">RU</Option>
                </Select>
              </FormItem>
            </div>
          </div>

          <Button type="primary" disabled>
            Update Information
          </Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(BasicProfile)
