/* eslint-disable no-nested-ternary */
/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/jsx-no-comment-textnodes */
import React from 'react'
import {
  DatePicker,
  Checkbox,
  Form,
  Input,
  Select,
  Upload,
  Icon,
  notification,
  Button,
  Switch,
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
@connect(({ gallery, router }) => ({ gallery, router }))
class CreateGallery extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: '',
      publishDate: '',
      gallery: '2019',
      editGallery: '',
      uploading: true,
      language: true,
      translationRequired: false,
    }
  }

  componentDidMount() {
    const { dispatch, router } = this.props
    const { location } = router
    const uuid = location.state
    if (uuid !== undefined) {
      const body = {
        uuid,
      }
      dispatch({
        type: 'gallery/GET_GALLERY_BY_ID',
        payload: body,
      })
    }
    dispatch({
      type: 'gallery/GET_GALLERY_LIST',
    })
  }

  componentWillReceiveProps(nextProps) {
    const { uploading } = this.state
    if (nextProps.gallery.editGallery !== '' && uploading) {
      const { gallery } = nextProps
      const { editGallery } = gallery
      this.setState({
        editGallery,
        gallery: editGallery.gallery || '2019',
        photoFiles: editGallery.photos || [],
        createDate: editGallery.date || '',
        publishDate: editGallery.publish_date || '',
        translationRequired: editGallery.translation_required,
      })
    }
    if (nextProps.gallery.isGalleryCreated) {
      this.handleReset()
    }
  }

  componentWillUnmount() {
    const { form } = this.props
    form.resetFields()
    this.setState({
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: '',
      publishDate: '',
      gallery: '2019',
      editGallery: '',
    })
  }

  handleCheckbox = event => {
    setTimeout(() => {
      this.setState({
        translationRequired: event.target.checked,
      })
    }, 0)
  }

  onEditorStateChange: Function = editorState => {
    this.setState({
      galleryBody: editorState,
    })
  }

  hadleSelectGallery = gallery => {
    this.setState({ gallery, uploading: false })
  }

  beforeUploadAudio = file => {
    const isJPG = file.type === 'image/jpg' || 'image/jpeg'
    if (!isJPG) {
      notification.error({
        message: 'error',
        description: 'You can only upload jpg/jpeg file!',
      })
    }
    return isJPG
  }

  dummyRequest = ({ file, onSuccess }) => {
    console.info(file)
    setTimeout(() => {
      onSuccess('ok')
    }, 0)
  }

  handleLanguage = () => {
    const { language } = this.state
    this.setState({
      language: !language,
    })
  }

  handleFileChange = info => {
    this.setState(
      {
        uploading: false,
      },
      () => {
        this.handleUploading(info)
      },
    )
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

  getBase64 = (img, callback) => {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
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
        setTimeout(() => {
          this.setUploadedFiles(finalUrl)
        }, 0)
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
      success: () => {
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

  setUploadedFiles = finalUrl => {
    const { photoFiles } = this.state
    let array
    if (photoFiles && photoFiles.length > 0) {
      array = [...photoFiles]
    } else {
      array = []
    }
    array.push(finalUrl)
    this.setState({
      photoFiles: array,
    })
  }

  handleCreateDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        createDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handlePublishDate = (date, dateString) => {
    console.info(date, dateString)
    setTimeout(() => {
      this.setState({
        publishDate: dateString,
        uploading: false,
      })
    }, 0)
  }

  handleFormBody = event => {
    event.preventDefault()
    const { form, dispatch, router } = this.props
    const { location } = router
    const uuid = location.state
    const {
      photoFiles,
      galleryBody,
      gallery,
      createDate,
      publishDate,
      editGallery,
      language,
      translationRequired,
    } = this.state
    const title = form.getFieldValue('title')
    const bodyEn = draftToHtml(convertToRaw(galleryBody.getCurrentContent()))
    form.validateFields(['title', 'create_date', 'publish_date'], (err, values) => {
      console.info(values)
      if (!err) {
        const body = {
          uuid: uuid || this.uuidv4(),
          gallery,
          date: createDate,
          publish_date: publishDate,
          photos: photoFiles,
          body: bodyEn,
          translation_required: translationRequired,
          title_en: language
            ? title
            : editGallery && editGallery.title_en
            ? editGallery.title_en
            : '',
          title_ru: language
            ? editGallery && editGallery.title_ru
              ? editGallery.title_ru
              : ''
            : title,
        }
        if (editGallery !== '' && uuid) {
          const payload = {
            body,
            uuid,
          }
          dispatch({
            type: 'gallery/UPDATE_GALLERY',
            payload,
          })
        } else {
          dispatch({
            type: 'gallery/CREATE_GALLERY',
            body,
          })
        }
      }
    })
  }

  deleteFile = item => {
    const fileName = item.substr(item.lastIndexOf('.com/') + 5)
    $.ajax({
      type: 'GET',
      url: `http://localhost:3000/api/blog/deleteFile/?filename=${fileName}`,
      success: () => {
        notification.success({
          message: 'File Deleted',
          description: 'File has been successfully deleted',
        })
        this.handelDeleteSetFiles(item)
      },
      error() {
        notification.error({
          message: 'error',
          description: 'Error occured during uploading, try again',
        })
      },
    })
  }

  handelDeleteSetFiles = item => {
    const { photoFiles } = this.state

    for (let i = 0; i < photoFiles.length; i += 1) {
      if (photoFiles[i] === item) {
        photoFiles.splice(i, 1)
        break
      }
    }
    this.setState({
      photoFiles,
    })
  }

  handleReset = () => {
    const { form } = this.props
    form.resetFields()
    this.setState({
      photoFiles: [],
      galleryBody: EditorState.createEmpty(),
      createDate: '',
      publishDate: '',
    })
  }

  render() {
    const { form, gallery } = this.props
    const { mainGallery } = gallery
    const dateFormat = 'YYYY/MM/DD'

    const { galleryBody, photoFiles, editGallery, language, translationRequired } = this.state
    return (
      <div>
        <Helmet title="Create Gallery" />
        <section className="card">
          <div className="card-header mb-2">
            <div className="utils__title">
              <strong>Create Gallery</strong>
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
                  <FormItem label="Title">
                    {form.getFieldDecorator('title', {
                      rules: [
                        {
                          required: true,
                          message: 'Title is required',
                        },
                      ],
                      initialValue:
                        editGallery && editGallery.uuid
                          ? language
                            ? editGallery.title_en
                            : editGallery.title_ru
                          : '',
                    })(<Input placeholder="Enter Title" />)}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Body">
                    {form.getFieldDecorator('content')(
                      <div className={styles.editor}>
                        <Editor
                          editorState={galleryBody}
                          onEditorStateChange={this.onEditorStateChange}
                        />
                      </div>,
                    )}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Gallery">
                    <Select
                      id="gallery-item"
                      defaultValue="2019"
                      showSearch
                      style={{ width: '25%' }}
                      onChange={this.hadleSelectGallery}
                      placeholder="Select Gallery"
                      optionFilterProp="children"
                      filterOption={(input, option) =>
                        option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                      }
                    >
                      {mainGallery && mainGallery.length > 0
                        ? mainGallery.map(item => {
                            return (
                              <Option key={item.uuid} value={item.name_en}>
                                {language ? item.name_en : item.name_ru}
                              </Option>
                            )
                          })
                        : null}
                    </Select>
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
                  <FormItem label="Created Date">
                    {form.getFieldDecorator('create_date', {
                      rules: [
                        {
                          required: true,
                          message: 'Date is required',
                        },
                      ],
                      initialValue:
                        editGallery && editGallery.date ? moment(editGallery.date, dateFormat) : '',
                    })(<DatePicker onChange={this.handleCreateDate} />)}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Published Date">
                    {form.getFieldDecorator('publish_date', {
                      rules: [
                        {
                          required: true,
                          message: 'Publish Date is required',
                        },
                      ],
                      initialValue:
                        editGallery && editGallery.publish_date
                          ? moment(editGallery.publish_date, dateFormat)
                          : '',
                    })(<DatePicker onChange={this.handlePublishDate} />)}
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Uploaded Photos">
                    <ul>
                      {photoFiles && photoFiles.length > 0
                        ? photoFiles.map(item => {
                            if (item !== '') {
                              return (
                                <li className="filesList">
                                  {item} &nbsp;&nbsp;
                                  <i
                                    className="fa fa-close closeIcon"
                                    onClick={() => {
                                      this.deleteFile(item)
                                    }}
                                  />
                                </li>
                              )
                            }
                          })
                        : null}
                    </ul>
                  </FormItem>
                </div>
                <div className="form-group">
                  <FormItem label="Upload Photos">
                    {form.getFieldDecorator('Files')(
                      <Dragger
                        beforeUpload={this.beforeUploadAudio}
                        multiple
                        showUploadList={false}
                        customRequest={this.dummyRequest}
                        onChange={this.handleFileChange}
                      >
                        <p className="ant-upload-drag-icon">
                          <Icon type="inbox" />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">
                          Support for a single or bulk upload. Strictly prohibit from uploading
                          company data or other band files
                        </p>
                      </Dragger>,
                    )}
                  </FormItem>
                </div>
              </Form>
            </div>
            <div className={styles.submit}>
              <span className="mr-3">
                <Button type="primary" onClick={this.handleFormBody}>
                  Save and Post
                </Button>
              </span>
              <Button type="danger" onClick={this.handleReset}>
                Discard
              </Button>
            </div>
          </div>
        </section>
      </div>
    )
  }
}

export default CreateGallery
