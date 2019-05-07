/* eslint-disable no-nested-ternary */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-unused-vars */
import React from 'react'
import { Editor } from 'react-draft-wysiwyg'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import {
  Form,
  Input,
  Button,
  Checkbox,
  Select,
  Upload,
  Icon,
  message,
  notification,
  DatePicker,
  Tabs,
} from 'antd'
import { connect } from 'react-redux'
import $ from 'jquery'
import moment from 'moment'
import { EditorState, convertToRaw, ContentState } from 'draft-js'
import draftToHtml from 'draftjs-to-html'
import htmlToDraft from 'html-to-draftjs'
import { uuidv4 } from '../../../../services/custom'
import styles from '../style.module.scss'
import serverAddress from '../../../../services/config'

const { Option } = Select
const FormItem = Form.Item
const { Dragger } = Upload

@Form.create()
@connect(({ blog, router }) => ({ blog, router }))
class AddForm extends React.Component {
  state = {
    files: [],
    editorState: EditorState.createEmpty(),
    editingBlog: '',
    editedBody: '',
    translationRequired: false,
    upoading: true,
    date: new Date(),
    publishDate: new Date(),
  }

  componentDidMount() {
    const { router, dispatch } = this.props
    const { location } = router
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'blog/GET_BLOG_BY_ID',
        payload: body,
      })
    }
  }

  componentWillReceiveProps(nextProps) {
    const { upoading } = this.state
    if (nextProps.blog.editBlog && upoading) {
      const { blog, english } = nextProps
      const { editBlog } = blog
      const html = editBlog
        ? english
          ? editBlog.body_en
          : editBlog.body_ru
          ? editBlog.body_ru
          : ''
        : ''
      let editorState = ''
      if (html.length > 0) {
        const contentBlock = htmlToDraft(html)
        if (contentBlock) {
          const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks)
          editorState = EditorState.createWithContent(contentState)
        }
        this.setState({
          editingBlog: blog.editBlog,
          files: blog.editBlog.files,
          translationRequired: editBlog.needs_translation,
          editorState,
        })
      }
    }
    if (nextProps.blog.isBlogCreated) {
      const { files } = this.state
      this.setState({
        files,
      })
      this.handleReset()
    }
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        date: dateString,
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

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router, english } = this.props
    const { location } = router
    const uuid = location.state
    const { files, editorState, editingBlog, translationRequired, publishDate, date } = this.state
    const titleEn = form.getFieldValue('title')
    const tag = form.getFieldValue('tag')
    const author = form.getFieldValue('author')
    const language = form.getFieldValue('language')
    const bodyEn = draftToHtml(convertToRaw(editorState.getCurrentContent()))
    const body = {
      uuid: uuid || uuidv4(),
      language,
      author,
      files,
      needs_translation: translationRequired,
      date,
      publish_date: publishDate,
    }
    if (english) {
      body.title_en = titleEn
      body.body_en = bodyEn
      body.tags_en = tag
      body.needs_translation = translationRequired
    } else {
      body.title_ru = titleEn
      body.body_ru = bodyEn
      body.tags_ru = tag
      body.needs_translation = translationRequired
    }
    if (editingBlog) {
      body.audit = editingBlog.audit
      const payload = {
        body,
        uuid,
      }
      dispatch({
        type: 'blog/UPDATE_BLOG',
        payload,
      })
    } else {
      dispatch({
        type: 'blog/CREATE_BLOG',
        payload: body,
      })
    }
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      editorState,
    })
  }

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
  }

  handleFileChange = info => {
    if (info.file.status === 'done') {
      this.setState({ upoading: false }, () => {
        this.uploads3(info.file)
      })
    }
  }

  uploads3 = file => {
    const fileName = file.name
    const fileType = file.type
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/generateUploadUrl?name=folder1/${fileName}&type=${fileType}`,
      success: data => {
        const temp = data.presignedUrl.toString()
        const finalUrl = temp.substr(0, temp.lastIndexOf('?'))
        const { files } = this.state
        const array = [...files]

        array.push(finalUrl)
        this.setState({ files: array })
        this.uploadFileToS3UsingPresignedUrl(data.presignedUrl, file)
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, Please try again',
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
        notification.success({
          message: 'Success',
          description: 'file has been uploaded successfully',
        })
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, Please try again',
        })
      },
    })
  }

  dummyRequest = ({ file, onSuccess }) => {
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  delereFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `${serverAddress}/api/blog/deleteFile/?filename=${fileName}`,
      success: data => {
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })

        const { files } = this.state

        for (let i = 0; i < files.length; i += 1) {
          if (files[i] === item) {
            files.splice(i, 1)
            break
          }
        }

        this.setState({
          files,
        })
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, Please try again',
        })
      },
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      editorState: '',
      editingBlog: {},
      files: [],
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  render() {
    const { form, english } = this.props
    const { editingBlog, editedBody, editorState, translationRequired } = this.state
    const { files } = this.state
    const dateFormat = 'YYYY/MM/DD'

    return (
      <>
        <Form className="mt-3" onSubmit={this.handleFormBody}>
          <div className="form-group">
            <FormItem label={english ? 'Title' : 'Title'}>
              {form.getFieldDecorator('title', {
                initialValue: editingBlog
                  ? english
                    ? editingBlog.title_en
                    : editingBlog.title_ru
                  : '',
              })(<Input placeholder="Post title" />)}
            </FormItem>
          </div>
          <div className="form-group">
            <FormItem label={english ? 'Tags' : 'Tags'}>
              {form.getFieldDecorator('tag', {
                initialValue: editingBlog
                  ? english
                    ? editingBlog.tags_en
                    : editingBlog.tags_ru
                  : '',
              })(<Input placeholder="Tags" />)}
            </FormItem>
          </div>
          <div className="form-group">
            <FormItem label="Author">
              {form.getFieldDecorator('author', {
                initialValue: editingBlog ? editingBlog.author : '',
              })(
                <Select
                  id="product-edit-colors"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select Author"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
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
                initialValue: editingBlog ? editingBlog.language : '',
              })(
                <Select
                  id="product-edit-colors"
                  showSearch
                  style={{ width: '100%' }}
                  placeholder="Select a color"
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
            <FormItem>
              {form.getFieldDecorator('translation', {
                initialValue: translationRequired,
              })(
                <Checkbox checked={translationRequired} onChange={this.handleCheckbox}>
                  Need Translation ?
                </Checkbox>,
              )}
            </FormItem>
          </div>
          <div className="form-group">
            <FormItem label="Date">
              {form.getFieldDecorator('date', {
                rules: [
                  {
                    required: true,
                    message: 'Create Date is required',
                  },
                ],
                initialValue:
                  editingBlog && editingBlog.date
                    ? moment(editingBlog.date, dateFormat)
                    : moment(new Date(), dateFormat),
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
                initialValue:
                  editingBlog && editingBlog.published_date
                    ? moment(editingBlog.published_date, dateFormat)
                    : moment(new Date(), dateFormat),
              })(<DatePicker onChange={this.handlePublishDate} disabled />)}
            </FormItem>
          </div>
          <div className="form-group">
            <FormItem label={english ? 'Body' : 'Body'}>
              {form.getFieldDecorator('content', {
                initialValue: editorState || '',
              })(
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
              <ul>
                {files && files.length > 0
                  ? files.map(item => {
                      return (
                        <li className="filesList">
                          {item}
                          <i
                            className="fa fa-close closeIcon"
                            onClick={() => {
                              this.delereFile(item)
                            }}
                          />
                        </li>
                      )
                    })
                  : null}
              </ul>
            </FormItem>
          </div>
          <div className="form-group">
            <FormItem>
              {form.getFieldDecorator('Files')(
                <Dragger
                  showUploadList={false}
                  customRequest={this.dummyRequest}
                  onChange={this.handleFileChange}
                >
                  <p className="ant-upload-drag-icon">
                    <Icon type="inbox" />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for a single or bulk upload. Strictly prohibit from uploading company
                    data or other band files
                  </p>
                </Dragger>,
              )}
            </FormItem>
          </div>
          <FormItem>
            <div className={styles.submit}>
              <span className="mr-3">
                <Button type="primary" htmlType="submit">
                  Save and Post
                </Button>
              </span>
              <Button type="danger" onClick={this.handleReset}>
                Discard
              </Button>
            </div>
          </FormItem>
        </Form>
      </>
    )
  }
}

export default AddForm
