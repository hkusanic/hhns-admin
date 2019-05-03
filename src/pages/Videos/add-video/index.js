/* eslint-disable react/no-access-state-in-setstate */
/* eslint-disable no-underscore-dangle */
/* eslint-disable array-callback-return */
/* eslint-disable no-plusplus */
/* eslint-disable no-nested-ternary */
/* eslint-disable prefer-destructuring */
/* eslint-disable react/destructuring-assignment */
import React from 'react'
import {
  Switch,
  Form,
  Button,
  Icon,
  Input,
  Select,
  DatePicker,
  Checkbox,
  AutoComplete,
  Tabs,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import moment from 'moment'
import { uuidv4 } from '../../../services/custom'
import BackNavigation from '../../../common/BackNavigation/index'
import AuditTimeline from '../../../components/CleanUIComponents/AuditTimeline'
import styles from './style.module.scss'

const FormItem = Form.Item
const { TabPane } = Tabs
const { Option } = Select
let id = 0;
let initialize = true;
@Form.create()
@connect(({ video, lecture }) => ({ video, lecture }))
class AddVideo extends React.Component {
  state = {
    autoCompleteDataSource: '',
    language: true,
    event: '',
    location: '',
    type: '',
    videoReference: '',
    videoUrlFields: [],
    videoUrl: [],
    showReference: false,
    tempUrl: '',
    editingvideo: '',
    translationRequired: true,
    nextUrls: [],
    arKeys: [],
  }

  componentDidMount() {
    initialize =true;
    const { location, dispatch } = this.props
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'video/GET_VIDEO_BY_ID',
        payload: body,
      })
    }
    dispatch({
      type: 'lecture/GET_EVENTS',
    })
    dispatch({
      type: 'lecture/GET_LOCATIONS',
    })
  }

  componentWillReceiveProps(nextProps) {
    const {form} = this.props;
    if (nextProps.video.editVideo !== '') {
      const { video } = nextProps
      let ar = []
      if (video.editVideo && video.editVideo.urls && video.editVideo.urls.length > 0) {
        ar = video.editVideo.urls
      }
      this.setState({
        editingvideo: video.editVideo,
        type: video.editVideo && video.editVideo.type ? video.editVideo.type : '',
        videoUrl: video.editVideo && video.editVideo.urls ? video.editVideo.urls || [] : [],
        showReference: video.editVideo && video.editVideo.type ? video.editVideo.type !== 'other' : false,
        translationRequired: video.editVideo ? video.editVideo.translation_required : true,
        nextUrls: ar,
      })
      if(initialize){
        let arKeys =[];
        video.editVideo.urls.map((k, index) => {
          arKeys.push(index);
        })
        this.setState({arKeys: arKeys});
          id = arKeys.length - 1;
          initialize = false;
          
      }
    }
    if (nextProps.video.isVideoCreated) {
      this.handleReset()
    }
  }

  remove = (k) => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    if (keys.length === 1) {
      return;
    }
    form.setFieldsValue({
      keys: keys.filter(key => key !== k),
    });
  }

  
  add = () => {
    const { form } = this.props;
    const keys = form.getFieldValue('keys');
    const nextKeys = keys.concat(++id);
    form.setFieldsValue({
      keys: nextKeys,
    });
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  // handleSelectEvent = event => {
  //   this.setState({
  //     event,
  //   })
  // }

  // handleSelectLocation = location => {
  //   this.setState({
  //     location,
  //   })
  // }

  // handleSelectType = type => {
  //   if (type !== 'other') {
  //     this.setState({ showReference: true, type, autoCompleteDataSource: [] }, () => {
  //     })
  //   } else {
  //     this.setState({ showReference: false, type, autoCompleteDataSource: [] }, () => {
  //     })
  //   }
  // }

  // handleVideoReferenceSelect = reference => {
  //   this.setState({
  //     videoReference: reference,
  //   })
  // }

  handleVideoReferenceSearch = reference => {
    const { form, dispatch } = this.props
    const type = form.getFieldValue('type')
    const body = {
      type,
      parameter: reference,
    }
    dispatch({
      type: 'video/GET_SUGGESTION',
      payload: body,
    })
    const ar = []
    if (this.props.video.suggestions) {
      if (this.state.language) {
        this.props.video.suggestions.map(a => {
          ar.push(a.en.title)
        })
      } else {
        this.props.video.suggestions.map(a => {
          ar.push(a.ru.title)
        })
      }
      this.setState({ autoCompleteDataSource: ar })
    }
  }


  handleSubmitForm = () => {
    const { form, dispatch } = this.props
    const uuid = this.props.location.state
    // const {
    //   language,
    //   event,
    //   location,
    //   type,
    //   videoReference,
    //   editingvideo,
    //   translationRequired,
    // } = this.state
    const {language, translationRequired, editingvideo} = this.state;
    const titleVideo = form.getFieldValue('title')
    const author = form.getFieldValue('author')
    const videoLanguage = form.getFieldValue('language')
    const date = form.getFieldValue('date')
    const publishDate = form.getFieldValue('publish_date')
    const event = form.getFieldValue('event');
    const location = form.getFieldValue('location');
    const type = form.getFieldValue('type');
    const videoReference = form.getFieldValue('reference');
    //const translationRequired = form.getFieldValue('translation');

    form.validateFields(['title', 'create_date'], (err, values) => {
      const dynamicFieldValues = []
      const keys = form.getFieldValue('keys')

      keys.map((k, index) => {
        const val = form.getFieldValue(`url-[${k}]`)
        dynamicFieldValues.push(val)
      })

      if (!err) {
        const body = {
          uuid: uuid || uuidv4(),
          date,
          published_date: publishDate,
          language: videoLanguage,
          reference: videoReference,
          translation_required: translationRequired,
          type,
          author,
          urls: dynamicFieldValues,
          en: {
            title: language ? titleVideo : editingvideo ? editingvideo.en.title : '',
            event: language ? event : editingvideo ? editingvideo.en.event : '',
            location: language ? location : editingvideo ? editingvideo.en.location : '',
          },
          ru: {
            title: language ? (editingvideo ? editingvideo.ru.title : '') : titleVideo,
            event: language ? (editingvideo ? editingvideo.ru.event : '') : event,
            location: language ? (editingvideo ? editingvideo.ru.location : '') : location,
          },
        }
        console.log(body);
        if (editingvideo !== '') {
          body.audit = editingvideo.audit
          const payload = {
            body,
            uuid,
          }
          dispatch({
            type: 'video/UPDATE_VIDEO',
            payload,
          })
        } else {
          dispatch({
            type: 'video/CREATE_VIDEO',
            body,
          })
        }
        this.setState({ id: 0 })
      }
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      event: '',
      location: '',
      type: '',
      videoReference: '',
      videoUrl: [],
      videoUrlFields: [],
      tempUrl: [],
      showReference: false,
      editingvideo: '',
      id: 0,
    })
  }

  render() {
    const { form, lecture, video } = this.props
    const { events, locations } = lecture
    const { language, translationRequired } = this.state
    const dateFormat = 'YYYY/MM/DD'
    const { getFieldDecorator, getFieldValue } = this.props.form

    const { editingvideo } = this.state

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    }
    const formItemLayoutWithOutLabel = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 20, offset: 4 },
      },
    }
     
    
    
    getFieldDecorator('keys', { rules: [
      {
        required: true,
        message: 'Url is required',
      },
    ],initialValue: (this.state.arKeys.length>0 ? this.state.arKeys : [0] ) });
    const keys = getFieldValue('keys');
    const formItems = keys.map((k, index) => (
      <Form.Item
        {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
        label={index === 0 ? 'Youtube Url' : ''}
        required={true}
        key={k}
      >
        {getFieldDecorator(`url-[${k}]`, {
          validateTrigger: ['onChange', 'onBlur'],
          rules: [{
            required: true,
            whitespace: true,
            message: "Please input url or delete this field.",
          }],
          initialValue: this.state.nextUrls[k] ? this.state.nextUrls[k] : '',
        })(
          <Input placeholder="Url" style={{ width: '60%', marginRight: 8 }} />
        )}
        {keys.length > 1 ? (
          <Icon
            className="dynamic-delete-button"
            type="minus-circle-o"
            onClick={() => this.remove(k)}
          />
        ) : null}
      </Form.Item>
    ));
    
    return (
      <React.Fragment>
        <div>
          <BackNavigation link="/video/list" title="Video List" />
          {editingvideo && editingvideo.en && editingvideo.ru ? (
            <div style={{ paddingTop: '10px' }}>
              <div>
                <strong>Title :</strong>
                &nbsp;&nbsp;
                <span>{language ? editingvideo.en.title : editingvideo.ru.title}</span>
              </div>
            </div>
          ) : null}
          <Helmet title="Add Video" />
          <Tabs defaultActiveKey="1">
            <TabPane tab="Video" key="1">
              <section className="card">
                <div className="card-header mb-2">
                  <div className="utils__title">
                    <strong>Video Add/Edit</strong>
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
                    <div className={styles.addPost}>
                      <Form className="mt-3">
                        <div className="form-group">
                          <FormItem label={language ? 'Title' : 'Title'}>
                            {form.getFieldDecorator('title', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Title is required',
                                },
                              ],
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.title
                                    : editingvideo.ru.title
                                  : '',
                            })(<Input placeholder="Video Title" />)}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Author">
                            {form.getFieldDecorator('author', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? editingvideo.author
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Author"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="Niranjana Swami">Niranjana Swami</Option>
                                <Option value="Other">Other</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Language">
                            {form.getFieldDecorator('language', {
                              initialValue: editingvideo ? editingvideo.language : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select language"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="english">English</Option>
                                <Option value="russian">Russian</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Type">
                            {form.getFieldDecorator('type', {
                              initialValue: editingvideo ? editingvideo.type : null,
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Type"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                <Option value="kirtan">Kirtan</Option>
                                <Option value="lecture">Lecture</Option>
                                <Option value="other">Other</Option>
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        {form.getFieldValue('type')==='kirtan' || form.getFieldValue('type')==='lecture' ? (
                          <div className="form-group">
                            <FormItem label="Reference">
                              {form.getFieldDecorator('reference', {
                                rules: [
                                  {
                                    required: form.getFieldValue('type')==='lecture',
                                    message: 'Reference is required',
                                  },
                                ],
                                initialValue: editingvideo.reference
                                  ? editingvideo.reference
                                  : null,
                              })(
                                <AutoComplete
                                  id="product-edit-colors"
                                  dataSource={this.state.autoCompleteDataSource}
                                  style={{ width: '100%' }}
                                  placeholder="Reference"
                                  optionFilterProp="children"
                                  onSearch={this.handleVideoReferenceSearch}
                                />,
                              )}
                            </FormItem>
                          </div>
                        ) : (
                          ''
                        )}
                        <div className="form-group">
                          <FormItem>
                            {form.getFieldDecorator('translation', {
                              rules: [
                                {
                                  required: true,
                                  message: 'Need Translation is required',
                                },
                              ],
                              initialValue: editingvideo ? editingvideo.translation_required : '',
                            })(
                              <Checkbox
                                checked={translationRequired}
                                onChange={this.handleCheckbox}
                              >
                                &nbsp; Need Translation ?
                              </Checkbox>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Date">
                            {form.getFieldDecorator('date', {
                              initialValue: editingvideo
                                ? moment(editingvideo.date, dateFormat)
                                : moment(new Date(), dateFormat),
                            })(<DatePicker />)}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Publish Date">
                            {form.getFieldDecorator('publish_date', {
                              initialValue: editingvideo
                                ? moment(editingvideo.published_date, dateFormat)
                                : moment(new Date(), dateFormat),
                            })(<DatePicker disabled />)}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Event">
                            {form.getFieldDecorator('event', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.event
                                    : editingvideo.ru.event
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Event"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {events && events.length > 0
                                  ? events.map(item => {
                                      return (
                                        <Option key={item._id} value={item.title}>
                                          {item.title}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          <FormItem label="Location">
                            {form.getFieldDecorator('location', {
                              initialValue:
                                editingvideo && (editingvideo.en || editingvideo.ru)
                                  ? language
                                    ? editingvideo.en.location
                                    : editingvideo.ru.location
                                  : '',
                            })(
                              <Select
                                id="product-edit-colors"
                                showSearch
                                style={{ width: '100%' }}
                                placeholder="Select Location"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                  option.props.children
                                    .toLowerCase()
                                    .indexOf(input.toLowerCase()) >= 0
                                }
                              >
                                {locations && locations.length > 0
                                  ? locations.map(item => {
                                      return (
                                        <Option key={item._id} value={item.title}>
                                          {item.title}
                                        </Option>
                                      )
                                    })
                                  : null}
                              </Select>,
                            )}
                          </FormItem>
                        </div>
                        <div className="form-group">
                          {formItems}
                          <Form.Item {...formItemLayoutWithOutLabel}>
                            <Button type="dashed" onClick={this.add} style={{ width: '60%' }}>
                              <Icon type="plus" /> Add field
                            </Button>
                          </Form.Item>
                        </div>
                        <FormItem>
                          <div className={styles.submit}>
                            <span className="mr-3">
                              <Button
                                type="primary"
                                htmlType="submit"
                                onClick={this.handleSubmitForm}
                              >
                                Save and Post
                              </Button>
                            </span>
                            <Button type="danger" onClick={this.handleReset}>
                              Discard
                            </Button>
                          </div>
                        </FormItem>
                      </Form>
                    </div>
                  </div>
                </div>
              </section>
            </TabPane>
            <TabPane tab="Audit" key="2">
              <section className="card">
                <div className="card-body">
                  <AuditTimeline
                    audit={
                      editingvideo && editingvideo.audit ? editingvideo.audit : video.videoAudit
                    }
                  />
                </div>
              </section>
            </TabPane>
          </Tabs>
        </div>
      </React.Fragment>
    )
  }
}
export default AddVideo
