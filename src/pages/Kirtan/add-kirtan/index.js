/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React from 'react'
import {
  Switch,
  Form,
  Button,
  Input,
  Icon,
  Select,
  DatePicker,
  Checkbox,
  Upload,
  notification,
} from 'antd'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import { EditorState, convertToRaw } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import $ from 'jquery'
import moment from 'moment'
import styles from './style.module.scss'

const FormItem = Form.Item
const { Option } = Select
const { Dragger } = Upload

@Form.create()
@connect(({ kirtan }) => ({ kirtan }))
class AddKirtan extends React.Component {
  state = {
    language: true,
    audioLink: '',
    createDate: '',
    publishDate: '',
    artist: '',
    kirtanLanguage: '',
    event: '',
    location: '',
    type: '',
    translationRequired: false,
    editorState: EditorState.createEmpty(),
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
      })
    }, 0)
  }

  handleSelectArtist = artist => {
    this.setState({
      artist,
    })
  }

  handleSelectEvent = event => {
    this.setState({
      event,
    })
  }

  handleKirtanLanguage = language => {
    this.setState({
      kirtanLanguage: language,
    })
  }

  handleSelectType = type => {
    this.setState({
      type,
    })
  }

  handleSelectLocation = location => {
    this.setState({
      location,
    })
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  uuidv4 = () => {
    // eslint-disable-next-line func-names
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      // eslint-disable-next-line no-bitwise
      const r = (Math.random() * 16) | 0

      // eslint-disable-next-line no-bitwise
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }

  handleUploading = info => {
    if (info.file.status === 'uploading') {
      notification.success({
        message: 'Uploading Started',
        description: 'File uploading is started',
      })
    }
    if (info.file.status === 'done') {
      this.uploads3(info.file)
    }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
      success: data => {
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        this.setUploadedFiles(finalUrl)
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file)
      },
      error() {
        notification.error({
          message: 'Error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  uploadFileToS3UsingPresignedUrl = (presignedUrl, file) => {
    $.ajax({
      type: 'PUT',
      url: presignedUrl,
      data: file.originFileObj,
      headers: {
        'Content-Type': file.type,
        reportProgress: true,
      },
      processData: false,
      success: data => {
        console.info(data)
        notification.success({
          message: 'Success',
          description: 'file has been uploaded successfully',
        })
      },
      error() {
        notification.warning({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  deleteFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        console.info(data)
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })
        this.handelDeleteSetFiles()
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  beforeUploadAudio = file => {
    const isJPG = file.type === 'audio/mp3'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload MP3 file!',
      })
    }
    return isJPG
  }

  handelDeleteSetFiles = () => {
    this.setState({ audioLink: '' })
  }

  setUploadedFiles = finalUrl => {
    this.setState({
      audioLink: finalUrl,
    })
  }

  dummyRequest = ({ file, onSuccess }) => {
    console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleSubmitForm = () => {
    const { form, dispatch } = this.props
    const {
      language,
      audioLink,
      createDate,
      publishDate,
      artist,
      kirtanLanguage,
      event,
      location,
      type,
      translationRequired,
      editorState,
    } = this.state
    const titlekirtan = form.getFieldValue('title')
    const kirtanBody = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    form.validateFields(['title', 'create_date', 'publish_date', 'translation'], (err, values) => {
      console.info(values)
      if (!err) {
        const body = {
          uuid: this.uuidv4(),
          created_date: createDate,
          published_date: publishDate,
          language: kirtanLanguage,
          audio_link: audioLink,
          translation_required: translationRequired,
          artist,
          type,
          en: {
            title: language ? titlekirtan : '',
            event: language ? event : '',
            topic: '',
            location: language ? location : '',
            body: language ? kirtanBody : '',
          },
          ru: {
            title: language ? '' : titlekirtan,
            event: language ? '' : event,
            topic: '',
            location: language ? '' : location,
            body: language ? '' : kirtanBody,
          },
        }
        dispatch({
          type: 'kirtan/CREATE_KIRTAN',
          payload: body,
        })
      }
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      language: true,
      audioLink: '',
      createDate: '',
      publishDate: '',
      artist: '',
      kirtanLanguage: '',
      event: '',
      location: '',
      type: '',
      translationRequired: false,
      editorState: EditorState.createEmpty(),
    })
  }

  render() {
    const { form } = this.props
    const { language, audioLink, translationRequired, editorState } = this.state
    const dateFormat = 'YYYY/MM/DD'
    return (
      <React.Fragment>
        <div>
          <Helmet title="Add Kirtan" />
          <section className="card">
            <div className="card-header mb-2">
              <div className="utils__title">
                <strong>Kirtan Add/Edit</strong>
                <Switch
                  defaultChecked
                  checkedChildren={language ? 'en' : 'ru'}
                  unCheckedChildren={language ? 'en' : 'ru'}
                  onChange={this.handleLanguage}
                  className="toggle"
                  style={{ width: '100px', marginLeft: '10px' }}
                />
              </div>
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
                        initialValue: '',
                      })(<Input placeholder="Kirtan Title" />)}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Language">
                      {form.getFieldDecorator('language')(
                        <Select
                          id="product-edit-colors"
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Select language"
                          onChange={this.handleKirtanLanguage}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                      {form.getFieldDecorator('type')(
                        <Select
                          id="product-edit-colors"
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Select Type"
                          optionFilterProp="children"
                          onChange={this.handleSelectType}
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="Kirtan">Kirtan</Option>
                          <Option value="Bhajan">Bhajan</Option>
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Artist">
                      {form.getFieldDecorator('artist')(
                        <Select
                          id="product-edit-colors"
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Select Artist"
                          onChange={this.handleSelectArtist}
                          optionFilterProp="children"
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="Aditi Dukhaha Prabhu">Aditi Dukhaha Prabhu</Option>
                          <Option value="Amala Harinama Dasa"> Amala Harinama Dasa</Option>
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Date">
                      {form.getFieldDecorator('create_date', {
                        rules: [
                          {
                            required: true,
                            message: 'Create Date is required',
                          },
                        ],
                        initialValue: moment(new Date().toLocaleDateString(), dateFormat),
                      })(<DatePicker onChange={this.handleCreateDate} />)}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Publish Date">
                      {form.getFieldDecorator('publish_date', {
                        rules: [
                          {
                            required: true,
                            message: 'Publish Date is required',
                          },
                        ],
                        initialValue: moment(new Date().toLocaleDateString(), dateFormat),
                      })(<DatePicker onChange={this.handlePublishDate} />)}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem>
                      {form.getFieldDecorator('translation', {
                        rules: [
                          {
                            required: true,
                            message: 'Need Translation is required',
                          },
                        ],
                        iinitialValue: translationRequired,
                      })(
                        <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                          &nbsp; Need Translation ?
                        </Checkbox>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Location">
                      {form.getFieldDecorator('location')(
                        <Select
                          id="product-edit-colors"
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Select Location"
                          optionFilterProp="children"
                          onChange={this.handleSelectLocation}
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="Aditi Dukhaha Prabhu">Bangalore</Option>
                          <Option value="Amala Harinama Dasa">Pune</Option>
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Event">
                      {form.getFieldDecorator('event')(
                        <Select
                          id="product-edit-colors"
                          showSearch
                          style={{ width: '100%' }}
                          placeholder="Select Event"
                          optionFilterProp="children"
                          onChange={this.handleSelectEvent}
                          filterOption={(input, option) =>
                            option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                          }
                        >
                          <Option value="Aditi Dukhaha Prabhu">Festival</Option>
                          <Option value="Amala Harinama Dasa">Guru Purinma</Option>
                        </Select>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Body">
                      {form.getFieldDecorator('content')(
                        <div className={styles.editor}>
                          <Editor
                            editorState={editorState}
                            onEditorStateChange={this.onEditorStateChange}
                          />
                        </div>,
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem label="Attachment">
                      {audioLink ? (
                        <ul>
                          <li className="filesList">
                            {audioLink}
                            &nbsp;&nbsp;
                            <i
                              className="fa fa-close closeIcon"
                              onClick={() => {
                                this.deleteFile(audioLink, 'audio')
                              }}
                            />
                          </li>
                        </ul>
                      ) : (
                        ''
                      )}
                    </FormItem>
                  </div>
                  <div className="form-group">
                    <FormItem>
                      {form.getFieldDecorator('Files')(
                        <Dragger
                          beforeUpload={this.beforeUploadAudio}
                          multiple={false}
                          showUploadList={false}
                          customRequest={this.dummyRequest}
                          onChange={this.handleUploading}
                        >
                          <p className="ant-upload-drag-icon">
                            <Icon type="inbox" />
                          </p>
                          <p className="ant-upload-text">
                            Click or drag file to this area to upload
                          </p>
                          <p className="ant-upload-hint">
                            Support for a single or bulk upload. Strictly prohibit from uploading
                            company data or other band files
                          </p>
                        </Dragger>,
                      )}
                    </FormItem>
                  </div>
                  <FormItem>
                    <div className={styles.submit}>
                      <span className="mr-3">
                        <Button type="primary" htmlType="submit" onClick={this.handleSubmitForm}>
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
          </section>
        </div>
      </React.Fragment>
    )
  }
}

export default AddKirtan
