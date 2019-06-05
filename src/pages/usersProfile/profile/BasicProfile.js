import React, { Component, Fragment } from 'react'
import { Form, Input, Select, Button, Upload } from 'antd'
import { withRouter } from 'react-router-dom'
import './BasicProfile.css'

const FormItem = Form.Item
const { Option } = Select

const AvatarView = ({ profilePic }) => (
  <Fragment>
    <div className="avatar">
      <img src={profilePic} alt="avatar" className="avatar_img" />
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

const getDataFromStorage = () => {
  const userDetails = JSON.parse(sessionStorage.getItem('userDetails'))

  return userDetails
}

@Form.create()
class BasicProfile extends Component {
  state = {
    user: {},
  }

  static getDerivedStateFromProps() {
    const data = getDataFromStorage()
    return {
      user: data,
    }
  }

  getProfileUrl = () => {
    const { user } = this.state
    if (user.profile_pic === 'Profile pic not available') {
      return 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'
    }
    return user.profile_pic
  }

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props

    const { user } = this.state

    console.log('user.profile_pic ===>>>', user.profile_pic)

    if (!user) {
      return <div>Loading...</div>
    }

    return (
      <Form layout="vertical" onSubmit={this.handleSubmit} hideRequiredMark>
        <div className="container">
          <div className="row">
            <div className="col-lg-8 nameDiv">
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="First Name">
                    <Input value={user.userName} placeholder="First Name" />
                  </FormItem>
                </div>
                <div className="col-lg-6">
                  <FormItem label="Last Name">
                    <Input placeholder="Last Name" />
                  </FormItem>
                </div>
              </div>
              <div className="row">
                <div className="col-lg-6">
                  <FormItem label="Email">
                    <Input value={user.email} placeholder="Email" />
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
                    })(<Input placeholder="Nickname" />)}
                  </FormItem>
                </div>
              </div>
            </div>

            <div className="col-lg-4 imageDiv">
              <AvatarView profilePic={this.getProfileUrl()} />
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Timezone">
                <Select value={user.timeZone} style={{ maxWidth: 220 }} placeholder="Timezone">
                  {/* <Option value="China">China</Option> */}
                </Select>
              </FormItem>
            </div>

            <div className="col-lg-8">
              <FormItem label="Phone Number">
                {/* <PhoneView value={data.mobileNumber} /> */}
                <Input type="number" value={user.mobileNumber} placeholder="Mobile Number" />
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Language">
                <Select value={user.language} style={{ maxWidth: 220 }} placeholder="Lanaguage">
                  <Option value="English">English</Option>
                  <Option value="Russian">Russian</Option>
                </Select>
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Street Name">
                {getFieldDecorator('street', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your street name!',
                    },
                  ],
                })(<Input placeholder="Street Name" />)}
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="City">
                {getFieldDecorator('city', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your city name!',
                    },
                  ],
                })(<Input placeholder="City Name" />)}
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
                })(<Input type="number" placeholder="Postal Code" />)}
              </FormItem>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-4">
              <FormItem label="Country">
                <Select
                  value={user.countryCode}
                  style={{ maxWidth: 220 }}
                  placeholder="Country Name"
                >
                  <Option value="en">EN</Option>
                  <Option value="ru">RU</Option>
                </Select>
              </FormItem>
            </div>
            <div className="col-lg-4">
              <FormItem label="Landmark (Optional)">
                {getFieldDecorator('landmark', {
                  rules: [
                    {
                      required: true,
                      message: 'Please input your landmark!',
                    },
                  ],
                })(<Input placeholder="Landmark" />)}
              </FormItem>
            </div>
          </div>

          <Button type="primary">Update Information</Button>
        </div>
      </Form>
    )
  }
}

export default withRouter(BasicProfile)
